import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import pool from "../configs/db.js";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan != "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Please upgrade",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: length,
    });

    const content = response.choices[0].message.content;
    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (?, ?, ?, 'Article')`,
      [userId, prompt, content]
    );

    console.log("Inserted Row ID:", result.insertId);

    if (plan != "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }
    res.json({ success: true, content: content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

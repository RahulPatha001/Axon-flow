import OpenAI from "openai";
import { clerkClient } from "@clerk/express";
import pool from "../configs/db.js";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import pdf from "pdf-parse/lib.pdf-parse.js";


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

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
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
      max_completion_tokens: 100,
    });

    const content = response.choices[0].message.content;
    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (?, ?, ?, 'blog-title')`,
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


export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan != "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1",
      formData, {
        headers:{'x-api-key': process.env.CLIPDROP_API_KEY},
        responseType: "arraybuffer",
      }
    )

    const base64Image = `data:image/png;base64. ${Buffer.from(data,'binary').toString('base64')}`;

   const {secure_url} =  await cloudinary.uploader.upload(base64Image);

    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type, publish)
   VALUES (?, ?, ?, 'image',?)`,
      [userId, prompt, secure_url,publish ?? false]
    );
    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const  image  = req.file ;
    const plan = req.plan;

    if (plan != "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }
    

   const {secure_url} =  await cloudinary.uploader.upload(image.path, {
    transformation: [
      {
        effect: 'background-removal',
        background_removal: 'remove_the_background'
      }
    ]
   });

    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (?, ?, ?, 'image')`,
      [userId, "Remove Background From Image", secure_url]
    );
    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {object} = req.body;
    const  image  = req.file ;
    const plan = req.plan;

    if (plan != "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }
    

   const {public_id} =  await cloudinary.uploader.upload(image.path);
   const imageurl = cloudinary.url(public_id,{
    transformation:[{effect: `gen_remove: ${object}`}],
    resource_type:'image'
   });

    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (?, ?, ?, 'image')`,
      [userId, `Removed ${object} from image`, imageurl]
    );
    res.json({ success: true, content: imageurl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume  = req.file ;
    const plan = req.plan;

    if (plan != "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium users",
      });
    }
    
    if(resume.size > 5*1024*1024){
      return res.json({success:false, message:'Resume file exeedes, Max allowed 5MB'});
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses
    and areas for improvement. Resume content: \n\n${pdfData.text}`

  const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1000,
    });
    const content = response.choices[0].message.content;
    const [result] = await pool.query(
      `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (?, ?, ?, 'resume-review')`,
      [userId, 'Review uploaded resume', content]
    );
    res.json({ success: true, content: imageurl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

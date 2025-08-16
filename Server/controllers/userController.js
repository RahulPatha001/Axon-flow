import pool from "../configs/db.js";

export const getPublishedCreations = async (req, res) => {
  try {
    const [result] = await pool.query(
      `select * from creations where pubslish = true order by created_at desc`
    );

    res.json({success:true, data: result});

  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};


export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const [result] = await pool.query(
      `select * from creations where user_id = ${userId} order by created_at desc`
    );

    res.json({success:true, data: result});

  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};


export const toggleCreationsLike = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {id} = req.body;

    const [creation] = await pool.query(
        `select * from creations where id = ${id}`
    );

    if(!creation){
        return res.json({success:false, message:"creations not found"});
    }

    const currentLikes = creation.likes;
    const userIdstr = userId.toString();
    let updatedLikes;
    let message;

    if(currentLikes.includes){
        updatedLikes = currentLikes.filter((user)=>user !== userIdstr);
        message = 'creation unliked'
    }else{
        updatedLikes = [...currentLikes, userIdstr]
        message - 'creation liked'
    }
    const formattedArray = `{${updatedLikes.json(',')}}`

    const [result] = await pool.query(
      `update creations set likes = ${formattedArray}::text[] where id = ${id}`
    );

    res.json({success:true, data: message});

  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};
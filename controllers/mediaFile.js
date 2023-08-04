const Chats = require('../models/chat');
const S3service = require('../services/S3services'); 

// Posting file url in the Chats table 
const postMediaFile = async(req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const name = req.user.name;
        const file = req.file.buffer;
        const fileName = `${userId} ${req.file.originalname}`;

        const fileUrl = await S3service.uploadFileToS3(file, fileName);

        const postFile = await Chats.create({ message: fileUrl, sender: name, groupId:Number(groupId), userId});
        
        res.status(202).json({ files:postFile , message: `file sended successfully `});
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: `Internal Server Error` });
    }
}

module.exports = {
    postMediaFile
}
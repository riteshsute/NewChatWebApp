const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');
 
// Posting text Message to Chats table
const postMessage = async(req, res) => {
    try {
        let { textMessage, groupId } = req.body;

        if(!groupId){
            groupId = null;
        }

        const name = req.user.name;
        const chats = await Chat.create({ 
            message:textMessage, 
            sender: name, 
            groupId:groupId, 
            userId: req.user.id 
        });
        
        res.status(201).json({ textMessage: chats, message: 'Successfully sended message' })

    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Getting old messages from Chats table according to groupId
const getMessages = async(req, res) => {
    try{
        const { groupId } = req.params;
        const textMessages = await Chat.findAll({ where:{groupId} });
        if(textMessages.length > 0) {
            return res.status(202).json({ textMessages })
        }else {
            return res.status(201).json({ message: 'there are no previous messages' })
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    postMessage,
    getMessages,
}
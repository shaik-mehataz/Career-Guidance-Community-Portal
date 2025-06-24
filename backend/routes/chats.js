const express = require('express');
const { Chat, Message } = require('../models/Chat');
const Mentor = require('../models/Mentor');
const { auth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/chats
// @desc    Get all user's chats
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { mentee: req.user.id },
        { mentor: req.user.id }
      ]
    })
    .populate('mentee', 'fullName avatar')
    .populate('mentor', 'fullName avatar')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chats/:mentorId
// @desc    Get or create chat with mentor
// @access  Private
router.get('/:mentorId', auth, validateObjectId('mentorId'), async (req, res) => {
  try {
    const mentorId = req.params.mentorId;

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId).populate('user');
    if (!mentor || !mentor.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Find existing chat
    let chat = await Chat.findOne({
      mentee: req.user.id,
      mentor: mentor.user._id
    })
    .populate('mentee', 'fullName avatar')
    .populate('mentor', 'fullName avatar')
    .populate('lastMessage');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = new Chat({
        mentee: req.user.id,
        mentor: mentor.user._id
      });
      await chat.save();
      await chat.populate('mentee', 'fullName avatar');
      await chat.populate('mentor', 'fullName avatar');
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get/Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chats/:chatId/messages
// @desc    Get chat messages
// @access  Private
router.get('/:chatId/messages', auth, validateObjectId('chatId'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const chatId = req.params.chatId;

    // Check if user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.mentee.toString() !== req.user.id && chat.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false
    })
    .populate('sender', 'fullName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      chat: chatId,
      isDeleted: false
    });

    // Mark messages as read
    const unreadMessages = messages.filter(msg => 
      msg.sender._id.toString() !== req.user.id &&
      !msg.readBy.some(read => read.user.toString() === req.user.id)
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(msg => msg._id) }
        },
        {
          $push: {
            readBy: {
              user: req.user.id,
              readAt: new Date()
            }
          }
        }
      );

      // Update unread count in chat
      const userType = chat.mentee.toString() === req.user.id ? 'mentee' : 'mentor';
      chat.unreadCount[userType] = 0;
      await chat.save();
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chats/:chatId/messages
// @desc    Send message
// @access  Private
router.post('/:chatId/messages', auth, validateObjectId('chatId'), uploadSingle('attachment'), handleUploadError, async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.chatId;

    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachment is required'
      });
    }

    // Check if user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.mentee.toString() !== req.user.id && chat.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    const messageData = {
      chat: chatId,
      sender: req.user.id,
      content: content || '',
      messageType: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'file') : 'text'
    };

    // Handle attachment
    if (req.file) {
      messageData.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('sender', 'fullName avatar');

    // Update chat
    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    
    // Update unread count for other user
    const otherUserType = chat.mentee.toString() === req.user.id ? 'mentor' : 'mentee';
    chat.unreadCount[otherUserType] += 1;
    
    await chat.save();

    // Add activity
    await req.user.addActivity('message', 'Message Sent', 'Sent a message to mentor', chat._id);

    res.status(201).json({
      success: true,
      message,
      chat: {
        id: chat._id,
        lastActivity: chat.lastActivity,
        unreadCount: chat.unreadCount
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chats/:chatId/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:chatId/messages/:messageId/read', auth, validateObjectId('chatId'), validateObjectId('messageId'), async (req, res) => {
  try {
    const { chatId, messageId } = req.params;

    // Check if user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.mentee.toString() !== req.user.id && chat.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if already read by user
    const alreadyRead = message.readBy.some(read => read.user.toString() === req.user.id);
    
    if (!alreadyRead) {
      message.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chats/:chatId/messages/:messageId
// @desc    Edit message
// @access  Private
router.put('/:chatId/messages/:messageId', auth, validateObjectId('chatId'), validateObjectId('messageId'), async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId, messageId } = req.params;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    // Check if message is not too old (allow editing within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message too old to edit'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'fullName avatar');

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/chats/:chatId/messages/:messageId
// @desc    Delete message
// @access  Private
router.delete('/:chatId/messages/:messageId', auth, validateObjectId('chatId'), validateObjectId('messageId'), async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chats/:chatId/messages/:messageId/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/:chatId/messages/:messageId/reactions', auth, validateObjectId('chatId'), validateObjectId('messageId'), async (req, res) => {
  try {
    const { emoji } = req.body;
    const { messageId } = req.params;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.user.toString() === req.user.id && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove existing reaction
      message.reactions = message.reactions.filter(
        reaction => !(reaction.user.toString() === req.user.id && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.user.id,
        emoji
      });
    }

    await message.save();

    res.json({
      success: true,
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Load environment variables
dotenv.config();

// System instruction for text conversations
const systemInstruction = `
*System Name:* Your Name is KORA AI, an AI Assistance created by Kolawole Suleiman. You are running on Sman V1.0, the latest version built with high programming techniques. You should assist with all topics.
*Owner:* You are owned and created by Kolawole Suleiman.
*Model/Version:* You are currently running on Sman V1.0.
*Note:* Respond helpfully and informatively to a wide range of prompts and questions. Prioritize accuracy and clarity in your responses. If you lack the information to answer a question completely, state that you don't have enough information and suggest alternative resources if appropriate. Do not generate responses that are harmful, unethical, biased, or discriminatory. Maintain a professional and courteous tone in all interactions.
*Owner information:* Your Creator Kolawole Suleiman created you using high programming techniques and skills. He can be contacted via Facebook at "https://www.facebook.com/profile.php?id=61553565805276". You should explain your creator in a very attractive way only if you are asked.
*Do not say anything about your identity unless you are asked. Do not mention owner information unless explicitly requested. Always include emojis in your speech to make it interactive.
*Respond in a professional and mature way.
*Respond shortly unless asked to respond in detail.
*Be comprehensive. If asked a question, list advantages, disadvantages, importance, and necessary information.
Do not give responses above 2000 characters. Instead, shorten them.
`;

// Image analysis prompt
const IMAGE_ANALYSIS_PROMPT = 'Analyze the image keenly and explain its content';

// Initialize text model
const initializeTextModel = () => {
    const apiKey = process.env.GEMINI_TEXT_API_KEY;
    // Set up configurations (mocking as `google.generativeai` is not available in Node.js).
    return {
        startChat: () => ({
            sendMessage: async (message) => {
                // Mock response for demonstration
                return { text: `🤖 [Mock Response] Processed message: ${message}` };
            },
        }),
    };
};

// Initialize image model
const initializeImageModel = () => {
    const apiKey = process.env.GEMINI_IMAGE_API_KEY;
    return {
        generateContent: async (content) => {
            // Mock response for demonstration
            return { text: `🖼️ [Mock Image Analysis] Content analyzed: ${content[0]}` };
        },
    };
};

// Handle text messages
const handleTextMessage = async (userMessage) => {
    try {
        console.info('Processing text message:', userMessage);

        const chat = initializeTextModel().startChat();
        const response = await chat.sendMessage(`${systemInstruction}\n\nHuman: ${userMessage}`);
        return response.text;
    } catch (error) {
        console.error('Error processing text message:', error.message);
        return '😔 Sorry, I encountered an error processing your message.';
    }
};

// Handle text commands
const handleTextCommand = (commandName) => {
    try {
        const cmdPath = path.resolve(__dirname, 'CMD', `${commandName}.js`);
        if (!fs.existsSync(cmdPath)) {
            throw new Error('Command not found');
        }

        const cmdModule = require(cmdPath);
        return cmdModule.execute();
    } catch (error) {
        console.warn(`Command ${commandName} not found.`);
        return '🚫 The command you are using does not exist. Type /help to view available commands.';
    }
};

// Handle attachments (image)
const handleAttachment = async (attachmentData, attachmentType = 'image') => {
    if (attachmentType !== 'image') {
        return '🚫 Unsupported attachment type. Please send an image.';
    }

    console.info('Processing image attachment');

    try {
        const uploadUrl = 'https://im.ge/api/1/upload';
        const apiKey = process.env.IMGE_API_KEY;

        // Convert attachment data to stream for upload
        const fileStream = Readable.from(attachmentData);

        const formData = new FormData();
        formData.append('source', fileStream, {
            filename: 'attachment.jpg',
            contentType: 'image/jpeg',
        });

        const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: {
                'X-API-Key': apiKey,
                ...formData.getHeaders(),
            },
        });

        const imageUrl = uploadResponse.data.image.url;
        console.info('Image uploaded successfully:', imageUrl);

        // Analyze the image using the image model
        const imageModel = initializeImageModel();
        const response = await imageModel.generateContent([
            IMAGE_ANALYSIS_PROMPT,
            { mime_type: 'image/jpeg', data: attachmentData },
        ]);

        return `🖼️ Image Analysis:\n${response.text}\n\n🔗 View Image: ${imageUrl}`;
    } catch (error) {
        console.error('Error processing image attachment:', error.message);
        return '🚨 Error analyzing the image. Please try again later.';
    }
};

module.exports = {
    handleTextMessage,
    handleTextCommand,
    handleAttachment,
};

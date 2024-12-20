const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dotenv = require('dotenv');
const cors = require('cors');
const messageHandler = require('./messageHandler.js'); // Giả sử bạn có module này

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Environment variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PREFIX = process.env.PREFIX || '/';

// Logging setup
const logger = console;

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    const tokenSent = req.query['hub.verify_token'];
    if (tokenSent === VERIFY_TOKEN) {
        logger.info('Webhook verification successful.');
        return res.send(req.query['hub.challenge']);
    }
    logger.error('Webhook verification failed: invalid verify token.');
    return res.status(403).send('Verification failed');
});

// Main webhook endpoint to handle messages
app.post('/webhook', async (req, res) => {
    const data = req.body;
    logger.info('Received data:', JSON.stringify(data));

    if (data.object === 'page') {
        for (const entry of data.entry) {
            for (const event of entry.messaging || []) {
                const senderId = event.sender.id;
                let response;

                if (event.message) {
                    const { text: messageText, attachments: messageAttachments } = event.message;

                    if (messageText && messageText.startsWith(PREFIX)) {
                        response = await messageHandler.handleTextCommand(
                            messageText.slice(PREFIX.length)
                        );
                    } else if (messageAttachments) {
                        try {
                            const attachment = messageAttachments[0];
                            if (attachment.type === 'image') {
                                const imageUrl = attachment.payload.url;

                                // Download the image data
                                try {
                                    const imageResponse = await axios.get(imageUrl, {
                                        responseType: 'arraybuffer',
                                    });
                                    response = await messageHandler.handleAttachment(
                                        imageResponse.data,
                                        'image'
                                    );
                                } catch (error) {
                                    logger.error('Failed to download image:', error.message);
                                    response = 'Failed to process the image attachment.';
                                }
                            }
                        } catch (error) {
                            logger.error('Error handling attachment:', error.message);
                            response = 'Error processing attachment.';
                        }
                    } else if (messageText) {
                        response = await messageHandler.handleTextMessage(messageText);
                    } else {
                        response = "Sorry, I didn't understand that message.";
                    }

                    // Send the response back
                    sendMessage(senderId, response);
                }
            }
        }
    }
    res.status(200).send('EVENT_RECEIVED');
});

// Send message back to Facebook using `request`
function sendMessage(recipientId, messageText) {
    if (!messageText) {
        logger.error('Error: Message text is required.');
        return;
    }

    const payload = {
        recipient: { id: recipientId },
        message: { text: messageText },
    };

    request({
        url: 'https://graph.facebook.com/v13.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: payload,
    }, (error, response, body) => {
        if (error) {
            logger.error('Error sending message:', error);
        } else if (response.body.error) {
            logger.error('Error response:', response.body.error);
        } else {
            logger.info(`Message sent successfully to user ${recipientId}:`, body);
        }
    });
}

// Test page access token validity
(function checkPageAccessToken() {
    const url = `https://graph.facebook.com/me`;
    request({
        url,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'GET',
    }, (error, response, body) => {
        if (error) {
            logger.error('Error validating page access token:', error);
        } else {
            const data = JSON.parse(body);
            if (data.error) {
                logger.error('Invalid page access token:', data.error);
            } else {
                logger.info('Page access token is valid:', data);
            }
        }
    });
})();

// Start the server
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Expose uptime for external access
function getBotUptime() {
    return (Date.now() - startTime) / 1000;
}
module.exports = { getBotUptime };

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Middleware to parse JSON request body
app.use(bodyParser.json());

async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAIResponse(input, userId, messageID) {
  const services = [
    { url: 'https://ai-tools.replit.app/gpt', params: { prompt: input, uid: userId } },
    { url: 'https://openaikey-x20f.onrender.com/api', params: { prompt: input } },
    { url: 'http://fi1.bot-hosting.net:6518/gpt', params: { query: input } },
    { url: 'https://ai-chat-gpt-4-lite.onrender.com/api/hercai', params: { question: input } }
  ];

  let response = "𝗔𝗦𝗦𝗜𝗦𝗧 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘 🪄✅.";
  let currentIndex = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[currentIndex];
    const data = await fetchFromAI(service.url, service.params);
    if (data && (data.gpt4 || data.reply || data.response)) {
      response = data.gpt4 || data.reply || data.response;
      break;
    }
    currentIndex = (currentIndex + 1) % services.length; // Move to the next service in the cycle
  }

  return { response, messageID };
}

// POST endpoint to share contact information on Facebook
app.post('/api/share-contact', async (req, res) => {
  try {
    const contactInfo = req.body.contactInfo;

    // Use the Facebook Graph API to share the contact information
    // Example: You would typically make a POST request to the Facebook Graph API here to publish the contact information on the user's feed.

    // For demonstration purposes, we'll just log the contact information
    console.log('Contact Information:', contactInfo);

    // Return a success response
    res.status(200).json({ message: 'Contact information shared on Facebook.' });
  } catch (error) {
    // Handle any errors
    console.error('Error sharing contact:', error.message);
    res.status(500).json({ error: 'Error sharing contact on Facebook.' });
  }
});

module.exports = {
  config: {
    name: 'ai',
    author: 'Arn',
    role: 0,
    category: 'ai',
    shortDescription: 'ai to ask anything',
  },
  onStart: async function ({ api, event, args }) {
    const input = args.join(' ').trim();
    if (!input) {
      api.sendMessage(`𝗔𝗦𝗦𝗜𝗦𝗧 𝗔𝗡𝗦𝗪𝗘𝗥𝗘𝗗✅\n━━━━━━━━━━━━━━━━\nPlease provide a question or statement.\n━━━━━━━━━━━━━━━━`, event.threadID);
      return;
    }

    const { response } = await getAIResponse(input, event.senderID, event.messageID);
    api.sendMessage(`𝗔𝗦𝗦𝗜𝗦𝗧 𝗔𝗡𝗦𝗪𝗘𝗥𝗘𝗗✅ \n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`, event.threadID);
  },
  onChat: async function ({ event, message }) {
    const messageContent = event.body.trim().toLowerCase();
    if (messageContent.startsWith("ai")) {
      const input = messageContent.replace(/^ai\s*/, "").trim();
      const { response } = await getAIResponse(input, event.senderID, message.messageID);
      message.reply(`𝗔𝗦𝗦𝗜𝗦𝗧 𝗔𝗡𝗦𝗪𝗘𝗥𝗘𝗗✅\n━━━━━━━━━━━━━━━━\n${response}\n━━━━━━━━━━━━━━━━`);
    }
  }
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

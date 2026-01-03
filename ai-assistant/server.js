const express = require('express');
const cors = require('cors');
const { getChatResponse } = require('./engine');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).send({ error: 'Message is required' });

    const response = await getChatResponse(message);
    res.send({ response });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`AI Assistant server running on http://localhost:${PORT}`);
});

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require("dotenv").config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.AZURE_OPENAI_KEY;
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT;

async function getChatResponse(userQuery) {
    try {
        // 1. Load the Resource Map
        const resourceMapPath = path.join(__dirname, 'resourcemap.json');
        const resourceMap = JSON.parse(fs.readFileSync(resourceMapPath, 'utf8'));

        // 2. Multi-stage Context Search
        let context = "";

        // Search in page descriptions and sections
        resourceMap.pages.forEach(page => {
            // Check if query matches page title or description
            if (userQuery.toLowerCase().includes(page.title.toLowerCase()) ||
                (page.description && userQuery.toLowerCase().includes(page.description.toLowerCase()))) {
                context += `[Page: ${page.title}] Description: ${page.description}\n`;
            }

            // Check sections
            page.content.forEach(chunk => {
                const queryWords = userQuery.toLowerCase().split(' ');
                const matches = queryWords.filter(word =>
                    word.length > 3 && (
                        chunk.heading.toLowerCase().includes(word) ||
                        chunk.text.toLowerCase().includes(word)
                    )
                );

                if (matches.length > 0) {
                    context += `[Section: ${chunk.heading} on ${page.title}] ${chunk.text}\n`;
                }
            });
        });

        // 3. Setup AI Client
        const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

        const messages = [
            {
                role: "system", content: `You are an intelligent AI assistant for the website: "${resourceMap.site_name}". 
            Your goal is to help visitors find information, answer questions about the site's content, products, or services, and provide a helpful experience.
            
            Priority: Use the provided [Context] for answers. This is your primary source of truth.
            
            Rules:
            1. If the answer is in the [Context], use it and provide the page reference.
            2. If the answer is NOT in the [Context], you may use your general knowledge but MUST add: "Note: I found this information from my general knowledge base, not directly from this website."
            3. Platform Adaptive: If a user asks for info for a specific platform (e.g., Mac, Windows, Mobile) and the site only has info for another, logically adapt the info and add: "Note: These details are adapted for your platform based on the site's original content and are for experimental purpose."
            4. Tone: Professional, helpful, and concise.` },
            { role: "user", content: `Context: ${context || "No specific content found on the site for this query."}\n\nQuestion: ${userQuery}` }
        ];

        const result = await client.getChatCompletions(deploymentId, messages);
        return result.choices[0].message.content;

    } catch (err) {
        console.error("AI Engine Error:", err);
        return "Sorry, I'm having trouble connecting to my brain. Please try again later.";
    }
}

module.exports = { getChatResponse };

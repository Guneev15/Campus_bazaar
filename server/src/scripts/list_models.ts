import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const listModels = async () => {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }

    try {
        // Fetch via REST because SDK listModels might be tricky to type in this env
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        const fs = require('fs');
        let output = "";
        
        if (data.models) {
            output += "✅ Available Models:\n";
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    output += `- ${m.name.replace('models/', '')}\n`;
                }
            });
        } else {
            output += "❌ No models found or error: " + JSON.stringify(data);
        }

        fs.writeFileSync('models_list.txt', output);
        console.log("Output written to models_list.txt");

    } catch (error) {
        console.error('Error listing models:', error);
    }
};

listModels();

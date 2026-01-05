import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const runTest = async () => {
  console.log('Testing Gemini API Connection...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Say 'Hello from Campus Bazaar AI' if you can read this.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ AI Response:', text.trim());
    console.log('🎉 API Key is valid and working!');
  } catch (error: any) {
    console.error('❌ AI Connection Failed:', error.message);
  }
};

runTest();

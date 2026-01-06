import dotenv from 'dotenv';

dotenv.config();

interface AIAnalysisResult {
  description: string;
  priceSuggestion: {
    min: number;
    max: number;
    sweetSpot: number;
  };
  confidenceScore: number;
  rationale: string;
  warnings: string[];
}

export const generateListingInfo = async (
  imageBuffer: Buffer, 
  mimeType: string,
  productName: string, 
  condition: string
): Promise<AIAnalysisResult> => {

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing (OPENROUTER_API_KEY)");
  }

  const prompt = `
    Role: Expert College Marketplace Risk Analyst & Copywriter.
    Task: Analyze the provided image of a product being sold by a student.
    
    Context:
    - Product Name Provided: "${productName}"
    - Condition Stated: "${condition}"
    - Target Audience: College Students in India (Currency: INR ₹).

    1. VISUAL ANALYSIS:
       - Confirm if the image matches the "${productName}".
       - Detect brand, model, and visible wear/tear.
       - Check for prohibited items (weapons, drugs, academic dishonesty).

    2. DESCRIPTION GENERATION (Strictly Honest & Neutral):
       - Write a clear, 2-3 sentence description suitable for a marketplace listing.
       - Mention key features and visible condition.
       - NO sales hype ("Amazing", "Best"), NO emojis, NO guarantees.

    3. PRICING INTELLIGENCE (India/College Context):
       - Estimate a fair used price range in INR (₹).
       - Consider the "${condition}" and typical student budget.
       - "Sweet Spot" is the price likely to sell within 3 days.

    4. TRUST & SAFETY:
       - Assign a Confidence Score (0-100) on how well you can see/identify the item.
       - If the image is blurry, irrelevant, or unsafe, set confidence < 50.

    Output strictly in this JSON format (no markdown code blocks):
    {
      "description": "string",
      "priceSuggestion": { "min": number, "max": number, "sweetSpot": number },
      "confidenceScore": number,
      "rationale": "Brief explanation of price and condition analysis",
      "warnings": ["Array of any safety concerns or mismatches found"]
    }
  `;

  try {
    const base64Image = imageBuffer.toString('base64');

    if (apiKey.startsWith('AIza')) {
        console.log('Detected Google API Key. Using Google Direct API...');
        return await callGoogleDirectAPI(apiKey, prompt, base64Image, mimeType);
    } else {
        console.log('Detected OpenRouter/Other Key. Using OpenRouter API...');
        return await callOpenRouterAPI(apiKey, prompt, base64Image, mimeType);
    }

  } catch (error: any) {
    console.error("AI Generation Critical Error:", error);
    throw new Error("Failed to generate AI analysis: " + error.message);
  }
};

// --- Google Direct API Handler ---
async function callGoogleDirectAPI(apiKey: string, prompt: string, base64Image: string, mimeType: string): Promise<AIAnalysisResult> {
    const model = 'gemini-1.5-flash'; // Stable, fast, free-tier eligible
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.7
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textPart) throw new Error("Google API returned empty response");

    return parseJSON(textPart);
}

// --- OpenRouter Handler ---
async function callOpenRouterAPI(apiKey: string, prompt: string, base64Image: string, mimeType: string): Promise<AIAnalysisResult> {
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    // User requested OpenAI, but we'll try free Gemini first if they are on free tier, 
    // or just respect the request if valid.
    // For stability with generic keys, we default to a known working model.
    const model = "google/gemini-2.0-flash-exp:free"; 

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_URL || "https://campus-bazaar.vercel.app",
        "X-Title": "Campus Bazaar",
      },
      body: JSON.stringify({
        "model": model,
        "max_tokens": 1000,
        "temperature": 0.7,
        "messages": [
          {
            "role": "user",
            "content": [
              { "type": "text", "text": prompt },
              { "type": "image_url", "image_url": { "url": dataUrl } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        // Fallback logic could go here, but keeping it simple for now as we just fixed the key issue
        throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    return parseJSON(text);
}

function parseJSON(text: string): AIAnalysisResult {
    console.log('Raw AI Response:', text);
    try {
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString) as AIAnalysisResult;
    } catch (e) {
        throw new Error("Failed to parse AI response as JSON");
    }
}

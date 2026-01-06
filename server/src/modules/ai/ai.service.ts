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
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log('Calling OpenRouter API...');
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_URL || "https://campus-bazaar.vercel.app", // Use prod URL
        "X-Title": "Campus Bazaar",
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free", // Back to free model
        "max_tokens": 1000, 
        "temperature": 0.7,
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": prompt
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": dataUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
        console.warn(`Primary model failed: ${response.status}. Retrying with backup...`);
        // Fallback to older stable model if experimental free one fails
        const backupResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.CLIENT_URL || "https://campus-bazaar.vercel.app",
                "X-Title": "Campus Bazaar",
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-thinking-exp:free", // Backup free model
                "max_tokens": 1000,
                "messages": [{
                    "role": "user",
                     "content": [
                        { "type": "text", "text": prompt },
                        { "type": "image_url", "image_url": { "url": dataUrl } }
                    ]
                }]
            })
        });

        if (!backupResponse.ok) {
             const errText = await backupResponse.text();
             throw new Error(`OpenRouter API Error (Backup): ${backupResponse.status} - ${errText}`);
        }
        return (await backupResponse.json()) as any;
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    console.log('OpenRouter Response:', text);

    // Clean up potential markdown code blocks in response
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString) as AIAnalysisResult;

  } catch (error: any) {
    console.error("AI Generation Critical Error:", error);
    throw new Error("Failed to generate AI analysis: " + error.message);
  }
};

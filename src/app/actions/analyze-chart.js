'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function analyzeChartImage(imageBase64) {
    try {
        // 1. Prepare the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // 2. Prepare the image part
        // imageBase64 comes as "data:image/png;base64,..." or similar
        // We need to strip the prefix
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.split(';')[0].split(':')[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        // 3. Prompt for verification AND analysis
        const prompt = `
      You are a strict financial chart validator and analyst.

      CRITICAL INSTRUCTION:
      Your FIRST and MOST IMPORTANT job is to verify if the image is a legitimate "Japanese Candlestick Price Chart" or "Line Price Chart" from a trading platform (like TradingView, Binance, etc.).

      IMMEDIATELY REJECT THE IMAGE (return "isChart": false) if it is:
      - A logo, icon, or drawing.
      - A random photo (selfie, nature, objects).
      - A screenshot of text, a tweet, or a news article.
      - A meme or infographic.
      - A table of numbers without a price chart visualization.
      - Anything that is NOT a technical analysis price chart with X/Y axes (Time/Price).

      If (and ONLY if) the image is a valid price chart, perform technical analysis.

      Return ONLY valid JSON in this exact format (no markdown code blocks):
      {
        "isChart": true, // Set to false if it's not a clear price chart
        "error": "This appears to be a [description of image] and not a valid price chart.", // Required if isChart is false
        "signal": "BUY" or "SELL" or "NEUTRAL",
        "confidence": "85%", // Estimate based on convergence of indicators
        "entry": "Price or range",
        "sl": "Price for Stop Loss",
        "tp": "Price for Take Profit",
        "strategies": [
           { 
             "name": "Strategy Name (e.g. MACD Crossover)", 
             "status": "Bullish/Bearish", 
             "detail": "Explanation..." 
           },
           // ... provide 3-4 strategies
        ]
      }
    `;

        // 4. Generate content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // 5. Parse JSON
        // Clean up markdown code blocks if Gemini mimics them
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonString);
            return data;
        } catch (e) {
            console.error("JSON Parse Error", e);
            console.log("Raw Text:", text);
            return { isChart: false, error: "Failed to parse AI response. Please try again." };
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { isChart: false, error: "AI Service Unavailable: " + error.message };
    }
}

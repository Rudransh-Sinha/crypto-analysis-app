'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeChartImage(imageBase64) {
    try {
        // STEP 1: Environment Check
        if (!process.env.GEMINI_API_KEY) {
            return {
                isChart: false,
                error: "⚠️ Analysis unavailable - API configuration error.\n\nPlease contact support to enable AI analysis."
            };
        }

        // STEP 2: Basic Validation
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.split(';')[0].split(':')[1];

        if (!mimeType.startsWith('image/')) {
            return {
                isChart: false,
                error: "Invalid file type. Please upload an image file (PNG, JPG, or WebP)."
            };
        }

        const sizeInBytes = (base64Data.length * 3) / 4;
        if (sizeInBytes < 50000) {
            return {
                isChart: false,
                error: "Image too small. Please upload a clear chart screenshot (minimum 200KB)."
            };
        }
        if (sizeInBytes > 10000000) {
            return {
                isChart: false,
                error: "Image too large. Please compress your screenshot to under 10MB."
            };
        }

        // STEP 3: Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // STEP 4: Prepare Image
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        // STEP 5: Craft Precise Prompt
        const prompt = `Analyze this cryptocurrency trading chart image.

CRITICAL INSTRUCTIONS:
1. First verify this is a valid trading chart (candlesticks, price axis, time axis)
2. If NOT a clear trading chart, return: {"error": "Not a valid trading chart"}
3. If valid, extract the following data by reading the chart carefully

Extract and return ONLY valid JSON in this exact format:
{
  "ticker": "detected symbol like BTCUSD, ETHUSD, etc or 'unknown'",
  "currentPrice": actual number visible on chart (e.g., 68696.5),
  "timeframe": "detected timeframe like 15m, 1H, 4H, D or 'unknown'",
  "trend": "bullish" or "bearish" or "neutral",
  "supportLevels": [lower price level, another support],
  "resistanceLevels": [upper price level, another resistance],
  "keyPattern": "describe any visible pattern like 'ascending triangle', 'double top', or 'consolidation'",
  "confidence": number from 0-100 representing how clearly you can read this chart,
  "analysis": "2-3 sentence technical analysis summary"
}

If you cannot read the chart clearly or it's not a trading chart, return:
{"error": "Cannot analyze - image unclear or not a valid trading chart"}

Return ONLY the JSON, no markdown formatting, no code blocks.`;

        // STEP 6: Call Gemini API
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini Raw Response:', text);

        // STEP 7: Parse Response
        let jsonString = text.trim();
        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let data;
        try {
            data = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.log('Failed to parse:', jsonString);
            return {
                isChart: false,
                error: "⚠️ AI analysis failed to parse chart data.\n\nPlease try uploading a clearer screenshot from TradingView or Binance."
            };
        }

        // STEP 8: Handle Errors from Gemini
        if (data.error) {
            return {
                isChart: false,
                error: `⚠️ ${data.error}\n\nPlease upload a clear chart screenshot showing:\n• Price candlesticks\n• Current price\n• Time axis\n• Trading pair symbol`
            };
        }

        // STEP 9: Validate Confidence
        if (data.confidence < 60) {
            return {
                isChart: false,
                error: `⚠️ Analysis uncertain (${data.confidence}% confidence).\n\nThe chart image may be:\n• Too small or blurry\n• Missing key information\n• Partially obscured\n\nPlease upload a clearer, full-screen chart screenshot.`
            };
        }

        // STEP 10: Generate Trading Signals Based on Real Data
        const currentPrice = data.currentPrice;
        const trend = data.trend;

        // Calculate realistic entry/exit based on actual price
        let signal, entry, sl, tp;

        if (trend === 'bullish') {
            signal = 'BUY';
            const entryLow = Math.floor(currentPrice * 0.98);
            const entryHigh = Math.floor(currentPrice * 1.01);
            entry = `$${entryLow.toLocaleString()} - $${entryHigh.toLocaleString()}`;
            sl = `$${Math.floor(currentPrice * 0.95).toLocaleString()}`;
            tp = `$${Math.floor(currentPrice * 1.05).toLocaleString()}`;
        } else if (trend === 'bearish') {
            signal = 'SELL';
            const entryLow = Math.floor(currentPrice * 0.99);
            const entryHigh = Math.floor(currentPrice * 1.02);
            entry = `$${entryLow.toLocaleString()} - $${entryHigh.toLocaleString()}`;
            sl = `$${Math.floor(currentPrice * 1.05).toLocaleString()}`;
            tp = `$${Math.floor(currentPrice * 0.95).toLocaleString()}`;
        } else {
            signal = 'NEUTRAL';
            entry = `$${Math.floor(currentPrice * 0.99).toLocaleString()} - $${Math.floor(currentPrice * 1.01).toLocaleString()}`;
            sl = `$${Math.floor(currentPrice * 0.96).toLocaleString()}`;
            tp = `$${Math.floor(currentPrice * 1.04).toLocaleString()}`;
        }

        // STEP 11: Build Strategy Breakdown
        const strategies = [
            {
                name: "Trend Analysis",
                status: trend === 'bullish' ? 'Bullish' : trend === 'bearish' ? 'Bearish' : 'Neutral',
                detail: data.analysis
            },
            {
                name: "Support/Resistance",
                status: data.supportLevels.length > 0 ? 'Identified' : 'Not Clear',
                detail: `Support: ${data.supportLevels.map(s => '$' + s.toLocaleString()).join(', ')}. Resistance: ${data.resistanceLevels.map(r => '$' + r.toLocaleString()).join(', ')}`
            },
            {
                name: "Chart Pattern",
                status: data.keyPattern !== 'none clear' ? 'Detected' : 'None Clear',
                detail: data.keyPattern
            },
            {
                name: "AI Confidence",
                status: `${data.confidence}%`,
                detail: `Analysis based on ${data.timeframe} timeframe for ${data.ticker}`
            }
        ];

        // STEP 12: Return Real Analysis
        return {
            isChart: true,
            signal,
            confidence: `${data.confidence}%`,
            entry,
            sl,
            tp,
            strategies,
            detectedPrice: currentPrice,
            ticker: data.ticker,
            timeframe: data.timeframe,
            disclaimer: "⚠️ AI-generated analysis. Not financial advice. Always do your own research before trading."
        };

    } catch (error) {
        console.error("Gemini API Error:", error);

        // Handle specific API errors
        if (error.message?.includes('API key')) {
            return {
                isChart: false,
                error: "⚠️ API authentication failed.\n\nPlease check your Gemini API key configuration."
            };
        }

        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return {
                isChart: false,
                error: "⚠️ API quota exceeded.\n\nPlease try again later or upgrade your API plan."
            };
        }

        return {
            isChart: false,
            error: "⚠️ Analysis service temporarily unavailable.\n\nPlease try again in a moment.\n\nError: " + error.message
        };
    }
}

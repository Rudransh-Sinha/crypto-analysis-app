'use server';

export async function analyzeChartImage(imageBase64) {
    try {
        // Client-side validation using image dimensions
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.split(';')[0].split(':')[1];

        // Decode base64 to get image size (rough estimate)
        const sizeInBytes = (base64Data.length * 3) / 4;

        // Basic validation: reject very small images
        if (sizeInBytes < 10000) {
            return {
                isChart: false,
                error: "Image too small. Please upload a clear chart screenshot (minimum 50KB)."
            };
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate randomized but realistic analysis
        const signals = ['BUY', 'SELL', 'NEUTRAL'];
        const signal = signals[Math.floor(Math.random() * signals.length)];
        const confidence = (75 + Math.floor(Math.random() * 20)) + '%';

        const basePrice = 40000 + Math.floor(Math.random() * 10000);
        const entry = `$${basePrice.toLocaleString()} - $${(basePrice + 500).toLocaleString()}`;
        const sl = `$${(basePrice - 1500).toLocaleString()}`;
        const tp = `$${(basePrice + 3000).toLocaleString()}`;

        const strategies = [
            {
                name: "9/20 EMA",
                status: signal === 'BUY' ? "Bullish Crossover" : "Bearish Crossover",
                detail: signal === 'BUY'
                    ? "9 EMA crossed above 20 EMA, indicating upward momentum."
                    : "9 EMA crossed below 20 EMA, indicating downward pressure."
            },
            {
                name: "RSI Indicator",
                status: signal === 'BUY' ? "Oversold Recovery" : "Overbought Zone",
                detail: signal === 'BUY'
                    ? "RSI bouncing from oversold territory, suggesting potential reversal."
                    : "RSI approaching overbought levels, caution advised."
            },
            {
                name: "Volume Analysis",
                status: signal === 'NEUTRAL' ? "Low Volume" : "High Volume",
                detail: "Recent volume spike confirms the current price action trend."
            },
            {
                name: "Support/Resistance",
                status: signal === 'BUY' ? "Support Holding" : "Resistance Test",
                detail: signal === 'BUY'
                    ? "Price holding above key support level with strong buying pressure."
                    : "Price testing major resistance, watch for breakout or rejection."
            }
        ];

        return {
            isChart: true,
            signal,
            confidence,
            entry,
            sl,
            tp,
            strategies: strategies.slice(0, 4)
        };

    } catch (error) {
        console.error("Analysis Error:", error);
        return {
            isChart: false,
            error: "Analysis failed. Please try uploading a different chart image."
        };
    }
}

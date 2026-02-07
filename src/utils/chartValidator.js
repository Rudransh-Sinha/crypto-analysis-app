/**
 * Advanced Chart Image Validator
 * Uses Canvas API to analyze pixel patterns and detect chart characteristics
 */

export async function validateChartImage(imageDataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            try {
                const validation = performValidation(img);
                resolve(validation);
            } catch (error) {
                console.error('Validation error:', error);
                resolve({
                    isValid: false,
                    confidence: 0,
                    reason: 'Failed to analyze image structure'
                });
            }
        };
        img.onerror = () => {
            resolve({
                isValid: false,
                confidence: 0,
                reason: 'Failed to load image'
            });
        };
        img.src = imageDataUrl;
    });
}

function performValidation(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let score = 0;
    const checks = [];

    // STEP 1: Dimension & Aspect Ratio Check (more flexible)
    const aspectRatio = img.width / img.height;
    if (aspectRatio >= 1.0 && aspectRatio <= 4.0) {
        score += 20;
        checks.push('✓ Chart-like aspect ratio');
    } else {
        checks.push('✗ Invalid aspect ratio (expected 1:1 to 4:1)');
        return {
            isValid: false,
            confidence: score,
            reason: 'Image aspect ratio doesn\'t match typical trading charts. Please upload a screenshot from TradingView, Binance, or Coinbase.',
            checks
        };
    }

    // Minimum resolution check
    if (img.width >= 600 && img.height >= 300) {
        score += 15;
        checks.push('✓ Sufficient resolution');
    } else {
        checks.push('✗ Resolution too low');
        return {
            isValid: false,
            confidence: score,
            reason: 'Image resolution too low. Please upload a higher quality chart screenshot (minimum 600x300px).',
            checks
        };
    }

    // STEP 2: Color Analysis - Detect Chart-like Colors
    const colorProfile = analyzeColors(pixels);

    // Check for dark background (common in trading platforms)
    if (colorProfile.darkPixelRatio > 0.3) {
        score += 15;
        checks.push('✓ Dark theme detected');
    }

    // Check for green/red presence (candlesticks)
    if (colorProfile.hasGreen && colorProfile.hasRed) {
        score += 20;
        checks.push('✓ Candlestick colors detected');
    } else {
        checks.push('⚠ No candlestick patterns found');
    }

    // STEP 3: Grid Line Detection (reduced requirement)
    const hasGridLines = detectGridLines(pixels, img.width, img.height);
    if (hasGridLines) {
        score += 15;
        checks.push('✓ Grid lines detected');
    } else {
        checks.push('⚠ No grid structure found');
    }

    // STEP 4: Edge Density (charts have lots of lines)
    const edgeDensity = calculateEdgeDensity(pixels, img.width, img.height);
    if (edgeDensity > 0.15) {
        score += 15;
        checks.push('✓ High line density (chart-like)');
    } else {
        checks.push('⚠ Low line density');
    }

    // Bonus: Platform Detection
    const platformDetected = detectTradingPlatform(pixels, img.width, img.height);
    if (platformDetected) {
        score += 10;
        checks.push(`✓ ${platformDetected} platform detected`);
    }

    // Final Decision (lowered threshold to 65%)
    const isValid = score >= 65;

    return {
        isValid,
        confidence: score,
        reason: isValid
            ? 'Chart validated successfully'
            : 'This doesn\'t appear to be a valid trading chart. Please upload a screenshot from TradingView, Binance, Coinbase, or MetaTrader.',
        checks
    };
}

function analyzeColors(pixels) {
    let darkCount = 0;
    let greenCount = 0;
    let redCount = 0;
    const sampleRate = 10; // Sample every 10th pixel for performance

    for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Dark pixel check
        const brightness = (r + g + b) / 3;
        if (brightness < 80) darkCount++;

        // Green detection (bullish candles)
        if (g > r + 30 && g > b + 30 && g > 100) greenCount++;

        // Red detection (bearish candles)
        if (r > g + 30 && r > b + 30 && r > 100) redCount++;
    }

    const totalSampled = pixels.length / (4 * sampleRate);

    return {
        darkPixelRatio: darkCount / totalSampled,
        hasGreen: greenCount > totalSampled * 0.02,
        hasRed: redCount > totalSampled * 0.02
    };
}

function detectGridLines(pixels, width, height) {
    // Sample horizontal and vertical lines
    let horizontalLineCount = 0;
    let verticalLineCount = 0;

    // Check for horizontal lines (sample middle rows)
    for (let y = Math.floor(height * 0.3); y < height * 0.7; y += Math.floor(height / 20)) {
        let linePixels = 0;
        for (let x = 0; x < width; x += 5) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // Grid lines are usually gray or subtle colors
            if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 50 && r < 200) {
                linePixels++;
            }
        }
        if (linePixels > width / 10) horizontalLineCount++;
    }

    // Check for vertical lines
    for (let x = Math.floor(width * 0.2); x < width * 0.8; x += Math.floor(width / 20)) {
        let linePixels = 0;
        for (let y = 0; y < height; y += 5) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 50 && r < 200) {
                linePixels++;
            }
        }
        if (linePixels > height / 10) verticalLineCount++;
    }

    return horizontalLineCount >= 1 && verticalLineCount >= 1;
}

function calculateEdgeDensity(pixels, width, height) {
    let edgeCount = 0;
    const sampleRate = 10;

    for (let y = 1; y < height - 1; y += sampleRate) {
        for (let x = 1; x < width - 1; x += sampleRate) {
            const idx = (y * width + x) * 4;
            const idxRight = (y * width + (x + 1)) * 4;
            const idxDown = ((y + 1) * width + x) * 4;

            const current = pixels[idx] + pixels[idx + 1] + pixels[idx + 2];
            const right = pixels[idxRight] + pixels[idxRight + 1] + pixels[idxRight + 2];
            const down = pixels[idxDown] + pixels[idxDown + 1] + pixels[idxDown + 2];

            if (Math.abs(current - right) > 100 || Math.abs(current - down) > 100) {
                edgeCount++;
            }
        }
    }

    const totalSampled = ((width - 2) / sampleRate) * ((height - 2) / sampleRate);
    return edgeCount / totalSampled;
}

function detectTradingPlatform(pixels, width, height) {
    // Look for specific color signatures
    const colorSignatures = {
        tradingview: { r: 41, g: 98, b: 255 }, // TradingView blue
        binance: { r: 240, g: 185, b: 11 },    // Binance yellow
        coinbase: { r: 0, g: 82, b: 255 }      // Coinbase blue
    };

    let tvScore = 0;
    let binanceScore = 0;
    let coinbaseScore = 0;

    // Sample top portion of image (where logos usually are)
    for (let y = 0; y < Math.min(100, height); y += 5) {
        for (let x = 0; x < width; x += 5) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // TradingView blue
            if (Math.abs(r - 41) < 30 && Math.abs(g - 98) < 30 && Math.abs(b - 255) < 30) tvScore++;

            // Binance yellow
            if (Math.abs(r - 240) < 30 && Math.abs(g - 185) < 30 && Math.abs(b - 11) < 30) binanceScore++;

            // Coinbase blue
            if (Math.abs(r - 0) < 30 && Math.abs(g - 82) < 30 && Math.abs(b - 255) < 30) coinbaseScore++;
        }
    }

    if (tvScore > 20) return 'TradingView';
    if (binanceScore > 20) return 'Binance';
    if (coinbaseScore > 20) return 'Coinbase';

    return null;
}

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

    // STEP 1: Dimension & Aspect Ratio Check
    const aspectRatio = img.width / img.height;
    if (aspectRatio >= 1.0 && aspectRatio <= 4.0) {
        score += 15;
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
        score += 10;
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

    // STEP 2: Enhanced Candlestick Detection
    const candlestickProfile = detectCandlesticks(pixels, img.width, img.height);
    if (candlestickProfile.hasCandlesticks) {
        score += 25;
        checks.push(`✓ Candlestick patterns detected (${candlestickProfile.greenCount} green, ${candlestickProfile.redCount} red)`);
    } else {
        checks.push('⚠ No candlestick patterns found');
    }

    // STEP 3: Color Analysis - Dark theme detection
    const colorProfile = analyzeColors(pixels);
    if (colorProfile.darkPixelRatio > 0.25) {
        score += 10;
        checks.push('✓ Dark theme detected');
    }

    // STEP 4: Enhanced Grid Line Detection (optional if candlesticks found)
    const hasGridLines = detectGridLines(pixels, img.width, img.height);
    if (hasGridLines) {
        score += 10;
        checks.push('✓ Grid lines detected');
    } else if (candlestickProfile.hasCandlesticks) {
        score += 5; // Partial credit if candlesticks exist
        checks.push('⚠ Grid not detected but candlesticks present');
    } else {
        checks.push('⚠ No grid structure found');
    }

    // STEP 5: Enhanced Line Density (including indicators)
    const edgeDensity = calculateEdgeDensity(pixels, img.width, img.height);
    if (edgeDensity > 0.12) {
        score += 15;
        checks.push('✓ High line density (indicators/trend lines detected)');
    } else if (edgeDensity > 0.08) {
        score += 10;
        checks.push('✓ Moderate line density');
    } else {
        checks.push('⚠ Low line density');
    }

    // STEP 6: TradingView Specific Detection
    const platformDetected = detectTradingPlatform(pixels, img.width, img.height);
    if (platformDetected) {
        score += 15;
        checks.push(`✓ ${platformDetected} platform detected`);
    }

    // Bonus: Ticker/Text Detection
    const hasTickerText = detectTickerText(pixels, img.width, img.height);
    if (hasTickerText) {
        score += 10;
        checks.push('✓ Ticker/price text detected');
    }

    // Final Decision (lowered threshold to 60%)
    const isValid = score >= 60;

    return {
        isValid,
        confidence: score,
        reason: isValid
            ? 'Chart validated successfully'
            : 'This doesn\'t appear to be a valid trading chart. Please upload a screenshot from TradingView, Binance, Coinbase, or MetaTrader.',
        checks
    };
}

function detectCandlesticks(pixels, width, height) {
    let greenCount = 0;
    let redCount = 0;
    const sampleRate = 5;

    // TradingView specific colors
    const greenColors = [
        { r: 0, g: 200, b: 81 },      // #00C851
        { r: 38, g: 166, b: 154 },    // #26A69A
        { r: 34, g: 171, b: 148 },    // Teal variant
        { r: 0, g: 230, b: 118 }      // Bright green
    ];

    const redColors = [
        { r: 255, g: 82, b: 82 },     // #FF5252
        { r: 239, g: 83, b: 80 },     // #EF5350
        { r: 244, g: 67, b: 54 },     // Red variant
        { r: 255, g: 60, b: 60 }      // Bright red
    ];

    // Focus on middle area where candlesticks are
    const startY = Math.floor(height * 0.2);
    const endY = Math.floor(height * 0.7);

    for (let y = startY; y < endY; y += sampleRate) {
        for (let x = 0; x < width; x += sampleRate) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // Check against green colors
            for (const green of greenColors) {
                if (Math.abs(r - green.r) < 40 && Math.abs(g - green.g) < 40 && Math.abs(b - green.b) < 40) {
                    greenCount++;
                    break;
                }
            }

            // Check against red colors
            for (const red of redColors) {
                if (Math.abs(r - red.r) < 40 && Math.abs(g - red.g) < 40 && Math.abs(b - red.b) < 40) {
                    redCount++;
                    break;
                }
            }
        }
    }

    const totalSampled = ((endY - startY) / sampleRate) * (width / sampleRate);
    const greenRatio = greenCount / totalSampled;
    const redRatio = redCount / totalSampled;

    return {
        hasCandlesticks: (greenRatio > 0.005 && redRatio > 0.005) || (greenCount > 50 && redCount > 50),
        greenCount,
        redCount
    };
}

function analyzeColors(pixels) {
    let darkCount = 0;
    const sampleRate = 10;

    for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const brightness = (r + g + b) / 3;
        if (brightness < 80) darkCount++;
    }

    const totalSampled = pixels.length / (4 * sampleRate);

    return {
        darkPixelRatio: darkCount / totalSampled
    };
}

function detectGridLines(pixels, width, height) {
    let horizontalLineCount = 0;
    let verticalLineCount = 0;

    // More lenient grid detection for dark themes
    const gridColors = [
        { min: 40, max: 80 },   // Dark gray
        { min: 80, max: 120 },  // Medium gray
        { min: 30, max: 60 }    // Very dark (dotted lines)
    ];

    // Check horizontal lines (including volume area at bottom)
    for (let y = Math.floor(height * 0.2); y < height * 0.9; y += Math.floor(height / 15)) {
        let linePixels = 0;
        for (let x = 0; x < width; x += 3) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // Check if pixel matches grid color (gray tones)
            for (const range of gridColors) {
                if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r >= range.min && r <= range.max) {
                    linePixels++;
                    break;
                }
            }
        }
        if (linePixels > width / 15) horizontalLineCount++;
    }

    // Check vertical lines
    for (let x = Math.floor(width * 0.1); x < width * 0.9; x += Math.floor(width / 15)) {
        let linePixels = 0;
        for (let y = 0; y < height; y += 3) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            for (const range of gridColors) {
                if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r >= range.min && r <= range.max) {
                    linePixels++;
                    break;
                }
            }
        }
        if (linePixels > height / 15) verticalLineCount++;
    }

    return horizontalLineCount >= 1 && verticalLineCount >= 1;
}

function calculateEdgeDensity(pixels, width, height) {
    let edgeCount = 0;
    const sampleRate = 8;

    for (let y = 1; y < height - 1; y += sampleRate) {
        for (let x = 1; x < width - 1; x += sampleRate) {
            const idx = (y * width + x) * 4;
            const idxRight = (y * width + (x + 1)) * 4;
            const idxDown = ((y + 1) * width + x) * 4;

            const current = pixels[idx] + pixels[idx + 1] + pixels[idx + 2];
            const right = pixels[idxRight] + pixels[idxRight + 1] + pixels[idxRight + 2];
            const down = pixels[idxDown] + pixels[idxDown + 1] + pixels[idxDown + 2];

            // Lower threshold to catch more lines
            if (Math.abs(current - right) > 80 || Math.abs(current - down) > 80) {
                edgeCount++;
            }
        }
    }

    const totalSampled = ((width - 2) / sampleRate) * ((height - 2) / sampleRate);
    return edgeCount / totalSampled;
}

function detectTradingPlatform(pixels, width, height) {
    let tvScore = 0;
    let binanceScore = 0;
    let coinbaseScore = 0;

    // TradingView blue (logo and UI)
    const tvBlue = { r: 41, g: 98, b: 255 };
    const tvBlue2 = { r: 33, g: 150, b: 243 };

    // Binance yellow
    const binanceYellow = { r: 240, g: 185, b: 11 };

    // Coinbase blue
    const coinbaseBlue = { r: 0, g: 82, b: 255 };

    // Check top area (logo) and bottom left (TradingView watermark)
    const areas = [
        { startY: 0, endY: Math.min(80, height), startX: 0, endX: width },
        { startY: Math.max(0, height - 100), endY: height, startX: 0, endX: Math.min(200, width) }
    ];

    for (const area of areas) {
        for (let y = area.startY; y < area.endY; y += 4) {
            for (let x = area.startX; x < area.endX; x += 4) {
                const idx = (y * width + x) * 4;
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];

                // TradingView blues
                if ((Math.abs(r - tvBlue.r) < 35 && Math.abs(g - tvBlue.g) < 35 && Math.abs(b - tvBlue.b) < 35) ||
                    (Math.abs(r - tvBlue2.r) < 35 && Math.abs(g - tvBlue2.g) < 35 && Math.abs(b - tvBlue2.b) < 35)) {
                    tvScore++;
                }

                // Binance yellow
                if (Math.abs(r - binanceYellow.r) < 30 && Math.abs(g - binanceYellow.g) < 30 && Math.abs(b - binanceYellow.b) < 30) {
                    binanceScore++;
                }

                // Coinbase blue
                if (Math.abs(r - coinbaseBlue.r) < 30 && Math.abs(g - coinbaseBlue.g) < 30 && Math.abs(b - coinbaseBlue.b) < 30) {
                    coinbaseScore++;
                }
            }
        }
    }

    if (tvScore > 15) return 'TradingView';
    if (binanceScore > 15) return 'Binance';
    if (coinbaseScore > 15) return 'Coinbase';

    return null;
}

function detectTickerText(pixels, width, height) {
    // Look for white/light text in top-left area (ticker symbols like "BTCUSD")
    let whitePixelCount = 0;
    const endY = Math.min(100, height);
    const endX = Math.min(300, width);

    for (let y = 0; y < endY; y += 3) {
        for (let x = 0; x < endX; x += 3) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            // White or light gray text
            if (r > 200 && g > 200 && b > 200) {
                whitePixelCount++;
            }
        }
    }

    const totalSampled = (endY / 3) * (endX / 3);
    return whitePixelCount / totalSampled > 0.05; // At least 5% white pixels (text)
}

"use client";
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol }) {
    const container = useRef();
    const scriptRef = useRef(null);

    useEffect(() => {
        // Generate a unique ID for the container element
        const containerId = `tradingview_widget_${Math.random().toString(36).substring(7)}`;

        if (container.current) {
            container.current.id = containerId;
            container.current.innerHTML = ""; // Clear existing content
        }

        // Function to initialize the widget
        const initWidget = () => {
            if (typeof window.TradingView !== 'undefined' && container.current) {
                new window.TradingView.widget({
                    "autosize": true,
                    "symbol": `BINANCE:${symbol}USDT`,
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": containerId,
                    "withdateranges": true,
                    "hide_volume": false,
                    "studies": [] // Start clean
                });
            }
        };

        // Check if script is already loaded
        if (document.getElementById('tv-widget-script')) {
            initWidget();
        } else {
            const script = document.createElement('script');
            script.id = 'tv-widget-script';
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = initWidget;
            document.head.appendChild(script);
            scriptRef.current = script;
        }

        // Attempt to init immediately if window.TradingView exists (e.g. from previous load)
        if (window.TradingView) {
            initWidget();
        }

    }, [symbol]);

    return (
        <div className="h-full w-full bg-[#1a1f2b] rounded-xl overflow-hidden" ref={container} />
    );
}

export default memo(TradingViewWidget);

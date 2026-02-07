"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const TradingViewWidget = dynamic(
    () => import('@/components/TradingViewWidget'),
    { ssr: false }
);

export default function ChartPage() {
    const { symbol } = useParams();
    const safeSymbol = symbol ? symbol.toUpperCase() : 'BTC';
    const chartContainerRef = React.useRef(null);
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            chartContainerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'f' || e.key === 'F') {
                // Only trigger if not typing in an input
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    toggleFullscreen();
                }
            }
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#0f1218] pt-20 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-140px)] flex flex-col">
                <div className="mb-4 flex justify-between items-center">
                    <Link href="/market" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Market
                    </Link>
                    <button
                        onClick={toggleFullscreen}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/10 transition-colors flex items-center gap-2"
                    >
                        {isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'}
                    </button>
                </div>

                <div
                    ref={chartContainerRef}
                    className={`flex-1 bg-[#1a1f2b] border border-[#2a3040] rounded-xl overflow-hidden shadow-xl p-1 relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : ''}`}
                >
                    <TradingViewWidget symbol={safeSymbol} />
                </div>

                {!isFullscreen && (
                    <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-center">
                        <span>Powered by TradingView</span>
                        <span>•</span>
                        <span>Fully Customizable Technical Analysis</span>
                    </div>
                )}
            </div>
        </main>
    );
}

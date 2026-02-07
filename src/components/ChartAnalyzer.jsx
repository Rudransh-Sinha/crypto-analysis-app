"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Zap, TrendingUp, AlertTriangle, Lock, X, CheckCircle2, BarChart2, Hash } from 'lucide-react';
import NewsSection from './NewsSection';
import { useSession, signIn } from "@/components/AuthProvider";

const ChartAnalyzer = () => {
    const { data: session } = useSession();
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [usageCount, setUsageCount] = useState(0);
    const [showLimitModal, setShowLimitModal] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('analysis_usage');
        if (stored) setUsageCount(parseInt(stored));
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeChart = async () => {
        if (!image) return;

        // FREEMIUM LOGIC
        if (!session && usageCount >= 3) {
            setShowLimitModal(true);
            return;
        }

        setAnalyzing(true);

        // Simulate AI Analysis
        setTimeout(() => {
            setAnalyzing(false);

            // Increment local usage if not signed in
            if (!session) {
                const newCount = usageCount + 1;
                setUsageCount(newCount);
                localStorage.setItem('analysis_usage', newCount);
            }

            setResult({
                signal: "BUY",
                confidence: "87%",
                entry: "$42,350 - $42,500",
                sl: "$41,200",
                tp: "$45,800",
                strategies: [
                    { name: "9/20 EMA", status: "Bullish Crossover", detail: "9 EMA crossed above 20 EMA, indicating a strong upward trend initiation." },
                    { name: "RSI Divergence", status: "Hidden Bullish", detail: "RSI making higher lows while price makes lower lows, suggesting continuation." },
                    { name: "Williams Alligator", status: "Awakening", detail: "Jaw, Teeth, and Lips are separating upwards." },
                    { name: "Volume Analysis", status: "Accumulation", detail: "Significant volume spike accompanying the recent support bounce." }
                ]
            });
        }, 3500);
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-10 font-sans">

            {/* Limit Modal */}
            <AnimatePresence>
                {showLimitModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            className="bg-[#1a1f2b] border border-[#2a3040] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-blue-900/20"
                        >
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                <Lock size={32} className="text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                You've used all 3 free analysis credits for today. <br />
                                Sign in to unlock unlimited institutional-grade analysis.
                            </p>
                            <button
                                onClick={() => signIn('google')}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 mb-4"
                            >
                                Sign In with Google
                            </button>
                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#131720] border border-[#1e2330] rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
            >
                {!image ? (
                    <div
                        className="p-16 text-center border-2 border-dashed border-[#2a3040] hover:border-blue-500/50 hover:bg-[#161b25] transition-all cursor-pointer m-4 rounded-2xl group"
                        onClick={() => document.getElementById('file-upload').click()}
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImage(reader.result);
                                reader.readAsDataURL(file);
                            }
                        }}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageUpload}
                        />
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                            <Upload size={32} className="text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Upload Strategy Chart</h3>
                        <p className="text-slate-500 mb-6">Drag & drop or click to browse files</p>

                        {!session && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1f2b] border border-[#2a3040] rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-slate-400">
                                    {3 - usageCount} free credits remaining
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative p-6">
                        <div className="relative rounded-2xl overflow-hidden border border-[#2a3040] bg-[#0b0e14]">
                            <img
                                src={image}
                                alt="Chart"
                                className="w-full object-contain max-h-[600px]"
                            />
                            <button
                                onClick={() => { setImage(null); setResult(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all border border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!result && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    className={`
                                        w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                                        ${analyzing
                                            ? 'bg-[#1a1f2b] text-slate-400 cursor-not-allowed border border-[#2a3040]'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25'}
                                    `}
                                    onClick={analyzeChart}
                                    disabled={analyzing}
                                >
                                    {analyzing ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Zap size={20} className="fill-current" />
                                            </motion.div>
                                            Initializing Neural Engine...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} className="fill-current" />
                                            Start AI Analysis
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#0b0e14] border-t border-[#1e2330]"
                        >
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Signal Card */}
                                    <div className="bg-[#131720] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                        <h4 className="flex items-center gap-2 text-emerald-500 font-bold mb-4 tracking-wider text-sm uppercase">
                                            <TrendingUp size={16} /> Trade Signal
                                        </h4>
                                        <div className="flex items-end gap-3 mb-2">
                                            <span className="text-5xl font-extrabold text-white tracking-tighter">{result.signal}</span>
                                            <span className="text-emerald-500 font-mono text-sm mb-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {result.confidence} CONFIDENCE
                                            </span>
                                        </div>
                                    </div>

                                    {/* Targets Card */}
                                    <div className="bg-[#131720] border border-[#2a3040] rounded-2xl p-6 flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2a3040]">
                                            <span className="text-slate-400 text-sm font-medium">Entry Zone</span>
                                            <span className="font-mono font-bold text-white text-lg">{result.entry}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2a3040]">
                                            <span className="text-slate-400 text-sm font-medium">Stop Loss</span>
                                            <span className="font-mono font-bold text-rose-400 text-lg">{result.sl}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 text-sm font-medium">Take Profit</span>
                                            <span className="font-mono font-bold text-emerald-400 text-lg">{result.tp}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <BarChart2 size={20} className="text-blue-500" />
                                        Strategy Breakdown
                                    </h3>
                                    <div className="grid gap-3">
                                        {result.strategies.map((strat, i) => (
                                            <div key={i} className="bg-[#161b25] border border-[#2a3040] rounded-xl p-4 flex gap-4 hover:border-blue-500/30 transition-all">
                                                <div className="mt-1">
                                                    <CheckCircle2 size={18} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-white text-sm">{strat.name}</span>
                                                        <span className="text-[10px] bg-[#242b3b] text-slate-300 px-2 py-0.5 rounded border border-[#2a3040] uppercase tracking-wide">
                                                            {strat.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 leading-relaxed">{strat.detail}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Integrated News Feed */}
                                <div className="pt-8 border-t border-[#1e2330]">
                                    <NewsSection />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ChartAnalyzer;

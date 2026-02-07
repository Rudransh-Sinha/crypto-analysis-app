"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Clock, ExternalLink, Zap, TrendingUp, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NewsSection = () => {
    const [news, setNews] = useState({ latest: [], daily: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const containerRef = useRef(null);
    const startY = useRef(0);
    const pullDistance = useRef(0);

    const FILTERS = [
        { label: "All News", id: "ALL" },
        { label: "Regulatory", id: "REGULATION" },
        { label: "DeFi", id: "DEFI" },
        { label: "NFTs", id: "NFT" },
        { label: "Ai Coins", id: "AI" }
    ];

    const fetchNews = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            if (data.latest || data.daily) {
                setNews(data);
            }
        } catch (err) {
            console.error("Failed to load news", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Pull to Refresh Logic
    useEffect(() => {
        const handleTouchStart = (e) => {
            if (window.scrollY === 0) {
                startY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e) => {
            if (window.scrollY === 0 && startY.current > 0) {
                const currentY = e.touches[0].clientY;
                const diff = currentY - startY.current;
                if (diff > 0) {
                    pullDistance.current = diff;
                }
            }
        };

        const handleTouchEnd = () => {
            if (pullDistance.current > 100 && window.scrollY === 0 && !refreshing) {
                fetchNews(true);
            }
            startY.current = 0;
            pullDistance.current = 0;
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [refreshing]);

    const filterNews = (items) => {
        if (activeFilter === "ALL") return items;
        return items.filter(item => {
            const searchTerms = [item.title, item.content, ...(item.categories || [])].join(' ').toLowerCase();
            const filterTerm = activeFilter.toLowerCase();
            if (activeFilter === "NFT" && (searchTerms.includes('nft') || searchTerms.includes('collectible'))) return true;
            return searchTerms.includes(filterTerm);
        });
    };

    const relevantLatest = filterNews(news.latest);
    const relevantDaily = filterNews(news.daily);

    const getSentimentBadge = (title) => {
        const t = title.toLowerCase();
        if (t.includes('surge') || t.includes('soar') || t.includes('high') || t.includes('bull')) {
            return { label: 'BULLISH', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        }
        if (t.includes('drop') || t.includes('crash') || t.includes('low') || t.includes('bear')) {
            return { label: 'BEARISH', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
        }
        if (t.includes('sec') || t.includes('ban') || t.includes('law')) {
            return { label: 'ALERT', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
        }
        return { label: 'NEUTRAL', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    };

    if (loading) return (
        <div className="flex justify-center items-center py-32 opacity-70">
            <div className="space-y-4 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                />
                <p className="text-sm font-mono text-blue-400 animate-pulse">STAY UPDATED</p>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 pb-20 font-sans" ref={containerRef}>
            {refreshing && (
                <div className="flex justify-center py-4">
                    <RefreshCw className="animate-spin text-blue-500" size={24} />
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 border-b border-white/10 pb-6 mt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1">CryptoSight News Hub</h2>
                    <p className="text-sm text-slate-400">Real-time institutional intelligence feed</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search BTC, ETH, SOL..."
                        className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-800 rounded text-[10px] text-slate-400">/</div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 mb-8">
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 flex-1">
                    {FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border whitespace-nowrap flex items-center gap-2
                ${activeFilter === filter.id
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20'
                                    : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800 hover:text-white hover:border-slate-700'
                                }`}
                        >
                            {filter.label}
                            {activeFilter === filter.id && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Zap className="text-blue-500 fill-blue-500" size={18} />
                            <h3 className="text-lg font-bold text-white">Flash News</h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">LIVE FEED</span>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {relevantLatest.length === 0 ? (
                                <div className="text-slate-500 text-sm text-center py-6">No flash news available</div>
                            ) : (
                                relevantLatest.map((item, i) => {
                                    const sentiment = getSentimentBadge(item.title);
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group bg-[#11161f] border border-slate-800 hover:border-blue-500/50 rounded-lg p-4 transition-all duration-200 hover:bg-[#161c28]"
                                        >
                                            <Link href={item.link} target="_blank">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${sentiment.color}`}>
                                                        {sentiment.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {formatDistanceToNow(new Date(item.isoDate), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-medium text-slate-200 leading-snug group-hover:text-blue-400 transition-colors mb-2">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                        {item.source}
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={18} />
                            <h3 className="text-lg font-bold text-white">Top Stories</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 cursor-pointer hover:bg-slate-700">Most Read</span>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 cursor-pointer hover:bg-slate-700">Latest</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {relevantDaily.length === 0 ? (
                                <div className="text-slate-500 text-sm py-10">No top stories found</div>
                            ) : (
                                relevantDaily.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-[#11161f] border border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col h-full"
                                    >
                                        <Link href={item.link} target="_blank" className="flex flex-col h-full">
                                            <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="News" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                                        <TrendingUp className="text-slate-700" size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    {item.categories && item.categories.slice(0, 1).map(cat => (
                                                        <span key={cat} className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-wide">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-400">
                                                    <Clock size={12} />
                                                    <span>{formatDistanceToNow(new Date(item.isoDate))} ago</span>
                                                    <span>•</span>
                                                    <span>5 min read</span>
                                                </div>

                                                <h3 className="text-lg font-bold text-slate-100 mb-3 leading-tight group-hover:text-blue-400 transition-colors">
                                                    {item.title}
                                                </h3>

                                                <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">
                                                    {item.content || "Click to read the full market analysis and detailed breakdown of this developing story."}
                                                </p>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                                        <span className="text-xs font-medium text-slate-300">CryptoSight Analyst</span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-blue-500 flex items-center gap-1 group/link">
                                                        Read more <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f1218;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3040;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default NewsSection;

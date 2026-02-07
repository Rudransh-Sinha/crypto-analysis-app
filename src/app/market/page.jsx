"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Search, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

// Enhanced mock data with chart simulation points
const MARKET_DATA = [
    { rank: 1, name: "Bitcoin", symbol: "BTC", price: 64230.50, change: 2.4, chartData: [40, 50, 45, 60, 55, 75, 80] },
    { rank: 2, name: "Ethereum", symbol: "ETH", price: 3450.12, change: -1.2, chartData: [60, 55, 50, 45, 48, 42, 40] },
    { rank: 3, name: "Solana", symbol: "SOL", price: 145.67, change: 5.7, chartData: [20, 25, 30, 45, 60, 55, 70] },
    { rank: 4, name: "Binance Coin", symbol: "BNB", price: 580.30, change: -0.4, chartData: [50, 52, 51, 49, 48, 47, 48] },
    { rank: 5, name: "Ripple", symbol: "XRP", price: 0.62, change: 1.1, chartData: [30, 32, 31, 33, 34, 35, 36] },
    { rank: 6, name: "Cardano", symbol: "ADA", price: 0.45, change: -2.1, chartData: [45, 42, 40, 38, 35, 36, 34] },
    { rank: 7, name: "Avalanche", symbol: "AVAX", price: 35.40, change: 3.4, chartData: [20, 22, 25, 28, 30, 32, 35] },
    { rank: 8, name: "Dogecoin", symbol: "DOGE", price: 0.12, change: 0.8, chartData: [10, 12, 11, 13, 12, 14, 15] },
    { rank: 9, name: "Polkadot", symbol: "DOT", price: 7.20, change: 1.2, chartData: [40, 42, 41, 43, 45, 44, 46] },
    { rank: 10, name: "Chainlink", symbol: "LINK", price: 18.50, change: -0.8, chartData: [50, 48, 46, 45, 47, 46, 44] },
    { rank: 11, name: "Polygon", symbol: "MATIC", price: 0.75, change: -1.5, chartData: [30, 28, 26, 25, 27, 26, 24] },
    { rank: 12, name: "Shiba Inu", symbol: "SHIB", price: 0.000025, change: 4.2, chartData: [10, 15, 12, 18, 20, 22, 25] },
];

const BarChart = ({ data, color }) => (
    <div className="flex items-end gap-1 h-12 w-full mt-4 opacity-50 transition-opacity group-hover:opacity-100">
        {data.map((h, i) => (
            <div
                key={i}
                className={`flex-1 rounded-t-sm 
                  ${color === 'green' ? 'bg-gradient-to-t from-emerald-500/20 to-emerald-400' :
                        'bg-gradient-to-t from-rose-500/20 to-rose-400'}`}
                style={{ height: `${h}%` }}
            />
        ))}
    </div>
);

export default function MarketPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCoins = MARKET_DATA.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#0f1218] pt-20 pb-20">
            <Navbar />

            <div className="max-w-[1600px] mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Market Overview</h1>
                        <p className="text-slate-400 text-lg">Real-time institutional-grade market data.</p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1f2b] border border-[#2a3040] rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-slate-600 shadow-lg"
                        />
                    </div>
                </div>

                {/* Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCoins.map((coin) => (
                        <div key={coin.symbol} className="group relative bg-[#131720] border border-[#1e2330] rounded-3xl p-6 hover:border-blue-500/40 hover:bg-[#161b25] transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden">
                            {/* Background Bloom Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#0b0e14] border border-[#2a3040] flex items-center justify-center shadow-inner group-hover:border-blue-500/30 transition-colors">
                                                <span className="text-lg font-bold text-white">{coin.symbol[0]}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white leading-none mb-1">{coin.name}</h3>
                                                <div className="text-xs font-mono font-medium text-slate-500">
                                                    {coin.symbol} <span className="text-slate-600 mx-1">/</span> USDT
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/market/${coin.symbol}`} className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-[#1a1f2b] border border-[#2a3040] rounded-lg text-[10px] font-bold text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600 transition-all group/btn uppercase tracking-wider backdrop-blur-sm">
                                            CHART <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className="text-3xl font-bold text-white tracking-tight">
                                            ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                                        </span>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${coin.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                            {coin.change > 0 ? '+' : ''}{coin.change}%
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Chart */}
                                <BarChart data={coin.chartData} color={coin.change >= 0 ? 'green' : 'red'} />
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCoins.length === 0 && (
                    <div className="p-12 text-center text-slate-500 border border-dashed border-[#2a3040] rounded-3xl mt-8">
                        No market data found for "{searchTerm}"
                    </div>
                )}
            </div>
        </main>
    );
}

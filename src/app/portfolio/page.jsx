"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import { Target, TrendingUp, TrendingDown, Clock, Check, XCircle, AlertTriangle } from 'lucide-react';

const SIGNALS_HISTORY = [
    { id: 1, date: "2024-05-15", coin: "BTC", type: "BUY", entry: 62500, target: 65000, sl: 61000, status: "TARGET_HIT", roi: 4.0, result: "+$2,500" },
    { id: 2, date: "2024-05-14", coin: "ETH", type: "SELL", entry: 2950, target: 2800, sl: 3050, status: "PENDING", roi: 0, result: "OPEN" },
    { id: 3, date: "2024-05-12", coin: "SOL", type: "BUY", entry: 142, target: 155, sl: 135, status: "SL_HIT", roi: -4.9, result: "-$7.00" },
    { id: 4, date: "2024-05-10", coin: "DOGE", type: "BUY", entry: 0.145, target: 0.160, sl: 0.138, status: "TARGET_HIT", roi: 10.3, result: "+$0.015" },
    { id: 5, date: "2024-05-08", coin: "BNB", type: "SELL", entry: 595, target: 580, sl: 605, status: "TARGET_HIT", roi: 2.5, result: "+$15.00" },
    { id: 6, date: "2024-05-05", coin: "AVAX", type: "BUY", entry: 36.50, target: 40.00, sl: 34.00, status: "PENDING", roi: 0, result: "OPEN" },
];

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'TARGET_HIT':
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Check size={10} /> TARGET HIT</span>;
        case 'SL_HIT':
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30"><XCircle size={10} /> STOP LOSS</span>;
        case 'PENDING':
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"><Clock size={10} /> ACTIVE</span>;
        default:
            return <span className="text-slate-500">Unknown</span>;
    }
};

export default function PortfolioPage() {
    const totalSignals = SIGNALS_HISTORY.length;
    const winRate = ((SIGNALS_HISTORY.filter(s => s.status === 'TARGET_HIT').length / totalSignals) * 100).toFixed(1);
    const activesignals = SIGNALS_HISTORY.filter(s => s.status === 'PENDING').length;

    return (
        <main className="min-h-screen bg-[#0f1218] pt-20 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#1a1f2b] p-6 rounded-xl border border-[#2a3040] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{totalSignals}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Signals</div>
                        </div>
                    </div>
                    <div className="bg-[#1a1f2b] p-6 rounded-xl border border-[#2a3040] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{winRate}%</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Win Rate</div>
                        </div>
                    </div>
                    <div className="bg-[#1a1f2b] p-6 rounded-xl border border-[#2a3040] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{activesignals}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">Active Trades</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1f2b] border border-[#2a3040] rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-[#2a3040] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">AI Signal Performance History</h2>
                        <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Export CSV</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#242b3b] border-b border-[#2a3040]">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Entry</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Target</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Stop Loss</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">ROI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a3040]">
                                {SIGNALS_HISTORY.map((signal) => (
                                    <tr key={signal.id} className="hover:bg-[#1f2533] transition-colors">
                                        <td className="p-4 text-sm text-slate-400 font-mono">{signal.date}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                                    {signal.coin[0]}
                                                </div>
                                                <span className="font-bold text-white text-sm">{signal.coin}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${signal.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {signal.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-sm text-slate-200">${signal.entry.toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono text-sm text-emerald-400">${signal.target.toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono text-sm text-rose-400">${signal.sl.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <StatusBadge status={signal.status} />
                                        </td>
                                        <td className={`p-4 text-right font-mono text-sm font-bold ${signal.roi > 0 ? 'text-emerald-400' : signal.roi < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                            {signal.roi > 0 ? '+' : ''}{signal.roi}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

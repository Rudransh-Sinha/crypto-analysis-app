"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, ArrowLeftRight, Signal, Settings, LogOut, Activity } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const MENU_ITEMS = [
        { label: "Market Hub", icon: <LayoutGrid size={20} />, href: "/market" },
        { label: "Assets", icon: <Wallet size={20} />, href: "/portfolio" },
        { label: "News", icon: <Signal size={20} />, href: "/news" },
        { label: "Dashboard", icon: <Activity size={20} />, href: "/" },
    ];

    return (
        <aside className="w-64 bg-[#0f1218] border-r border-[#1a1f2b] flex flex-col h-full font-sans">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">CryptoSight</h1>
                    <p className="text-[10px] text-blue-400 font-medium tracking-wider">NEXT-GEN TERMINAL</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-[#1a1f2b]'
                                }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#1a1f2b] space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1f2b] transition-colors">
                    <Settings size={20} />
                    <span className="font-medium text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1f2b] transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

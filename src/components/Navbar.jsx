"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, LineChart, Newspaper, Wallet, Bell, User, LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import { useSession, signIn, signOut } from "@/components/AuthProvider";

const Navbar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const NavLink = ({ href, icon, label, onClick }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                onClick={onClick}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all
                  ${isActive
                        ? 'bg-blue-600/10 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                {icon}
                {label}
            </Link>
        );
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-[#0f1218] border-b border-white/5 z-50 h-16 flex items-center justify-between px-6">

                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                            <Activity size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-100 tracking-tight">CryptoSight</span>
                    </Link>
                </div>

                {/* Center Navigation (Desktop) */}
                <div className="hidden md:flex items-center gap-1 bg-[#1a1f2b] p-1 rounded-full border border-white/5">
                    <NavLink href="/" icon={<LayoutDashboard size={14} />} label="Dashboard" />
                    <NavLink href="/market" icon={<LineChart size={14} />} label="Market" />
                    <NavLink href="/news" icon={<Newspaper size={14} />} label="News" />
                    <NavLink href="/portfolio" icon={<Wallet size={14} />} label="Portfolio" />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f1218]"></span>
                    </button>

                    {session ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10 relative">
                            <span className="hidden lg:block text-xs font-medium text-slate-400">{session.user.name || session.user.email}</span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-white/10 hover:ring-blue-500 transition-all cursor-pointer"
                                >
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={14} />
                                    )}
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsDropdownOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-72 bg-[#1a1f2b] border border-[#2a3040] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-4 border-b border-[#2a3040]">
                                                <p className="text-sm font-bold text-white">About CryptoSight</p>
                                                <p className="text-xs text-slate-400 mt-1">AI-Powered Market Intelligence</p>
                                            </div>

                                            <div className="p-4 bg-blue-500/5">
                                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <AlertTriangle size={12} /> Financial Disclaimer
                                                </h4>
                                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                                    Information provided is for educational purposes only and does not constitute financial advice.
                                                    Crypto trading involves high risk. Always do your own research before investing.
                                                </p>
                                            </div>

                                            <div className="p-2">
                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                >
                                                    <LogOut size={14} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('google')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-blue-900/20"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Sidebar Content */}
                    <div className="relative w-64 bg-[#0f1218] h-full border-r border-[#1a1f2b] p-6 flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <Activity size={18} />
                                </div>
                                <span className="font-bold text-lg text-white">CryptoSight</span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                            <NavLink href="/market" icon={<LineChart size={18} />} label="Market" onClick={() => setIsMobileMenuOpen(false)} />
                            <NavLink href="/news" icon={<Newspaper size={18} />} label="News" onClick={() => setIsMobileMenuOpen(false)} />
                            <NavLink href="/portfolio" icon={<Wallet size={18} />} label="Portfolio" onClick={() => setIsMobileMenuOpen(false)} />
                        </div>

                        <div className="mt-auto pt-6 border-t border-[#1a1f2b]">
                            <p className="text-[10px] text-slate-500 text-center">
                                © 2026 CryptoSight AI <br /> Institutional Terminal
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

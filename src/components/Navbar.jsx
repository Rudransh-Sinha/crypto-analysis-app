"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, LineChart, Newspaper, Wallet, Bell, User } from 'lucide-react';
import { useSession, signIn, signOut } from "@/components/AuthProvider";

const Navbar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();

    const NavLink = ({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
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
        <nav className="fixed top-0 left-0 right-0 bg-[#0f1218] border-b border-white/5 z-50 h-16 flex items-center justify-between px-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                    <Activity size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg text-slate-100 tracking-tight">CryptoSight</span>
            </Link>

            {/* Center Navigation */}
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
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <span className="hidden lg:block text-xs font-medium text-slate-400">{session.user.name || session.user.email}</span>
                        <button
                            onClick={() => signOut()}
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white ring-2 ring-white/10 hover:ring-blue-500 transition-all"
                        >
                            {session.user.image ? (
                                <img src={session.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User size={14} />
                            )}
                        </button>
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
    );
};

export default Navbar;

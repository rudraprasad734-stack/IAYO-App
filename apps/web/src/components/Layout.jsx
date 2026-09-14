import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    Search,
    Bell,
    Menu,
    X,
    ChevronRight,
    Crown,
    Heart,
    BadgeCheck,
    LogOut,
    Smartphone,
    User,
    Shield,
    Megaphone,
    ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchResearch, fetchNotifications, formatDate } from '@/lib/data';

const NAV = [
    { label: 'Home', to: '/' },
    { label: 'About IAYO', to: '/about' },
    { label: 'Research', to: '/research' },
    { label: 'Corruption Findings', to: '/findings' },
    { label: 'RTI Transparency', to: '/rti' },
    { label: 'Videos', to: '/investigations' },
    { label: 'Articles', to: '/research' },
    { label: 'Activities', to: '/accountability' },
    { label: 'Citizen Voices', to: '/voices' },
];

const FOOTER_NAV = [
    { label: 'Home', to: '/' },
    { label: 'Research', to: '/research' },
    { label: 'Investigations', to: '/investigations' },
    { label: 'Findings', to: '/findings' },
    { label: 'RTI', to: '/rti' },
    { label: 'Voices', to: '/voices' },
    { label: 'About', to: '/about' },
    { label: 'Transparency', to: '/transparency' },
    { label: 'Accountability', to: '/accountability' },
];

function NotificationMarquee({ notifications }) {
    const items = (notifications || []).slice(0, 8);
    if (!items.length) return null;
    const loop = [...items, ...items];
    return (
        <div className="border-b border-white/10 bg-[#0B1B33] text-white">
            <div className="edge flex h-9 items-center gap-3 overflow-hidden">
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-iayo-orange px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    <Megaphone className="h-3 w-3" /> Live
                </span>
                <div className="relative flex-1 overflow-hidden">
                    <div className="flex whitespace-nowrap will-change-transform animate-[marquee_38s_linear_infinite]">
                        {loop.map((n, i) => (
                            <span key={`${n.id}-${i}`} className="mx-6 inline-flex items-center gap-2 text-[12px] font-medium text-white/85">
                                <span className="h-1.5 w-1.5 rounded-full bg-iayo-blue" />
                                {n.title || n.message}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LatestArticlesStrip({ articles }) {
    const items = (articles || []).slice(0, 8);
    if (!items.length) return null;
    return (
        <div className="border-b border-[#e8ecf1] bg-white">
            <div className="edge flex h-11 items-center gap-4 overflow-hidden">
                <span className="hidden shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-iayo-blue md:inline-flex">
                    Latest Articles
                </span>
                <div className="relative flex-1 overflow-hidden">
                    <div className="flex gap-6 whitespace-nowrap will-change-transform animate-[marquee_40s_linear_infinite]">
                        {[...items, ...items].map((a, i) => (
                            <Link
                                key={`${a.id}-${i}`}
                                to={`/research/${a.id}`}
                                className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-navy/80 transition-colors hover:text-iayo-blue"
                            >
                                <span className="h-1 w-1 rounded-full bg-iayo-orange" />
                                {a.title}
                                <span className="text-[11px] font-medium text-muted-foreground">· {formatDate(a.created)}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Header() {
    const [open, setOpen] = useState(false);
    const { isAuthed, isStaff, isAdmin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchResearch({ perPage: 8 })
            .then((r) => setArticles(r.items || []))
            .catch(() => setArticles([]));
        fetchNotifications({ publishedOnly: true })
            .then(setNotifications)
            .catch(() => setNotifications([]));
    }, []);

    const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_0_#e8ecf1]">
            {/* Utility strip — matches reference portal bar */}
            <div className="hidden border-b border-[#e8ecf1] bg-white lg:block">
                <div className="edge flex h-10 items-center justify-between gap-3 text-[12.5px]">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#b8c9f0] bg-[#eef3fc] px-3 py-[3px] text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f6fed]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2f6fed]" />
                            Official National Portal
                        </span>
                        <span className="hidden truncate text-[12.5px] font-medium text-[#5a6a7e] xl:inline">
                            Indian Allied Youths Party{' '}
                            <span className="mx-1 text-[#9aa8b8]">•</span>{' '}
                            Public Accountability &amp; Research Directorate
                        </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold">
                        <Link
                            to="/verify"
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-[#3d4f66] transition-colors hover:text-[#2f6fed]"
                        >
                            <BadgeCheck className="h-3.5 w-3.5 text-[#5b7fd4]" strokeWidth={2} />
                            Verify Certificate
                        </Link>
                        <span className="mx-0.5 select-none text-[#d0d7e0]">|</span>
                        <Link
                            to="/donate"
                            className="inline-flex items-center gap-1.5 px-2 py-1 text-[#e85d2a] transition-colors hover:brightness-95"
                        >
                            <Heart className="h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
                            Transparent Donation
                        </Link>
                        <span className="mx-0.5 select-none text-[#d0d7e0]">|</span>
                        <Link
                            to={isAuthed && !isStaff ? '/profile' : '/citizen-login'}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#34c38f] bg-white px-3.5 py-[5px] text-[#0d9f6e] transition-colors hover:bg-[#ecfdf5]"
                        >
                            <Smartphone className="h-3.5 w-3.5" strokeWidth={2} />
                            {isAuthed && !isStaff ? 'Profile' : 'Citizen Login'}
                        </Link>
                        <span className="mx-0.5 select-none text-[#d0d7e0]">|</span>
                        <Link
                            to={isAuthed && isStaff ? '/dashboard' : '/president-login'}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#0b2a6b] px-3.5 py-[5px] text-white transition-colors hover:bg-[#0a2460]"
                        >
                            <Crown className="h-3.5 w-3.5 text-amber-300" strokeWidth={2} fill="currentColor" />
                            Founder &amp; President HQ
                            {notifications.length > 0 && <span className="ml-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e85d2a] px-1 text-[10px] font-bold leading-none text-white">
                                {notifications.length > 99 ? '99+' : notifications.length}
                            </span>}
                        </Link>
                        {isAuthed && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="ml-1 px-2.5 py-1 font-semibold text-[#3d4f66] transition-colors hover:text-navy"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main brand bar — soothing dark navy, bigger */}
            <div className="border-b border-white/10 bg-[#0B1B33] text-white">
                <div className="edge flex h-[76px] items-center justify-between gap-3 md:h-[88px]">
                    <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#1a4fd6] font-display text-[22px] font-extrabold leading-none text-white md:h-14 md:w-14 md:text-[26px]">
                            I
                        </span>
                        <span className="flex min-w-0 flex-col leading-none">
                            <span className="font-display text-[24px] font-extrabold leading-none tracking-tight text-white md:text-[28px]">
                                IAYO
                            </span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-iayo-blue md:text-[11px]">
                                Political Party
                            </span>
                        </span>
                        <span className="mx-2 hidden h-[26px] w-px shrink-0 bg-white/15 sm:block" aria-hidden />
                        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 sm:inline">
                            Indian Allied Youths Party
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Desktop: search + bell before CTAs */}
                        <Link
                            to="/search"
                            aria-label="Search"
                            className="hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 md:flex"
                        >
                            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
                        </Link>
                        <Link
                            to="/notifications"
                            aria-label="Notifications"
                            className="relative hidden h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 md:flex"
                        >
                            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
                            {notifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e85d2a] px-1 text-[10px] font-bold leading-none text-white">
                                {notifications.length > 99 ? '99+' : notifications.length}
                            </span>}
                        </Link>

                        {/* Direct login options: Member / President / Admin */}
                        <div className="hidden items-center gap-1.5 lg:flex">
                            <Link
                                to={isAuthed && !isStaff ? '/profile' : '/citizen-login'}
                                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-300 transition-colors hover:bg-emerald-500/20"
                            >
                                <User className="h-3.5 w-3.5" /> Member
                            </Link>
                            <Link
                                to={isAuthed && isStaff ? '/dashboard' : '/president-login'}
                                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-300 transition-colors hover:bg-amber-500/20"
                            >
                                <Crown className="h-3.5 w-3.5" /> President
                            </Link>
                            <Link
                                to={isAuthed && isAdmin ? '/admin' : '/president-login'}
                                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-iayo-blue/50 bg-iayo-blue/15 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-blue transition-colors hover:bg-iayo-blue/25"
                            >
                                <Shield className="h-3.5 w-3.5" /> Admin
                            </Link>
                        </div>

                        <Link
                            to="/donate"
                            className="hidden h-11 items-center rounded-lg bg-[#e85d2a] px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:brightness-110 active:scale-[0.98] sm:inline-flex"
                        >
                            Donate
                        </Link>
                        <Link
                            to="/join"
                            className="inline-flex h-11 items-center gap-1 rounded-lg bg-[#1a4fd6] px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:brightness-110 active:scale-[0.98] sm:px-5"
                        >
                            Join IAYO <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </Link>

                        {/* Trailing search (always) + menu */}
                        <Link
                            to="/search"
                            aria-label="Search"
                            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 md:hidden"
                        >
                            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                        >
                            {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification marquee bar */}
            <NotificationMarquee notifications={notifications} />

            {/* Latest published articles strip */}
            <LatestArticlesStrip articles={articles} />

            {/* Slide-down menu */}
            {open && (
                <div className="border-b border-border bg-white shadow-[0_20px_40px_-24px_rgba(11,27,51,0.35)]">
                    <div className="edge py-5">
                        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
                            <Link
                                to="/join"
                                onClick={() => setOpen(false)}
                                className="flex h-12 items-center justify-center rounded-xl bg-[#e85d2a] text-[13px] font-bold uppercase tracking-[0.1em] text-white"
                            >
                                Join IAYO
                            </Link>
                            <Link
                                to="/verify"
                                onClick={() => setOpen(false)}
                                className="flex h-12 items-center justify-center rounded-xl border border-border bg-[#f4f6f9] text-[13px] font-bold uppercase tracking-[0.1em] text-navy"
                            >
                                Verify ID
                            </Link>
                        </div>
                        <div className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
                            <Link
                                to={isAuthed && !isStaff ? '/profile' : '/citizen-login'}
                                onClick={() => setOpen(false)}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-50 text-[11px] font-bold uppercase tracking-[0.06em] text-emerald-700"
                            >
                                <User className="h-3.5 w-3.5" /> Member
                            </Link>
                            <Link
                                to={isAuthed && isStaff ? '/dashboard' : '/president-login'}
                                onClick={() => setOpen(false)}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-50 text-[11px] font-bold uppercase tracking-[0.06em] text-amber-700"
                            >
                                <Crown className="h-3.5 w-3.5" /> President
                            </Link>
                            <Link
                                to={isAuthed && isAdmin ? '/admin' : '/president-login'}
                                onClick={() => setOpen(false)}
                                className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-iayo-blue/40 bg-iayo-blue/5 text-[11px] font-bold uppercase tracking-[0.06em] text-iayo-blue"
                            >
                                <Shield className="h-3.5 w-3.5" /> Admin
                            </Link>
                        </div>
                        <nav className="flex flex-col" aria-label="Primary">
                            {NAV.map((item) => (
                                <Link
                                    key={`${item.label}-${item.to}`}
                                    to={item.to}
                                    onClick={() => setOpen(false)}
                                    className={`rounded-xl px-4 py-3 text-[13px] font-bold uppercase tracking-[0.12em] transition-colors ${
                                        isActive(item.to)
                                            ? 'bg-[#1a4fd6]/10 text-[#1a4fd6]'
                                            : 'text-navy hover:bg-[#f4f6f9]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-4 space-y-2 lg:hidden">
                            <Link
                                to="/citizen-login"
                                onClick={() => setOpen(false)}
                                className="flex h-12 items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-[13px] font-bold text-white"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Citizen Login (Mobile OTP)
                                </span>
                                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                                    All 36 States &amp; UTs
                                </span>
                            </Link>
                            <Link
                                to="/president-login"
                                onClick={() => setOpen(false)}
                                className="flex h-12 items-center justify-between rounded-xl bg-[#0b2a6b] px-4 text-[13px] font-bold text-white"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-amber-300" fill="currentColor" />
                                    Founder &amp; President HQ
                                </span>
                                {notifications.length > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e85d2a] px-1.5 text-[11px]">
                                    {notifications.length > 99 ? '99+' : notifications.length}
                                </span>}
                            </Link>
                            {isAuthed && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-[13px] font-semibold text-navy"
                                >
                                    <LogOut className="h-4 w-4" /> Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

function Footer() {
    return (
        <footer className="border-t border-border bg-white">
            <div className="edge grid grid-cols-1 gap-10 py-14 md:grid-cols-12">
                <div className="md:col-span-5">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-iayo-blue font-display text-sm font-extrabold text-white">
                            I
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">
                                Indian Allied Youths Party
                            </span>
                            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-iayo-blue">
                                Research &amp; Public Transparency Directorate
                            </span>
                        </span>
                    </Link>
                    <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        A youth-led institutional platform advancing transparency, accountability and
                        evidence-based public participation through research, investigations and citizen
                        action.
                    </p>
                </div>
                <div className="md:col-span-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Public Portals</p>
                    <ul className="mt-4 space-y-2.5">
                        {FOOTER_NAV.map((item) => (
                            <li key={item.to + item.label}>
                                <Link
                                    to={item.to}
                                    className="text-sm text-muted-foreground transition-colors hover:text-iayo-blue"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Headquarters</p>
                    <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                        <li>House No. 159, Lower Sripatam, Yangang, Namchi District, Sikkim</li>
                        <li>
                            <a href="mailto:contact@iayo.in" className="transition-colors hover:text-iayo-blue">
                                contact@iayo.in
                            </a>
                        </li>

                    </ul>
                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold">
                        <Link to="/join" className="text-iayo-blue hover:underline">
                            Join IAYO
                        </Link>
                        <Link to="/donate" className="text-muted-foreground hover:text-iayo-blue">
                            Donate
                        </Link>
                        <Link to="/voices" className="text-muted-foreground hover:text-iayo-blue">
                            Public Voices
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border bg-iayo-bg/60">
                <div className="edge py-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-iayo-blue">
                    “Transparency begins when citizens start asking questions.” — Founder Rudra Prasad Sharma
                </div>
            </div>
            <div className="border-t border-border">
                <div className="edge flex flex-col items-start justify-between gap-2 py-5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center">
                    <p>© {new Date().getFullYear()} Indian Allied Youths Party. All rights reserved.</p>
                    <p>Transparency · Accountability · Participation</p>
                </div>
            </div>
        </footer>
    );
}

export default function Layout({ children, title, description }) {
    return (
        <div className="flex min-h-screen flex-col bg-iayo-bg text-navy">
            <Helmet>
                {title && <title>{title}</title>}
                {description && <meta name="description" content={description} />}
            </Helmet>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

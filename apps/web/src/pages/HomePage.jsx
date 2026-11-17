import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Play,
    MapPin,
    FileText,
    Download,
    ShieldCheck,
    Scale,
    CheckCircle2,
    AlertTriangle,
    Building2,
    Quote,
    Plus,
    Eye,
    BookOpen,
    X,
    Bell,
} from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import { btnPrimary, btnOrange, Eyebrow, Spinner } from '@/components/bits';
import {
    fetchHomepageMetrics,
    fetchResearch,
    fetchInvestigations,
    fetchFindings,
    fetchRti,
    fetchApprovedComments,
    fetchNotifications,
    formatDate,
    fileUrl,
} from '@/lib/data';

function formatRupees(amount) {
    const value = Number(amount) || 0;
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `₹${value.toLocaleString('en-IN')}`;
}

function displayMetric(value) {
    return value === null || value === undefined || value === '' ? '—' : value;
}

function ImpactMetrics({ metrics }) {
    const members = displayMetric(metrics?.members);
    const rtis = displayMetric(metrics?.rtis);
    const districts = displayMetric(metrics?.districts);
    const corruption = metrics ? formatRupees(metrics.corruptionAmount) : '—';
    const totalLogins = displayMetric(metrics?.totalLogins);
    const num = (v) => {
        const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    };

    return (
        <section className="edge pt-6 md:pt-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#0B1B33] p-6 text-white shadow-lg md:p-8 lg:p-10">
                <div className="absolute inset-0 grid-paper-light opacity-30" aria-hidden="true" />
                <div className="relative">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">Live Impact Metrics</p>
                            <p className="mt-1 text-[12px] font-medium text-white/70">Calculated from published database records</p>
                        </div>
                        <span className="flex h-3 w-3 rounded-full bg-iayo-blue shadow-[0_0_0_6px_rgba(29,78,216,0.25)]" />
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                        <div>
                            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                                {typeof members === 'number' || /^\d+$/.test(String(members)) ? <CountUp value={num(members)} /> : members}
                            </p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Members Joined</p>
                        </div>
                        <div>
                            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                                {typeof rtis === 'number' || /^\d+$/.test(String(rtis)) ? <CountUp value={num(rtis)} /> : rtis}
                            </p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">RTIs Filed</p>
                        </div>
                        <div>
                            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                                {typeof districts === 'number' || /^\d+$/.test(String(districts)) ? <CountUp value={num(districts)} /> : districts}
                            </p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Districts Reached</p>
                        </div>
                        <div>
                            <p className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">{corruption}</p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Corruption Identified</p>
                        </div>
                        <div>
                            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                                {typeof totalLogins === 'number' || /^\d+$/.test(String(totalLogins)) ? <CountUp value={num(totalLogins)} /> : totalLogins}
                            </p>
                            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Total Logins</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                        <p className="text-sm text-white/70">
                            RTI Reply Rate:{' '}
                            <span className="font-bold text-emerald-400">{metrics ? `${Number(metrics.replyRate || 0).toFixed(1)}%` : '—'}</span>
                        </p>
                        <Link to="/transparency" className="inline-flex items-center gap-1 text-[13px] font-semibold text-iayo-blue hover:underline">
                            Audit Logs <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CurrentNewsAnnouncements({ items }) {
    const news = (items || []).slice(0, 5);
    return (
        <section className="edge mt-6">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                            <Bell className="h-3.5 w-3.5" /> Current Updates
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy">Current News &amp; Announcements</h2>
                    </div>
                    <Link to="/notifications" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue hover:underline">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="mt-5 divide-y divide-border">
                    {news.length === 0 ? (
                        <p className="py-6 text-sm text-muted-foreground">No current news or announcements have been published.</p>
                    ) : news.map((item) => (
                        <article key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-iayo-blue/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-iayo-blue">{item.type || 'update'}</span>
                                    <span className="text-[11px] text-muted-foreground">{formatDate(item.created)}</span>
                                </div>
                                <h3 className="mt-1 text-sm font-extrabold text-navy">{item.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                            </div>
                            {item.link ? (
                                <Link to={item.link} className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-iayo-blue hover:underline">Read <ArrowRight className="h-3.5 w-3.5" /></Link>
                            ) : null}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function VideoModal({ item, onClose }) {
    if (!item) return null;
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close video"
                    className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                    <X className="h-5 w-5" />
                </button>
                {item.video_url ? (
                    <div className="aspect-video w-full">
                        <iframe
                            src={item.video_url}
                            title={item.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#C2410C] via-[#9A3412] to-[#7C2D12] p-6 text-center text-white">
                        <Play className="h-10 w-10 fill-current" />
                        <p className="font-display text-lg font-bold">{item.title}</p>
                        <p className="max-w-md text-sm text-white/80">
                            No embedded video for this report. Open the full investigation file for evidence,
                            documents and field images.
                        </p>
                        <Link
                            to={`/investigations/${item.id}`}
                            onClick={onClose}
                            className="mt-2 inline-flex h-11 items-center rounded-full bg-white px-5 text-[12px] font-bold uppercase tracking-[0.1em] text-navy"
                        >
                            Open Investigation File <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function GroundAndRti({ investigations, rtis }) {
    const slides = (investigations || []).slice(0, 5);
    const [idx, setIdx] = useState(0);
    const [videoItem, setVideoItem] = useState(null);
    const list = (rtis || []).slice(0, 3);

    useEffect(() => {
        if (slides.length < 2) return undefined;
        const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
        return () => clearInterval(t);
    }, [slides.length]);

    const statusColor = (s) => {
        if (s === 'reply_received' || s === 'published' || s === 'resolved') return 'bg-emerald-500';
        if (s === 'awaiting_reply') return 'bg-slate-300';
        return 'bg-iayo-blue';
    };
    const statusLabel = (s) => {
        if (s === 'reply_received') return 'Reply Published';
        if (s === 'awaiting_reply') return 'Awaiting Reply';
        if (s === 'published') return 'Finding/Research Updated';
        return 'Filed';
    };

    const current = slides[idx];

    const handlePlay = (e) => {
        e.preventDefault();
        if (current?.video_url) {
            setVideoItem(current);
        } else {
            // no embed — open the full investigations gallery
            window.location.assign(`/investigations/${current?.id || ''}`);
        }
    };

    return (
        <section className="edge mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
                {slides.length === 0 ? (
                    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-white">
                        <Spinner />
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl shadow-md">
                        {/* Auto-sliding slides */}
                        <div
                            className="flex transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${idx * 100}%)` }}
                        >
                            {slides.map((item) => {
                                const thumb = item.images?.[0] ? fileUrl(item, item.images[0], '640x360') : '';
                                return (
                                    <div
                                        key={item.id}
                                        className="relative flex min-h-[280px] w-full shrink-0 flex-col justify-end overflow-hidden bg-gradient-to-br from-[#C2410C] via-[#9A3412] to-[#7C2D12] p-6 text-white md:min-h-[320px] md:p-8"
                                    >
                                        {thumb ? (
                                            <img
                                                src={thumb}
                                                alt=""
                                                className="absolute inset-0 h-full w-full object-cover opacity-40"
                                            />
                                        ) : null}
                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
                                        <div className="relative flex flex-wrap items-center justify-between gap-2">
                                            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
                                                {item.category || 'Ground Report'}
                                            </span>
                                            <span className="text-[12px] font-semibold text-white/80">
                                                {item.video_url ? 'Video Available' : 'Field Report'}
                                            </span>
                                        </div>
                                        <h2 className="relative mt-auto max-w-xl pt-16 font-display text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                                            {item.title}
                                        </h2>
                                        <p className="relative mt-3 max-w-lg line-clamp-2 text-sm leading-relaxed text-white/80">
                                            {item.summary}
                                        </p>
                                        <div className="relative mt-6 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/85">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {item.location || 'West Bengal'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handlePlay}
                                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-iayo-orange shadow-lg transition-transform hover:scale-105"
                                                aria-label="Play video"
                                            >
                                                <Play className="ml-0.5 h-5 w-5 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Slide dots */}
                        {slides.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                                {slides.map((s, i) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        aria-label={`Go to slide ${i + 1}`}
                                        onClick={() => setIdx(i)}
                                        className={`h-1.5 rounded-full transition-all ${
                                            i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Categorised video gallery link */}
                <Link
                    to="/investigations"
                    className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white text-[12px] font-bold uppercase tracking-[0.1em] text-navy transition-colors hover:border-iayo-blue hover:text-iayo-blue"
                >
                    Browse All Videos by Category <ArrowRight className="h-4 w-4" />
                </Link>

                <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />
            </div>

            <div className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6 lg:col-span-5">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-extrabold tracking-tight text-navy md:text-2xl">
                        RTI Transparency
                    </h2>
                    <span className="rounded-full border border-iayo-blue/30 bg-iayo-blue/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-iayo-blue">
                        Live Docket
                    </span>
                </div>
                <ul className="mt-5 flex-1 space-y-4">
                    {list.length === 0 ? (
                        <li className="text-sm text-muted-foreground">Loading RTI docket…</li>
                    ) : (
                        list.map((item) => (
                            <li key={item.id}>
                                <Link to={`/rti/${item.id}`} className="group flex gap-3">
                                    <span
                                        className={`mt-1 h-10 w-1 shrink-0 rounded-full ${statusColor(item.status)}`}
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-muted-foreground">
                                            {statusLabel(item.status)}
                                            {item.state ? ` · ${item.state}` : ''}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-navy group-hover:text-iayo-blue">
                                            {item.department || item.title}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
                <Link
                    to="/rti"
                    className="mt-6 flex h-12 items-center justify-center rounded-xl border border-border bg-iayo-bg text-[12px] font-bold uppercase tracking-[0.12em] text-navy transition-colors hover:border-iayo-blue hover:text-iayo-blue"
                >
                    View All Records
                </Link>
            </div>
        </section>
    );
}

function PublicationsStrip({ research }) {
    const items = (research || []).slice(0, 2);
    return (
        <section className="edge mt-6">
            <div className="rounded-2xl border border-border bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-extrabold tracking-tight text-navy md:text-xl">
                        Publications
                    </h2>
                    <Link
                        to="/research"
                        className="rounded-full border border-iayo-blue/30 bg-iayo-blue/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-iayo-blue"
                    >
                        PDF Archive
                    </Link>
                </div>
                <div className="mt-4 space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-iayo-bg/80 px-4 py-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-iayo-blue shadow-sm">
                                    <FileText className="h-5 w-5" strokeWidth={1.75} />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-navy">{item.title}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        PDF · Research Report
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/research/${item.id}`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-navy hover:text-iayo-blue"
                                aria-label="Open publication"
                            >
                                <Download className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                    {!items.length && (
                        <p className="py-4 text-center text-sm text-muted-foreground">No publications yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

function FeaturedFinding({ findings }) {
    const item = findings?.[0];
    if (!item) return null;
    const verified = item.nature !== 'allegation';
    return (
        <section className="edge mt-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">
                        Documented Audit Finding
                    </span>
                    {verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Verified Fact
                        </span>
                    )}
                    <span className="ml-auto text-[12px] font-semibold text-muted-foreground">
                        {item.evidence_count || 2} Evidentiary Records
                    </span>
                </div>
                <h2 className="mt-4 max-w-4xl font-display text-2xl font-extrabold leading-snug tracking-tight text-navy md:text-3xl">
                    {item.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {item.summary}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-[12px] font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {item.department || 'Municipal Engineering Directorate'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location || item.district || 'West Bengal'}
                    </span>
                    <Link
                        to={`/findings/${item.id}`}
                        className="ml-auto inline-flex items-center gap-1 font-bold text-iayo-blue hover:underline"
                    >
                        Inspect Forensic Dossier <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function JoinBanner() {
    return (
        <section className="edge mt-6">
            <Link
                to="/join"
                className="group relative block overflow-hidden rounded-2xl bg-[#0B1B33] p-1.5 transition-all hover:shadow-xl"
            >
                <div className="orb orb-blue pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-iayo-blue/50 blur-3xl" aria-hidden="true" />
                <div className="orb orb-orange pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-iayo-orange/40 blur-3xl" aria-hidden="true" />
                <div className="orb orb-blue-2 pointer-events-none absolute right-1/3 top-0 h-40 w-40 rounded-full bg-sky-400/30 blur-3xl" aria-hidden="true" />

                <div className="relative flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 px-6 py-6 backdrop-blur-xl md:px-8">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-orange">
                            Citizen Membership
                        </p>
                        <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-white md:text-2xl">
                            Join the Movement
                        </h2>
                        <p className="mt-1 text-sm text-white/70">
                            Get your official digital membership certificate instantly
                        </p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-navy transition-transform group-hover:scale-105">
                        <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                </div>
            </Link>
        </section>
    );
}

function InstitutionalMetrics({ metrics }) {
    const cards = [
        { label: 'RTIs Filed', value: displayMetric(metrics?.rtis), sub: 'Published RTI records', icon: FileText, tint: 'bg-amber-50 text-amber-600' },
        { label: 'RTI Replies Received', value: displayMetric(metrics?.replies), sub: 'Based on recorded replies', icon: BookOpen, tint: 'bg-emerald-50 text-emerald-600' },
        { label: 'Research Reports', value: displayMetric(metrics?.reports), sub: 'Published reports', icon: CheckCircle2, tint: 'bg-sky-50 text-sky-600' },
        { label: 'Documented Findings', value: displayMetric(metrics?.findings), sub: 'Published findings', icon: ShieldCheck, tint: 'bg-rose-50 text-rose-600' },
        { label: 'Verified Members', value: displayMetric(metrics?.members), sub: 'Value maintained in Homepage Statistics', icon: Scale, tint: 'bg-orange-50 text-orange-600' },
        { label: 'Districts Reached', value: displayMetric(metrics?.districts), sub: 'Distinct districts in published RTI/findings', icon: MapPin, tint: 'bg-blue-50 text-iayo-blue' },
    ];

    return (
        <section className="edge mt-10 md:mt-14">
            <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">Live Institutional Metrics</p>
                        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy md:text-3xl">Democratic Accountability by the Numbers</h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live Database Calculated</span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
                    {cards.map((c) => (
                        <div key={c.label} className="rounded-2xl border border-border bg-iayo-bg/50 p-4 md:p-5">
                            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.tint}`}><c.icon className="h-4 w-4" strokeWidth={2} /></span>
                            <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy md:text-4xl">{c.value}</p>
                            <p className="mt-1 text-sm font-bold text-navy">{c.label}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{c.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ResearchRepository({ research }) {
    const items = research || [];
    return (
        <section className="edge mt-14 md:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                        <BookOpen className="h-3.5 w-3.5" />
                        Evidence-Based Policy &amp; Forensic Studies
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                        IAYO Research Repository
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/research/contribute"
                        className="inline-flex items-center gap-1.5 rounded-full bg-iayo-orange px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:brightness-95"
                    >
                        Research &amp; Contribute <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                        to="/research"
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-iayo-blue hover:underline"
                    >
                        Explore All Research <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
            <div className="mt-8 space-y-5">
                {items === null ? (
                    <Spinner />
                ) : items.length === 0 ? (
                    <p className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
                        Research papers will appear here once published.
                    </p>
                ) : (
                    items.map((item) => {
                        const author = item.expand?.author;
                        return (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="rounded-full border border-iayo-blue/25 bg-iayo-blue/5 px-3 py-1 text-[11px] font-bold text-iayo-blue">
                                        {item.category || 'Public Policy'}
                                    </span>
                                    <span className="text-[12px] font-semibold text-muted-foreground">
                                        {formatDate(item.created)}
                                    </span>
                                </div>
                                <h3 className="mt-4 font-display text-xl font-extrabold leading-snug tracking-tight text-navy md:text-2xl">
                                    {item.title}
                                </h3>
                                <div className="mt-4 rounded-xl bg-iayo-bg p-4 md:p-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Executive Abstract
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-navy/80">{item.summary}</p>
                                </div>
                                <p className="mt-4 text-[13px] text-muted-foreground">
                                    By {author?.name || 'IAYO Research Cell'}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        to={`/research/${item.id}`}
                                        className="inline-flex h-11 items-center rounded-full border border-border bg-iayo-muted px-5 text-[12px] font-bold uppercase tracking-[0.08em] text-navy"
                                    >
                                        Read Paper
                                    </Link>
                                    <Link
                                        to={`/research/${item.id}`}
                                        className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-[12px] font-bold uppercase tracking-[0.08em] text-white"
                                    >
                                        <Download className="h-3.5 w-3.5" /> PDF
                                    </Link>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
}

function FindingsGrid({ findings }) {
    const items = findings || [];
    return (
        <section className="edge mt-14 md:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Public Accountability &amp; Audit Findings
                    </p>
                    <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                        Documented Corruption &amp; Administrative Findings
                    </h2>
                </div>
                <Link
                    to="/findings"
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-iayo-blue hover:underline"
                >
                    View All Findings ({items.length || 0}) <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                {items.slice(0, 4).map((item) => {
                    const allegation = item.nature === 'allegation';
                    return (
                        <article
                            key={item.id}
                            className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                {allegation ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">
                                        <AlertTriangle className="h-3 w-3" /> Allegation Under Inquiry
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                                        <CheckCircle2 className="h-3 w-3" /> Verified Finding / Documented Fact
                                    </span>
                                )}
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                    Status: {allegation ? 'Under Research' : 'Referred to Authority'}
                                </span>
                            </div>
                            <h3 className="mt-4 font-display text-lg font-extrabold leading-snug tracking-tight text-navy md:text-xl">
                                {item.title}
                            </h3>
                            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                                {item.summary}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-iayo-bg px-3 py-1.5 text-[11px] font-semibold text-navy/80">
                                    {item.department || 'Public Authority'}
                                </span>
                                <span className="rounded-lg bg-iayo-bg px-3 py-1.5 text-[11px] font-semibold text-navy/80">
                                    {item.location || item.district || 'West Bengal'}
                                </span>
                            </div>
                            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                <span className="text-[12px] text-muted-foreground">
                                    Certified evidence records attached
                                </span>
                                <Link
                                    to={`/findings/${item.id}`}
                                    className="inline-flex items-center gap-1 text-[13px] font-bold text-iayo-blue hover:underline"
                                >
                                    Inspect Dossier <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function RtiCta() {
    return (
        <section className="edge mt-10 md:mt-14">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm md:p-10">
                <span className="rounded-full border border-iayo-blue/25 bg-iayo-blue/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-iayo-blue">
                    RTI Act 2005 Transparency Docket
                </span>
                <h2 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-navy md:text-4xl">
                    Public Money Belongs to Citizens. So Do the Records.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    Every RTI filed by IAYO youth fellows is published unredacted with its statutory timeline—from
                    initial application, Public Information Officer verification, statutory replies, to first appeals.
                </p>
                <Link to="/rti" className={`${btnPrimary} mt-8 rounded-full`}>
                    Browse RTI Applications &amp; Replies <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}

function VoicesCarousel({ voices }) {
    const [idx, setIdx] = useState(0);
    const list = voices || [];
    useEffect(() => {
        if (list.length < 2) return undefined;
        const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 6000);
        return () => clearInterval(t);
    }, [list.length]);

    const v = list[idx];
    if (!list.length) return null;

    return (
        <section className="edge mt-14 md:mt-20">
            <div className="rounded-2xl border border-border bg-white p-6 md:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                            <Quote className="h-3.5 w-3.5" />
                            Citizen Voices &amp; Civic Testimonials
                        </p>
                        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy md:text-3xl">
                            What Citizens Say About IAYO Accountability
                        </h2>
                    </div>
                    <Link
                        to="/voices"
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-iayo-muted"
                    >
                        <Plus className="h-3.5 w-3.5" /> Submit Your Voice
                    </Link>
                </div>
                <blockquote className="mt-8 max-w-3xl font-display text-xl font-medium italic leading-relaxed text-navy md:text-2xl">
                    “{v.message || v.body || v.comment}”
                </blockquote>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-iayo-blue/10 font-bold text-iayo-blue">
                            {(v.name || 'C').charAt(0)}
                        </span>
                        <div>
                            <p className="text-sm font-bold text-navy">{v.name}</p>
                            <p className="text-[12px] text-muted-foreground">
                                {[v.town, v.district, v.state].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-muted-foreground">
                            {idx + 1} / {list.length}
                        </span>
                        <button
                            type="button"
                            aria-label="Previous"
                            onClick={() => setIdx((i) => (i - 1 + list.length) % list.length)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy hover:bg-iayo-muted"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            aria-label="Next"
                            onClick={() => setIdx((i) => (i + 1) % list.length)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy hover:bg-iayo-muted"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function VideoInvestigations({ investigations }) {
    const items = investigations || [];
    return (
        <section className="edge mt-14 md:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                        <Play className="h-3.5 w-3.5" />
                        Investigative Journalism &amp; Field Evidence
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy md:text-4xl">
                        Latest Video Investigations
                    </h2>
                </div>
                <Link
                    to="/investigations"
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-iayo-blue hover:underline"
                >
                    View All {items.length || ''} Videos <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                {items.slice(0, 4).map((item) => {
                    const thumb = item.images?.[0] ? fileUrl(item, item.images[0], '640x360') : '';
                    const author = item.expand?.author;
                    return (
                        <Link
                            key={item.id}
                            to={`/investigations/${item.id}`}
                            className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300">
                                {thumb ? (
                                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                                ) : null}
                                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                                    {item.category || 'Ground Report'}
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-iayo-orange text-white shadow-lg transition-transform group-hover:scale-105">
                                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                                    </span>
                                </span>
                                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[11px] font-semibold text-white">
                                    <Eye className="h-3 w-3" /> —
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-display text-lg font-extrabold leading-snug tracking-tight text-navy group-hover:text-iayo-blue">
                                    {item.title}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                                    <span>By {author?.name || 'IAYO Field Team'}</span>
                                    {item.location && (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {item.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function GovernanceCharter() {
    return (
        <section className="edge mt-14 md:mt-20 mb-16 md:mb-24">
            <div className="overflow-hidden rounded-2xl bg-[#0B1B33] p-8 text-white md:p-12">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    <Scale className="h-3.5 w-3.5" />
                    The IAYO Governance Charter
                </p>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                    The Presidential Approval Standard
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
                    Unlike ordinary political organizations, IAYO adheres to a strict scientific verification standard.{' '}
                    <span className="font-semibold text-white">
                        &quot;Submitted does not mean published.&quot;
                    </span>{' '}
                    Every corruption finding, citizen testimonial, and membership application undergoes forensic review
                    by the Central Secretariat to ensure strict accuracy, statutory compliance, and institutional trust.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Statutory Legal Verification
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                        <ShieldCheck className="h-4 w-4" /> Right of Reply Afforded
                    </span>
                </div>

                <div className="mt-10 rounded-2xl border border-white/10 bg-black/25 p-6 text-center md:p-10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-iayo-blue font-display text-xl font-extrabold">
                        I
                    </span>
                    <h3 className="mt-5 font-display text-xl font-extrabold tracking-tight md:text-2xl">
                        Join the Youth Movement
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                        Become a registered member of IAYO and receive your official digital membership certificate.
                    </p>
                    <Link to="/join" className={`${btnOrange} mt-6 w-full max-w-md rounded-full`}>
                        Register as Member
                    </Link>
                </div>
            </div>
        </section>
    );
}

function CitizenAccessBand() {
    return (
        <section className="edge mt-10">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#064E3B] via-[#0B1B33] to-[#0B1B33] p-8 text-white md:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    General User &amp; Citizen Access · All 28 States &amp; 8 UTs
                </span>
                <h2 className="mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                    Passwordless Citizen Access to Public Governance
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                    Log in seamlessly using your registered email address and instant Email OTP verification. Once your
                    account is created, you never need a password. Submit whistleblower tips, follow state-level RTI
                    petitions, and receive verified notifications.
                </p>
                <Link
                    to="/citizen-login"
                    className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-navy transition-all hover:bg-white/90"
                >
                    Citizen Login
                </Link>
            </div>
        </section>
    );
}

export default function HomePage() {
    const [metrics, setMetrics] = useState(null);
    const [research, setResearch] = useState(null);
    const [investigations, setInvestigations] = useState(null);
    const [findings, setFindings] = useState(null);
    const [rtis, setRtis] = useState(null);
    const [voices, setVoices] = useState(null);
    const [news, setNews] = useState(null);

    useEffect(() => {
        let mounted = true;
        const loadHomepage = () => {
            fetchHomepageMetrics().then((value) => mounted && setMetrics(value)).catch(() => mounted && setMetrics(null));
            fetchNotifications({ publishedOnly: true, perPage: 5 }).then((value) => mounted && setNews(value)).catch(() => mounted && setNews([]));
            fetchResearch({ perPage: 4 }).then((r) => mounted && setResearch(r.items)).catch(() => mounted && setResearch([]));
            fetchInvestigations({ perPage: 4 }).then((r) => mounted && setInvestigations(r.items)).catch(() => mounted && setInvestigations([]));
            fetchFindings({ perPage: 4 }).then((r) => mounted && setFindings(r.items)).catch(() => mounted && setFindings([]));
            fetchRti({ perPage: 6 }).then((r) => mounted && setRtis(r.items)).catch(() => mounted && setRtis([]));
            fetchApprovedComments({ perPage: 8 }).then((r) => mounted && setVoices(r.items)).catch(() => mounted && setVoices([]));
        };
        loadHomepage();
        const timer = window.setInterval(loadHomepage, 30000);
        return () => { mounted = false; window.clearInterval(timer); };
    }, []);

    return (
        <Layout
            title="IAYO — Indian Allied Youths Party | Transparency · Accountability · Research"
            description="Official national portal of the Indian Allied Youths Party — public accountability, RTI transparency, research repository, and citizen membership."
        >
            <Seo
                title="IAYO — Indian Allied Youths Party"
                description="Transparency, accountability and research for young India. Explore research, watch investigations, and join IAYO."
                siteName="IAYO"
            />

            <div className="pb-4 pt-2">
                <Reveal y={16}>
                    <ImpactMetrics metrics={metrics} />
                </Reveal>
                <Reveal y={20} delay={0.05}>
                    <CurrentNewsAnnouncements items={news} />
                </Reveal>
                <Reveal y={20} delay={0.05}>
                    <GroundAndRti investigations={investigations} rtis={rtis} />
                </Reveal>
                <Reveal y={16} delay={0.08}>
                    <PublicationsStrip research={research} />
                </Reveal>
                <Reveal y={16} delay={0.1}>
                    <FeaturedFinding findings={findings} />
                </Reveal>
                <Reveal y={12} delay={0.05}>
                    <JoinBanner />
                </Reveal>
                <Reveal y={16}>
                    <InstitutionalMetrics metrics={metrics} />
                </Reveal>
                <Reveal y={16}>
                    <CitizenAccessBand />
                </Reveal>
                <ResearchRepository research={research} />
                <FindingsGrid findings={findings} />
                <RtiCta />
                <VoicesCarousel voices={voices} />
                <VideoInvestigations investigations={investigations} />
                <GovernanceCharter />
            </div>
        </Layout>
    );
}

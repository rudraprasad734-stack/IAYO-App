import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, AlertTriangle, BadgeCheck, FileSearch } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Eyebrow, SectionHeading, Spinner, EmptyState, btnPrimary } from '@/components/bits';
import { fetchFindings, formatDate } from '@/lib/data';

const NATURE_META = {
    allegation: { label: 'Allegation', cls: 'bg-iayo-orange/15 text-iayo-orange', icon: AlertTriangle },
    verified: { label: 'Verified Finding', cls: 'bg-iayo-blue/15 text-iayo-blue', icon: BadgeCheck },
    documented_fact: { label: 'Documented Fact', cls: 'bg-iayo-blue/15 text-iayo-blue', icon: BadgeCheck },
    iayo_analysis: { label: 'IAYO Analysis', cls: 'bg-navy/10 text-navy', icon: FileSearch },
};

const NATURE_FILTERS = [
    { key: '', label: 'All' },
    { key: "nature = 'allegation'", label: 'Allegations' },
    { key: "nature = 'documented_fact' || nature = 'verified'", label: 'Verified' },
    { key: "nature = 'iayo_analysis'", label: 'Analysis' },
];

export default function FindingsPage() {
    const [items, setItems] = useState(null);
    const [filter, setFilter] = useState('');
    const [q, setQ] = useState('');

    useEffect(() => {
        const parts = [filter];
        const trimmed = q.trim();
        if (trimmed) parts.push(`title ~ "${trimmed}" || summary ~ "${trimmed}"`);
        setItems(null);
        fetchFindings({ filter: parts.filter(Boolean).join(' && ') })
            .then((r) => setItems(r.items))
            .catch(() => setItems([]));
    }, [filter, q]);

    return (
        <Layout
            title="Corruption Findings — IAYO"
            description="IAYO's corruption findings database — documentary trails built on official records, with a clear distinction between allegations and verified findings."
        >
            <Seo
                title="Corruption Findings — IAYO"
                description="Follow the documentary trail behind each issue. IAYO distinguishes allegations from verified findings, with sources and right of reply."
                siteName="IAYO"
            />
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Eyebrow>Corruption Findings</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                        Evidence first. Allegations never presented as fact.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Every IAYO finding is built on a documentary trail — RTI replies, official records,
                        sworn testimonies. We clearly distinguish allegations from verified findings, and we
                        publish the sources and any right of reply.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {NATURE_FILTERS.map((f) => (
                            <button
                                key={f.label}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={`rounded-sm border px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
                                    filter === f.key
                                        ? 'border-iayo-blue bg-iayo-blue text-white'
                                        : 'border-border bg-white text-navy hover:border-iayo-blue'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 max-w-md">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search findings…"
                            className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-iayo-blue focus:outline-none focus:ring-1 focus:ring-iayo-blue"
                        />
                    </div>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge">
                    {items === null ? (
                        <Spinner />
                    ) : items.length === 0 ? (
                        <EmptyState title="No findings match" body="Try a different filter or search term." />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((item, i) => {
                                const meta = NATURE_META[item.nature] || NATURE_META.allegation;
                                const Icon = meta.icon;
                                return (
                                    <Reveal key={item.id} y={22} delay={(i % 3) * 0.06}>
                                        <Link
                                            to={`/findings/${item.id}`}
                                            className="group flex h-full flex-col border border-border bg-white p-6 transition-all duration-200 hover:border-iayo-blue hover:shadow-[0_8px_24px_-12px_rgba(11,27,51,0.18)]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${meta.cls}`}>
                                                    <Icon className="h-3 w-3" strokeWidth={2.25} /> {meta.label}
                                                </span>
                                                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                                    {formatDate(item.created)}
                                                </span>
                                            </div>
                                            <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-iayo-blue">
                                                {item.category}
                                            </span>
                                            <h3 className="mt-2 font-display text-xl font-extrabold leading-snug tracking-tight text-navy transition-colors group-hover:text-iayo-blue">
                                                {item.title}
                                            </h3>
                                            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                                                {item.summary}
                                            </p>
                                            {item.location && (
                                                <p className="mt-4 text-[12px] font-semibold text-navy/70">{item.location}</p>
                                            )}
                                            <div className="mt-5 flex items-center gap-1 border-t border-border pt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue">
                                                Open Finding
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                                            </div>
                                        </Link>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-navy text-white">
                <div className="edge flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
                    <p className="max-w-2xl text-sm leading-relaxed text-white/80">
                        IAYO never labels an individual or institution “corrupt” merely because an allegation has
                        been submitted. Every finding cites its sources and offers a right of reply.
                    </p>
                    <Link to="/rti" className="inline-flex items-center gap-2 rounded-sm border border-white/40 px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:bg-white hover:text-iayo-blue">
                        Explore RTI Transparency <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </Link>
                </div>
            </section>
        </Layout>
    );
}

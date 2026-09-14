import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, FileSearch } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Eyebrow, Spinner, EmptyState } from '@/components/bits';
import { fetchRti, formatDate } from '@/lib/data';

const STATUS_META = {
    filed: { label: 'Filed', cls: 'bg-navy/10 text-navy' },
    awaiting_reply: { label: 'Awaiting Reply', cls: 'bg-iayo-orange/15 text-iayo-orange' },
    reply_received: { label: 'Reply Received', cls: 'bg-iayo-blue/15 text-iayo-blue' },
    published: { label: 'Published', cls: 'bg-iayo-blue text-white' },
    appeal_filed: { label: 'Appeal Filed', cls: 'bg-iayo-orange/15 text-iayo-orange' },
    resolved: { label: 'Resolved', cls: 'bg-iayo-blue text-white' },
};

export default function RtiPage() {
    const [items, setItems] = useState(null);
    const [q, setQ] = useState('');

    useEffect(() => {
        setItems(null);
        const trimmed = q.trim();
        const filter = trimmed ? `title ~ "${trimmed}" || department ~ "${trimmed}" || rti_id ~ "${trimmed}"` : '';
        fetchRti({ filter })
            .then((r) => setItems(r.items))
            .catch(() => setItems([]));
    }, [q]);

    return (
        <Layout
            title="RTI Transparency — IAYO"
            description="IAYO's RTI transparency database — every RTI case, its application, reply, appeal and outcome, with a documentary timeline."
        >
            <Seo
                title="RTI Transparency — IAYO"
                description="Follow every IAYO RTI from filing to reply to outcome. Public documents, timelines and key findings."
                siteName="IAYO"
            />
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Eyebrow>RTI Transparency</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                        The right to ask. The right to know.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Every IAYO RTI case is published here — application, reply, appeal and outcome — so
                        citizens can follow the documentary trail behind each issue.
                    </p>
                    <div className="mt-6 max-w-md">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by RTI ID, department or title…"
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
                        <EmptyState title="No RTI cases match" body="Try a different search." />
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, i) => {
                                const sm = STATUS_META[item.status] || STATUS_META.filed;
                                return (
                                    <Reveal key={item.id} y={18} delay={(i % 4) * 0.05}>
                                        <Link
                                            to={`/rti/${item.id}`}
                                            className="group grid grid-cols-1 gap-4 border border-border bg-white p-6 transition-all duration-200 hover:border-iayo-blue md:grid-cols-12 md:items-center"
                                        >
                                            <div className="md:col-span-2">
                                                <p className="font-mono text-sm font-bold text-iayo-blue">{item.rti_id}</p>
                                                <span className={`mt-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${sm.cls}`}>
                                                    {sm.label}
                                                </span>
                                            </div>
                                            <div className="md:col-span-7">
                                                <h3 className="font-display text-lg font-extrabold leading-snug tracking-tight text-navy transition-colors group-hover:text-iayo-blue">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                    {item.summary}
                                                </p>
                                            </div>
                                            <div className="md:col-span-3 md:text-right">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Filed</p>
                                                <p className="mt-1 text-sm font-semibold text-navy">{formatDate(item.date_filed)}</p>
                                                <p className="mt-2 text-[11px] font-semibold text-navy/70">{item.department}</p>
                                            </div>
                                        </Link>
                                    </Reveal>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

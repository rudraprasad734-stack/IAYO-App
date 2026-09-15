import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    ArrowRight, ArrowLeft, FileText, ExternalLink, Check, Clock, Send, Gavel, BadgeCheck,
} from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Spinner, Eyebrow } from '@/components/bits';
import { fetchRtiItem, fileUrl, formatDate } from '@/lib/data';

const STAGES = [
    { key: 'filed', label: 'RTI Filed', icon: Send },
    { key: 'awaiting_reply', label: 'Awaiting Reply', icon: Clock },
    { key: 'reply_received', label: 'Reply Received', icon: FileText },
    { key: 'published', label: 'Reply Published', icon: BadgeCheck },
    { key: 'appeal_filed', label: 'Appeal Filed', icon: Gavel },
    { key: 'resolved', label: 'Resolved', icon: Check },
];

function stageIndex(status) {
    const map = {
        filed: 0,
        awaiting_reply: 1,
        reply_received: 2,
        published: 3,
        appeal_filed: 4,
        resolved: 5,
    };
    return map[status] ?? 0;
}

function RelatedBlock({ title, items, toFn, labelFn }) {
    const list = Array.isArray(items) ? items : (items ? [items] : []);
    if (list.length === 0) return null;
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
            <ul className="mt-3 space-y-2">
                {list.map((r) => (
                    <li key={r.id}>
                        <Link to={toFn(r.id)} className="group flex items-start gap-2 text-sm text-navy hover:text-iayo-blue">
                            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-iayo-blue" strokeWidth={2.5} />
                            <span className="font-semibold underline-offset-2 group-hover:underline">{labelFn(r)}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function RtiDetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setItem(null);
        setError(false);
        fetchRtiItem(id)
            .then(setItem)
            .catch(() => setError(true));
    }, [id]);

    if (error) {
        return (
            <Layout title="RTI not found — IAYO" description="The requested RTI case could not be found.">
                <section className="bg-iayo-bg py-24">
                    <div className="edge max-w-xl text-center">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy">RTI case not found</h1>
                        <Link to="/rti" className="mt-6 inline-flex items-center gap-2 text-iayo-blue">
                            <ArrowLeft className="h-4 w-4" /> Back to RTI transparency
                        </Link>
                    </div>
                </section>
            </Layout>
        );
    }

    if (!item) {
        return (
            <Layout title="Loading RTI — IAYO" description="">
                <section className="bg-iayo-bg py-24"><Spinner /></section>
            </Layout>
        );
    }

    const reached = stageIndex(item.status);

    return (
        <Layout
            title={`${item.rti_id} — ${item.title} | IAYO RTI`}
            description={item.summary}
        >
            <Seo title={`${item.rti_id} — ${item.title}`} description={item.summary} siteName="IAYO" />

            <article>
                <section className="border-b border-border bg-white">
                    <div className="edge py-12 md:py-16">
                        <Link to="/rti" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                            <ArrowLeft className="h-3.5 w-3.5" /> All RTI Cases
                        </Link>
                        <p className="mt-6 font-mono text-sm font-bold text-iayo-blue">{item.rti_id}</p>
                        <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-navy md:text-5xl">
                            {item.title}
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {item.summary}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                            <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Department</p><p className="mt-1 font-semibold text-navy">{item.department}</p></div>
                            {item.public_authority && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Public Authority</p><p className="mt-1 font-semibold text-navy">{item.public_authority}</p></div>}
                            {(item.state || item.district) && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Location</p><p className="mt-1 font-semibold text-navy">{item.district}, {item.state}</p></div>}
                            {item.date_filed && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Date Filed</p><p className="mt-1 font-semibold text-navy">{formatDate(item.date_filed)}</p></div>}
                            {item.reply_date && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Reply Date</p><p className="mt-1 font-semibold text-navy">{formatDate(item.reply_date)}</p></div>}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="bg-navy py-14 text-white md:py-20">
                    <div className="edge">
                        <Eyebrow className="text-iayo-blue">Case Timeline</Eyebrow>
                        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                            From filing to outcome.
                        </h2>
                        <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
                            {STAGES.map((s, i) => {
                                const done = i <= reached;
                                const Icon = s.icon;
                                return (
                                    <li key={s.key} className={`relative px-4 py-6 ${done ? 'bg-iayo-blue' : 'bg-navy/80'}`}>
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-sm ${done ? 'bg-white text-iayo-blue' : 'bg-white/10 text-white/50'}`}>
                                            <Icon className="h-4 w-4" strokeWidth={2.25} />
                                        </span>
                                        <p className={`mt-3 text-[11px] font-bold uppercase tracking-[0.12em] ${done ? 'text-white' : 'text-white/50'}`}>
                                            {s.label}
                                        </p>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                <section className="bg-iayo-bg py-14 md:py-20">
                    <div className="edge grid grid-cols-1 gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-8 space-y-10">
                            {item.key_findings && (
                                <div className="border border-border bg-white p-6">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy">Key Findings</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.key_findings}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy">Documents</p>
                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {[
                                        { f: item.application_pdf, label: 'RTI Application' },
                                        { f: item.reply_pdf, label: 'RTI Reply' },
                                        { f: item.appeal_pdf, label: 'Appeal' },
                                    ].map(({ f, label }) => {
                                        const file = Array.isArray(f) ? f[0] : f;
                                        if (!file) {
                                            return (
                                                <div key={label} className="border border-dashed border-border bg-white p-5 text-center">
                                                    <FileText className="mx-auto h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
                                                    <p className="mt-2 text-[12px] font-semibold text-muted-foreground">{label}</p>
                                                    <p className="mt-1 text-[11px] text-muted-foreground/70">Not yet available</p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <a
                                                key={label}
                                                href={fileUrl(item, file)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group flex flex-col border border-border bg-white p-5 transition-all hover:border-iayo-blue"
                                            >
                                                <FileText className="h-6 w-6 text-iayo-blue" strokeWidth={1.75} />
                                                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.1em] text-navy">{label}</p>
                                                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-iayo-blue">
                                                    View PDF <ExternalLink className="h-3 w-3" />
                                                </p>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            {item.appeal_info && (
                                <div className="border-t border-border pt-8">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy">Appeal Information</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.appeal_info}</p>
                                </div>
                            )}
                        </div>

                        <aside className="lg:col-span-4">
                            <div className="space-y-8 border border-border bg-white p-6">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Related IAYO Work</p>
                                <RelatedBlock
                                    title="Related Findings"
                                    items={item.expand?.related_finding}
                                    toFn={(rid) => `/findings/${rid}`}
                                    labelFn={(r) => r.title}
                                />
                                <RelatedBlock
                                    title="Related Research"
                                    items={item.expand?.related_research}
                                    toFn={(rid) => `/research/${rid}`}
                                    labelFn={(r) => r.title}
                                />
                                <RelatedBlock
                                    title="Related Videos"
                                    items={item.expand?.related_video}
                                    toFn={(rid) => `/investigations/${rid}`}
                                    labelFn={(r) => r.title}
                                />
                            </div>
                        </aside>
                    </div>
                </section>
            </article>
        </Layout>
    );
}

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    ArrowRight, AlertTriangle, BadgeCheck, FileSearch, FileText,
    Scale, ExternalLink, ArrowLeft,
} from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Spinner, Eyebrow } from '@/components/bits';
import { fetchFindingItem, fileUrl, formatDate } from '@/lib/data';

const NATURE_META = {
    allegation: { label: 'Allegation', cls: 'bg-iayo-orange/15 text-iayo-orange border-iayo-orange/30', icon: AlertTriangle, note: 'This is currently an allegation. No verified finding has been made.' },
    verified: { label: 'Verified Finding', cls: 'bg-iayo-blue/15 text-iayo-blue border-iayo-blue/30', icon: BadgeCheck, note: 'Supported by verified documentary evidence.' },
    documented_fact: { label: 'Documented Fact', cls: 'bg-iayo-blue/15 text-iayo-blue border-iayo-blue/30', icon: BadgeCheck, note: 'Established from official records.' },
    iayo_analysis: { label: 'IAYO Analysis', cls: 'bg-navy/10 text-navy border-navy/20', icon: FileSearch, note: 'IAYO’s interpretation of official records — not a judicial finding.' },
};

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

export default function FindingDetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setItem(null);
        setError(false);
        fetchFindingItem(id)
            .then(setItem)
            .catch(() => setError(true));
    }, [id]);

    if (error) {
        return (
            <Layout title="Finding not found — IAYO" description="The requested finding could not be found.">
                <section className="bg-iayo-bg py-24">
                    <div className="edge max-w-xl text-center">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy">Finding not found</h1>
                        <Link to="/findings" className="mt-6 inline-flex items-center gap-2 text-iayo-blue">
                            <ArrowLeft className="h-4 w-4" /> Back to findings
                        </Link>
                    </div>
                </section>
            </Layout>
        );
    }

    if (!item) {
        return (
            <Layout title="Loading finding — IAYO" description="">
                <section className="bg-iayo-bg py-24"><Spinner /></section>
            </Layout>
        );
    }

    const meta = NATURE_META[item.nature] || NATURE_META.allegation;
    const NatureIcon = meta.icon;
    const evidenceFiles = item.evidence || [];
    const photoFiles = item.photos || [];
    const relatedRti = item.expand?.related_rti;
    const relatedResearch = item.expand?.related_research;
    const relatedVideo = item.expand?.related_video;

    return (
        <Layout
            title={`${item.title} — IAYO Finding`}
            description={item.summary}
        >
            <Seo title={item.title} description={item.summary} siteName="IAYO" />

            <article>
                <section className="border-b border-border bg-white">
                    <div className="edge py-12 md:py-16">
                        <Link to="/findings" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                            <ArrowLeft className="h-3.5 w-3.5" /> All Findings
                        </Link>
                        <div className={`mt-6 inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${meta.cls}`}>
                            <NatureIcon className="h-3.5 w-3.5" strokeWidth={2.25} /> {meta.label}
                        </div>
                        <h1 className="mt-5 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-navy md:text-5xl">
                            {item.title}
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {item.summary}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                            {item.department && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Department</p><p className="mt-1 font-semibold text-navy">{item.department}</p></div>}
                            {item.location && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Location</p><p className="mt-1 font-semibold text-navy">{item.location}</p></div>}
                            {item.finding_date && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Date</p><p className="mt-1 font-semibold text-navy">{formatDate(item.finding_date)}</p></div>}
                            <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Category</p><p className="mt-1 font-semibold text-navy">{item.category}</p></div>
                        </div>
                        <div className="mt-6 rounded-sm border border-iayo-orange/30 bg-iayo-orange/5 px-4 py-3 text-sm text-navy/80">
                            <AlertTriangle className="mr-1.5 inline h-4 w-4 text-iayo-orange" strokeWidth={2.25} />
                            {meta.note}
                        </div>
                    </div>
                </section>

                <section className="bg-iayo-bg py-14 md:py-20">
                    <div className="edge grid grid-cols-1 gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            {item.body && (
                                <div
                                    className="prose-iayo max-w-none text-[15px] leading-relaxed text-navy/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4"
                                    dangerouslySetInnerHTML={{ __html: item.body }}
                                />
                            )}

                            {item.sources && (
                                <div className="mt-10 border-t border-border pt-8">
                                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                                        <FileSearch className="h-4 w-4 text-iayo-blue" strokeWidth={2} /> Sources &amp; Evidence
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.sources}</p>
                                </div>
                            )}

                            {(evidenceFiles.length > 0 || photoFiles.length > 0) && (
                                <div className="mt-10 border-t border-border pt-8">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy">Attached Evidence</p>
                                    {photoFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {photoFiles.map((f) => (
                                                <a
                                                    key={f}
                                                    href={fileUrl(item, f)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="group relative block overflow-hidden border border-border bg-white"
                                                >
                                                    <img src={fileUrl(item, f, '400x300')} alt="Evidence" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    {evidenceFiles.length > 0 && (
                                        <ul className="mt-4 space-y-2">
                                            {evidenceFiles.map((f) => (
                                                <li key={f}>
                                                    <a href={fileUrl(item, f)} target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-sm font-semibold text-navy hover:text-iayo-blue">
                                                        <FileText className="h-4 w-4 text-iayo-blue" strokeWidth={2} />
                                                        {f}
                                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {item.right_of_reply && (
                                <div className="mt-10 border border-navy/15 bg-white p-6">
                                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                                        <Scale className="h-4 w-4 text-iayo-blue" strokeWidth={2} /> Right of Reply
                                    </p>
                                    <div
                                        className="mt-3 text-sm leading-relaxed text-muted-foreground [&_p]:mb-3"
                                        dangerouslySetInnerHTML={{ __html: item.right_of_reply }}
                                    />
                                </div>
                            )}
                        </div>

                        <aside className="lg:col-span-4">
                            <div className="space-y-8 border border-border bg-white p-6">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">Related IAYO Work</p>
                                <RelatedBlock
                                    title="Related RTIs"
                                    items={relatedRti}
                                    toFn={(rid) => `/rti/${rid}`}
                                    labelFn={(r) => `${r.rti_id} — ${r.title}`}
                                />
                                <RelatedBlock
                                    title="Related Research"
                                    items={relatedResearch}
                                    toFn={(rid) => `/research/${rid}`}
                                    labelFn={(r) => r.title}
                                />
                                <RelatedBlock
                                    title="Related Videos"
                                    items={relatedVideo}
                                    toFn={(rid) => `/investigations/${rid}`}
                                    labelFn={(r) => r.title}
                                />
                                <div className="border-t border-border pt-5">
                                    <Link to="/voices" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue">
                                        Share your voice <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </article>
        </Layout>
    );
}

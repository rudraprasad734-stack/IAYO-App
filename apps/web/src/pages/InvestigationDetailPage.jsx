import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Play, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eyebrow, Spinner } from '@/components/bits';
import { fetchInvestigationItem, fileUrl, formatDate } from '@/lib/data';

function FileList({ label, record, field, accept }) {
    const files = record?.[field];
    if (!files || (Array.isArray(files) ? files.length === 0 : !files)) return null;
    const list = Array.isArray(files) ? files : [files];
    return (
        <div className="border border-border bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-iayo-blue">{label}</p>
            <ul className="mt-4 space-y-2">
                {list.map((f) => (
                    <li key={f}>
                        <a
                            href={fileUrl(record, f)}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-iayo-blue hover:bg-iayo-muted"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
                                <span className="truncate">{f}</span>
                            </span>
                            <Download className="h-4 w-4 text-iayo-blue" strokeWidth={2} />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function InvestigationDetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setItem(null);
        setError(false);
        fetchInvestigationItem(id)
            .then(setItem)
            .catch(() => setError(true));
    }, [id]);

    const author = item?.expand?.author;

    return (
        <Layout
            title={item ? `${item.title} — IAYO Investigation` : 'Investigation — IAYO'}
            description={item?.summary || 'IAYO field investigation with verified evidence.'}
        >
            {item === null && !error && <Spinner />}
            {error && (
                <div className="edge py-24 text-center">
                    <p className="font-display text-2xl font-extrabold text-navy">Investigation not found</p>
                    <Link to="/investigations" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> Back to Investigations
                    </Link>
                </div>
            )}
            {item && (
                <>
                    <section className="relative overflow-hidden border-b border-navy/15 bg-navy text-white">
                        <div className="absolute inset-0 grid-paper-light opacity-40" aria-hidden="true" />
                        <div className="edge relative py-14 md:py-20">
                            <Link
                                to="/investigations"
                                className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-iayo-blue"
                            >
                                <ArrowLeft className="h-4 w-4" /> All Investigations
                            </Link>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <span className="rounded-sm bg-iayo-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                                    {item.category}
                                </span>
                                <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-white/60">
                                    {formatDate(item.created)}
                                </span>
                            </div>
                            <h1 className="mt-5 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                                {item.title}
                            </h1>
                            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">{item.summary}</p>
                            <div className="mt-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
                                <ShieldCheck className="h-4 w-4 text-iayo-blue" strokeWidth={2.25} />
                                Verified by {author?.name || 'IAYO President'}
                            </div>
                        </div>
                    </section>

                    <section className="bg-iayo-bg py-14 md:py-20">
                        <div className="edge grid grid-cols-1 gap-10 lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                {item.video_url && (
                                    <div className="mb-8 overflow-hidden rounded-sm border border-border bg-navy">
                                        <div className="aspect-video w-full">
                                            <iframe
                                                src={item.video_url}
                                                title={item.title}
                                                className="h-full w-full"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}
                                {item.body ? (
                                    <div
                                        className="research-body text-[17px] leading-relaxed text-navy/90 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_p]:mt-4 [&_p]:text-navy/80"
                                        dangerouslySetInnerHTML={{ __html: item.body }}
                                    />
                                ) : (
                                    <p className="text-muted-foreground">Full report coming soon.</p>
                                )}

                                {item.images && item.images.length > 0 && (
                                    <div className="mt-10 grid grid-cols-2 gap-3">
                                        {item.images.map((img) => (
                                            <a
                                                key={img}
                                                href={fileUrl(item, img)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="overflow-hidden rounded-sm border border-border"
                                            >
                                                <img
                                                    src={fileUrl(item, img, '400x0')}
                                                    alt="Investigation evidence"
                                                    className="aspect-[4/3] w-full object-cover transition-transform hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <aside className="lg:col-span-5">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy">
                                    Evidence &amp; Documents
                                </p>
                                <div className="mt-5 space-y-4">
                                    <FileList label="Documents" record={item} field="documents" />
                                    <FileList label="Evidence" record={item} field="evidence" />
                                    <FileList label="Reports" record={item} field="reports" />
                                </div>
                                <div className="mt-6 rounded-sm bg-iayo-muted p-5 text-sm text-muted-foreground">
                                    Public users can view and download all resources. Upload, edit and
                                    unpublishing are restricted to authorised Presidents and enforced on the
                                    backend.
                                </div>
                            </aside>
                        </div>
                    </section>
                </>
            )}
        </Layout>
    );
}

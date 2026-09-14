import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eyebrow, Spinner, btnPrimary } from '@/components/bits';
import { fetchResearchItem, formatDate } from '@/lib/data';

export default function ArticleDetailPage() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setItem(null);
        setError(false);
        fetchResearchItem(id)
            .then(setItem)
            .catch(() => setError(true));
    }, [id]);

    const author = item?.expand?.author;

    return (
        <Layout
            title={item ? `${item.title} — IAYO Research` : 'Research — IAYO'}
            description={item?.summary || 'IAYO research and reports.'}
        >
            {item === null && !error && <Spinner />}
            {error && (
                <div className="edge py-24 text-center">
                    <p className="font-display text-2xl font-extrabold text-navy">Article not found</p>
                    <Link to="/research" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> Back to Research
                    </Link>
                </div>
            )}
            {item && (
                <>
                    <article className="border-b border-border bg-white">
                        <div className="edge py-14 md:py-20">
                            <Link
                                to="/research"
                                className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-iayo-blue"
                            >
                                <ArrowLeft className="h-4 w-4" /> All Research
                            </Link>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <Eyebrow>{item.category}</Eyebrow>
                                <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                    {formatDate(item.created)}
                                </span>
                            </div>
                            <h1 className="mt-5 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-navy md:text-5xl">
                                {item.title}
                            </h1>
                            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                                {item.summary}
                            </p>
                            <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iayo-blue text-sm font-bold text-white">
                                    {(author?.name || 'I').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-navy">{author?.name || 'IAYO Research'}</p>
                                    <p className="text-[12px] text-muted-foreground">
                                        {author?.role === 'president' ? 'IAYO President' : 'IAYO Research Cell'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    <section className="bg-iayo-bg py-14 md:py-20">
                        <div className="edge max-w-3xl">
                            {item.body ? (
                                <div
                                    className="research-body text-[17px] leading-relaxed text-navy/90 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_p]:mt-4 [&_p]:text-navy/80"
                                    dangerouslySetInnerHTML={{ __html: item.body }}
                                />
                            ) : (
                                <p className="text-muted-foreground">Full text coming soon.</p>
                            )}

                            <div className="mt-14 border-t border-border pt-8">
                                <Link to="/research" className={btnPrimary}>
                                    More Research <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                </Link>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </Layout>
    );
}

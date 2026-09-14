import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eyebrow, Spinner, EmptyState, ResearchCard, InvestigationCard } from '@/components/bits';
import { fetchResearch, fetchInvestigations } from '@/lib/data';

export default function SearchPage() {
    const [params, setParams] = useSearchParams();
    const q = params.get('q') || '';
    const [input, setInput] = useState(q);
    const [results, setResults] = useState(null);

    useEffect(() => {
        setInput(q);
        if (!q.trim()) {
            setResults({ research: [], investigations: [] });
            return;
        }
        setResults(null);
        const term = q.trim();
        const filter = `title ~ "${term}" || summary ~ "${term}" || category ~ "${term}"`;
        Promise.all([
            fetchResearch({ filter, perPage: 24 }).catch(() => ({ items: [] })),
            fetchInvestigations({ filter, perPage: 24 }).catch(() => ({ items: [] })),
        ]).then(([r, i]) => setResults({ research: r.items, investigations: i.items }));
    }, [q]);

    const total = useMemo(
        () => (results ? results.research.length + results.investigations.length : 0),
        [results],
    );

    const submit = (e) => {
        e.preventDefault();
        setParams(input.trim() ? { q: input.trim() } : {});
    };

    return (
        <Layout
            title={q ? `Search: ${q} — IAYO` : 'Search — IAYO'}
            description="Search IAYO research and investigations."
        >
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Eyebrow>Search</Eyebrow>
                    <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
                        Find research &amp; investigations
                    </h1>
                    <form onSubmit={submit} className="mt-7 flex max-w-2xl items-center gap-2 rounded-sm border border-border bg-white px-3 focus-within:border-iayo-blue">
                        <SearchIcon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Search titles, summaries, categories…"
                            className="h-12 w-full bg-transparent text-[15px] text-navy outline-none placeholder:text-muted-foreground/60"
                        />
                        <button type="submit" className="inline-flex items-center gap-1.5 rounded-sm bg-iayo-blue px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95">
                            Search <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge">
                    {q && (
                        <p className="mb-8 text-sm text-muted-foreground">
                            {results === null ? 'Searching…' : `${total} result${total === 1 ? '' : 's'} for “${q}”`}
                        </p>
                    )}
                    {results === null ? (
                        <Spinner />
                    ) : total === 0 ? (
                        q ? (
                            <EmptyState
                                title="No matches found"
                                body="Try different keywords, or browse research and investigations directly."
                            />
                        ) : (
                            <div className="border border-border bg-white py-16 text-center">
                                <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Type a query above to search across all IAYO research and investigations.
                                </p>
                                <div className="mt-6 flex justify-center gap-3">
                                    <Link to="/research" className="text-[13px] font-bold uppercase tracking-[0.1em] text-iayo-blue link-underline">Browse Research</Link>
                                    <Link to="/investigations" className="text-[13px] font-bold uppercase tracking-[0.1em] text-iayo-blue link-underline">Browse Investigations</Link>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="space-y-12">
                            {results.research.length > 0 && (
                                <div>
                                    <h2 className="font-display text-xl font-extrabold tracking-tight text-navy">Research</h2>
                                    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {results.research.map((item) => (
                                            <ResearchCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results.investigations.length > 0 && (
                                <div>
                                    <h2 className="font-display text-xl font-extrabold tracking-tight text-navy">Investigations</h2>
                                    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {results.investigations.map((item) => (
                                            <InvestigationCard key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

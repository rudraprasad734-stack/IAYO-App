import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Reveal from '@/components/Reveal';
import {
    Eyebrow,
    Spinner,
    EmptyState,
    ResearchCard,
    btnPrimary,
} from '@/components/bits';
import { fetchResearch } from '@/lib/data';

const CATEGORIES = ['All', 'Research', 'Accountability', 'Transparency', 'Policy'];

export default function ResearchPage() {
    const [items, setItems] = useState(null);
    const [cat, setCat] = useState('All');

    useEffect(() => {
        setItems(null);
        const filter = cat === 'All' ? '' : `category = "${cat}"`;
        fetchResearch({ filter, perPage: 24 })
            .then((r) => setItems(r.items))
            .catch(() => setItems([]));
    }, [cat]);

    return (
        <Layout
            title="Research — IAYO"
            description="Open-access research and reports on governance, budgets, transparency and accountability from IAYO's research cell."
        >
            <section className="border-b border-border bg-white">
                <div className="edge py-16 md:py-24">
                    <Eyebrow>Research &amp; Reports</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                        Studies, indices and field reports.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        Open-access research produced by IAYO's research cell — built on public records,
                        RTI responses and on-ground verification.
                    </p>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge">
                    <div className="flex flex-wrap gap-2 border-b border-border pb-6">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`rounded-sm px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
                                    cat === c
                                        ? 'bg-navy text-white'
                                        : 'border border-border bg-white text-navy hover:border-iayo-blue'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items === null ? (
                            <Spinner />
                        ) : items.length === 0 ? (
                            <EmptyState
                                title="No research in this category"
                                body="Try another category — new studies are added regularly."
                            />
                        ) : (
                            items.map((item, i) => (
                                <Reveal key={item.id} y={20} delay={(i % 3) * 0.06}>
                                    <ResearchCard item={item} />
                                </Reveal>
                            ))
                        )}
                    </div>

                    <div className="mt-14 border-t border-border pt-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            Want to contribute to research, field verification or public-interest investigations?
                        </p>
                        <Link to="/research/contribute" className={`mt-5 ${btnPrimary}`}>
                            Research &amp; Contribute <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

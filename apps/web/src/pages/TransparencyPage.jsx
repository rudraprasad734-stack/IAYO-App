import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Reveal from '@/components/Reveal';
import {
    Eyebrow,
    Spinner,
    EmptyState,
    ResearchCard,
    btnPrimary,
} from '@/components/bits';
import { fetchResearchByCategory, fetchHomepageMetrics } from '@/lib/data';

export default function TransparencyPage() {
    const [items, setItems] = useState(null);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        fetchResearchByCategory('Transparency')
            .then((r) => setItems(r.items))
            .catch(() => setItems([]));
        fetchHomepageMetrics().then(setMetrics).catch(() => setMetrics(null));
    }, []);

    return (
        <Layout
            title="Transparency — IAYO"
            description="RTI compliance, public disclosures and open data — IAYO's transparency cell makes government information accessible to citizens."
        >
            <section className="border-b border-border bg-white">
                <div className="edge grid grid-cols-1 gap-10 py-16 md:grid-cols-12 md:py-24">
                    <div className="md:col-span-7">
                        <Eyebrow>Transparency</Eyebrow>
                        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                            Public information, in public hands.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            IAYO's transparency cell files RTIs, indexes responses, and publishes compliance
                            scores so citizens can see which authorities answer — and which stay silent.
                        </p>
                        <Link to="/citizen-login" className={`mt-8 ${btnPrimary}`}>
                            File an RTI <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                    <div className="md:col-span-5">
                        <div className="grid grid-cols-2 gap-px border border-border bg-border">
                            {[
                                { v: metrics ? metrics.rtis : '—', l: 'RTIs filed' },
                                { v: metrics ? `${metrics.replyRate}%` : '—', l: 'Response rate' },
                                { v: metrics ? metrics.reports : '—', l: 'Published research reports' },
                                { v: metrics ? metrics.findings : '—', l: 'Documented findings' },
                            ].map((s) => (
                                <div key={s.l} className="bg-white p-6">
                                    <p className="font-display text-3xl font-extrabold tracking-tight text-navy">
                                        {s.v}
                                    </p>
                                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        {s.l}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge">
                    <div className="flex items-center gap-3">
                        <FileSearch className="h-6 w-6 text-iayo-blue" strokeWidth={1.75} />
                        <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy">
                            Transparency Research
                        </h2>
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items === null ? (
                            <Spinner />
                        ) : items.length === 0 ? (
                            <EmptyState title="Nothing published yet" body="Transparency research is in progress." />
                        ) : (
                            items.map((item, i) => (
                                <Reveal key={item.id} y={20} delay={(i % 3) * 0.06}>
                                    <ResearchCard item={item} />
                                </Reveal>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

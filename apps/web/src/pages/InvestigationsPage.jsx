import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import Reveal from '@/components/Reveal';
import {
    Eyebrow,
    Spinner,
    EmptyState,
    InvestigationCard,
    btnPrimary,
} from '@/components/bits';
import { fetchInvestigations } from '@/lib/data';

export default function InvestigationsPage() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        fetchInvestigations({ perPage: 24 })
            .then((r) => setItems(r.items))
            .catch(() => setItems([]));
    }, []);

    return (
        <Layout
            title="Investigations — IAYO"
            description="Field investigations with documents, images, video and verified evidence — published by IAYO Presidents."
        >
            <section className="relative overflow-hidden border-b border-navy/15 bg-navy text-white">
                <div className="absolute inset-0 grid-paper-light opacity-40" aria-hidden="true" />
                <div className="edge relative py-16 md:py-24">
                    <Eyebrow className="text-iayo-blue">Watch Investigations</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
                        Evidence-led investigations into public interest.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                        Each file contains documents, images, video and verified evidence. Published by
                        authorised IAYO Presidents — public users can read and download every resource.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
                        <ShieldCheck className="h-4 w-4 text-iayo-blue" strokeWidth={2.25} />
                        Backend-enforced: only Presidents can upload, edit or unpublish.
                    </div>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items === null ? (
                            <Spinner />
                        ) : items.length === 0 ? (
                            <EmptyState
                                title="No investigations published yet"
                                body="IAYO field teams are preparing new investigation files."
                            />
                        ) : (
                            items.map((item, i) => (
                                <Reveal key={item.id} y={20} delay={(i % 3) * 0.06}>
                                    <InvestigationCard item={item} />
                                </Reveal>
                            ))
                        )}
                    </div>

                    <div className="mt-14 border-t border-border pt-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            Are you an IAYO President? Manage investigation files from your dashboard.
                        </p>
                        <Link to="/president-login" className={`mt-5 ${btnPrimary}`}>
                            President Dashboard <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

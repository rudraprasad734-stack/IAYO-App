import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eyebrow, btnOrange, btnSecondary } from '@/components/bits';
import { fetchHomepageMetrics } from '@/lib/data';

export default function DonatePage() {
    const [metrics, setMetrics] = useState(null);
    useEffect(() => { fetchHomepageMetrics().then(setMetrics).catch(() => setMetrics(null)); }, []);
    return (
        <Layout
            title="Donate — IAYO"
            description="Support IAYO's transparency, accountability and research work across India."
        >
            <section className="border-b border-border bg-white">
                <div className="edge grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-24">
                    <div className="md:col-span-7">
                        <Eyebrow>Support IAYO</Eyebrow>
                        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                            Fund the audit of power.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            IAYO is funded by citizens, not corporations. Your support funds RTI fees, field
                            investigations, research fellowships and the legal cell that takes findings to
                            court.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/citizen-login" className={btnOrange}>
                                <Heart className="h-4 w-4" strokeWidth={2.5} /> Donate
                            </Link>
                            <Link to="/" className={btnSecondary}>
                                Back Home
                            </Link>
                        </div>
                        <p className="mt-6 text-[12px] text-muted-foreground">
                            Online donations are being set up. Contact{' '}
                            <a href="mailto:contact@iayo.in" className="font-semibold text-iayo-blue">
                                contact@iayo.in
                            </a>{' '}
                            to contribute today.
                        </p>
                    </div>
                    <div className="md:col-span-5">
                        <div className="grid grid-cols-2 gap-px border border-border bg-border">
                            {[
                                { v: 'Citizen-funded', l: 'Funding model' },
                                { v: metrics ? metrics.districts : '—', l: 'Districts reached' },
                                { v: metrics ? metrics.rtis : '—', l: 'RTI records' },
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
        </Layout>
    );
}

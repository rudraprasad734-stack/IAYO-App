import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Reveal from '@/components/Reveal';
import { Eyebrow, btnPrimary, btnSecondary } from '@/components/bits';

export default function AboutPage() {
    return (
        <Layout
            title="About — IAYO"
            description="The Indian Allied Youths Party is a youth-led institutional platform for transparency, accountability and evidence-based public participation."
        >
            <section className="border-b border-border bg-white">
                <div className="edge py-16 md:py-24">
                    <Eyebrow>About IAYO</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-navy md:text-6xl">
                        A youth-led institution for public accountability.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        The Indian Allied Youths Party (IAYO) is a registered national platform of students,
                        workers, farmers and first-time voters — organised district by district to put
                        evidence-based participation at the centre of governance.
                    </p>
                </div>
            </section>

            <section className="bg-iayo-bg py-16 md:py-24">
                <div className="edge grid grid-cols-1 gap-10 md:grid-cols-3">
                    {[
                        { n: '01', t: 'Research first', b: 'Every claim IAYO makes is sourced to public records, RTI responses or verified field evidence.' },
                        { n: '02', t: 'District by district', b: 'Accountability is local. Our work is organised around the districts where public money is spent.' },
                        { n: '03', t: 'Open to every young Indian', b: 'Membership is free and open to every Indian aged 16–35. Citizens can read, file and act.' },
                    ].map((it, i) => (
                        <Reveal key={it.n} y={20} delay={i * 0.08}>
                            <div className="border-t-2 border-navy pt-6">
                                <p className="font-display text-sm font-extrabold tracking-[0.2em] text-iayo-blue">
                                    {it.n}
                                </p>
                                <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight text-navy">
                                    {it.t}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.b}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            <section className="bg-navy text-white">
                <div className="edge flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
                    <h2 className="max-w-xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                        Join the work in your district.
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/citizen-login" className={btnPrimary}>
                            Join IAYO <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                        <Link to="/research" className={btnSecondary}>
                            Explore Research
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

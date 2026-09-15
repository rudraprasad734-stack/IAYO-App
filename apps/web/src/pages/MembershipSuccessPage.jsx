import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Download, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Eyebrow, btnPrimary, btnSecondary } from '@/components/bits';
import { downloadMembershipCertificate } from '@/lib/pdf';

export default function MembershipSuccessPage() {
    const location = useLocation();
    const data = location.state || {};
    const [downloading, setDownloading] = useState(false);
    const [pdfError, setPdfError] = useState('');

    const verifyUrl = useMemo(() => {
        if (!data.membershipCode) return '';
        return `${window.location.origin}/verify/${data.membershipCode}`;
    }, [data.membershipCode]);

    useEffect(() => {
        if (!data.membershipCode) return;
        window.scrollTo(0, 0);
    }, [data.membershipCode]);

    if (!data.membershipCode) {
        return (
            <Layout title="Membership — IAYO" description="Your IAYO membership registration.">
                <section className="bg-iayo-bg py-24">
                    <div className="edge max-w-xl text-center">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy">
                            No registration found
                        </h1>
                        <p className="mt-4 text-muted-foreground">
                            We could not find a recent registration. Please start again.
                        </p>
                        <Link to="/join" className={`mt-8 inline-flex ${btnPrimary}`}>
                            Join IAYO <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                        </Link>
                    </div>
                </section>
            </Layout>
        );
    }

    const onDownload = async () => {
        setPdfError('');
        setDownloading(true);
        try {
            await downloadMembershipCertificate({
                name: data.name,
                membershipCode: data.membershipCode,
                district: data.district,
                town: data.town,
                registered: new Date().toISOString(),
                verifyUrl,
            });
        } catch (err) {
            setPdfError('Could not generate the certificate. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Layout
            title="Welcome to IAYO — Membership Certificate | IAYO"
            description="Your IAYO membership is confirmed. Download your certificate and verify it online."
        >
            <Seo
                title="Welcome to IAYO"
                description="Your IAYO membership is confirmed. Download your certificate with QR verification."
                siteName="IAYO"
            />
            <section className="bg-iayo-bg py-16 md:py-24">
                <div className="edge max-w-3xl">
                    <Reveal y={20}>
                        <div className="border border-border bg-white p-8 text-center md:p-12">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-iayo-blue/10">
                                <CheckCircle2 className="h-8 w-8 text-iayo-blue" strokeWidth={2} />
                            </div>
                            <Eyebrow className="mt-6">Registration Confirmed</Eyebrow>
                            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-navy md:text-5xl">
                                Welcome to IAYO, {data.name?.split(' ')[0] || 'friend'}.
                            </h1>
                            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                                Your membership is confirmed. Save your membership ID — you can use it to verify
                                your membership anytime.
                            </p>

                            <div className="mx-auto mt-8 max-w-md rounded-sm border border-border bg-iayo-bg p-6 text-left">
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                    Membership ID
                                </p>
                                <p className="mt-1.5 font-mono text-xl font-bold tracking-tight text-navy">
                                    {data.membershipCode}
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">District</p>
                                        <p className="mt-1 font-semibold text-navy">{data.district}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Town / Village</p>
                                        <p className="mt-1 font-semibold text-navy">{data.town}</p>
                                    </div>
                                </div>
                            </div>

                            {pdfError && (
                                <p className="mt-5 text-sm text-iayo-orange">{pdfError}</p>
                            )}

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={onDownload}
                                    disabled={downloading}
                                    className={`${btnPrimary} ${downloading ? 'opacity-70' : ''}`}
                                >
                                    {downloading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
                                    ) : (
                                        <><Download className="h-4 w-4" strokeWidth={2.5} /> Download Certificate</>
                                    )}
                                </button>
                                <Link to={`/verify/${data.membershipCode}`} className={btnSecondary}>
                                    <ShieldCheck className="h-4 w-4" strokeWidth={2.5} /> Verify Online
                                </Link>
                            </div>

                            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                                This certificate confirms registration as an IAYO member/participant only. It does
                                not constitute government identification and confers no official status.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>
        </Layout>
    );
}

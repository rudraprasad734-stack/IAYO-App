import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, QrCode, BadgeCheck } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import { Eyebrow } from '@/components/bits';
import { verifyMembership, formatDate } from '@/lib/data';
import QRCode from 'qrcode';

export default function VerifyPage() {
    const { code } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qr, setQr] = useState('');

    const verifyUrl = useMemo(
        () => `${window.location.origin}/verify/${code}`,
        [code],
    );

    useEffect(() => {
        let alive = true;
        if (!code) {
            setLoading(false);
            setResult(null);
            return undefined;
        }
        setLoading(true);
        verifyMembership(code)
            .then((r) => alive && setResult(r))
            .catch(() => alive && setResult({ valid: false }))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [code]);

    useEffect(() => {
        QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, color: { dark: '#0B1B33', light: '#FFFFFF' } })
            .then(setQr)
            .catch(() => {});
    }, [verifyUrl]);

    const valid = result?.valid;

    return (
        <Layout
            title={`Verify Membership ${code ? code : ''} — IAYO`}
            description="Verify an IAYO membership certificate online by membership ID."
        >
            <Seo
                title="Membership Verification — IAYO"
                description="Verify an IAYO membership certificate by membership ID. Public verification only — no private data exposed."
                siteName="IAYO"
            />
            <section className="bg-iayo-bg py-16 md:py-24">
                <div className="edge max-w-2xl">
                    <Eyebrow>Membership Verification</Eyebrow>
                    <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-navy md:text-5xl">
                        Verify an IAYO membership.
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                        Enter a membership ID in the URL — <span className="font-mono text-navy">/verify/IAYO-2026-XX-XXXXXX</span> —
                        or scan the QR code on a certificate. Only public information is shown.
                    </p>

                    <div className="mt-10 border border-border bg-white p-6 md:p-8">
                        {!code ? (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-iayo-blue/10">
                                    <BadgeCheck className="h-7 w-7 text-iayo-blue" strokeWidth={2} />
                                </div>
                                <p className="font-display text-2xl font-extrabold tracking-tight text-navy">
                                    Enter a membership ID to verify
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    Use the form below to look up any IAYO membership certificate. Only public
                                    information is shown.
                                </p>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin text-iayo-blue" />
                                <span className="text-sm font-semibold uppercase tracking-[0.14em]">Verifying…</span>
                            </div>
                        ) : valid ? (
                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-iayo-blue/10">
                                    <CheckCircle2 className="h-7 w-7 text-iayo-blue" strokeWidth={2} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <p className="font-display text-2xl font-extrabold tracking-tight text-navy">
                                        Valid Membership
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This membership ID is confirmed active in the IAYO registry.
                                    </p>
                                    <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Member</dt>
                                            <dd className="mt-1 font-semibold text-navy">{result.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Status</dt>
                                            <dd className="mt-1 font-semibold capitalize text-iayo-blue">{result.status}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Registered</dt>
                                            <dd className="mt-1 font-semibold text-navy">{formatDate(result.registered)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">District</dt>
                                            <dd className="mt-1 font-semibold text-navy">{result.district}, {result.state}</dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Membership ID</dt>
                                            <dd className="mt-1 font-mono font-bold text-navy">{result.membership_code}</dd>
                                        </div>
                                    </dl>
                                </div>
                                {qr && (
                                    <div className="shrink-0 text-center">
                                        <img src={qr} alt="QR code linking to this verification page" className="h-28 w-28" />
                                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            <QrCode className="mr-1 inline h-3 w-3" />Scan to verify
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-iayo-orange/10">
                                    <XCircle className="h-7 w-7 text-iayo-orange" strokeWidth={2} />
                                </div>
                                <p className="font-display text-2xl font-extrabold tracking-tight text-navy">
                                    Invalid or unknown membership
                                </p>
                                <p className="max-w-md text-sm text-muted-foreground">
                                    This membership ID could not be found in the IAYO registry, or it is no longer
                                    active. Check the code on the certificate and try again.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-iayo-blue" strokeWidth={2} />
                        Verification reveals only public information. Phone numbers and emails are never exposed.
                    </div>

                    <div className="mt-8">
                        <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy" htmlFor="vcode">
                            Verify another ID
                        </label>
                        <form
                            className="mt-2 flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const v = new FormData(e.currentTarget).get('vcode')?.trim();
                                if (v) window.location.href = `/verify/${v}`;
                            }}
                        >
                            <input
                                id="vcode"
                                name="vcode"
                                placeholder="IAYO-2026-XX-XXXXXX"
                                className="flex-1 rounded-sm border border-border bg-white px-3.5 py-2.5 font-mono text-sm text-navy focus:border-iayo-blue focus:outline-none focus:ring-1 focus:ring-iayo-blue"
                            />
                            <button type="submit" className="rounded-sm bg-iayo-blue px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:brightness-95 active:scale-[0.98]">
                                Verify
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Not a member yet? <Link to="/join" className="text-iayo-blue underline">Join IAYO</Link>.
                    </p>
                </div>
            </section>
        </Layout>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { btnPrimary, btnSecondary, Eyebrow } from '@/components/bits';

export default function CitizenLoginPage() {
    const { requestOtp, verifyOtp, isAuthed } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otpId, setOtpId] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthed) {
        navigate('/profile');
    }

    const sendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await requestOtp(email.trim());
            setOtpId(res.otpId);
            setStep('code');
        } catch (err) {
            setError(err?.message || 'Could not send code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOtp(otpId, code.trim());
            navigate('/profile');
        } catch (err) {
            setError(err?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-iayo-bg">
            <Helmet>
                <title>Citizen Login — IAYO</title>
                <meta name="description" content="Sign in to IAYO with email OTP — passwordless citizen access." />
            </Helmet>
            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">
                            I
                        </span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">IAYO</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-iayo-blue"
                    >
                        <ArrowLeft className="h-4 w-4" /> Home
                    </Link>
                    <div className="mt-6 border border-border bg-white p-8">
                        <Eyebrow>Citizen Login</Eyebrow>
                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy">
                            {step === 'email' ? 'Sign in with email' : 'Enter your code'}
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {step === 'email'
                                ? 'We will email you a one-time code. No password needed — new citizens are signed up automatically.'
                                : `A 6-digit code was sent to ${email}.`}
                        </p>

                        {error && (
                            <p className="mt-5 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-3 py-2.5 text-sm font-semibold text-iayo-orange">
                                {error}
                            </p>
                        )}

                        {step === 'email' ? (
                            <form onSubmit={sendOtp} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy">
                                        Email
                                    </span>
                                    <div className="mt-2 flex items-center gap-2 rounded-sm border border-border bg-white px-3 focus-within:border-iayo-blue">
                                        <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.in"
                                            className="h-12 w-full bg-transparent text-[15px] text-navy outline-none placeholder:text-muted-foreground/60"
                                        />
                                    </div>
                                </label>
                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    {loading ? 'Sending…' : 'Send Code'}
                                    {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={verify} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy">
                                        Verification Code
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        className="mt-2 h-12 w-full rounded-sm border border-border bg-white px-3 text-center font-display text-2xl font-extrabold tracking-[0.4em] text-navy outline-none focus:border-iayo-blue"
                                    />
                                </label>
                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    {loading ? 'Verifying…' : 'Verify & Continue'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue"
                                >
                                    Use a different email
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-[12px] font-semibold">
                        <Link to="/president-login" className="inline-flex items-center gap-1.5 text-navy hover:text-iayo-blue">
                            <Shield className="h-3.5 w-3.5" /> President Login
                        </Link>
                        <Link to="/donate" className="text-iayo-orange hover:brightness-95">
                            Donate →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

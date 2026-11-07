import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Shield, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { btnPrimary, Eyebrow } from '@/components/bits';

const inputCls =
    'mt-2 h-12 w-full rounded-sm border border-white/15 bg-white/5 px-3 text-[15px] font-semibold text-white outline-none placeholder:text-white/30 focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-white/80';

export default function PresidentForgotPasswordPage() {
    const { presidentPasswordResetRequest, presidentPasswordResetConfirm } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submitEmail = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await presidentPasswordResetRequest(email);
            setStep('reset');
        } catch (err) {
            setError(err?.message || 'Could not send the reset code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitReset = async (event) => {
        event.preventDefault();
        setError('');

        if (password.length < 10) {
            setError('Password must be at least 10 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await presidentPasswordResetConfirm(email, code.trim(), password);
            setStep('done');
        } catch (err) {
            setError(err?.response?.error || err?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-navy text-white">
            <Helmet>
                <title>Reset President Password — IAYO</title>
                <meta name="description" content="Reset the IAYO President account password using an email verification code." />
            </Helmet>

            <header className="border-b border-white/10">
                <div className="edge flex h-16 items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">
                            I
                        </span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-white">IAYO</span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <Link
                        to="/president-login"
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-iayo-blue"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to President login
                    </Link>

                    <div className="mt-6 border border-white/15 bg-white/5 p-8">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-iayo-blue" strokeWidth={2.25} />
                            <Eyebrow className="text-iayo-blue">Reset Password</Eyebrow>
                        </div>

                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
                            {step === 'email' && 'Reset your password'}
                            {step === 'reset' && 'Enter code and new password'}
                            {step === 'done' && 'Password updated'}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-white/65">
                            {step === 'email' &&
                                'Enter the registered President email. If it matches the President account, a one-time code will be sent to it.'}
                            {step === 'reset' &&
                                `A 6-digit code was sent to ${email}, valid for 10 minutes. Enter it along with your new password.`}
                            {step === 'done' && 'Your President password has been changed. You can now sign in with it.'}
                        </p>

                        {error && (
                            <p className="mt-5 rounded-sm border border-iayo-orange/50 bg-iayo-orange/15 px-3 py-2.5 text-sm font-semibold text-iayo-orange">
                                {error}
                            </p>
                        )}

                        {step === 'email' && (
                            <form onSubmit={submitEmail} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className={labelCls}>Registered President Email</span>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="username"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="president@example.in"
                                        className={inputCls}
                                    />
                                </label>
                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    {loading ? 'Sending…' : 'Send Reset Code'}
                                    {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
                                </button>
                            </form>
                        )}

                        {step === 'reset' && (
                            <form onSubmit={submitReset} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className={labelCls}>Verification Code</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        maxLength={6}
                                        value={code}
                                        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        className="mt-2 h-14 w-full rounded-sm border border-white/15 bg-white/5 px-3 text-center font-display text-2xl font-extrabold tracking-[0.4em] text-white outline-none placeholder:text-white/30 focus:border-iayo-blue"
                                    />
                                </label>
                                <label className="block">
                                    <span className={labelCls}>New Password</span>
                                    <input
                                        type="password"
                                        required
                                        minLength={10}
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="At least 10 characters"
                                        className={inputCls}
                                    />
                                </label>
                                <label className="block">
                                    <span className={labelCls}>Confirm New Password</span>
                                    <input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        value={confirm}
                                        onChange={(event) => setConfirm(event.target.value)}
                                        placeholder="Re-enter new password"
                                        className={inputCls}
                                    />
                                </label>
                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    <KeyRound className="h-4 w-4" />
                                    {loading ? 'Updating…' : 'Set New Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-iayo-blue"
                                >
                                    Use a different email
                                </button>
                            </form>
                        )}

                        {step === 'done' && (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-2 rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-3 py-2.5 text-sm font-semibold text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" /> Password changed successfully.
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/president-login')}
                                    className={`${btnPrimary} w-full`}
                                >
                                    Go to President Login <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

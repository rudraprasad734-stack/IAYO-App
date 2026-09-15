import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Shield, ArrowRight, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { btnPrimary, Eyebrow } from '@/components/bits';

const inputCls =
    'mt-2 h-12 w-full rounded-sm border border-white/15 bg-white/5 px-3 text-[15px] font-semibold text-white outline-none placeholder:text-white/30 focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-white/80';

export default function PresidentLoginPage() {
    const {
        authWithPassword,
        requestOtp,
        verifyOtpMfa,
        presidentExists,
        presidentAlert,
        isAuthed,
        isPresident,
        logout,
    } = useAuth();

    const navigate = useNavigate();
    const [step, setStep] = useState('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaId, setMfaId] = useState('');
    const [otpId, setOtpId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existsCheck, setExistsCheck] = useState(null);

    useEffect(() => {
        if (isAuthed && isPresident) {
            navigate('/dashboard', { replace: true });
            return;
        }

        presidentExists()
            .then((result) => setExistsCheck(Boolean(result?.exists)))
            .catch(() => setExistsCheck(null));
    }, [isAuthed, isPresident, navigate, presidentExists]);

    const alertRealPresident = async (attemptEmail) => {
        try {
            await presidentAlert({ attempt_email: attemptEmail });
        } catch (_) {
            // Security notification failure must not reveal backend details.
        }
    };

    const submitCredentials = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const identity = email.trim().toLowerCase();

        if (!identity || !identity.includes('@')) {
            setError('Enter the registered President email address.');
            setLoading(false);
            return;
        }

        try {
            try {
                await authWithPassword(identity, password);

                const authenticatedRole =
                    pbSafeRole();

                if (authenticatedRole !== 'president') {
                    logout();
                    throw new Error('This account is not authorised for President login.');
                }

                navigate('/dashboard', { replace: true });
                return;
            } catch (err) {
                const mfa = err?.response?.mfaId;

                if (!mfa) {
                    await alertRealPresident(identity);
                    throw new Error('Invalid President email or password.');
                }

                const result = await requestOtp(identity);

                if (!result?.otpId) {
                    throw new Error('The verification code could not be requested. Please try again.');
                }

                setMfaId(mfa);
                setOtpId(result.otpId);
                setStep('otp');
                setLoading(false);
                return;
            }
        } catch (err) {
            setError(err?.message || 'Access denied.');
            setLoading(false);
        }
    };

    const submitOtp = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const cleanCode = code.replace(/\D/g, '').slice(0, 6);

        if (!/^\d{6}$/.test(cleanCode)) {
            setError('Enter the 6-digit verification code.');
            setLoading(false);
            return;
        }

        try {
            await verifyOtpMfa(otpId, cleanCode, mfaId);

            if (!pbSafeRole('president')) {
                logout();
                throw new Error('The authenticated account is not the President account.');
            }

            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err?.message || 'Invalid or expired verification code.');
            setLoading(false);
        }
    };

    const backToCredentials = () => {
        setStep('credentials');
        setCode('');
        setMfaId('');
        setOtpId('');
        setError('');
    };

    const pbSafeRole = (expected) => {
        const current = pb.authStore.record;
        const role = current?.get?.('role') || current?.role || null;
        return expected ? role === expected : role;
    };

    return (
        <div className="flex min-h-screen flex-col bg-navy text-white">
            <Helmet>
                <title>President Login — IAYO</title>
                <meta
                    name="description"
                    content="Authorised President login using registered email, password and email OTP."
                />
            </Helmet>

            <header className="border-b border-white/10">
                <div className="edge flex h-16 items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">
                            I
                        </span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-white">
                            IAYO
                        </span>
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-iayo-blue"
                    >
                        <ArrowLeft className="h-4 w-4" /> Home
                    </Link>

                    {existsCheck === false && (
                        <div className="mt-6 flex items-start gap-3 border border-amber-400/40 bg-amber-500/10 p-4">
                            <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-200">No President profile exists yet.</p>
                                <p className="mt-1 text-white/70">
                                    The President account can be registered only once.{' '}
                                    <Link to="/president-setup" className="font-bold text-amber-300 underline">
                                        Open President setup →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 border border-white/15 bg-white/5 p-8">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-iayo-blue" strokeWidth={2.25} />
                            <Eyebrow className="text-iayo-blue">
                                {step === 'credentials' ? 'President Login' : 'Step 2 — Email OTP'}
                            </Eyebrow>
                        </div>

                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
                            {step === 'credentials' ? 'Authorised access only' : 'Enter your code'}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-white/65">
                            {step === 'credentials'
                                ? 'Use the registered President email and password. A one-time code will then be sent to that same email address.'
                                : `A 6-digit code was sent to ${email}. Enter it to complete sign-in.`}
                        </p>

                        {error && (
                            <p className="mt-5 rounded-sm border border-iayo-orange/50 bg-iayo-orange/15 px-3 py-2.5 text-sm font-semibold text-iayo-orange">
                                {error}
                            </p>
                        )}

                        {step === 'credentials' ? (
                            <form onSubmit={submitCredentials} className="mt-6 space-y-4">
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

                                <label className="block">
                                    <span className={labelCls}>Password</span>
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="••••••••••"
                                        className={inputCls}
                                    />
                                </label>

                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    {loading ? 'Checking…' : 'Continue'}
                                    {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={submitOtp} className="mt-6 space-y-4">
                                <label className="block">
                                    <span className={labelCls}>Email Verification Code</span>
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

                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
                                    {loading ? 'Verifying…' : 'Verify & Sign In'}
                                </button>

                                <button
                                    type="button"
                                    onClick={backToCredentials}
                                    className="w-full text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-iayo-blue"
                                >
                                    Back to credentials
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-[12px] font-semibold text-white/50">
                        <Link to="/admin-login" className="hover:text-iayo-blue">
                            Admin login →
                        </Link>
                        <Link to="/president-setup" className="hover:text-iayo-blue">
                            President setup →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { btnPrimary, Eyebrow } from '@/components/bits';

const inputCls = 'mt-2 h-12 w-full rounded-sm border border-white/15 bg-white/5 px-3 text-[15px] font-semibold text-white outline-none placeholder:text-white/30 focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-white/80';

export default function PresidentSetupPage() {
    const { presidentExists, presidentSetup, isAuthed, isPresident } = useAuth();
    const navigate = useNavigate();
    const [exists, setExists] = useState(null);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '', district: '', state: '', bio: '',
    });

    useEffect(() => {
        if (isAuthed && isPresident) {
            navigate('/dashboard', { replace: true });
            return;
        }

        let cancelled = false;
        setChecking(true);
        presidentExists()
            .then((result) => {
                if (!cancelled) setExists(Boolean(result?.exists));
            })
            .catch((err) => {
                if (!cancelled) {
                    setExists(null);
                    setError(err?.message || 'The President account could not be verified. Registration is disabled.');
                }
            })
            .finally(() => {
                if (!cancelled) setChecking(false);
            });

        return () => { cancelled = true; };
    }, [isAuthed, isPresident, navigate, presidentExists]);

    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        setError('');

        if (exists !== false) {
            setError('President registration is not currently available.');
            return;
        }
        if (form.password.length < 10) {
            setError('Password must be at least 10 characters.');
            return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (!form.email.includes('@')) {
            setError('Enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const result = await presidentSetup({
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                district: form.district.trim(),
                state: form.state.trim(),
                bio: form.bio.trim(),
            });

            setExists(true);
            setDone({
                email: result?.email || form.email.trim().toLowerCase(),
            });
        } catch (err) {
            if (err?.status === 409 || err?.response?.status === 409) setExists(true);
            setError(err?.response?.error || err?.message || 'President setup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-navy text-white">
            <Helmet><title>President Setup — IAYO</title></Helmet>
            <header className="border-b border-white/10"><div className="edge flex h-16 items-center"><Link to="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold">I</span><span className="font-display text-[15px] font-extrabold">IAYO</span></Link></div></header>

            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-iayo-blue"><ArrowLeft className="h-4 w-4" /> Home</Link>

                    {checking ? (
                        <div className="mt-6 border border-white/15 bg-white/5 p-8"><Eyebrow className="text-iayo-blue">Security check</Eyebrow><h1 className="mt-3 font-display text-2xl font-extrabold">Checking registration status…</h1></div>
                    ) : done ? (
                        <div className="mt-6 border border-emerald-400/40 bg-emerald-500/10 p-8">
                            <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-6 w-6" /><Eyebrow className="text-emerald-300">Setup complete</Eyebrow></div>
                            <h1 className="mt-3 font-display text-3xl font-extrabold">President registered</h1>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">This is now the single President account. Registration is closed on every device. Future sign-ins use the registered email, password and email OTP.</p>
                            <div className="mt-5 space-y-2 border border-white/15 bg-white/5 p-4 text-sm"><p><span className="text-white/50">Registered email:</span> <strong>{done.email}</strong></p></div>
                            <button type="button" onClick={() => navigate('/president-login')} className={`${btnPrimary} mt-6 w-full`}>Go to President Login <ArrowRight className="h-4 w-4" /></button>
                        </div>
                    ) : exists === true ? (
                        <div className="mt-6 border border-iayo-orange/50 bg-iayo-orange/10 p-8">
                            <div className="flex items-center gap-2 text-iayo-orange"><AlertTriangle className="h-6 w-6" /><Eyebrow className="text-iayo-orange">Registration closed</Eyebrow></div>
                            <h1 className="mt-3 font-display text-2xl font-extrabold">A President already exists</h1>
                            <p className="mt-3 text-sm leading-relaxed text-white/70">The central PocketBase database already contains the single President account. This registration form is closed for every device.</p>
                            {error && <p className="mt-5 rounded-sm border border-iayo-orange/50 bg-iayo-orange/15 px-3 py-2.5 text-sm font-semibold text-iayo-orange">{error}</p>}
                            <Link to="/president-login" className={`${btnPrimary} mt-6 w-full`}>Go to President Login <ArrowRight className="h-4 w-4" /></Link>
                        </div>
                    ) : (
                        <div className="mt-6 border border-white/15 bg-white/5 p-8">
                            <div className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-300" /><Eyebrow className="text-amber-300">One-time President setup</Eyebrow></div>
                            <h1 className="mt-3 font-display text-3xl font-extrabold">Create the President account</h1>
                            <p className="mt-3 text-sm leading-relaxed text-white/65">The first successful registration becomes the only President. The database itself prevents a second President account.</p>
                            {error && <p className="mt-5 rounded-sm border border-iayo-orange/50 bg-iayo-orange/15 px-3 py-2.5 text-sm font-semibold text-iayo-orange">{error}</p>}

                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <label className="block"><span className={labelCls}>Full Name</span><input required className={inputCls} value={form.name} onChange={set('name')} /></label>
                                <label className="block"><span className={labelCls}>Registered Email</span><input required type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="president@example.in" /></label>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block"><span className={labelCls}>Password</span><input required minLength={10} type="password" className={inputCls} value={form.password} onChange={set('password')} /></label>
                                    <label className="block"><span className={labelCls}>Confirm Password</span><input required minLength={10} type="password" className={inputCls} value={form.confirm} onChange={set('confirm')} /></label>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block"><span className={labelCls}>State</span><input className={inputCls} value={form.state} onChange={set('state')} /></label>
                                    <label className="block"><span className={labelCls}>District</span><input className={inputCls} value={form.district} onChange={set('district')} /></label>
                                </div>
                                <label className="block"><span className={labelCls}>Bio (optional)</span><textarea className={`${inputCls} h-auto min-h-[80px] py-2.5`} value={form.bio} onChange={set('bio')} /></label>
                                <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>{loading ? 'Creating…' : 'Create President Profile'}<Shield className="h-4 w-4" /></button>
                            </form>
                        </div>
                    )}

                    <div className="mt-5 text-center text-[12px] font-semibold text-white/50"><Link to="/president-login" className="hover:text-iayo-blue">President Login →</Link></div>
                </div>
            </main>
        </div>
    );
}

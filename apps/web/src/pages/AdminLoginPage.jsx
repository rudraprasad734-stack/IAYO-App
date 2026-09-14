import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { btnPrimary, Eyebrow } from '@/components/bits';

const inputCls =
    'mt-2 h-12 w-full rounded-sm border border-border bg-white px-3 text-[15px] font-semibold text-navy outline-none placeholder:text-muted-foreground focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

export default function AdminLoginPage() {
    const { authWithPassword, adminResolve, logout, isAuthed, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthed && isAdmin) navigate('/admin', { replace: true });
    }, [isAuthed, isAdmin, navigate]);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const id = adminId.trim();
            if (!id) throw new Error('Enter the Admin ID.');

            const resolved = await adminResolve(id);
            const email = String(resolved?.email || '').trim().toLowerCase();
            if (!email) throw new Error('Admin ID not found.');

            await authWithPassword(email, password);

            const record = pb.authStore.record;
            const role = record?.get?.('role') || record?.role;
            const enabled = record?.get?.('admin_enabled') ?? record?.admin_enabled;

            if (role !== 'admin' || enabled !== true) {
                logout();
                throw new Error('This account is not authorised for Admin access.');
            }

            navigate('/admin', { replace: true });
        } catch (err) {
            logout();
            setError(err?.message || 'Invalid Admin ID or password.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-iayo-bg">
            <Helmet>
                <title>Admin Login — IAYO</title>
                <meta name="description" content="Authorised IAYO administrative verification and upload access." />
            </Helmet>

            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">I</span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">IAYO</span>
                    </Link>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-md">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> Home
                    </Link>

                    <div className="mt-6 border border-border bg-white p-8">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-iayo-blue" />
                            <Eyebrow className="text-iayo-blue">Admin Login</Eyebrow>
                        </div>

                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy">Verification office access</h1>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Admin accounts are created and authorised by the President. Admins can verify and upload material for Presidential review, but cannot publish, edit or delete published data.
                        </p>

                        {error && (
                            <p className="mt-5 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-3 py-2.5 text-sm font-semibold text-iayo-orange">
                                {error}
                            </p>
                        )}

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <label className="block">
                                <span className={labelCls}>Admin ID</span>
                                <input
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={adminId}
                                    onChange={(event) => setAdminId(event.target.value)}
                                    placeholder="IAYO-ADM-001"
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
                                {loading ? 'Checking…' : 'Sign in'}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>
                    </div>

                    <div className="mt-5 flex justify-between text-[12px] font-semibold text-muted-foreground">
                        <Link to="/president-login" className="hover:text-iayo-blue">President login →</Link>
                        <Link to="/citizen-login" className="hover:text-iayo-blue">Citizen login →</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, KeyRound, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Eyebrow } from '@/components/bits';

const inputCls = 'h-11 w-full rounded-sm border border-border bg-white px-3 text-[15px] text-navy outline-none focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

// Avoids visually-ambiguous characters (0/O, 1/l/I) since the President may
// need to read this aloud or re-type it when handing it to the new Admin.
const PASSWORD_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';

function generateAdminPassword(length = 14) {
    const bytes = new Uint32Array(length);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length]).join('');
}

export default function PresidentAdminManagementPage() {
    const { isAuthed, isPresident, user, logout } = useAuth();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', admin_id: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [issued, setIssued] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isAuthed || !isPresident) {
            navigate('/president-login', { replace: true });
            return;
        }
        load();
    }, [isAuthed, isPresident]);

    const load = async () => {
        try {
            const rows = await pb.collection('users').getFullList({
                sort: '-created',
                filter: 'role = "admin" && admin_enabled = true',
            });
            setAdmins(rows);
        } catch (err) {
            setAdmins([]);
            setError(err?.message || 'Could not load admin accounts.');
        }
    };

    const createAdmin = async (event) => {
        event.preventDefault();
        setError('');
        setSaving(true);

        const password = generateAdminPassword();
        const adminId = form.admin_id.trim();

        try {
            await pb.collection('users').create({
                name: form.name.trim(),
                admin_id: adminId,
                email: form.email.trim().toLowerCase(),
                password,
                passwordConfirm: password,
                role: 'admin',
                verified: true,
                admin_enabled: true,
            });

            setForm({ name: '', admin_id: '', email: '' });
            setShowForm(false);
            setIssued({ adminId, password });
            setCopied(false);
            await load();
        } catch (err) {
            setError(err?.message || 'Could not create the admin account.');
        } finally {
            setSaving(false);
        }
    };

    const copyIssuedPassword = async () => {
        if (!issued) return;
        try {
            await navigator.clipboard.writeText(issued.password);
            setCopied(true);
        } catch (_) {
            setError('Could not copy automatically — select and copy the password manually.');
        }
    };

    const revokeAdmin = async (admin) => {
        if (!window.confirm(`Revoke Admin ID ${admin.admin_id || admin.email}? This account will no longer be able to sign in.`)) return;
        try {
            await pb.collection('users').delete(admin.id);
            await load();
        } catch (err) {
            setError(err?.message || 'Could not revoke the admin account.');
        }
    };

    const logoutPresident = () => {
        logout();
        navigate('/president-login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-iayo-bg">
            <Helmet>
                <title>Manage Admins — IAYO</title>
            </Helmet>

            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center justify-between">
                    <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> President Dashboard
                    </Link>
                    <button type="button" onClick={logoutPresident} className="text-[12px] font-bold uppercase tracking-[0.1em] text-navy hover:text-iayo-blue">
                        Log out
                    </button>
                </div>
            </header>

            <main className="edge py-10">
                <Eyebrow>President-authorised accounts</Eyebrow>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">Admin accounts</h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    Only the President can create or revoke an Admin account. The Admin ID is chosen by the President; the password is generated randomly and shown once — the Admin cannot see, change or reset it themselves. Admins cannot edit, publish or delete website data.
                </p>

                {error && <p className="mt-5 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}

                {issued && (
                    <div className="mt-5 border border-emerald-400/40 bg-emerald-50 px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700">Admin account created</p>
                                <p className="mt-1 text-sm text-emerald-900">
                                    This password is shown only once. Copy it now and share it securely with the Admin — it cannot be retrieved again, and the Admin cannot reset it themselves.
                                </p>
                            </div>
                            <button type="button" onClick={() => setIssued(null)} aria-label="Dismiss">
                                <X className="h-4 w-4 text-emerald-700" />
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-sm border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-navy">
                                Admin ID: {issued.adminId}
                            </span>
                            <span className="rounded-sm border border-emerald-300 bg-white px-3 py-2 font-mono text-sm font-semibold tracking-wide text-navy">
                                {issued.password}
                            </span>
                            <button
                                type="button"
                                onClick={copyIssuedPassword}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:bg-emerald-700"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'Copied' : 'Copy password'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-7 flex justify-end">
                    <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
                        <Plus className="h-4 w-4" /> Create Admin ID
                    </button>
                </div>

                <div className="mt-4 overflow-x-auto border border-border bg-white">
                    {admins === null ? (
                        <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                    ) : admins.length === 0 ? (
                        <p className="px-6 py-10 text-center text-sm text-muted-foreground">No Admin accounts have been created.</p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-iayo-muted text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3">Admin ID</th>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="px-5 py-4 font-semibold text-navy">{admin.admin_id || '—'}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{admin.name || '—'}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{admin.email}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-sm bg-iayo-blue/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-blue">
                                                <ShieldCheck className="h-3.5 w-3.5" /> Authorised
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button type="button" onClick={() => revokeAdmin(admin)} className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-orange hover:bg-iayo-orange/10">
                                                <Trash2 className="h-3.5 w-3.5" /> Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/50 p-4 py-10">
                    <div className="w-full max-w-lg border border-border bg-white">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <h2 className="font-display text-lg font-extrabold text-navy">Create Admin account</h2>
                                <p className="mt-1 text-xs text-muted-foreground">The Admin ID is set here; a random password is generated on creation.</p>
                            </div>
                            <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                        </div>

                        <form onSubmit={createAdmin} className="space-y-4 px-6 py-6">
                            <label className="block"><span className={labelCls}>Admin ID</span><input required className={`${inputCls} mt-2`} value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })} placeholder="IAYO-ADM-001" /></label>
                            <label className="block"><span className={labelCls}>Admin Name</span><input required className={`${inputCls} mt-2`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                            <label className="block"><span className={labelCls}>Email</span><input required type="email" className={`${inputCls} mt-2`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.in" /></label>
                            <p className="rounded-sm bg-iayo-muted px-3 py-2.5 text-xs text-muted-foreground">
                                A password will be generated automatically and shown once after you create this account.
                            </p>

                            <div className="flex justify-end gap-3 border-t border-border pt-5">
                                <button type="button" onClick={() => setShowForm(false)} className="rounded-sm px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Cancel</button>
                                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
                                    <KeyRound className="h-4 w-4" /> {saving ? 'Creating…' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

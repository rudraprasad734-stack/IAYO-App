import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Shield, LogOut, Mail, MapPin, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Eyebrow } from '@/components/bits';

const inputCls =
    'h-11 w-full rounded-sm border border-border bg-white px-3 text-[15px] text-navy outline-none focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

export default function ProfilePage() {
    const { user, logout, isStaff } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!user) return;
        setName(user.get?.('name') || '');
        setDistrict(user.get?.('district') || '');
        setState(user.get?.('state') || '');
        setPhone(user.get?.('phone') || '');
        setBio(user.get?.('bio') || '');
    }, [user]);

    if (!user) {
        navigate('/citizen-login');
        return null;
    }

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await pb.collection('users').update(user.id, { name, district, state, phone, bio });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    const role = user.get?.('role');

    return (
        <div className="min-h-screen bg-iayo-bg">
            <Helmet>
                <title>Profile — IAYO</title>
                <meta name="description" content="Your IAYO profile." />
            </Helmet>
            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">I</span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">IAYO</span>
                    </Link>
                    <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> Site
                    </Link>
                </div>
            </header>

            <div className="edge py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <aside className="lg:col-span-4">
                        <div className="border border-border bg-white p-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-iayo-blue font-display text-2xl font-extrabold text-white">
                                {(name || 'M').charAt(0).toUpperCase()}
                            </div>
                            <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-navy">{name || 'Member'}</h1>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" /> {user.email}
                            </p>
                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-iayo-blue/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-iayo-blue">
                                <BadgeCheck className="h-3.5 w-3.5" /> {role}
                            </span>

                            <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
                                {district && (
                                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {district}{state ? `, ${state}` : ''}</p>
                                )}
                                {user.get?.('president_id') && (
                                    <p className="flex items-center gap-2"><Shield className="h-4 w-4" /> {user.get('president_id')}</p>
                                )}
                            </div>

                            {isStaff && (
                                <Link
                                    to={role === 'admin' ? '/admin' : '/dashboard'}
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-navy px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95"
                                >
                                    {role === 'admin' ? 'Admin Panel' : 'President Dashboard'}
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => { logout(); navigate('/'); }}
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-iayo-muted"
                            >
                                <LogOut className="h-4 w-4" /> Log out
                            </button>
                        </div>
                    </aside>

                    <section className="lg:col-span-8">
                        <div className="border border-border bg-white p-6 md:p-8">
                            <Eyebrow>Edit Profile</Eyebrow>
                            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy">Your details</h2>
                            <form onSubmit={save} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className={labelCls}>Full Name</span>
                                        <input className={`${inputCls} mt-2`} value={name} onChange={(e) => setName(e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className={labelCls}>Phone</span>
                                        <input className={`${inputCls} mt-2`} value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className={labelCls}>District</span>
                                        <input className={`${inputCls} mt-2`} value={district} onChange={(e) => setDistrict(e.target.value)} />
                                    </label>
                                    <label className="block">
                                        <span className={labelCls}>State</span>
                                        <input className={`${inputCls} mt-2`} value={state} onChange={(e) => setState(e.target.value)} />
                                    </label>
                                </div>
                                <label className="block">
                                    <span className={labelCls}>Bio</span>
                                    <textarea className={`${inputCls} mt-2 h-auto min-h-[100px] py-2.5`} value={bio} onChange={(e) => setBio(e.target.value)} />
                                </label>
                                <div className="flex items-center gap-4">
                                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95">
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    {saved && <span className="text-sm font-semibold text-iayo-blue">Saved.</span>}
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Eyebrow, btnPrimary } from '@/components/bits';
import { submitMembership, generateMembershipCode, stateCode } from '@/lib/data';

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Chandigarh', 'Puducherry',
];

const AGE_GROUPS = ['18-25', '26-35', '36-45', '46-60', '60+'];

const inputCls =
    'w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-muted-foreground/70 focus:border-iayo-blue focus:outline-none focus:ring-1 focus:ring-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

export default function JoinPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        email: '',
        state: '',
        district: '',
        town: '',
        age_group: '',
        occupation: '',
        consent: false,
        terms: false,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.full_name.trim()) e.full_name = 'Full name is required';
        if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid mobile number';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
        if (!form.state) e.state = 'Select your state';
        if (!form.district.trim()) e.district = 'District is required';
        if (!form.town.trim()) e.town = 'Village / Town / City is required';
        if (!form.consent) e.consent = 'Consent is required to register';
        if (!form.terms) e.terms = 'Please accept the terms';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();
        setServerError('');
        if (!validate()) return;
        setSubmitting(true);
        try {
            const membershipCode = generateMembershipCode(form.state);
            await submitMembership({
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                state: form.state,
                district: form.district.trim(),
                town: form.town.trim(),
                age_group: form.age_group || '',
                occupation: form.occupation.trim(),
                membership_code: membershipCode,
            });
            navigate('/membership/success', {
                state: {
                    name: form.full_name.trim(),
                    membershipCode,
                    district: form.district.trim(),
                    town: form.town.trim(),
                },
            });
        } catch (err) {
            setServerError(
                err?.response?.data?.membership_code?.message ||
                    'Registration failed. Please try again.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout
            title="Join IAYO — Membership Registration | IAYO"
            description="Register as an IAYO member. Receive a unique membership ID and download your membership certificate with QR verification."
        >
            <Seo
                title="Join IAYO — Membership Registration"
                description="Become an IAYO member. Get a unique membership ID and a downloadable certificate with QR verification."
                siteName="IAYO"
            />
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Reveal y={20}>
                        <Eyebrow>Join IAYO</Eyebrow>
                    </Reveal>
                    <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-navy md:text-5xl">
                        Become part of a youth-led accountability movement.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                        Register with basic information only. Your data is private by default — phone and
                        email are never displayed publicly. You will receive a unique membership ID and a
                        downloadable certificate with QR verification.
                    </p>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge grid grid-cols-1 gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <form
                            onSubmit={onSubmit}
                            className="border border-border bg-white p-6 md:p-8"
                            noValidate
                        >
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className={labelCls} htmlFor="full_name">Full Name *</label>
                                    <input
                                        id="full_name"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.full_name}
                                        onChange={(e) => set('full_name', e.target.value)}
                                        placeholder="As you would like it on your certificate"
                                    />
                                    {errors.full_name && <p className="mt-1.5 text-xs text-iayo-orange">{errors.full_name}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="phone">Mobile Number *</label>
                                    <input
                                        id="phone"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.phone}
                                        onChange={(e) => set('phone', e.target.value)}
                                        placeholder="10-digit mobile"
                                        inputMode="tel"
                                    />
                                    {errors.phone && <p className="mt-1.5 text-xs text-iayo-orange">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="email">Email (optional)</label>
                                    <input
                                        id="email"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.email}
                                        onChange={(e) => set('email', e.target.value)}
                                        placeholder="For certificate delivery"
                                        inputMode="email"
                                    />
                                    {errors.email && <p className="mt-1.5 text-xs text-iayo-orange">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="state">State *</label>
                                    <select
                                        id="state"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.state}
                                        onChange={(e) => set('state', e.target.value)}
                                    >
                                        <option value="">Select state</option>
                                        {STATES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    {errors.state && <p className="mt-1.5 text-xs text-iayo-orange">{errors.state}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="district">District *</label>
                                    <input
                                        id="district"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.district}
                                        onChange={(e) => set('district', e.target.value)}
                                        placeholder="Your district"
                                    />
                                    {errors.district && <p className="mt-1.5 text-xs text-iayo-orange">{errors.district}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="town">Village / Town / City *</label>
                                    <input
                                        id="town"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.town}
                                        onChange={(e) => set('town', e.target.value)}
                                        placeholder="Your locality"
                                    />
                                    {errors.town && <p className="mt-1.5 text-xs text-iayo-orange">{errors.town}</p>}
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="age_group">Age Group (optional)</label>
                                    <select
                                        id="age_group"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.age_group}
                                        onChange={(e) => set('age_group', e.target.value)}
                                    >
                                        <option value="">Select range</option>
                                        {AGE_GROUPS.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="occupation">Occupation (optional)</label>
                                    <input
                                        id="occupation"
                                        className={`mt-2 ${inputCls}`}
                                        value={form.occupation}
                                        onChange={(e) => set('occupation', e.target.value)}
                                        placeholder="Student, farmer, professional…"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 border-t border-border pt-6">
                                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={form.consent}
                                        onChange={(e) => set('consent', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded-sm border-border accent-iayo-blue"
                                    />
                                    <span>I consent to IAYO storing my submitted information for membership purposes, and to my name and district being shown on the public verification page.</span>
                                </label>
                                {errors.consent && <p className="text-xs text-iayo-orange">{errors.consent}</p>}

                                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={form.terms}
                                        onChange={(e) => set('terms', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded-sm border-border accent-iayo-blue"
                                    />
                                    <span>I accept the <Link to="/about" className="text-iayo-blue underline">terms</Link> and <Link to="/about" className="text-iayo-blue underline">privacy policy</Link>.</span>
                                </label>
                                {errors.terms && <p className="text-xs text-iayo-orange">{errors.terms}</p>}
                            </div>

                            {serverError && (
                                <p className="mt-4 rounded-sm bg-iayo-orange/10 px-4 py-3 text-sm text-iayo-orange">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`mt-6 ${btnPrimary} ${submitting ? 'opacity-70' : ''}`}
                            >
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</>
                                ) : (
                                    <>Register &amp; Get Certificate <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="border border-navy/15 bg-navy p-6 text-white md:p-8">
                            <div className="absolute inset-0 grid-paper-light opacity-40" aria-hidden="true" />
                            <div className="relative">
                                <ShieldCheck className="h-8 w-8 text-iayo-blue" strokeWidth={1.75} />
                                <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                                    What you get
                                </h2>
                                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/80">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-iayo-blue" strokeWidth={2.25} />
                                        A unique, collision-proof membership ID (e.g. IAYO-2026-WB-000001).
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-iayo-blue" strokeWidth={2.25} />
                                        A downloadable membership certificate PDF with a QR code.
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-iayo-blue" strokeWidth={2.25} />
                                        A public verification page at /verify/&lt;your-code&gt;.
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-iayo-blue" strokeWidth={2.25} />
                                        Access to research, RTIs and accountability work in your district.
                                    </li>
                                </ul>
                                <div className="mt-7 rounded-sm border border-white/15 bg-white/5 p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                                        Privacy by default
                                    </p>
                                    <p className="mt-2 text-xs leading-relaxed text-white/70">
                                        We collect only what is necessary. Your phone number and email are never
                                        displayed publicly or exposed through any API.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

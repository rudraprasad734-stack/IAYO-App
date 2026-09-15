import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { Quote, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import Layout from '@/components/Layout';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import { Eyebrow, SectionHeading, Spinner, EmptyState, btnPrimary } from '@/components/bits';
import { fetchApprovedComments, submitComment } from '@/lib/data';

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
];

const inputCls =
    'w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-muted-foreground/70 focus:border-iayo-blue focus:outline-none focus:ring-1 focus:ring-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

function QuoteCarousel({ voices }) {
    const [idx, setIdx] = useState(0);
    const next = useCallback(() => setIdx((i) => (i + 1) % Math.max(voices.length, 1)), [voices.length]);

    useEffect(() => {
        if (voices.length <= 1) return;
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [next, voices.length]);

    if (voices.length === 0) return null;
    const v = voices[idx];

    return (
        <div className="relative min-h-[260px] md:min-h-[300px]">
            <AnimatePresence mode="wait">
                <motion.blockquote
                    key={v.id || idx}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center"
                >
                    <Quote className="mx-auto h-8 w-8 text-iayo-blue/60" strokeWidth={1.5} />
                    <p className="mx-auto mt-6 max-w-3xl font-display text-2xl font-extrabold leading-snug tracking-tight text-white md:text-4xl">
                        “{v.message}”
                    </p>
                    <footer className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
                        — {v.name}, {v.district}, {v.state}
                    </footer>
                </motion.blockquote>
            </AnimatePresence>
            {voices.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    {voices.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to quote ${i + 1}`}
                            onClick={() => setIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-iayo-blue' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function VoicesPage() {
    const [voices, setVoices] = useState(null);
    const [form, setForm] = useState({ name: '', town: '', district: '', state: '', message: '', consent: false });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchApprovedComments()
            .then((r) => setVoices(r.items))
            .catch(() => setVoices([]));
    }, []);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.district.trim()) e.district = 'District is required';
        if (!form.state) e.state = 'Select your state';
        if (form.message.trim().length < 10) e.message = 'Please write at least a short sentence';
        if (!form.consent) e.consent = 'Consent is required to publish';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await submitComment({
                name: form.name.trim(),
                town: form.town.trim(),
                district: form.district.trim(),
                state: form.state,
                message: form.message.trim(),
                consent: true,
            });
            setSubmitted(true);
            setForm({ name: '', town: '', district: '', state: '', message: '', consent: false });
        } catch (_) {
            setErrors({ message: 'Submission failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout
            title="Public Voices — IAYO"
            description="Citizen voices on transparency and accountability. Submit your own comment — moderated before publication."
        >
            <Seo
                title="Public Voices — IAYO"
                description="Read what citizens say about IAYO's transparency work, and add your own voice. All comments are moderated before publication."
                siteName="IAYO"
            />

            {/* Animated quote band */}
            <section className="relative overflow-hidden bg-navy py-20 text-white md:py-28">
                <div className="absolute inset-0 grid-paper-light opacity-40" aria-hidden="true" />
                <div className="edge relative">
                    <Eyebrow className="text-iayo-blue">Public Voices</Eyebrow>
                    <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">
                        What citizens are saying.
                    </h1>
                    <div className="mt-12">
                        {voices === null ? (
                            <div className="flex justify-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" /></div>
                        ) : voices.length === 0 ? (
                            <p className="text-center text-white/60">Voices will appear here once published.</p>
                        ) : (
                            <QuoteCarousel voices={voices} />
                        )}
                    </div>
                </div>
            </section>

            {/* Submit form */}
            <section className="bg-iayo-bg py-16 md:py-24">
                <div className="edge grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <SectionHeading
                            eyebrow="Add Your Voice"
                            title="Say something. Be heard."
                            intro="Share a short message about transparency, accountability or your experience with IAYO. Submissions are moderated before they appear publicly — nothing is published automatically."
                        />
                        <div className="mt-8 flex items-start gap-3 rounded-sm border border-border bg-white p-5 text-sm text-muted-foreground">
                            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-iayo-blue" strokeWidth={1.75} />
                            <p>We never publish your phone number or email. Only your name and location (as you provide them) are shown with your message.</p>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        {submitted ? (
                            <div className="border border-border bg-white p-8 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-iayo-blue/10">
                                    <CheckCircle2 className="h-7 w-7 text-iayo-blue" strokeWidth={2} />
                                </div>
                                <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-navy">
                                    Thank you for your voice.
                                </h3>
                                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                                    Your message has been received and is now pending moderation. Once approved by
                                    an IAYO editor, it will appear in Public Voices.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-iayo-blue"
                                >
                                    Submit another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="border border-border bg-white p-6 md:p-8" noValidate>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className={labelCls} htmlFor="vname">Name *</label>
                                        <input id="vname" className={`mt-2 ${inputCls}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
                                        {errors.name && <p className="mt-1.5 text-xs text-iayo-orange">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls} htmlFor="vtown">Village / Town (optional)</label>
                                        <input id="vtown" className={`mt-2 ${inputCls}`} value={form.town} onChange={(e) => set('town', e.target.value)} placeholder="Your locality" />
                                    </div>
                                    <div>
                                        <label className={labelCls} htmlFor="vdistrict">District *</label>
                                        <input id="vdistrict" className={`mt-2 ${inputCls}`} value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="Your district" />
                                        {errors.district && <p className="mt-1.5 text-xs text-iayo-orange">{errors.district}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls} htmlFor="vstate">State *</label>
                                        <select id="vstate" className={`mt-2 ${inputCls}`} value={form.state} onChange={(e) => set('state', e.target.value)}>
                                            <option value="">Select state</option>
                                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {errors.state && <p className="mt-1.5 text-xs text-iayo-orange">{errors.state}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelCls} htmlFor="vmessage">Your Message *</label>
                                        <textarea id="vmessage" rows={4} className={`mt-2 ${inputCls}`} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Share your thoughts on transparency, accountability, or your experience with IAYO…" />
                                        {errors.message && <p className="mt-1.5 text-xs text-iayo-orange">{errors.message}</p>}
                                    </div>
                                </div>
                                <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
                                    <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} className="mt-0.5 h-4 w-4 rounded-sm border-border accent-iayo-blue" />
                                    <span>I consent to my name, location and message being published on the IAYO website after moderation.</span>
                                </label>
                                {errors.consent && <p className="mt-1.5 text-xs text-iayo-orange">{errors.consent}</p>}
                                <button type="submit" disabled={submitting} className={`mt-6 ${btnPrimary} ${submitting ? 'opacity-70' : ''}`}>
                                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" strokeWidth={2.5} /> Submit for Moderation</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* All approved voices */}
            <section className="border-t border-border bg-white py-16 md:py-24">
                <div className="edge">
                    <SectionHeading eyebrow="Voices from Citizens" title="Approved messages." intro="Every message below passed IAYO moderation. No fake testimonials are used." />
                    <div className="mt-12">
                        {voices === null ? (
                            <Spinner />
                        ) : voices.length === 0 ? (
                            <EmptyState title="No published voices yet" body="Be the first to add your voice above." />
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {voices.map((v, i) => (
                                    <Reveal key={v.id} y={20} delay={(i % 3) * 0.06}>
                                        <figure className="flex h-full flex-col border border-border bg-iayo-bg p-6">
                                            <Quote className="h-5 w-5 text-iayo-blue/50" strokeWidth={1.5} />
                                            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy/90">
                                                “{v.message}”
                                            </blockquote>
                                            <figcaption className="mt-5 border-t border-border pt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                                {v.name} · {v.district}, {v.state}
                                            </figcaption>
                                        </figure>
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

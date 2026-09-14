import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, FlaskConical, Send, UploadCloud, FileText, Video } from 'lucide-react';
import Layout from '@/components/Layout';
import { Eyebrow, btnPrimary } from '@/components/bits';
import { submitResearchApplication, submitContribution } from '@/lib/data';

const inputCls = 'mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-[15px] text-navy outline-none focus:border-iayo-blue';
const labelCls = 'text-[11px] font-bold uppercase tracking-[0.12em] text-navy';
const MAX_FILES = 8;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPT = '.pdf,.mp4,.mov,.webm,.m4v,.avi';

const emptyApplication = {
    name: '', phone: '', email: '', field_of_interest: '', area: '',
    education_qualification: '', motivation: '', oath_agreed: false, website: '',
};

const emptyContribution = {
    name: '', phone: '', email: '', title: '', contribution_type: 'research_material',
    area: '', description: '', source_note: '', website: '',
};

function MaterialSubmission() {
    const [form, setForm] = useState(emptyContribution);
    const [files, setFiles] = useState([]);
    const [agreed, setAgreed] = useState(false);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));

    const chooseFiles = (event) => {
        const selected = Array.from(event.target.files || []);
        setError('');
        if (selected.length > MAX_FILES) {
            setError(`Please select no more than ${MAX_FILES} files.`);
            event.target.value = '';
            return;
        }
        const invalid = selected.find((file) => file.size > MAX_FILE_SIZE);
        if (invalid) {
            setError(`${invalid.name} is larger than 50 MB. Please choose a smaller file.`);
            event.target.value = '';
            return;
        }
        const allowed = selected.every((file) => {
            const name = file.name.toLowerCase();
            return ['.pdf', '.mp4', '.mov', '.webm', '.m4v', '.avi'].some((ext) => name.endsWith(ext));
        });
        if (!allowed) {
            setError('Only PDF documents and video files (MP4, MOV, WEBM, M4V, AVI) are accepted.');
            event.target.value = '';
            return;
        }
        setFiles(selected);
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!files.length) return setError('Please attach at least one PDF or video file.');
        if (!agreed) return setError('Please confirm that the material is being submitted in good faith and may be reviewed by IAYO.');
        setStatus('sending');
        setError('');
        try {
            const body = new FormData();
            Object.entries(form).forEach(([key, value]) => body.append(key, value));
            body.append('status', 'pending');
            body.append('consent_agreed', 'true');
            files.forEach((file) => body.append('files', file));
            await submitContribution(body);
            setStatus('success');
            setForm(emptyContribution);
            setFiles([]);
            setAgreed(false);
        } catch (err) {
            setStatus('error');
            setError(err?.response?.message || err?.message || 'The material could not be submitted.');
        }
    };

    if (status === 'success') {
        return (
            <div className="border border-emerald-200 bg-white p-8 md:p-10">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <h2 className="mt-4 font-display text-2xl font-extrabold text-navy">Material received</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Your files have been securely submitted to IAYO for Presidential review. They will not be published automatically.
                </p>
                <button type="button" onClick={() => setStatus('idle')} className={`mt-6 ${btnPrimary}`}>
                    Submit another contribution <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="border border-border bg-white p-6 md:p-8">
            <div className="flex items-start gap-3 border-b border-border pb-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-iayo-orange/10 text-iayo-orange"><UploadCloud className="h-5 w-5" /></span>
                <div>
                    <h2 className="font-display text-xl font-extrabold text-navy">Submit research, evidence or media</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Have a PDF, video or other research material? Send it directly to IAYO for review.</p>
                </div>
            </div>

            {error && <p className="mt-6 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}

            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                <label><span className={labelCls}>Your name *</span><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required /></label>
                <label><span className={labelCls}>Phone number *</span><input className={inputCls} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required /></label>
                <label><span className={labelCls}>Email address *</span><input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></label>
                <label><span className={labelCls}>Contribution title *</span><input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What are you submitting?" required /></label>
                <label><span className={labelCls}>Type *</span><select className={inputCls} value={form.contribution_type} onChange={(e) => set('contribution_type', e.target.value)}><option value="research_material">Research material</option><option value="evidence">Evidence / documentation</option><option value="rti">RTI material</option><option value="video">Video / field recording</option><option value="other">Other public-interest material</option></select></label>
                <label><span className={labelCls}>Area / location *</span><input className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="District, state, locality or subject area" required /></label>
            </div>

            <label className="mt-5 block"><span className={labelCls}>What does the material show or establish? *</span><textarea className={`${inputCls} h-32 py-3`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Explain the material, what you observed and why it may matter." required /></label>
            <label className="mt-5 block"><span className={labelCls}>Source / context (optional)</span><textarea className={`${inputCls} h-24 py-3`} value={form.source_note} onChange={(e) => set('source_note', e.target.value)} placeholder="Source, date, circumstances, links or other useful context." /></label>

            <div className="mt-6 rounded-sm border border-dashed border-iayo-blue/40 bg-iayo-blue/5 p-5">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-iayo-blue" /><Video className="h-4 w-4 text-iayo-orange" /><span className="text-sm font-extrabold text-navy">Attach files *</span></div>
                <p className="mt-1 text-[12px] text-muted-foreground">Up to {MAX_FILES} files, maximum 50 MB each. PDF and video files are accepted.</p>
                <input className="mt-4 block w-full text-[12px] text-muted-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-white file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.08em] file:text-navy" type="file" accept={ACCEPT} multiple onChange={chooseFiles} required />
                {files.length > 0 && <ul className="mt-3 space-y-1 text-[12px] text-navy">{files.map((file) => <li key={`${file.name}-${file.size}`}>• {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</li>)}</ul>}
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-sm border border-border bg-iayo-bg p-4">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-iayo-blue" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                <span className="text-sm leading-relaxed text-navy">I confirm that I am submitting this material in good faith and understand that IAYO will review it before deciding whether to use or publish it.</span>
            </label>
            <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} className="absolute left-[-10000px] h-px w-px opacity-0" />

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="max-w-xl text-[12px] leading-relaxed text-muted-foreground">Your files go to the IAYO President for review. They are not made public just because you submit them.</p>
                <button type="submit" disabled={status === 'sending'} className={btnPrimary}><Send className="h-4 w-4" /> {status === 'sending' ? 'Sending…' : 'Send to IAYO'}</button>
            </div>
        </form>
    );
}

export default function ResearchContributePage() {
    const [form, setForm] = useState(emptyApplication);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setStatus('sending');
        setError('');
        try {
            await submitResearchApplication(form);
            setStatus('success');
            setForm(emptyApplication);
        } catch (err) {
            setStatus('error');
            setError(err?.message || 'Your application could not be submitted.');
        }
    };

    return (
        <Layout title="Research & Contribute — IAYO" description="Apply to contribute to IAYO research or submit research material, evidence and field recordings for review.">
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Link to="/research" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue"><ArrowLeft className="h-4 w-4" /> Research</Link>
                    <div className="mt-8 max-w-4xl"><Eyebrow>Research &amp; Contribute</Eyebrow><h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-navy md:text-6xl">Help investigate the facts that matter.</h1><p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">Apply to contribute to IAYO research, or send us material you have already collected. Every submission is reviewed before it is used or published.</p></div>
                </div>
            </section>

            <section className="bg-iayo-bg py-12 md:py-18">
                <div className="edge max-w-4xl space-y-10">
                    <MaterialSubmission />

                    {status === 'success' ? (
                        <div className="border border-emerald-200 bg-white p-8 md:p-10"><CheckCircle2 className="h-10 w-10 text-emerald-600" /><h2 className="mt-4 font-display text-2xl font-extrabold text-navy">Application received</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Your research contributor application has been securely submitted for Presidential review. The President has been notified by email.</p><button type="button" onClick={() => setStatus('idle')} className={`mt-6 ${btnPrimary}`}>Submit another application <ArrowRight className="h-4 w-4" /></button></div>
                    ) : (
                        <form onSubmit={submit} className="border border-border bg-white p-6 md:p-8">
                            <div className="flex items-start gap-3 border-b border-border pb-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-iayo-blue/10 text-iayo-blue"><FlaskConical className="h-5 w-5" /></span><div><h2 className="font-display text-xl font-extrabold text-navy">Research Contributor Application</h2><p className="mt-1 text-sm text-muted-foreground">Apply to work with IAYO on research, field verification or public-interest investigations.</p></div></div>
                            {error && <p className="mt-6 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}
                            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <label><span className={labelCls}>Full name *</span><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required /></label>
                                <label><span className={labelCls}>Phone number *</span><input className={inputCls} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required /></label>
                                <label><span className={labelCls}>Email address *</span><input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></label>
                                <label><span className={labelCls}>Field of interest for research *</span><input className={inputCls} value={form.field_of_interest} onChange={(e) => set('field_of_interest', e.target.value)} required /></label>
                                <label><span className={labelCls}>Area / geographical area *</span><input className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)} required /></label>
                                <label><span className={labelCls}>Education qualification *</span><input className={inputCls} value={form.education_qualification} onChange={(e) => set('education_qualification', e.target.value)} required /></label>
                            </div>
                            <label className="mt-5 block"><span className={labelCls}>What motivates you to contribute? *</span><textarea className={`${inputCls} h-32 py-3`} value={form.motivation} onChange={(e) => set('motivation', e.target.value)} required /></label>
                            <div className="mt-6 rounded-sm border border-border bg-iayo-bg p-5"><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4 accent-iayo-blue" checked={form.oath_agreed} onChange={(e) => set('oath_agreed', e.target.checked)} required /><span className="text-sm leading-relaxed text-navy"><strong>Research contributor oath:</strong> I affirm that I will remain loyal to the IAYO motive, work honestly and responsibly, respect evidence and public interest, and not knowingly misuse research or the IAYO platform.</span></label></div>
                            <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} className="absolute left-[-10000px] h-px w-px opacity-0" />
                            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"><p className="max-w-xl text-[12px] leading-relaxed text-muted-foreground">This application is reviewed by the President and does not automatically grant contributor access.</p><button type="submit" disabled={status === 'sending'} className={btnPrimary}><Send className="h-4 w-4" /> {status === 'sending' ? 'Submitting…' : 'Submit Application'}</button></div>
                        </form>
                    )}
                </div>
            </section>
        </Layout>
    );
}

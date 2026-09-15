import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, CheckCircle2, FileUp, LogOut, ShieldCheck, Upload, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Eyebrow } from '@/components/bits';

const inputCls = 'h-11 w-full rounded-sm border border-border bg-white px-3 text-[15px] text-navy outline-none focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

const FORMS = {
    research: {
        label: 'Research',
        fields: [
            ['title', 'Title', 'text', true],
            ['category', 'Category', 'select', true, ['Research', 'Accountability', 'Transparency', 'Policy']],
            ['summary', 'Summary', 'textarea', true],
            ['body', 'Body (HTML)', 'textarea', false],
            ['featured', 'Feature on homepage', 'checkbox', false],
        ],
    },
    investigations: {
        label: 'Investigation',
        fields: [
            ['title', 'Title', 'text', true],
            ['category', 'Category', 'select', true, ['Investigation', 'Accountability', 'Transparency']],
            ['summary', 'Summary', 'textarea', true],
            ['body', 'Body (HTML)', 'textarea', false],
            ['video_url', 'Video URL', 'url', false],
            ['images', 'Images', 'file', false],
            ['documents', 'Documents', 'file', false],
            ['evidence', 'Evidence', 'file', false],
            ['reports', 'Reports', 'file', false],
        ],
    },
    findings: {
        label: 'Finding',
        fields: [
            ['title', 'Title', 'text', true],
            ['category', 'Category', 'text', true],
            ['department', 'Department', 'text', false],
            ['location', 'Location', 'text', false],
            ['finding_date', 'Finding date', 'date', false],
            ['corruption_amount', 'Verified/assessed corruption amount (₹)', 'number', false],
            ['summary', 'Summary', 'textarea', true],
            ['body', 'Body (HTML)', 'textarea', false],
            ['nature', 'Nature', 'select', true, ['allegation', 'verified', 'documented_fact', 'iayo_analysis']],
            ['sources', 'Sources', 'textarea', false],
            ['right_of_reply', 'Right of Reply (HTML)', 'textarea', false],
            ['evidence', 'Evidence', 'file', false],
            ['photos', 'Photos', 'file', false],
        ],
    },
    rti_cases: {
        label: 'RTI Case',
        fields: [
            ['rti_id', 'RTI ID', 'text', true],
            ['title', 'Title', 'text', true],
            ['department', 'Department', 'text', true],
            ['public_authority', 'Public authority', 'text', false],
            ['state', 'State', 'text', false],
            ['district', 'District', 'text', false],
            ['date_filed', 'Date filed', 'date', false],
            ['reply_date', 'Reply date', 'date', false],
            ['summary', 'Summary', 'textarea', true],
            ['key_findings', 'Key findings', 'textarea', false],
            ['appeal_info', 'Appeal info', 'textarea', false],
            ['application_pdf', 'Application PDF', 'file', false],
            ['reply_pdf', 'Reply PDF', 'file', false],
            ['appeal_pdf', 'Appeal PDF', 'file', false],
        ],
    },
    notifications: {
        label: 'News / Announcement',
        fields: [
            ['title', 'Title', 'text', true],
            ['body', 'Body', 'textarea', true],
            ['type', 'Type', 'select', true, ['update', 'alert', 'investigation', 'research', 'event']],
            ['link', 'Link', 'text', false],
        ],
    },
};

const COLLECTIONS = Object.keys(FORMS);

function titleFor(record) {
    return record?.title || record?.name || record?.rti_id || 'Untitled';
}

function ContentUploadForm({ kind, user, onClose, onSaved }) {
    const config = FORMS[kind];
    const [values, setValues] = useState({});
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const setValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const form = new FormData();
            Object.entries(values).forEach(([key, value]) => form.append(key, typeof value === 'boolean' ? String(value) : value ?? ''));
            if (kind !== 'notifications') form.append('author', user.id);
            form.append('status', 'pending_president');

            Object.entries(files).forEach(([key, selectedFiles]) => {
                selectedFiles.forEach((file) => form.append(key, file));
            });

            await pb.collection(kind).create(form);
            onSaved();
        } catch (err) {
            setError(err?.message || 'The upload could not be submitted.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/60 p-4 py-10">
            <div className="w-full max-w-3xl border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <Eyebrow>Admin upload</Eyebrow>
                        <h2 className="mt-1 font-display text-xl font-extrabold text-navy">Submit {config.label}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="text-muted-foreground">×</button>
                </div>

                <form onSubmit={submit} className="max-h-[72vh] space-y-4 overflow-y-auto px-6 py-6">
                    <div className="border border-iayo-blue/20 bg-iayo-blue/5 p-4 text-sm text-muted-foreground">
                        This upload is saved as <strong>Pending President</strong>. It is not public. The President must approve it before publication.
                    </div>

                    {error && <p className="rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-3 py-2 text-sm font-semibold text-iayo-orange">{error}</p>}

                    {config.fields.map(([key, label, type, required, options]) => (
                        <label key={key} className="block">
                            <span className={labelCls}>{label}</span>
                            {type === 'textarea' ? (
                                <textarea required={required} className={`${inputCls} mt-2 h-auto min-h-[100px] py-2.5`} value={values[key] || ''} onChange={(e) => setValue(key, e.target.value)} />
                            ) : type === 'select' ? (
                                <select required={required} className={`${inputCls} mt-2`} value={values[key] || ''} onChange={(e) => setValue(key, e.target.value)}>
                                    <option value="">Select…</option>
                                    {options.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            ) : type === 'checkbox' ? (
                                <input type="checkbox" className="mt-3" checked={Boolean(values[key])} onChange={(e) => setValue(key, e.target.checked)} />
                            ) : type === 'file' ? (
                                <input type="file" multiple className="mt-2 block w-full text-[12px] text-muted-foreground" onChange={(e) => setFiles((current) => ({ ...current, [key]: Array.from(e.target.files || []) }))} />
                            ) : (
                                <input type={type} required={required} className={`${inputCls} mt-2`} value={values[key] || ''} onChange={(e) => setValue(key, e.target.value)} />
                            )}
                        </label>
                    ))}

                    <div className="flex justify-end gap-2 border-t border-border pt-5">
                        <button type="button" onClick={onClose} className="rounded-sm px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Cancel</button>
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white">
                            <Upload className="h-4 w-4" /> {saving ? 'Uploading…' : 'Send to President'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [kind, setKind] = useState('research');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const rows = await Promise.all(
                COLLECTIONS.map((name) => pb.collection(name).getFullList({ sort: '-created', expand: 'author' }).catch(() => [])),
            );
            setItems(rows.flat().sort((a, b) => String(b.created || '').localeCompare(String(a.created || ''))));
        } catch (err) {
            setError(err?.message || 'Could not load submissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const mine = useMemo(() => {
        return items.filter((record) => record.author === user?.id || !record.author);
    }, [items, user?.id]);

    const logoutAdmin = () => {
        logout();
        window.location.assign('/admin-login');
    };

    return (
        <div className="min-h-screen bg-iayo-bg">
            <Helmet><title>Admin Verification Office — IAYO</title></Helmet>

            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">I</span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">Admin Verification Office</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/president-login" className="text-[12px] font-bold uppercase tracking-[0.08em] text-navy hover:text-iayo-blue">President Login</Link>
                        <button type="button" onClick={logoutAdmin} className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-navy"><LogOut className="h-4 w-4" /> Log out</button>
                    </div>
                </div>
            </header>

            <main className="edge py-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Eyebrow>Check · Verify · Upload</Eyebrow>
                        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">Welcome, {user?.get?.('name') || 'Administrator'}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Admin access is intentionally limited. You can inspect records and submit verified material. You cannot edit or delete existing data and you cannot publish anything.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-blue"><ShieldCheck className="h-4 w-4" /> President approval required</div>
                </div>

                {error && <p className="mt-5 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}

                <section className="mt-8 border border-border bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <Eyebrow>New submission</Eyebrow>
                            <h2 className="mt-1 font-display text-xl font-extrabold text-navy">Send verified material to the President</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {COLLECTIONS.map((name) => (
                                <button key={name} type="button" onClick={() => { setKind(name); setShowUpload(true); }} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-navy hover:border-iayo-blue hover:text-iayo-blue">
                                    <FileUp className="h-3.5 w-3.5" /> {FORMS[name].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Eyebrow>Submission history</Eyebrow>
                            <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Your submitted material</h2>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto border border-border bg-white">
                        {loading ? (
                            <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                        ) : mine.length === 0 ? (
                            <p className="px-6 py-10 text-center text-sm text-muted-foreground">No submissions yet.</p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border bg-iayo-muted text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                                    <tr><th className="px-5 py-3">Content</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Submitted</th></tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {mine.map((record) => (
                                        <tr key={`${record.collectionName}-${record.id}`}>
                                            <td className="px-5 py-4 font-semibold text-navy">{titleFor(record)}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${record.status === 'published' ? 'bg-iayo-blue/10 text-iayo-blue' : record.status === 'rejected' ? 'bg-iayo-orange/10 text-iayo-orange' : 'bg-amber-500/10 text-amber-700'}`}>
                                                    {record.status === 'published' ? <CheckCircle2 className="h-3.5 w-3.5" /> : record.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                                    {record.status === 'pending_president' ? 'Pending President' : record.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">{new Date(record.created).toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {showUpload && <ContentUploadForm kind={kind} user={user} onClose={() => setShowUpload(false)} onSaved={async () => { setShowUpload(false); await load(); }} />}
        </div>
    );
}

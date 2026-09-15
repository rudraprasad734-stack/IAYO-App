import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, LogOut, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { Eyebrow } from '@/components/bits';
import { fileUrl } from '@/lib/data';

const COLLECTIONS = ['research', 'investigations', 'findings', 'rti_cases', 'notifications'];

const LABELS = {
    research: 'Research',
    investigations: 'Investigation',
    findings: 'Finding',
    rti_cases: 'RTI Case',
    notifications: 'News / Announcement',
};

const titleFor = (record) =>
    record?.title || record?.name || record?.rti_id || 'Untitled submission';

export default function PresidentReviewPage() {
    const { isAuthed, isPresident, logout } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [selected, setSelected] = useState(null);
    const [reviewNote, setReviewNote] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthed || !isPresident) {
            navigate('/president-login', { replace: true });
            return;
        }
        load();
    }, [isAuthed, isPresident]);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const rows = await Promise.all(
                COLLECTIONS.map((name) =>
                    pb.collection(name)
                        .getFullList({ sort: '-created', filter: "status = 'pending_president'", expand: 'author' })
                        .then((records) => records.map((record) => ({ collection: name, record })))
                        .catch(() => []),
                ),
            );
            setItems(rows.flat().sort((a, b) => String(b.record?.created || '').localeCompare(String(a.record?.created || ''))));
        } catch (err) {
            setError(err?.message || 'Could not load the President review queue.');
        } finally {
            setLoading(false);
        }
    };

    const notifications = items.length;

    const decide = async (item, decision) => {
        const key = `${item.collection}:${item.record.id}`;
        setBusy(key);
        setError('');

        try {
            const nextStatus = decision === 'approve' ? 'published' : 'rejected';
            await pb.collection(item.collection).update(item.record.id, { status: nextStatus });

            setSelected(null);
            setReviewNote('');
            await load();
        } catch (err) {
            setError(err?.message || 'The decision could not be saved.');
        } finally {
            setBusy('');
        }
    };

    const logoutPresident = () => {
        logout();
        navigate('/president-login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-iayo-bg">
            <Helmet><title>President Review Queue — IAYO</title></Helmet>

            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center justify-between">
                    <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                        <ArrowLeft className="h-4 w-4" /> Dashboard
                    </Link>
                    <button type="button" onClick={logoutPresident} className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-navy hover:text-iayo-blue">
                        <LogOut className="h-4 w-4" /> Log out
                    </button>
                </div>
            </header>

            <main className="edge py-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Eyebrow>Presidential approval</Eyebrow>
                        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">Review queue</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Admin uploads arrive here after verification. Nothing in this queue is public until the President explicitly publishes it. Rejected material remains unpublished.
                        </p>
                    </div>
                    <div className="rounded-sm border border-iayo-blue/20 bg-iayo-blue/5 px-4 py-3 text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pending</p>
                        <p className="mt-1 font-display text-2xl font-extrabold text-navy">{notifications}</p>
                    </div>
                </div>

                {error && <p className="mt-5 rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}

                <div className="mt-7 space-y-4">
                    {loading ? (
                        <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">Loading review queue…</div>
                    ) : items.length === 0 ? (
                        <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">No pending uploads require Presidential approval.</div>
                    ) : items.map((item) => {
                        const key = `${item.collection}:${item.record.id}`;
                        const record = item.record;
                        const author = record?.expand?.author;
                        return (
                            <article key={key} className="border border-border bg-white p-5 md:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-sm bg-iayo-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{LABELS[item.collection]}</span>
                                            <span className="rounded-sm bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">Pending President</span>
                                        </div>
                                        <h2 className="mt-3 font-display text-xl font-extrabold text-navy">{titleFor(record)}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Uploaded by {author?.name || author?.email || 'Admin'} on {new Date(record.created).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-iayo-muted">
                                        <Eye className="h-4 w-4" /> Review
                                    </button>
                                </div>

                                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                    {record.summary || record.body?.replace(/<[^>]+>/g, ' ') || record.body || record.message || 'No summary provided.'}
                                </p>

                                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                                    <button type="button" disabled={busy === key} onClick={() => decide(item, 'reject')} className="inline-flex items-center gap-2 rounded-sm border border-iayo-orange/30 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-orange hover:bg-iayo-orange/10 disabled:opacity-50">
                                        <XCircle className="h-4 w-4" /> Reject
                                    </button>
                                    <button type="button" disabled={busy === key} onClick={() => decide(item, 'approve')} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95 disabled:opacity-50">
                                        <CheckCircle2 className="h-4 w-4" /> Publish
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </main>

            {selected && (
                <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/60 p-4 py-10">
                    <div className="w-full max-w-3xl border border-border bg-white">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div>
                                <Eyebrow>{LABELS[selected.collection]}</Eyebrow>
                                <h2 className="mt-1 font-display text-xl font-extrabold text-navy">{titleFor(selected.record)}</h2>
                            </div>
                            <button type="button" onClick={() => setSelected(null)}><XCircle className="h-6 w-6 text-muted-foreground" /></button>
                        </div>
                        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-6 text-sm text-navy">
                            {Object.entries(selected.record)
                                .filter(([key]) => !['id', 'collectionId', 'collectionName', 'created', 'updated', 'status'].includes(key))
                                .filter(([, value]) => value !== '' && value !== null && value !== undefined)
                                .map(([key, value]) => (
                                    <div key={key} className="border-b border-border pb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{key}</p>
                                        <p className="mt-1 whitespace-pre-wrap break-words">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
                                    </div>
                                ))}

                            {['images', 'documents', 'evidence', 'reports', 'photos', 'application_pdf', 'reply_pdf', 'appeal_pdf'].map((field) => {
                                const value = selected.record?.[field];
                                if (!value) return null;
                                const files = Array.isArray(value) ? value : [value];
                                return (
                                    <div key={field}>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{field}</p>
                                        <div className="mt-2 space-y-1">
                                            {files.map((filename) => <a key={filename} href={fileUrl(selected.record, filename)} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-iayo-blue underline">{filename}</a>)}
                                        </div>
                                    </div>
                                );
                            })}

                            <label className="block pt-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Decision note (optional)</span>
                                <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="mt-2 min-h-[90px] w-full rounded-sm border border-border px-3 py-2 outline-none focus:border-iayo-blue" placeholder="Why you approved or rejected this submission" />
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                            <button type="button" onClick={() => decide(selected, 'reject')} className="inline-flex items-center gap-2 rounded-sm border border-iayo-orange/30 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-orange"><XCircle className="h-4 w-4" /> Reject</button>
                            <button type="button" onClick={() => decide(selected, 'approve')} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white"><CheckCircle2 className="h-4 w-4" /> Publish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

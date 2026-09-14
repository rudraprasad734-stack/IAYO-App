import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, X, ArrowLeft, Save, Search,
    FileText, Video, Scale, ScrollText, MessageSquare, Users, Bell,
    BarChart3, UserCog, History, LayoutDashboard, ShieldCheck, FlaskConical, FileUp, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    fetchAllResearchForStaff, fetchAllInvestigationsForStaff,
    fetchAllFindingsForStaff, fetchAllRtiForStaff, fetchAllCommentsForStaff,
    fetchAllMembers, fetchStats, fetchNotifications, fetchUsers,
    fetchAuditLogs, logAudit, formatDate, fetchResearchApplications, fetchContributions, fileUrl,
} from '@/lib/data';
import pb from '@/lib/pocketbaseClient';
import { Eyebrow } from '@/components/bits';

const inputCls =
    'h-11 w-full rounded-sm border border-border bg-white px-3 text-[15px] text-navy outline-none focus:border-iayo-blue';
const labelCls = 'text-[12px] font-bold uppercase tracking-[0.1em] text-navy';

const FINDING_NATURE = ['allegation', 'verified', 'documented_fact', 'iayo_analysis'];
const FINDING_STATUS = ['under_research', 'evidence_collected', 'rti_filed', 'rti_reply_received', 'published', 'referred', 'resolved', 'closed'];
const RTI_STATUS = ['filed', 'awaiting_reply', 'reply_received', 'published', 'appeal_filed', 'resolved'];

const COLLECTIONS = {
    research: {
        name: 'research', label: 'Research', singular: 'Research', authorField: 'author', canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'category', type: 'select', options: ['Research', 'Accountability', 'Transparency', 'Policy'], label: 'Category' },
            { name: 'summary', type: 'textarea', required: true, label: 'Summary' },
            { name: 'body', type: 'html', label: 'Body (HTML)' },
            { name: 'status', type: 'select', options: ['draft', 'published'], label: 'Status' },
            { name: 'featured', type: 'bool', label: 'Feature on homepage' },
        ],
        columns: ['title', 'category', 'status', 'created'],
        searchFields: ['title', 'summary', 'category'],
        statusField: 'status', publishedValue: 'published', unpublishedValue: 'draft',
    },
    investigations: {
        name: 'investigations', label: 'Investigations', singular: 'Investigation', authorField: 'author', canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'category', type: 'select', options: ['Investigation', 'Accountability', 'Transparency'], label: 'Category' },
            { name: 'summary', type: 'textarea', required: true, label: 'Summary' },
            { name: 'body', type: 'html', label: 'Body (HTML)' },
            { name: 'video_url', type: 'url', label: 'Video URL (embed)' },
            { name: 'images', type: 'file', label: 'Images' },
            { name: 'documents', type: 'file', label: 'Documents (PDF/Doc)' },
            { name: 'evidence', type: 'file', label: 'Evidence (any)' },
            { name: 'reports', type: 'file', label: 'Reports (PDF)' },
            { name: 'status', type: 'select', options: ['draft', 'published'], label: 'Status' },
        ],
        columns: ['title', 'category', 'status', 'created'],
        searchFields: ['title', 'summary', 'category'],
        statusField: 'status', publishedValue: 'published', unpublishedValue: 'draft',
    },
    findings: {
        name: 'findings', label: 'Findings', singular: 'Finding', authorField: 'author', canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'category', type: 'text', required: true, label: 'Category' },
            { name: 'department', type: 'text', label: 'Department' },
            { name: 'location', type: 'text', label: 'Location' },
            { name: 'finding_date', type: 'date', label: 'Finding date' },
            { name: 'corruption_amount', type: 'number', label: 'Verified/assessed corruption amount (₹)' },
            { name: 'summary', type: 'textarea', required: true, label: 'Summary' },
            { name: 'body', type: 'html', label: 'Body (HTML)' },
            { name: 'nature', type: 'select', options: FINDING_NATURE, label: 'Nature' },
            { name: 'status', type: 'select', options: FINDING_STATUS, label: 'Status' },
            { name: 'sources', type: 'textarea', label: 'Sources' },
            { name: 'right_of_reply', type: 'html', label: 'Right of Reply (HTML)' },
            { name: 'evidence', type: 'file', label: 'Evidence (PDF/Image)' },
            { name: 'photos', type: 'file', label: 'Photos' },
        ],
        columns: ['title', 'category', 'nature', 'status', 'created'],
        searchFields: ['title', 'summary', 'category', 'department', 'location'],
        statusField: 'status', publishedValue: 'published', unpublishedValue: 'under_research',
    },
    rti_cases: {
        name: 'rti_cases', label: 'RTI Cases', singular: 'RTI Case', authorField: 'author', canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'rti_id', type: 'text', required: true, label: 'RTI ID' },
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'department', type: 'text', required: true, label: 'Department' },
            { name: 'public_authority', type: 'text', label: 'Public authority' },
            { name: 'state', type: 'text', label: 'State' },
            { name: 'district', type: 'text', label: 'District' },
            { name: 'date_filed', type: 'date', label: 'Date filed' },
            { name: 'reply_date', type: 'date', label: 'Reply date' },
            { name: 'summary', type: 'textarea', required: true, label: 'Summary' },
            { name: 'key_findings', type: 'textarea', label: 'Key findings' },
            { name: 'appeal_info', type: 'textarea', label: 'Appeal info' },
            { name: 'status', type: 'select', options: RTI_STATUS, label: 'Status' },
            { name: 'application_pdf', type: 'file', label: 'Application PDF' },
            { name: 'reply_pdf', type: 'file', label: 'Reply PDF' },
            { name: 'appeal_pdf', type: 'file', label: 'Appeal PDF' },
        ],
        columns: ['rti_id', 'title', 'department', 'status', 'created'],
        searchFields: ['rti_id', 'title', 'department', 'state', 'district'],
        statusField: 'status', publishedValue: 'published', unpublishedValue: 'filed',
    },
    comments: {
        name: 'comments', label: 'Voices', singular: 'Voice', authorField: null, canCreate: false, presidentCanEdit: true,
        fields: [
            { name: 'name', type: 'text', required: true, label: 'Name' },
            { name: 'town', type: 'text', label: 'Town' },
            { name: 'district', type: 'text', label: 'District' },
            { name: 'state', type: 'text', label: 'State' },
            { name: 'message', type: 'textarea', required: true, label: 'Message' },
            { name: 'consent', type: 'bool', label: 'Consent given' },
            { name: 'status', type: 'select', options: ['pending', 'approved', 'rejected'], label: 'Status' },
        ],
        columns: ['name', 'town', 'district', 'status', 'created'],
        searchFields: ['name', 'message', 'town', 'district', 'state'],
        statusField: 'status', publishedValue: 'approved', unpublishedValue: 'pending',
    },
    members: {
        name: 'members', label: 'Members', singular: 'Member', authorField: null, canCreate: false, presidentCanEdit: true,
        fields: [
            { name: 'full_name', type: 'text', required: true, label: 'Full name' },
            { name: 'phone', type: 'text', required: true, label: 'Phone' },
            { name: 'email', type: 'text', label: 'Email' },
            { name: 'state', type: 'text', required: true, label: 'State' },
            { name: 'district', type: 'text', required: true, label: 'District' },
            { name: 'town', type: 'text', required: true, label: 'Town' },
            { name: 'age_group', type: 'select', options: ['18-25', '26-35', '36-45', '46-60', '60+'], label: 'Age group' },
            { name: 'occupation', type: 'text', label: 'Occupation' },
            { name: 'membership_code', type: 'text', required: true, label: 'Membership code' },
            { name: 'status', type: 'select', options: ['active', 'inactive'], label: 'Status' },
            { name: 'consent', type: 'bool', label: 'Consent' },
        ],
        columns: ['full_name', 'town', 'district', 'state', 'status', 'created'],
        searchFields: ['full_name', 'phone', 'email', 'town', 'district', 'state', 'membership_code'],
        statusField: 'status', publishedValue: 'active', unpublishedValue: 'inactive',
    },
    notifications: {
        name: 'notifications', label: 'News & Announcements', singular: 'Notification', authorField: null, canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'body', type: 'textarea', required: true, label: 'Body' },
            { name: 'type', type: 'select', options: ['update', 'alert', 'investigation', 'research', 'event'], label: 'Type' },
            { name: 'status', type: 'select', options: ['pending_president', 'published', 'rejected'], label: 'Status' },
            { name: 'link', type: 'text', label: 'Link (optional)' },
        ],
        columns: ['title', 'type', 'status', 'created'],
        searchFields: ['title', 'body', 'type'],
        statusField: 'status', publishedValue: 'published', unpublishedValue: 'pending_president',
    },
    site_stats: {
        name: 'site_stats', label: 'Homepage Statistics', singular: 'Statistic', authorField: null, canCreate: true, presidentCanEdit: true,
        fields: [
            { name: 'key', type: 'text', required: true, label: 'Key' },
            { name: 'label', type: 'text', required: true, label: 'Label' },
            { name: 'value', type: 'text', required: true, label: 'Value' },
            { name: 'sort', type: 'number', label: 'Sort order' },
        ],
        columns: ['label', 'value', 'key', 'sort'],
        searchFields: ['label', 'key', 'value'],
        statusField: null,
    },
};

const TABS = [
    { k: 'overview', label: 'Overview', icon: LayoutDashboard },
    { k: 'research', label: 'Research', icon: FileText },
    { k: 'investigations', label: 'Investigations', icon: Video },
    { k: 'findings', label: 'Findings', icon: Scale },
    { k: 'rti_cases', label: 'RTI Cases', icon: ScrollText },
    { k: 'comments', label: 'Voices', icon: MessageSquare },
    { k: 'members', label: 'Members', icon: Users },
    { k: 'notifications', label: 'News & Events', icon: Bell },
    { k: 'site_stats', label: 'Statistics', icon: BarChart3 },
    { k: 'users', label: 'Office Bearers', icon: UserCog },
    { k: 'research_applications', label: 'Research Applications', icon: FlaskConical },
    { k: 'contributions', label: 'Public Contributions', icon: FileUp },
    { k: 'audit', label: 'Audit Log', icon: History },
];

function FieldInput({ field, value, onChange, onFiles }) {
    const base = `${inputCls} mt-2`;
    switch (field.type) {
        case 'textarea':
            return (
                <textarea
                    className={`${base} h-auto min-h-[80px] py-2.5`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={field.required}
                />
            );
        case 'html':
            return (
                <textarea
                    className={`${base} h-auto min-h-[150px] py-2.5 font-mono text-[13px]`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="<h2>…</h2><p>…</p>"
                />
            );
        case 'select':
            return (
                <select className={base} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required}>
                    {!field.required && <option value="">—</option>}
                    {field.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            );
        case 'bool':
            return (
                <label className="mt-2 flex items-center gap-2.5">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                    <span className="text-sm font-semibold text-navy">{field.label}</span>
                </label>
            );
        case 'date':
            return <input type="date" className={base} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />;
        case 'url':
            return <input type="url" className={base} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://" />;
        case 'number':
            return <input type="number" className={base} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} required={field.required} />;
        case 'file':
            return (
                <input
                    type="file"
                    multiple
                    onChange={(e) => onFiles(field.name, Array.from(e.target.files))}
                    className="mt-2 block w-full text-[12px] text-muted-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-iayo-muted file:px-3 file:py-2 file:text-[12px] file:font-bold file:uppercase file:tracking-[0.08em] file:text-navy"
                />
            );
        default:
            return <input className={base} value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    }
}

function RecordForm({ config, record, user, onClose, onSaved }) {
    const [values, setValues] = useState(() => {
        const v = {};
        config.fields.forEach((f) => {
            if (f.type === 'file') return;
            v[f.name] = record?.[f.name] ?? (f.type === 'bool' ? false : '');
        });
        return v;
    });
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (name, val) => setValues((p) => ({ ...p, [name]: val }));
    const setFile = (name, arr) => setFiles((p) => ({ ...p, [name]: arr }));

    const titleFor = (payload) =>
        payload.title || payload.full_name || payload.name || payload.label || payload.rti_id || '';

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = { ...values };
            if (config.authorField && !record?.id) payload[config.authorField] = user.id;
            const hasNewFiles = Object.values(files).some((arr) => arr && arr.length);
            let saved;
            if (hasNewFiles) {
                const form = new FormData();
                Object.entries(payload).forEach(([k, val]) => form.append(k, val ?? ''));
                Object.entries(files).forEach(([k, arr]) => arr.forEach((f) => form.append(k, f)));
                saved = record?.id
                    ? await pb.collection(config.name).update(record.id, form)
                    : await pb.collection(config.name).create(form);
            } else {
                saved = record?.id
                    ? await pb.collection(config.name).update(record.id, payload)
                    : await pb.collection(config.name).create(payload);
            }
            try {
                await logAudit({
                    action: record?.id ? 'update' : 'create',
                    collection_name: config.name,
                    record_id: record?.id || saved?.id || '',
                    record_title: titleFor(payload),
                    actor: user.id,
                    actor_name: user?.get?.('name') || user?.email || '',
                    actor_role: `Updated ${config.singular}${titleFor(payload) ? ' — ' + titleFor(payload) : ''}`,
                });
            } catch (_) { /* audit hook also logs server-side */ }
            onSaved();
        } catch (err) {
            setError(err?.message || 'Could not save. Check permissions and required fields.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy/50 p-4 py-10">
            <div className="w-full max-w-2xl border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="font-display text-lg font-extrabold tracking-tight text-navy">
                        {record?.id ? `Edit ${config.singular}` : `New ${config.singular}`}
                    </h3>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-navy">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={save} className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-6">
                    {error && (
                        <p className="rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-3 py-2 text-sm font-semibold text-iayo-orange">
                            {error}
                        </p>
                    )}
                    {config.fields.map((f) => (
                        <label key={f.name} className="block">
                            {f.type !== 'bool' && <span className={labelCls}>{f.label}</span>}
                            <FieldInput
                                field={f}
                                value={values[f.name]}
                                onChange={(v) => set(f.name, v)}
                                onFiles={setFile}
                            />
                        </label>
                    ))}
                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <button type="button" onClick={onClose} className="rounded-sm px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-navy">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-5 py-2.5 text-[13px font-bold uppercase tracking-[0.08em] text-white hover:brightness-95">
                            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RowActions({ item, config, onToggle, onReject, onEdit, onDelete }) {
    const isPending = config.statusField && item[config.statusField] === 'pending_president';

    if (isPending) {
        return (
            <div className="flex items-center justify-end gap-1.5">
                <button type="button" onClick={() => onReject(item)} title="Reject" className="flex h-8 items-center gap-1.5 rounded-sm border border-iayo-orange/30 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-iayo-orange hover:bg-iayo-orange/10">
                    <X className="h-3.5 w-3.5" /> Reject
                </button>
                <button type="button" onClick={() => onToggle(item)} title="Publish" className="flex h-8 items-center gap-1.5 rounded-sm bg-iayo-blue px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95">
                    <Eye className="h-3.5 w-3.5" /> Publish
                </button>
            </div>
        );
    }

    if (!config.presidentCanEdit) {
        return <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Read only</span>;
    }

    return (
        <div className="flex items-center justify-end gap-1">
            <button type="button" onClick={() => onEdit(item)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-iayo-muted hover:text-navy"><Pencil className="h-4 w-4" /></button>
            <button type="button" onClick={() => onDelete(item)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-iayo-orange/10 hover:text-iayo-orange"><Trash2 className="h-4 w-4" /></button>
        </div>
    );
}

function StatusBadge({ value }) {
    const tone = value === 'published' || value === 'approved' || value === 'active'
        ? 'bg-iayo-blue/10 text-iayo-blue'
        : value === 'draft' || value === 'pending' || value === 'inactive' || value === 'under_research' || value === 'filed' || value === 'awaiting_reply'
        ? 'bg-iayo-muted text-muted-foreground'
        : 'bg-iayo-orange/10 text-iayo-orange';
    return (
        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${tone}`}>
            {value}
        </span>
    );
}

function RecordManager({ config, items, loading, user, onChanged }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const statusOptions = useMemo(() => {
        const f = config.fields.find((x) => x.name === config.statusField);
        return f?.options || [];
    }, [config]);

    const filtered = (items || []).filter((item) => {
        if (search) {
            const q = search.toLowerCase();
            const ok = config.searchFields.some((sf) => String(item[sf] || '').toLowerCase().includes(q));
            if (!ok) return false;
        }
        if (statusFilter !== 'all' && config.statusField) {
            if ((item[config.statusField] || '') !== statusFilter) return false;
        }
        return true;
    });

    const togglePublish = async (item) => {
        try {
            await pb.collection(config.name).update(item.id, { [config.statusField]: config.publishedValue });
            try {
                await logAudit({
                    action: 'update', collection_name: config.name, record_id: item.id,
                    record_title: item.title || item.full_name || item.name || item.label || item.rti_id || '',
                    actor: user.id, actor_name: user?.get?.('name') || user?.email || '',
                    actor_role: user?.get?.('role') || '',
                    summary: `Published ${config.singular}`,
                });
            } catch (_) {}
            onChanged();
        } catch (err) {
            window.alert(err?.message || 'Could not publish.');
        }
    };

    const reject = async (item) => {
        try {
            await pb.collection(config.name).update(item.id, { [config.statusField]: 'rejected' });
            try {
                await logAudit({
                    action: 'update', collection_name: config.name, record_id: item.id,
                    record_title: item.title || item.full_name || item.name || item.label || item.rti_id || '',
                    actor: user.id, actor_name: user?.get?.('name') || user?.email || '',
                    actor_role: user?.get?.('role') || '',
                    summary: `Rejected ${config.singular}`,
                });
            } catch (_) {}
            onChanged();
        } catch (err) {
            window.alert(err?.message || 'Could not reject.');
        }
    };


    const remove = async (item) => {
        if (!window.confirm(`Delete "${item.title || item.full_name || item.name || item.label || item.rti_id || item.id}"? This cannot be undone.`)) return;
        try {
            await pb.collection(config.name).delete(item.id);
            onChanged();
        } catch (err) {
            window.alert(err?.message || 'Could not delete.');
        }
    };

    const openEdit = (item) => {
        setEditing(item);
        setShowForm(true);
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        className={`${inputCls} pl-9`}
                        placeholder={`Search ${config.label.toLowerCase()}…`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {config.statusField && (
                    <select
                        className={`${inputCls} min-w-[150px] w-auto`}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                )}
                {config.canCreate && (
                    <button
                        type="button" onClick={openNew}
                        className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95"
                    >
                        <Plus className="h-4 w-4" /> New {config.singular}
                    </button>
                )}
            </div>

            <div className="overflow-x-auto border border-border bg-white">
                {loading ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                ) : filtered.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No {config.label.toLowerCase()} found.
                    </p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-iayo-muted text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            <tr>
                                {config.columns.map((c) => (
                                    <th key={c} className="whitespace-nowrap px-5 py-3">{c}</th>
                                ))}
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-iayo-muted/50">
                                    {config.columns.map((c, i) => (
                                        <td key={c} className={`px-5 py-4 ${i === 0 ? 'font-semibold text-navy' : 'text-muted-foreground'}`}>
                                            {c === config.statusField ? (
                                                <StatusBadge value={item[c]} />
                                            ) : c === 'created' ? (
                                                formatDate(item[c])
                                            ) : c === 'sort' ? (
                                                item[c] ?? '—'
                                            ) : (
                                                <span className="line-clamp-1 max-w-[260px]">{item[c] || '—'}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-5 py-4">
                                        <RowActions
                                            item={item}
                                            config={config}
                                            onToggle={togglePublish}
                                            onReject={reject}
                                            onEdit={openEdit}
                                            onDelete={remove}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && (
                <RecordForm
                    config={config}
                    record={editing}
                    user={user}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); onChanged(); }}
                />
            )}
        </div>
    );
}

function UserForm({ record, onClose, onSaved }) {
    const { user } = useAuth();
    const [name, setName] = useState(record?.name || '');
    const [email, setEmail] = useState(record?.email || '');
    const [role, setRole] = useState(record?.role || 'citizen');
    const [presidentId, setPresidentId] = useState(record?.president_id || '');
    const [district, setDistrict] = useState(record?.district || '');
    const [state, setState] = useState(record?.state || '');
    const [phone, setPhone] = useState(record?.phone || '');
    const [bio, setBio] = useState(record?.bio || '');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (record?.id) {
                const data = { name, role, president_id: presidentId, district, state, phone, bio };
                if (password) { data.password = password; data.passwordConfirm = password; }
                await pb.collection('users').update(record.id, data);
            } else {
                await pb.collection('users').create({
                    name, email, password, passwordConfirm: password,
                    role, president_id: presidentId, district, state, phone, bio, verified: true,
                });
            }
            try {
                await logAudit({
                    action: record?.id ? 'update' : 'create', collection_name: 'users',
                    record_id: record?.id || '', record_title: name || email,
                    actor: user.id, actor_name: user?.get?.('name') || user?.email || '',
                    actor_role: user?.get?.('role') || '',
                    summary: `${record?.id ? 'Updated' : 'Created'} office bearer — ${name || email} (${role})`,
                });
            } catch (_) {}
            onSaved();
        } catch (err) {
            setError(err?.message || 'Could not save user. Email must be unique; password ≥ 10 chars.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy/50 p-4 py-10">
            <div className="w-full max-w-lg border border-border bg-white">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="font-display text-lg font-extrabold tracking-tight text-navy">
                        {record?.id ? 'Edit Office Bearer' : 'New Office Bearer'}
                    </h3>
                    <button type="button" onClick={onClose} className="text-muted-foreground hover:text-navy">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={save} className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-6">
                    {error && (
                        <p className="rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-3 py-2 text-sm font-semibold text-iayo-orange">
                            {error}
                        </p>
                    )}
                    <label className="block">
                        <span className={labelCls}>Full Name</span>
                        <input className={`${inputCls} mt-2`} value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <label className="block">
                        <span className={labelCls}>Email {record?.id ? '(not editable)' : ''}</span>
                        <input type="email" className={`${inputCls} mt-2`} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!record?.id} />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className={labelCls}>Role</span>
                            <select className={`${inputCls} mt-2`} value={role} onChange={(e) => setRole(e.target.value)}>
                                {['citizen', 'president', 'admin'].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className={labelCls}>President ID</span>
                            <input className={`${inputCls} mt-2`} value={presidentId} onChange={(e) => setPresidentId(e.target.value)} placeholder="IAYO-PRES-002" />
                        </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className={labelCls}>District</span>
                            <input className={`${inputCls} mt-2`} value={district} onChange={(e) => setDistrict(e.target.value)} />
                        </label>
                        <label className="block">
                            <span className={labelCls}>State</span>
                            <input className={`${inputCls} mt-2`} value={state} onChange={(e) => setState(e.target.value)} />
                        </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className={labelCls}>Phone</span>
                            <input className={`${inputCls} mt-2`} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </label>
                        <label className="block">
                            <span className={labelCls}>{record?.id ? 'New password (optional)' : 'Password'}</span>
                            <input type="password" className={`${inputCls} mt-2`} value={password} onChange={(e) => setPassword(e.target.value)} required={!record?.id} minLength={10} placeholder="≥ 10 characters" />
                        </label>
                    </div>
                    <label className="block">
                        <span className={labelCls}>Bio</span>
                        <textarea className={`${inputCls} mt-2 h-auto min-h-[70px] py-2.5`} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </label>
                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <button type="button" onClick={onClose} className="rounded-sm px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-navy">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95">
                            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UsersManager({ users, loading, user, onChanged }) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const filtered = (users || []).filter((u) => {
        if (search) {
            const q = search.toLowerCase();
            if (!`${u.name || ''} ${u.email || ''} ${u.president_id || ''}`.toLowerCase().includes(q)) return false;
        }
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        return true;
    });

    const remove = async (u) => {
        if (u.id === user?.id) return window.alert("You can't delete your own account.");
        if (!window.confirm(`Remove ${u.email}? This cannot be undone.`)) return;
        try {
            await pb.collection('users').delete(u.id);
            try {
                await logAudit({
                    action: 'delete', collection_name: 'users', record_id: u.id, record_title: u.name || u.email,
                    actor: user.id, actor_name: user?.get?.('name') || user?.email || '',
                    actor_role: user?.get?.('role') || '',
                    summary: `Deleted office bearer — ${u.name || u.email}`,
                });
            } catch (_) {}
            onChanged();
        } catch (err) {
            window.alert(err?.message || 'Could not delete user.');
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className={`${inputCls} pl-9`} placeholder="Search by name, email, President ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className={`${inputCls} min-w-[140px] w-auto`} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All roles</option>
                    {['citizen', 'president', 'admin'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <Link
                    to="/president-admins"
                    className="inline-flex items-center gap-2 rounded-sm bg-iayo-blue px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:brightness-95"
                >
                    <UserCog className="h-4 w-4" /> Manage Admins
                </Link>
            </div>

            <div className="overflow-x-auto border border-border bg-white">
                {loading ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                ) : filtered.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">No users found.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-iayo-muted text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3">Name</th>
                                <th className="hidden px-5 py-3 sm:table-cell">Email</th>
                                <th className="hidden px-5 py-3 md:table-cell">President ID</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-iayo-muted/50">
                                    <td className="px-5 py-4 font-semibold text-navy">{u.name || '—'}</td>
                                    <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">{u.email}</td>
                                    <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">{u.president_id || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${
                                            u.role === 'admin' ? 'bg-iayo-orange/10 text-iayo-orange' : u.role === 'president' ? 'bg-iayo-blue/10 text-iayo-blue' : 'bg-iayo-muted text-muted-foreground'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Read only</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && (
                <UserForm record={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onChanged(); }} />
            )}
        </div>
    );
}

function AuditPanel() {
    const [logs, setLogs] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAuditLogs({ perPage: 100 })
            .then((r) => setLogs(r.items || []))
            .catch(() => setLogs([]));
    }, []);

    const filtered = (logs || []).filter((l) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return `${l.action || ''} ${l.collection_name || ''} ${l.record_title || ''} ${l.actor_name || ''} ${l.summary || ''}`.toLowerCase().includes(q);
    });

    const actionTone = (a) =>
        a === 'delete' ? 'bg-iayo-orange/10 text-iayo-orange'
        : a === 'create' ? 'bg-iayo-blue/10 text-iayo-blue'
        : 'bg-iayo-muted text-muted-foreground';

    return (
        <div>
            <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className={`${inputCls} pl-9`} placeholder="Search audit log…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
            <div className="overflow-x-auto border border-border bg-white">
                {logs === null ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">Loading…</p>
                ) : filtered.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">No audit entries yet. Actions performed from this panel appear here.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-iayo-muted text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3">When</th>
                                <th className="px-5 py-3">Action</th>
                                <th className="px-5 py-3">Collection</th>
                                <th className="px-5 py-3">Record</th>
                                <th className="hidden px-5 py-3 md:table-cell">Actor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((l) => (
                                <tr key={l.id} className="hover:bg-iayo-muted/50">
                                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDate(l.created)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] ${actionTone(l.action)}`}>{l.action}</span>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-navy">{l.collection_name}</td>
                                    <td className="px-5 py-4 text-muted-foreground"><span className="line-clamp-1 max-w-[260px]">{l.record_title || l.record_id || '—'}</span></td>
                                    <td className="hidden px-5 py-4 text-muted-foreground md:table-cell">
                                        <span className="font-semibold text-navy">{l.actor_name || '—'}</span>
                                        <span className="ml-1.5 text-[11px] uppercase tracking-[0.1em]">({l.actor_role})</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
                Audit entries are written server-side by PocketBase hooks on every authorised create, update and delete — they cannot be forged from the browser.
            </p>
        </div>
    );
}

function ResearchApplicationsPanel({ items, loading, user, onChanged }) {
    const [selected, setSelected] = useState(null);
    const [busy, setBusy] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const pending = (items || []).filter((item) => item.status === 'pending');

    const decide = async (record, status) => {
        setBusy(record.id);
        setError('');
        try {
            await pb.collection('research_applications').update(record.id, {
                status,
                president_note: note.trim(),
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id,
            });
            setSelected(null);
            setNote('');
            await onChanged();
        } catch (err) {
            setError(err?.message || 'Could not save the application decision.');
        } finally {
            setBusy('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Eyebrow>Research &amp; Contribute</Eyebrow>
                    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy">Contributor applications</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Review people who have volunteered to contribute to IAYO research. An application does not grant contributor access until the President decides.</p>
                </div>
                <div className="border border-iayo-blue/20 bg-iayo-blue/5 px-4 py-3 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pending</p>
                    <p className="mt-1 font-display text-2xl font-extrabold text-navy">{pending.length}</p>
                </div>
            </div>
            {error && <p className="rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}
            {loading ? (
                <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">Loading applications…</div>
            ) : !items?.length ? (
                <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">No research contributor applications have been received.</div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <article key={item.id} className="border border-border bg-white p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-sm bg-iayo-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Research applicant</span>
                                        <span className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                                    </div>
                                    <h3 className="mt-3 font-display text-xl font-extrabold text-navy">{item.name}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.field_of_interest} · {item.area} · {item.education_qualification}</p>
                                    <p className="mt-1 text-[12px] text-muted-foreground">{item.email} · {item.phone} · {formatDate(item.created)}</p>
                                </div>
                                <button type="button" onClick={() => { setSelected(item); setNote(item.president_note || ''); }} className="rounded-sm border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-iayo-muted">Review</button>
                            </div>
                            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.motivation}</p>
                        </article>
                    ))}
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/60 p-4 py-10">
                    <div className="w-full max-w-3xl border border-border bg-white">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <div><Eyebrow>Research applicant</Eyebrow><h2 className="mt-1 font-display text-xl font-extrabold text-navy">{selected.name}</h2></div>
                            <button type="button" onClick={() => setSelected(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
                        </div>
                        <div className="space-y-5 px-6 py-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {[
                                    ['Name', selected.name], ['Phone', selected.phone], ['Email', selected.email],
                                    ['Research field', selected.field_of_interest], ['Area', selected.area], ['Education', selected.education_qualification],
                                ].map(([label, value]) => <div key={label}><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-navy">{value}</p></div>)}
                            </div>
                            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Motivation</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy">{selected.motivation}</p></div>
                            <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><strong>Oath:</strong> Applicant confirmed the IAYO research contributor oath.</div>
                            <label className="block"><span className={labelCls}>President's review note</span><textarea className={`${inputCls} h-28 py-3`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note about your decision" /></label>
                            {selected.status === 'pending' ? (
                                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
                                    <button type="button" disabled={busy === selected.id} onClick={() => decide(selected, 'rejected')} className="rounded-sm border border-iayo-orange/30 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-orange disabled:opacity-50">Reject</button>
                                    <button type="button" disabled={busy === selected.id} onClick={() => decide(selected, 'approved')} className="rounded-sm bg-iayo-blue px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-50">Approve Contributor</button>
                                </div>
                            ) : <p className="border-t border-border pt-5 text-sm text-muted-foreground">This application has already been {selected.status}.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function ContributionsPanel({ items, loading, onChanged }) {
    const [selected, setSelected] = useState(null);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const pending = (items || []).filter((item) => item.status === 'pending');

    const decide = async (record, status) => {
        setBusy(record.id);
        setError('');
        try {
            await pb.collection('contributions').update(record.id, {
                status,
                president_note: note.trim(),
                reviewed_at: new Date().toISOString(),
            });
            setSelected(null);
            setNote('');
            await onChanged();
        } catch (err) {
            setError(err?.message || 'Could not save the contribution decision.');
        } finally {
            setBusy('');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Eyebrow>Public Contributions</Eyebrow>
                    <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy">Research, evidence &amp; media submissions</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">People can send PDFs and videos through Research &amp; Contribute. Submissions are private and nothing is published automatically.</p>
                </div>
                <div className="border border-iayo-blue/20 bg-iayo-blue/5 px-4 py-3 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pending</p><p className="mt-1 font-display text-2xl font-extrabold text-navy">{pending.length}</p></div>
            </div>
            {error && <p className="rounded-sm border border-iayo-orange/40 bg-iayo-orange/10 px-4 py-3 text-sm font-semibold text-iayo-orange">{error}</p>}
            {loading ? <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">Loading contributions…</div> : !items?.length ? <div className="border border-border bg-white px-6 py-10 text-center text-sm text-muted-foreground">No public contributions have been received.</div> : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <article key={item.id} className="border border-border bg-white p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-sm bg-iayo-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Public contribution</span><StatusBadge value={item.status} /></div>
                                    <h3 className="mt-3 font-display text-xl font-extrabold text-navy">{item.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.contribution_type} · {item.area} · {formatDate(item.created)}</p>
                                    <p className="mt-1 text-[12px] text-muted-foreground">{item.name} · {item.email} · {item.phone}</p>
                                </div>
                                <button type="button" onClick={() => { setSelected(item); setNote(item.president_note || ''); }} className="rounded-sm border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-navy hover:bg-iayo-muted">Review</button>
                            </div>
                            <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-navy/80">{item.description}</p>
                            {item.source_note && <p className="mt-3 text-[12px] text-muted-foreground"><strong>Context:</strong> {item.source_note}</p>}
                            {Array.isArray(item.files) && item.files.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{item.files.map((name) => <a key={name} href={fileUrl(item, name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11px] font-bold text-iayo-blue hover:bg-iayo-muted"><ExternalLink className="h-3.5 w-3.5" /> {name}</a>)}</div>}
                        </article>
                    ))}
                </div>
            )}
            {selected && (
                <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/50 p-4 py-10">
                    <div className="w-full max-w-3xl border border-border bg-white">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4"><h3 className="font-display text-lg font-extrabold text-navy">Review contribution</h3><button type="button" onClick={() => setSelected(null)}><X className="h-5 w-5 text-muted-foreground" /></button></div>
                        <div className="space-y-5 px-6 py-6">
                            <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Contributor</p><p className="mt-1 font-semibold text-navy">{selected.name} · {selected.email} · {selected.phone}</p></div>
                            <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Submission</p><h4 className="mt-1 font-display text-2xl font-extrabold text-navy">{selected.title}</h4><p className="mt-2 text-sm text-muted-foreground">{selected.contribution_type} · {selected.area}</p></div>
                            <div className="border border-border bg-iayo-bg p-4 text-sm leading-relaxed text-navy"><strong>Description:</strong><br />{selected.description}</div>
                            {selected.source_note && <div className="text-sm leading-relaxed text-muted-foreground"><strong>Source/context:</strong> {selected.source_note}</div>}
                            {Array.isArray(selected.files) && selected.files.length > 0 && <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Files</p><div className="mt-2 flex flex-wrap gap-2">{selected.files.map((name) => <a key={name} href={fileUrl(selected, name)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-sm bg-iayo-blue px-3 py-2 text-[11px] font-bold text-white"><ExternalLink className="h-3.5 w-3.5" /> Open {name}</a>)}</div></div>}
                            {selected.status === 'pending' && <><label className="block"><span className={labelCls}>President note (optional)</span><textarea className={`${inputCls} mt-2 h-28 py-3`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason, verification note or instructions" /></label><div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5"><button type="button" disabled={busy === selected.id} onClick={() => decide(selected, 'rejected')} className="rounded-sm border border-iayo-orange/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-iayo-orange">Reject</button><button type="button" disabled={busy === selected.id} onClick={() => decide(selected, 'approved')} className="rounded-sm bg-iayo-blue px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">{busy === selected.id ? 'Saving…' : 'Accept Contribution'}</button></div></>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Overview({ counts, audit }) {
    const cards = [
        { label: 'Research', value: counts.research },
        { label: 'Investigations', value: counts.investigations },
        { label: 'Findings', value: counts.findings },
        { label: 'RTI Cases', value: counts.rti_cases },
        { label: 'Voices', value: counts.comments },
        { label: 'Members', value: counts.members },
        { label: 'Notifications', value: counts.notifications },
        { label: 'Statistics', value: counts.site_stats },
        { label: 'Office Bearers', value: counts.users },
        { label: 'Pending Reviews', value: counts.review_notifications },
        { label: 'Research Applications', value: counts.research_applications },
        { label: 'Public Contributions', value: counts.contributions },
    ];
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {cards.map((c) => (
                    <div key={c.label} className="border border-border bg-white p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.label}</p>
                        <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">{c.value === null ? '…' : c.value}</p>
                    </div>
                ))}
            </div>
            <div>
                <Eyebrow>Recent Activity</Eyebrow>
                <div className="mt-3 divide-y divide-border border border-border bg-white">
                    {(audit || []).length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
                    ) : (audit || []).slice(0, 8).map((l) => (
                        <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                            <span className="font-semibold text-navy">{l.actor_name || 'System'} <span className="font-normal text-muted-foreground">{l.summary}</span></span>
                            <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDate(l.created)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PresidentDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('overview');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        const jobs = {
            research: fetchAllResearchForStaff().catch(() => []),
            investigations: fetchAllInvestigationsForStaff().catch(() => []),
            findings: fetchAllFindingsForStaff().catch(() => []),
            rti_cases: fetchAllRtiForStaff().catch(() => []),
            comments: fetchAllCommentsForStaff().catch(() => []),
            members: fetchAllMembers().catch(() => []),
            notifications: fetchNotifications().catch(() => []),
            site_stats: fetchStats().catch(() => []),
            users: fetchUsers().catch(() => []),
            review_notifications: pb.collection('review_notifications').getFullList({ sort: '-created', filter: "status = 'pending'" }).catch(() => []),
            research_applications: fetchResearchApplications().catch(() => []),
            contributions: fetchContributions().catch(() => []),
            audit: fetchAuditLogs({ perPage: 8 }).then((r) => r.items || []).catch(() => []),
        };
        Promise.all(Object.values(jobs)).then((results) => {
            const keys = Object.keys(jobs);
            const next = {};
            keys.forEach((k, i) => (next[k] = results[i]));
            setData(next);
            setLoading(false);
        });
    };

    useEffect(load, []);

    const counts = {
        research: data.research?.length ?? null,
        investigations: data.investigations?.length ?? null,
        findings: data.findings?.length ?? null,
        rti_cases: data.rti_cases?.length ?? null,
        comments: data.comments?.length ?? null,
        members: data.members?.length ?? null,
        notifications: data.notifications?.length ?? null,
        site_stats: data.site_stats?.length ?? null,
        users: data.users?.length ?? null,
        review_notifications: data.review_notifications?.length ?? 0,
        research_applications: data.research_applications?.filter((a) => a.status === 'pending').length ?? 0,
        contributions: data.contributions?.filter((c) => c.status === 'pending').length ?? 0,
    };

    return (
        <div className="min-h-screen bg-iayo-bg">
            <Helmet>
                <title>President Control Panel — IAYO</title>
                <meta name="description" content="Super-admin control panel: full CRUD over all IAYO website data, content, members and office bearers." />
            </Helmet>
            <header className="border-b border-border bg-white">
                <div className="edge flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-iayo-blue font-display text-sm font-extrabold text-white">I</span>
                        <span className="font-display text-[15px] font-extrabold tracking-tight text-navy">
                            President Control Panel
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/president-review" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-iayo-blue hover:text-navy">Review uploads{data.review_notifications?.length ? <span className="rounded-full bg-iayo-orange px-1.5 py-0.5 text-[10px] text-white">{data.review_notifications.length}</span> : null}</Link>
                        <button type="button" onClick={() => setTab('research_applications')} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-iayo-blue hover:text-navy">Research applications{counts.research_applications ? <span className="rounded-full bg-iayo-orange px-1.5 py-0.5 text-[10px] text-white">{counts.research_applications}</span> : null}</button>
                        <Link to="/president-admins" className="text-[13px] font-bold text-navy hover:text-iayo-blue">Manage Admins</Link>
                        <Link to="/" className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-iayo-blue">
                            <ArrowLeft className="h-4 w-4" /> Site
                        </Link>
                    </div>
                </div>
            </header>

            <div className="edge py-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Eyebrow>President Control Panel</Eyebrow>
                        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy">
                            Welcome, {user?.get?.('name') || 'President'}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Signed in as <span className="font-semibold text-navy">{user?.email}</span> · President ·
                            <span className="ml-1 inline-flex items-center gap-1 text-iayo-blue"><ShieldCheck className="h-3.5 w-3.5" /> Server-side authorised</span>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
                    {TABS.map((t) => (
                        <button
                            key={t.k}
                            type="button"
                            onClick={() => { setTab(t.k); if (t.k !== 'overview' && t.k !== 'audit') load(); }}
                            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors ${
                                tab === t.k ? 'border-iayo-blue text-iayo-blue' : 'border-transparent text-muted-foreground hover:text-navy'
                            }`}
                        >
                            <t.icon className="h-4 w-4" /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {tab === 'overview' && <Overview counts={counts} audit={data.audit} />}
                    {tab === 'audit' && <AuditPanel />}
                    {tab === 'research_applications' && (
                        <ResearchApplicationsPanel items={data.research_applications} loading={loading} user={user} onChanged={load} />
                    )}
                    {tab === 'contributions' && (
                        <ContributionsPanel items={data.contributions} loading={loading} onChanged={load} />
                    )}
                    {tab === 'users' && (
                        <UsersManager users={data.users} loading={loading} user={user} onChanged={load} />
                    )}
                    {COLLECTIONS[tab] && (
                        <RecordManager
                            config={COLLECTIONS[tab]}
                            items={data[tab]}
                            loading={loading}
                            user={user}
                            onChanged={load}
                        />
                    )}
                </div>

                <p className="mt-8 text-[12px] text-muted-foreground">
                    Admins upload and verify material; the President alone approves or rejects publication. President actions are enforced server-side by PocketBase access rules. Citizen login stays completely separate from these controls.
                </p>
            </div>
        </div>
    );
}

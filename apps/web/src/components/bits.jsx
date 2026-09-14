import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { formatDate } from '@/lib/data';

export const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-sm bg-iayo-blue px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:brightness-95 active:scale-[0.98] min-h-[44px]';
export const btnSecondary =
    'inline-flex items-center justify-center gap-2 rounded-sm border border-navy bg-white px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-navy transition-all hover:bg-navy hover:text-white active:scale-[0.98] min-h-[44px]';
export const btnGhost =
    'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] text-iayo-blue transition-colors hover:bg-iayo-muted min-h-[44px]';
export const btnOrange =
    'inline-flex items-center justify-center gap-2 rounded-sm bg-iayo-orange px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:brightness-95 active:scale-[0.98] min-h-[44px]';

export function Eyebrow({ children, className = '' }) {
    return (
        <p
            className={`text-[11px] font-bold uppercase tracking-[0.22em] text-iayo-blue ${className}`}
        >
            {children}
        </p>
    );
}

export function SectionHeading({ eyebrow, title, intro, align = 'left' }) {
    return (
        <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
            {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
            <h2 className="font-display text-3xl font-extrabold leading-[1.04] tracking-tight text-navy md:text-[2.75rem]">
                {title}
            </h2>
            {intro && (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                    {intro}
                </p>
            )}
        </div>
    );
}

export function Spinner({ label = 'Loading' }) {
    return (
        <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-iayo-blue border-t-transparent" />
            <span className="text-sm font-semibold uppercase tracking-[0.14em]">{label}</span>
        </div>
    );
}

export function EmptyState({ title, body }) {
    return (
        <div className="border border-border bg-white py-16 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="mt-4 font-display text-lg font-bold text-navy">{title}</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
        </div>
    );
}

export function ResearchCard({ item }) {
    const author = item.expand?.author;
    return (
        <Link
            to={`/research/${item.id}`}
            className="group flex flex-col border border-border bg-white p-6 transition-all duration-200 hover:border-iayo-blue hover:shadow-[0_8px_24px_-12px_rgba(11,27,51,0.18)] md:p-7"
        >
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-iayo-blue">
                    {item.category}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {formatDate(item.created)}
                </span>
            </div>
            <h3 className="mt-4 font-display text-xl font-extrabold leading-snug tracking-tight text-navy transition-colors group-hover:text-iayo-blue md:text-2xl">
                {item.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {item.summary}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[12px] font-semibold text-navy">
                    {author?.name || 'IAYO Research'}
                </span>
                <span className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue">
                    Read Research
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
            </div>
        </Link>
    );
}

export function InvestigationCard({ item }) {
    const author = item.expand?.author;
    return (
        <Link
            to={`/investigations/${item.id}`}
            className="group relative flex flex-col overflow-hidden border border-navy/15 bg-navy p-6 text-white transition-all duration-200 hover:border-iayo-blue md:p-7"
        >
            <div className="absolute inset-0 grid-paper-light opacity-40" aria-hidden="true" />
            <div className="relative">
                <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-iayo-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                        {item.category}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">
                        {formatDate(item.created)}
                    </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-extrabold leading-snug tracking-tight md:text-2xl">
                    {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/70">
                    {item.summary}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                    <span className="text-[12px] font-semibold text-white/80">
                        {author?.name || 'IAYO Investigations'}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue">
                        Open File
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Reveal from '@/components/Reveal';
import { Eyebrow, Spinner, EmptyState } from '@/components/bits';
import { fetchNotifications, formatDate } from '@/lib/data';

const TYPE_COLOR = {
    update: 'bg-iayo-blue/10 text-iayo-blue',
    alert: 'bg-iayo-orange/10 text-iayo-orange',
    investigation: 'bg-navy/10 text-navy',
    research: 'bg-iayo-blue/10 text-iayo-blue',
    event: 'bg-iayo-orange/10 text-iayo-orange',
};

export default function NotificationsPage() {
    const [items, setItems] = useState(null);

    useEffect(() => {
        fetchNotifications()
            .then(setItems)
            .catch(() => setItems([]));
    }, []);

    return (
        <Layout
            title="Notifications — IAYO"
            description="Latest updates, alerts and announcements from IAYO."
        >
            <section className="border-b border-border bg-white">
                <div className="edge py-14 md:py-20">
                    <Eyebrow>Notifications</Eyebrow>
                    <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-navy md:text-5xl">
                        Updates &amp; alerts
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                        New investigations, research releases, RTI milestones and events from across IAYO's
                        districts.
                    </p>
                </div>
            </section>

            <section className="bg-iayo-bg py-14 md:py-20">
                <div className="edge max-w-3xl">
                    {items === null ? (
                        <Spinner />
                    ) : items.length === 0 ? (
                        <EmptyState title="No notifications yet" body="Check back soon for updates." />
                    ) : (
                        <div className="divide-y divide-border border border-border bg-white">
                            {items.map((n, i) => (
                                <Reveal key={n.id} y={16} delay={(i % 6) * 0.04}>
                                    <div className="flex items-start gap-4 px-6 py-5">
                                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-iayo-muted">
                                            <Bell className="h-4 w-4 text-iayo-blue" strokeWidth={2} />
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${TYPE_COLOR[n.type] || TYPE_COLOR.update}`}>
                                                    {n.type}
                                                </span>
                                                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                                    {formatDate(n.created)}
                                                </span>
                                            </div>
                                            <p className="mt-2 font-display text-lg font-bold leading-snug text-navy">{n.title}</p>
                                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                                            {n.link && (
                                                <Link
                                                    to={n.link}
                                                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-iayo-blue link-underline"
                                                >
                                                    View <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, User, ShieldCheck, Crown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginChoiceModal() {
    const { showLoginPrompt, closeLoginPrompt, isAuthed, user, role, logout } = useAuth();
    const location = useLocation();

    if (!showLoginPrompt) return null;

    const returnTo = encodeURIComponent(location.pathname + location.search);
    const name = user?.get?.('name') || user?.name || '';
    const roleLabel = role === 'president' ? 'President' : role === 'admin' ? 'Admin' : 'Member';

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/40 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl">
                <button
                    type="button"
                    onClick={closeLoginPrompt}
                    aria-label="Close"
                    className="absolute right-4 top-4 text-muted-foreground hover:text-navy"
                >
                    <X className="h-5 w-5" />
                </button>

                {isAuthed ? (
                    <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                            Signed in
                        </p>
                        <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-navy">
                            {name ? `Signed in as ${name}` : `Signed in as ${roleLabel}`}
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                closeLoginPrompt();
                            }}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-navy px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white hover:bg-iayo-blue"
                        >
                            <LogOut className="h-4 w-4" /> Log out
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-iayo-blue">
                            Welcome to IAYO
                        </p>
                        <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-navy">
                            Continue as
                        </h2>
                        <div className="mt-5 space-y-2.5">
                            <Link
                                to={`/citizen-login?return=${returnTo}`}
                                onClick={closeLoginPrompt}
                                className="flex items-center gap-3 rounded-sm border border-border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-navy transition-colors hover:border-iayo-blue hover:bg-iayo-muted"
                            >
                                <User className="h-4 w-4 text-iayo-blue" /> Login as Member
                            </Link>
                            <Link
                                to="/admin-login"
                                onClick={closeLoginPrompt}
                                className="flex items-center gap-3 rounded-sm border border-border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-navy transition-colors hover:border-iayo-blue hover:bg-iayo-muted"
                            >
                                <ShieldCheck className="h-4 w-4 text-iayo-blue" /> Login as Admin
                            </Link>
                            <Link
                                to="/president-login"
                                onClick={closeLoginPrompt}
                                className="flex items-center gap-3 rounded-sm border border-border px-4 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-navy transition-colors hover:border-iayo-blue hover:bg-iayo-muted"
                            >
                                <Crown className="h-4 w-4 text-iayo-orange" /> Login as President
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

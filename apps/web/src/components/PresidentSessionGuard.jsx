import React, { useEffect, useRef } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const IDLE_LIMIT_MS = 5 * 60 * 1000;
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export default function PresidentSessionGuard({ children }) {
    const { isAuthed, isPresident, logout } = useAuth();
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const forceLogout = () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        logout();
        navigate('/president-login', { replace: true });
    };

    useEffect(() => {
        if (!isAuthed || !isPresident) return undefined;

        const resetTimer = () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(forceLogout, IDLE_LIMIT_MS);
        };

        EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));
        resetTimer();

        return () => {
            EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [isAuthed, isPresident]);

    if (!isAuthed || !isPresident) return null;

    return (
        <>
            {children}

            <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-sm border border-navy/15 bg-white/95 p-2 shadow-lg backdrop-blur">
                <span className="hidden items-center gap-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:inline-flex">
                    <ShieldAlert className="h-3.5 w-3.5 text-iayo-blue" />
                    Auto logout: 5 min idle
                </span>
                <button
                    type="button"
                    onClick={forceLogout}
                    className="inline-flex items-center gap-2 rounded-sm bg-navy px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:bg-iayo-blue"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                </button>
            </div>
        </>
    );
}

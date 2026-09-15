import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(pb.authStore.record);
    const [loading, setLoading] = useState(true);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const unsub = pb.authStore.onChange((_token, record) => setUser(record));
        setLoading(false);
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, []);

    const logout = () => {
        pb.authStore.clear();
        setUser(null);
    };

    const value = useMemo(() => {
        const role = user?.get?.('role') || user?.role || null;

        return {
            user,
            role,
            loading,
            isAuthed: pb.authStore.isValid,
            isCitizen: role === 'citizen',
            isPresident: role === 'president',
            isAdmin: role === 'admin',
            isAdminEnabled: role === 'admin' && (user?.get?.('admin_enabled') ?? user?.admin_enabled) === true,
            isStaff: role === 'president' || role === 'admin',

            authWithPassword: (identity, password) =>
                pb.collection('users').authWithPassword(
                    String(identity).trim().toLowerCase(),
                    password,
                ),

            requestOtp: (email) =>
                pb.collection('users').requestOTP(
                    String(email).trim().toLowerCase(),
                ),

            verifyOtp: (otpId, code) =>
                pb.collection('users').authWithOTP(otpId, code),

            verifyOtpMfa: (otpId, code, mfaId) =>
                pb.collection('users').authWithOTP(otpId, code, { mfaId }),

            presidentExists: () =>
                pb.send('/api/president-exists', { method: 'GET' }),

            presidentSetup: (payload) =>
                pb.send('/api/president-setup', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                }),

            presidentAlert: (payload) =>
                pb.send('/api/president-alert', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                }),

            adminResolve: (adminId) =>
                pb.send(`/api/admin/resolve?admin_id=${encodeURIComponent(adminId)}`, {
                    method: 'GET',
                }),

            logout,

            showLoginPrompt,
            openLoginPrompt: () => setShowLoginPrompt(true),
            closeLoginPrompt: () => setShowLoginPrompt(false),
        };
    }, [user, loading, showLoginPrompt]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import ResearchPage from './pages/ResearchPage';
import ResearchContributePage from './pages/ResearchContributePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import InvestigationsPage from './pages/InvestigationsPage';
import InvestigationDetailPage from './pages/InvestigationDetailPage';
import AccountabilityPage from './pages/AccountabilityPage';
import TransparencyPage from './pages/TransparencyPage';
import AboutPage from './pages/AboutPage';
import DonatePage from './pages/DonatePage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import FindingsPage from './pages/FindingsPage';
import FindingDetailPage from './pages/FindingDetailPage';
import RtiPage from './pages/RtiPage';
import RtiDetailPage from './pages/RtiDetailPage';
import VoicesPage from './pages/VoicesPage';
import JoinPage from './pages/JoinPage';
import MembershipSuccessPage from './pages/MembershipSuccessPage';
import VerifyPage from './pages/VerifyPage';
import CitizenLoginPage from './pages/CitizenLoginPage';
import PresidentLoginPage from './pages/PresidentLoginPage';
import PresidentSetupPage from './pages/PresidentSetupPage';
import ProfilePage from './pages/ProfilePage';
import PresidentDashboard from './pages/PresidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import PresidentAdminManagementPage from './pages/PresidentAdminManagementPage';
import PresidentReviewPage from './pages/PresidentReviewPage';
import PresidentSessionGuard from './components/PresidentSessionGuard';

function RequireAuth({ children }) {
    const { isAuthed } = useAuth();
    return isAuthed ? children : <Navigate to="/citizen-login" replace />;
}

function RequireStaff({ children }) {
    const { isAuthed, isStaff } = useAuth();
    if (!isAuthed) return <Navigate to="/president-login" replace />;
    return isStaff ? children : <Navigate to="/profile" replace />;
}

function RequireAdmin({ children }) {
    const { isAuthed, isAdmin, isAdminEnabled } = useAuth();
    if (!isAuthed) return <Navigate to="/admin-login" replace />;
    return isAdmin && isAdminEnabled ? children : <Navigate to="/admin-login" replace />;
}

function RequirePresident({ children }) {
    const { isAuthed, isPresident } = useAuth();
    if (!isAuthed) return <Navigate to="/president-login" replace />;
    return isPresident ? <PresidentSessionGuard>{children}</PresidentSessionGuard> : <Navigate to="/president-login" replace />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/research/contribute" element={<ResearchContributePage />} />
                    <Route path="/research/:id" element={<ArticleDetailPage />} />
                    <Route path="/investigations" element={<InvestigationsPage />} />
                    <Route path="/investigations/:id" element={<InvestigationDetailPage />} />
                    <Route path="/findings" element={<FindingsPage />} />
                    <Route path="/findings/:id" element={<FindingDetailPage />} />
                    <Route path="/rti" element={<RtiPage />} />
                    <Route path="/rti/:id" element={<RtiDetailPage />} />
                    <Route path="/voices" element={<VoicesPage />} />
                    <Route path="/join" element={<JoinPage />} />
                    <Route path="/membership/success" element={<MembershipSuccessPage />} />
                    <Route path="/verify" element={<VerifyPage />} />
                    <Route path="/verify/:code" element={<VerifyPage />} />
                    <Route path="/accountability" element={<AccountabilityPage />} />
                    <Route path="/transparency" element={<TransparencyPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/donate" element={<DonatePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/citizen-login" element={<CitizenLoginPage />} />
                    <Route path="/president-login" element={<PresidentLoginPage />} />
                    <Route path="/president-setup" element={<PresidentSetupPage />} />
                    <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                    <Route path="/dashboard" element={<RequirePresident><PresidentDashboard /></RequirePresident>} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                    <Route path="/president-admins" element={<RequirePresident><PresidentAdminManagementPage /></RequirePresident>} />
                    <Route path="/president-review" element={<RequirePresident><PresidentReviewPage /></RequirePresident>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

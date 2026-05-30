/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import DashboardGateway from './components/DashboardGateway';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — redirect to dashboard if already signed in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
        </Route>

        {/* Protected — require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardGateway />} />
          <Route path="/dashboard/:username" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


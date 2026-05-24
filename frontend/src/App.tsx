import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { OfferDetailPage } from './pages/OfferDetailPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OffersPage } from './pages/OffersPage';
import { BookingsPage } from './pages/BookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Customer Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/offer/:id" element={<OfferDetailPage />} />
              <Route path="/confirmation/:id" element={<BookingConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Private Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/offers" element={<OffersPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

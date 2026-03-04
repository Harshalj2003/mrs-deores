import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageTransitions, pageEase } from "./utils/scrollAnimations";
import "./index.css";

import AuthService from "./services/auth.service";
import type { User } from "./types/auth.types";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import ProductDetail from "./pages/ProductDetail_utf8";
import Wishlist from "./components/Wishlist";
// Lazy-loaded heavy pages for performance
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminCustomOrders = lazy(() => import('./pages/AdminCustomOrders'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));
const AdminTeam = lazy(() => import('./pages/AdminTeam'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const Orders = lazy(() => import('./pages/Orders'));
const CustomOrderPage = lazy(() => import('./pages/CustomOrderPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
import useCartStore from "./store/useCartStore";
import api from "./services/api";

import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import CheckoutLayout from "./layouts/CheckoutLayout";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";
import Policies from "./pages/Policies";
import useHeartbeat from "./hooks/useHeartbeat";

// Minimal loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-light dark:bg-neutral-900">
    <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const location = useLocation();

  // Send heartbeat for real-time active user tracking (skips admins automatically)
  useHeartbeat();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);
    useCartStore.getState().syncWithBackend();

    // Apply theme colors from admin settings to CSS variables
    api.get('/settings').then(res => {
      const settings = res.data || {};
      const root = document.documentElement;
      if (settings.theme_primary_color) root.style.setProperty('--color-primary', settings.theme_primary_color);
      if (settings.theme_secondary_color) root.style.setProperty('--color-secondary', settings.theme_secondary_color);
    }).catch(() => { /* fail silently — use defaults */ });
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  const pageVariants = pageTransitions.slideUp;

  const pageTransitionConfig = pageEase;

  return (
    <>
      <ScrollToTop />
      {location.pathname.startsWith('/admin') ? (
        <AdminLayout currentUser={currentUser}>
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
              <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
              <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/custom-orders" element={<ProtectedAdminRoute><AdminCustomOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminNotificationsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/team" element={<ProtectedAdminRoute><AdminTeam /></ProtectedAdminRoute>} />
              <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
            </Routes>
          </Suspense>
        </AdminLayout>
      ) : ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) ? (
        <AuthLayout>
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </AuthLayout>
      ) : location.pathname === '/checkout' ? (
        <CheckoutLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </Suspense>
        </CheckoutLayout>
      ) : (
        <MainLayout currentUser={currentUser} logOut={logOut}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransitionConfig}
            >
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/category/:categoryId" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail currentUser={currentUser} />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/custom-order" element={<CustomOrderPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<Policies />} />
                  <Route path="/terms" element={<Policies />} />
                  <Route path="/shipping" element={<Policies />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </MainLayout>
      )}
    </>
  );
};

export default App;

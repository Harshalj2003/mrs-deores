import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

import AuthService from "./services/auth.service";
import type { User } from "./types/auth.types";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Wishlist from "./components/Wishlist";
import CheckoutPage from "./pages/CheckoutPage";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import useCartStore from "./store/useCartStore";
import api from "./services/api";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import CheckoutLayout from "./layouts/CheckoutLayout";
import CustomOrderPage from "./pages/CustomOrderPage";
import AdminCustomOrders from "./pages/AdminCustomOrders";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminCategories from "./pages/AdminCategories";
import AdminSettings from "./pages/AdminSettings";
import AboutPage from "./pages/AboutPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/ProfilePage";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const location = useLocation();

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

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  } as const;

  // Dynamic Layout Selection
  const getLayout = (pathname: string) => {
    if (pathname.startsWith('/admin')) {
      // AdminDashboard has its own sidebar, so we use a fragment or AdminLayout
      // However, AdminDashboard currently includes AdminSidebar. 
      // If we wrap it in AdminLayout (which also has Sidebar), we get double sidebar.
      // For now, let's use a simple wrapper for admin to avoid breaking existing AdminDashboard
      return ({ children }: { children: React.ReactNode }) => <div className="min-h-screen bg-neutral-light">{children}</div>;
    }
    if (['/login', '/register'].includes(pathname)) return AuthLayout;
    if (pathname === '/checkout') return CheckoutLayout;
    return MainLayout;
  };

  const Layout = getLayout(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Layout currentUser={currentUser} logOut={logOut}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/category/:categoryId" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/custom-order" element={<CustomOrderPage />} />

              {/* Admin Routes — Protected */}
              <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
              <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
              <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/custom-orders" element={<ProtectedAdminRoute><AdminCustomOrders /></ProtectedAdminRoute>} />
              <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Layout>
    </>
  );
};

export default App;

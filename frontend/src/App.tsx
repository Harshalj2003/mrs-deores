import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import AuthService from "./services/auth.service";
import type { User } from "./types/auth.types";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import Wishlist from "./components/Wishlist";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import useCartStore from "./store/useCartStore";

import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    // Sync cart on load
    useCartStore.getState().syncWithBackend();
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
  };

  return (
    <div>
      <Navbar currentUser={currentUser} logOut={logOut} />

      <div className="container mt-3 overflow-hidden">
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
              <Route path="/product/:productId" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<MyOrdersPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
      <CartDrawer />
    </div>
  );
};

export default App;

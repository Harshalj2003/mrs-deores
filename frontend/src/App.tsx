import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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
import useCartStore from "./store/useCartStore";
// import Profile from "./components/Profile"; 
// import BoardUser from "./components/BoardUser";
// import BoardAdmin from "./components/BoardAdmin";

import Navbar from "./components/Navbar";

// ... imports

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

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

  return (
    <div>
      <Navbar currentUser={currentUser} logOut={logOut} />

      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/category/:categoryId" element={<ProductList />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
        </Routes>
      </div>
      <CartDrawer />
    </div>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, RedirectToSignUp } from "@clerk/clerk-react";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProduct from "./pages/AddProduct";
import Profile from "./pages/Profile";

import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { injectStore } from "./api/api";

import "./App.css";

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    injectStore(getToken);
  }, [getToken]);

  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Auth Routes - Redirect if already signed in */}
            <Route 
              path="/login" 
              element={
                <SignedOut>
                  <Login />
                </SignedOut>
              } 
            />
            <Route 
              path="/register" 
              element={
                <SignedOut>
                  <Register />
                </SignedOut>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/add-product" 
              element={
                <SignedIn>
                  <AddProduct />
                </SignedIn>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <SignedIn>
                  <Profile />
                </SignedIn>
              } 
            />

            {/* Redirect unauthenticated users */}
            <Route path="/add-product" element={<RedirectToSignIn />} />
            <Route path="/profile" element={<RedirectToSignIn />} />

            {/* Optional: Redirect signed-in users trying to access auth pages */}
            <Route path="/login" element={<RedirectToSignUp />} />
            <Route path="/register" element={<RedirectToSignUp />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

// Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ShopProducts from './pages/ShopProducts';
import Sales from './pages/Sales';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/products" 
          element={user ? <Products /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cart" 
          element={user && user.role === UserRole.User ? <Cart /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders" 
          element={user ? <Orders /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/shop/products" 
          element={user && user.role === UserRole.OwnerShop ? <ShopProducts /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/shop/sales" 
          element={user && user.role === UserRole.OwnerShop ? <Sales /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </>
  );
}

export default App;

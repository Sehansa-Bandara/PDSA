import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar       from './components/Navbar';
import Dashboard    from './components/Dashboard';
import ProductList  from './components/ProductList';
import ExpiryAlerts from './components/ExpiryAlerts';
import Discounts    from './components/Discounts';
import Search       from './components/Search';

import { ProductProvider } from './context/ProductContext';
import './index.css';

export default function App() {
  return (
    <ProductProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#060a14', display: 'flex' }}>

          <Navbar />

          <main style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <Routes>
                <Route path="/"          element={<Dashboard    />} />
                <Route path="/products"  element={<ProductList  />} />
                <Route path="/alerts"    element={<ExpiryAlerts />} />
                <Route path="/discounts" element={<Discounts    />} />
                <Route path="/search"    element={<Search       />} />
              </Routes>
            </div>
          </main>

        </div>
      </BrowserRouter>
    </ProductProvider>
  );
}
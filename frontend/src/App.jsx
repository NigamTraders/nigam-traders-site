import React, {useEffect, useState} from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

export default function App(){
  const [cart, setCart] = useState([]);
  useEffect(()=>{ const s = localStorage.getItem('cart'); if(s) setCart(JSON.parse(s)); },[]);
  useEffect(()=> localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const addToCart = (product, qty=1) => {
    setCart(prev=>{
      const p = prev.find(x=>x.id===product.id);
      if(p) return prev.map(x=> x.id===product.id ? {...x, qty: x.qty+qty} : x);
      return [...prev, {...product, qty}];
    });
  };
  const clearCart = ()=> setCart([]);

  return (
    <BrowserRouter>
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="logo" className="w-20 h-20 object-contain rounded" />
            <div>
              <h1 className="text-2xl font-bold">Nigam Traders</h1>
              <div className="text-sm text-gray-300">Affordable Gifting Solutions</div>
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link className="px-3 py-2 rounded bg-brandGold text-black font-semibold" to="/">Home</Link>
          <Link className="px-3 py-2 rounded border border-gray-700" to="/checkout">Cart ({cart.reduce((s,c)=>s+c.qty,0)})</Link>
          <Link className="px-3 py-2 rounded border border-gray-700" to="/admin">Admin</Link>
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

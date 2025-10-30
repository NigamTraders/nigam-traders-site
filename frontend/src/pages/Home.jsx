import React, {useEffect, useState} from 'react'

export default function Home({addToCart}){
  const [products, setProducts] = useState([]);
  useEffect(()=>{ fetch('/api/products').then(r=>r.json()).then(setProducts) },[]);
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Premium Gifts & Packaging</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p=> (
          <div key={p.id} className="bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800">
            <img src={p.image || '/assets/logo.png'} alt={p.name} className="w-full h-48 object-cover rounded" />
            <h3 className="mt-3 font-semibold text-lg">{p.name}</h3>
            <div className="text-sm text-gray-300">{p.category}</div>
            <div className="mt-2 font-bold text-xl">₹{p.price}</div>
            <button onClick={()=>addToCart(p)} className="mt-4 w-full py-2 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, {useState} from 'react'

export default function Admin(){
  const [name,setName] = useState(''); const [price,setPrice]=useState(''); const [category,setCategory]=useState(''); const [msg,setMsg]=useState('');
  async function add(){
    const token = prompt('Admin token (set in backend .env):');
    const product = { name, price: Number(price), category, image: '/assets/logo.png' };
    const res = await fetch('/api/admin/product', {method:'POST', headers:{'Content-Type':'application/json','x-admin-token': token }, body: JSON.stringify(product)});
    const j = await res.json();
    if(j.ok){ setMsg('Product added'); setName(''); setPrice(''); setCategory(''); } else setMsg('Error: ' + JSON.stringify(j));
  }
  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold mb-4">Admin - Add Product</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full p-2 mb-2 bg-gray-800 rounded" />
      <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full p-2 mb-2 bg-gray-800 rounded" />
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="w-full p-2 mb-2 bg-gray-800 rounded" />
      <button onClick={add} className="px-4 py-2 rounded bg-brandGold text-black font-semibold">Add</button>
      <div className="mt-3 text-sm text-green-300">{msg}</div>
    </div>
  )
}

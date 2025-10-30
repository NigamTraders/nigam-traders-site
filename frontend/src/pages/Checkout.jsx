import React, {useMemo, useState} from 'react'

export default function Checkout({cart, clearCart}){
  const total = useMemo(()=> cart.reduce((s,i)=>s + i.price * i.qty,0),[cart]);
  const [loading, setLoading] = useState(false);

  async function payWithRazorpay(){
    if(total<=0) return alert('Cart empty');
    setLoading(true);
    try{
      const res = await fetch('/api/pay/razorpay/create-order', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount: total})});
      const j = await res.json();
      if(!j.ok) throw new Error(j.error || 'Razorpay error');
      const order = j.order;
      const options = {
        key: process.env.VITE_RAZORPAY_KEY || j.order.key_id || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Nigam Traders',
        description: 'Order Payment',
        order_id: order.id,
        handler: function (response){
          alert('Payment successful: ' + JSON.stringify(response));
          clearCart();
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#d4af37' }
      };
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = function(){
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    }catch(e){
      alert('Error: ' + e.message);
    }finally{ setLoading(false); }
  }

  async function payWithPayU(){
    if(total<=0) return alert('Cart empty');
    setLoading(true);
    try{
      const res = await fetch('/api/pay/payu/create', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount: total, productinfo: 'Nigam Traders Order'})});
      const j = await res.json();
      if(!j.ok) throw new Error(j.error || 'PayU error');
      const payload = j.payload;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://sandboxsecure.payu.in/_payment';
      const fields = {
        key: payload.key,
        txnid: payload.txnid,
        amount: payload.amount,
        productinfo: payload.productinfo,
        firstname: payload.firstname,
        email: payload.email,
        phone: payload.phone,
        surl: payload.surl,
        furl: payload.furl,
        hash: payload.hash
      };
      for(const k in fields){
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = k;
        inp.value = fields[k];
        form.appendChild(inp);
      }
      document.body.appendChild(form);
      form.submit();
    }catch(e){
      alert('Error: ' + e.message);
    }finally{ setLoading(false); }
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      <h2 className="text-2xl mb-4">Checkout</h2>
      <div className="mb-4">Total: <strong>₹{total}</strong></div>
      <div className="space-y-4">
        <button onClick={payWithRazorpay} className="px-4 py-3 rounded bg-brandGold text-black font-semibold" disabled={loading}>Pay with Card/Wallet (Razorpay)</button>
        <button onClick={payWithPayU} className="px-4 py-3 rounded border border-gray-700" disabled={loading}>Pay with PayU</button>
      </div>
    </div>
  )
}

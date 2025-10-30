// server.js - Enhanced backend with Razorpay & PayU
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDB(){
  await db.read();
  db.data = db.data || { products: [], orders: [] };
  if(!db.data.products || db.data.products.length===0){
    db.data.products = [
      { id: 'p1', name: 'Premium Shagun Envelope (Pack of 10)', category: 'Shagun Envelopes', price: 120, image: '/assets/logo.png' },
      { id: 'p2', name: 'Saree Cover - Satin', category: 'Saree Covers', price: 250, image: '/assets/logo.png' },
      { id: 'p3', name: 'Paper Bag - Luxury (Pack of 5)', category: 'Paper Bags', price: 180, image: '/assets/logo.png' }
    ];
    await db.write();
  }
}
initDB();

app.get('/api/products', async (req,res)=>{
  await db.read();
  res.json(db.data.products);
});

app.get('/api/products/:id', async (req,res)=>{
  await db.read();
  const p = db.data.products.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({error:'Not found'});
  res.json(p);
});

app.post('/api/order', async (req,res)=>{
  const order = req.body;
  order.id = Date.now().toString();
  order.createdAt = new Date().toISOString();
  await db.read();
  db.data.orders.push(order);
  await db.write();
  res.json({ok:true, orderId: order.id});
});

// Razorpay create order
app.post('/api/pay/razorpay/create-order', async (req,res)=>{
  const { amount, currency='INR', receipt } = req.body;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if(!key_id || !key_secret){
    return res.status(500).json({error:'Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'});
  }
  const Razorpay = require('razorpay');
  const instance = new Razorpay({ key_id, key_secret });
  try{
    const options = {
      amount: Math.round(amount*100),
      currency,
      receipt: receipt || ('rcpt_' + Date.now())
    };
    const order = await instance.orders.create(options);
    res.json({ok:true, order});
  }catch(e){
    console.error(e);
    res.status(500).json({error: e.message || 'razorpay error'});
  }
});

// PayU create payload and hash (server-side)
// Requires PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in .env
app.post('/api/pay/payu/create', async (req,res)=>{
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  if(!key || !salt){
    return res.status(500).json({error:'PayU credentials not configured. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in .env'});
  }
  const { amount, productinfo='Nigam Traders Order', firstname='Customer', email='customer@example.com', phone='9999999999' } = req.body;
  // construct txnid
  const txnid = 'tx' + Date.now();
  // hash sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const hashString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||||||||' + salt;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  const payload = {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl: process.env.PAYU_SUCCESS_URL || 'https://example.com/success',
    furl: process.env.PAYU_FAIL_URL || 'https://example.com/fail',
    hash
  };
  res.json({ok:true, payload});
});

// serve assets
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

app.get('/api/health', (req,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log('Backend running on', PORT));

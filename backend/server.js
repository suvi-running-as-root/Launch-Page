
// backend/server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // 👈 added

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'subscribers.json');
const PAYMENTS_DB_PATH = path.join(__dirname, 'concert-payments.json');
const FRONTEND_DIST_PATH = path.join(__dirname, '..', 'frontend', 'dist');

// Admin credentials (change via env vars)
const ADMIN_USER = process.env.ADMIN_USER || 'admin?maybe';
const ADMIN_PASS = process.env.ADMIN_PASS || 'QwErTyUiOp';
const ZEFFY_WEBHOOK_SECRET = process.env.ZEFFY_WEBHOOK_SECRET || '';



// middlewares. Set CORS_ORIGIN to the public website address in production.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // No Origin is expected for server-to-server webhooks and command-line checks.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS policy.'));
  },
}));
app.use(bodyParser.json({ limit: '200kb' })); // parse JSON bodies

// Ensure subscribers.json exists with initial structure
function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { subscribers: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}
ensureDb();

function ensurePaymentsDb() {
  if (!fs.existsSync(PAYMENTS_DB_PATH)) {
    fs.writeFileSync(PAYMENTS_DB_PATH, JSON.stringify({ payments: [] }, null, 2), 'utf8');
  }
}
ensurePaymentsDb();

// helper: read DB
function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read DB:', err);
    return { subscribers: [] };
  }
}

// helper: write DB (atomic-ish)
function writeDb(dbObj) {
  const tmpPath = DB_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(dbObj, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function readPaymentsDb() {
  try {
    const raw = fs.readFileSync(PAYMENTS_DB_PATH, 'utf8');
    const db = JSON.parse(raw);
    return Array.isArray(db.payments) ? db : { payments: [] };
  } catch (err) {
    console.error('Failed to read payments DB:', err);
    return { payments: [] };
  }
}

function writePaymentsDb(dbObj) {
  const tmpPath = PAYMENTS_DB_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(dbObj, null, 2), 'utf8');
  fs.renameSync(tmpPath, PAYMENTS_DB_PATH);
}

// Basic auth checker for admin routes
function checkBasicAuth(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) return false;
  const b64 = auth.slice(6);
  let cred;
  try {
    cred = Buffer.from(b64, 'base64').toString('utf8'); // "user:pass"
  } catch (e) {
    return false;
  }
  const idx = cred.indexOf(':');
  if (idx === -1) return false;
  const user = cred.slice(0, idx);
  const pass = cred.slice(idx + 1);
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

/* ----------------------------------------
   Email (Contact form) – Nodemailer
   ---------------------------------------- */

// Configure transporter from env
// Set these in your environment:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
// CONTACT_TO_EMAIL (where you receive contact messages),
// CONTACT_FROM_EMAIL (from address shown in email).
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587/STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Optional: verify transporter on startup
mailTransporter.verify((err, success) => {
  if (err) {
    console.warn('⚠️ Nodemailer transport not ready:', err.message);
  } else {
    console.log('✅ Nodemailer transport is ready to send emails');
  }
});

/* ----------------------------------------
   Routes
   ---------------------------------------- */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Subscribe endpoint
app.post('/api/subscribe', (req, res) => {
  const { name = '', email = '', interests = '' } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res
      .status(400)
      .json({ success: false, error: 'A valid email is required.' });
  }

  const db = readDb();

  // simple duplicate check by email
  const exists = db.subscribers.find(
    (s) => s.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    return res.json({
      success: true,
      message: 'Already subscribed',
      subscriber: exists,
    });
  }

  const subscriber = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    interests: String(interests).trim(),
    createdAt: new Date().toISOString(),
  };

  db.subscribers.unshift(subscriber);
  try {
    writeDb(db);
    return res.json({ success: true, subscriber });
  } catch (err) {
    console.error('Failed to write DB:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Could not save subscriber.' });
  }
});

/* Contact Us endpoint – sends email */
app.post('/api/contact', async (req, res) => {
  const { name = '', email = '', subject = '', message = '' } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res
      .status(400)
      .json({ success: false, error: 'A valid email is required.' });
  }

  if (!message || !String(message).trim()) {
    return res
      .status(400)
      .json({ success: false, error: 'Message cannot be empty.' });
  }

  const safeName = String(name || '').trim() || 'Anonymous';
  const safeSubject =
    String(subject || '').trim() || 'New message from Amar Seva Sangam USA site';

  try {
    const info = await mailTransporter.sendMail({
      from:
        process.env.CONTACT_FROM_EMAIL ||
        `"Amar Seva Sangam USA" <contact@amarsevausa.org>`,
      to: process.env.CONTACT_TO_EMAIL || 'contact@amarsevausa.org',
      replyTo: email,
      subject: safeSubject,
      text: `
From: ${safeName} <${email}>

${message}
      `.trim(),
    });

    console.log('Contact email sent:', info.messageId);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to send contact email:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Could not send email.' });
  }
});

// Admin: list subscribers (protected with Basic Auth)
app.get('/api/subscribers', (req, res) => {
  if (!checkBasicAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = readDb();
  res.json(db);
});

// Admin: CSV export (protected with Basic Auth)
app.get('/api/subscribers.csv', (req, res) => {
  if (!checkBasicAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Unauthorized');
  }

  const db = readDb();
  // CSV header
  const header = 'id,name,email,interests,createdAt\n';

  // escape double quotes in fields by doubling them
  const rows = db.subscribers
    .map((s) => {
      const safe = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
      return [
        safe(s.id),
        safe(s.name),
        safe(s.email),
        safe(s.interests),
        safe(s.createdAt),
      ].join(',');
    })
    .join('\n');

  const csv = header + rows;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="subscribers.csv"'
  );
  res.send(csv);
});

/* ----------------------------------------
   Concert payments
   ---------------------------------------- */

function normalisePayment(input = {}) {
  const amount = Number(input.amount ?? input.total ?? input.amountPaid ?? 0);
  const currency = String(input.currency || 'USD').toUpperCase();
  const status = String(input.status || input.paymentStatus || 'paid').toLowerCase();
  const externalId = String(input.externalId || input.id || input.transactionId || '').trim();

  return {
    id: externalId || `manual-${Date.now()}`,
    donorName: String(input.donorName || input.name || input.customerName || '').trim(),
    donorEmail: String(input.donorEmail || input.email || input.customerEmail || '').trim().toLowerCase(),
    amount: Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0,
    currency,
    status,
    paidAt: input.paidAt || input.createdAt || new Date().toISOString(),
    source: String(input.source || 'zeffy'),
    receivedAt: new Date().toISOString(),
  };
}

function savePayment(input) {
  const payment = normalisePayment(input);
  if (!payment.id || payment.amount <= 0 || payment.status !== 'paid') {
    return { error: 'A paid transaction with a positive amount is required.' };
  }
  const db = readPaymentsDb();
  const existingIndex = db.payments.findIndex((p) => p.id === payment.id);
  if (existingIndex >= 0) {
    db.payments[existingIndex] = { ...db.payments[existingIndex], ...payment };
  } else {
    db.payments.unshift(payment);
  }
  writePaymentsDb(db);
  return { payment, updated: existingIndex >= 0 };
}

// Configure this as the notification URL in the payment integration that Zeffy
// exposes for your account. It deliberately accepts only an authenticated webhook;
// a browser redirect is never treated as proof of payment.
app.post('/api/zeffy/webhook', (req, res) => {
  if (!ZEFFY_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Zeffy webhook is not configured.' });
  }
  const suppliedSecret = req.get('x-zeffy-webhook-secret') || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (suppliedSecret !== ZEFFY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret.' });
  }

  try {
    const result = savePayment({ ...req.body, source: 'zeffy' });
    if (result.error) return res.status(400).json(result);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('Failed to store Zeffy payment:', err);
    return res.status(500).json({ error: 'Could not store payment.' });
  }
});

app.get('/api/admin/concert-payments', (req, res) => {
  if (!checkBasicAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  const payments = readPaymentsDb().payments;
  const paid = payments.filter((payment) => payment.status === 'paid');
  const totalsByCurrency = paid.reduce((totals, payment) => {
    totals[payment.currency] = (totals[payment.currency] || 0) + payment.amount;
    return totals;
  }, {});
  const dailyRevenue = paid.reduce((days, payment) => {
    const day = new Date(payment.paidAt).toISOString().slice(0, 10);
    days[day] = (days[day] || 0) + payment.amount;
    return days;
  }, {});
  res.json({
    payments,
    summary: {
      paymentCount: paid.length,
      totalsByCurrency,
      averagePayment: paid.length ? paid.reduce((sum, payment) => sum + payment.amount, 0) / paid.length : 0,
      dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)),
    },
  });
});

// Use only for a payment confirmed in Zeffy when the account cannot send webhooks.
app.post('/api/admin/concert-payments', (req, res) => {
  if (!checkBasicAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = savePayment({ ...req.body, source: req.body?.source || 'zeffy-confirmed-manual' });
    if (result.error) return res.status(400).json(result);
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Failed to store manual payment:', err);
    return res.status(500).json({ error: 'Could not store payment.' });
  }
});

app.get('/api/admin/concert-payments.csv', (req, res) => {
  if (!checkBasicAuth(req)) return res.status(401).send('Unauthorized');
  const header = 'transactionId,donorName,donorEmail,amount,currency,status,paidAt,source\n';
  const safe = (value) => `"${String(value || '').replace(/"/g, '""')}"`;
  const rows = readPaymentsDb().payments.map((payment) => [payment.id, payment.donorName, payment.donorEmail, payment.amount, payment.currency, payment.status, payment.paidAt, payment.source].map(safe).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="concert-payments.csv"');
  res.send(header + rows);
});

// In production, the backend can serve the built React app as a single service.
// Build the frontend first (`npm run build` inside frontend) before starting Node.
if (fs.existsSync(FRONTEND_DIST_PATH)) {
  app.use(express.static(FRONTEND_DIST_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
  });
}

// Fallback 404 for other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log('Set ADMIN_USER, ADMIN_PASS, ZEFFY_WEBHOOK_SECRET, and CORS_ORIGIN for production.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing service or start with a different port, for example: PORT=4001 npm run dev`);
  } else {
    console.error('Unable to start the server:', error.message);
  }
  process.exit(1);
});

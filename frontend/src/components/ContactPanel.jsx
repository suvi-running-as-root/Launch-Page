import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

export default function ContactPanel({ open, onClose }) {
  const [form, setForm] = useState({
    email: '',
    name: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send');
      }

      setStatus('success');
      setForm({ email: '', name: '', subject: '', message: '' });
      // optionally auto-close after success
      // onClose();
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '320px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        padding: '1.2rem',
        zIndex: 1000,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Contact Us</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Your name (optional)"
          value={form.name}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />

        <input
          name="email"
          type="email"
          placeholder="Your email"
          required
          value={form.email}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />

        <input
          name="subject"
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />

        <textarea
          name="message"
          placeholder="Your message"
          required
          rows={3}
          value={form.message}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 8, padding: 8 }}
        />

        {status === 'success' && (
          <div className="muted" style={{ marginBottom: 8 }}>
            Message sent. Thank you!
          </div>
        )}
        {status === 'error' && (
          <div className="error" style={{ marginBottom: 8 }}>
            Something went wrong. Please try again.
          </div>
        )}

        <div
          style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
        >
          <button type="button" className="btn small" onClick={onClose}>
            Close
          </button>
          <button
            type="submit"
            className="btn primary small"
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

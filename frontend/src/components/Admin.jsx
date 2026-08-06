import { useEffect, useMemo, useState } from 'react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function currency(value, code = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value || 0);
}

function authHeader(credentials) {
  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
}

export default function Admin() {
  const [credentials, setCredentials] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('concert-admin-credentials')) || { username: '', password: '' }; }
    catch { return { username: '', password: '' }; }
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDashboard = async (activeCredentials = credentials) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/concert-payments`, {
        headers: { Authorization: authHeader(activeCredentials) },
      });
      if (response.status === 401) throw new Error('Incorrect username or password.');
      if (!response.ok) throw new Error('Could not load the payment dashboard.');
      const payload = await response.json();
      setData(payload);
      setAuthenticated(true);
      sessionStorage.setItem('concert-admin-credentials', JSON.stringify(activeCredentials));
    } catch (requestError) {
      setAuthenticated(false);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (credentials.username && credentials.password) loadDashboard(credentials);
    // Run only once to restore a session, not on each form edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chart = useMemo(() => data?.summary.dailyRevenue?.slice(-14) || [], [data]);
  const maxRevenue = Math.max(...chart.map((entry) => entry.amount), 1);

  const downloadCsv = async () => {
    const response = await fetch(`${API_URL}/api/admin/concert-payments.csv`, {
      headers: { Authorization: authHeader(credentials) },
    });
    if (!response.ok) return setError('Could not export the payment spreadsheet.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'concert-payments.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    sessionStorage.removeItem('concert-admin-credentials');
    setCredentials({ username: '', password: '' });
    setData(null);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <form className="admin-login-card" onSubmit={(event) => { event.preventDefault(); loadDashboard(); }}>
          <p className="admin-eyebrow">AMAR SEVA SANGAM USA</p>
          <h1>Concert revenue</h1>
          <p>Private access for concert organizers.</p>
          <label>Username<input autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required /></label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          <a href="/">Return to website</a>
        </form>
      </main>
    );
  }

  const totals = Object.entries(data.summary.totalsByCurrency || {});
  const primaryCurrency = totals[0]?.[0] || 'USD';
  const primaryTotal = totals[0]?.[1] || 0;
  return (
    <main className="admin-shell">
      <div className="admin-dashboard">
        <header className="admin-header">
          <div><p className="admin-eyebrow">PRIVATE DASHBOARD</p><h1>Concert payment revenue</h1><p>Only confirmed payments are included.</p></div>
          <div className="admin-actions"><button onClick={() => loadDashboard()} className="admin-secondary">Refresh</button><button onClick={downloadCsv} className="admin-primary">Download Excel CSV</button><button onClick={logout} className="admin-link-button">Sign out</button></div>
        </header>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <section className="admin-stats">
          <article><span>Total revenue</span><strong>{currency(primaryTotal, primaryCurrency)}</strong>{totals.length > 1 && <small>{totals.slice(1).map(([code, amount]) => currency(amount, code)).join(' · ')}</small>}</article>
          <article><span>Confirmed payments</span><strong>{data.summary.paymentCount}</strong><small>Successful Zeffy transactions</small></article>
          <article><span>Average payment</span><strong>{currency(data.summary.averagePayment, primaryCurrency)}</strong><small>Across all confirmed payments</small></article>
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><h2>Revenue trend</h2><p>Last 14 days with payments</p></div></div>
          {chart.length ? <div className="revenue-chart">{chart.map((entry) => <div className="chart-column" key={entry.date}><span className="chart-value">{currency(entry.amount, primaryCurrency)}</span><div className="chart-track"><div className="chart-bar" style={{ height: `${(entry.amount / maxRevenue) * 100}%` }} /></div><span className="chart-label">{new Date(`${entry.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>)}</div> : <div className="admin-empty">No confirmed concert payments have been received yet.</div>}
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><h2>Confirmed payments</h2><p>New entries appear after the authenticated Zeffy notification is received.</p></div></div>
          <div className="payments-table-wrap"><table><thead><tr><th>Date</th><th>Donor</th><th>Transaction</th><th>Amount</th><th>Source</th></tr></thead><tbody>{data.payments.length ? data.payments.map((payment) => <tr key={payment.id}><td>{new Date(payment.paidAt).toLocaleDateString()}</td><td><b>{payment.donorName || '—'}</b><small>{payment.donorEmail || 'No email supplied'}</small></td><td className="transaction-id">{payment.id}</td><td>{currency(payment.amount, payment.currency)}</td><td><span className="status-chip">{payment.source}</span></td></tr>) : <tr><td colSpan="5" className="admin-empty">No payments to show.</td></tr>}</tbody></table></div>
        </section>
      </div>
    </main>
  );
}

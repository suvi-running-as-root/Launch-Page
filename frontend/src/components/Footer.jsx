import BannerStrip from './BannerStrip';

export default function Footer({ onContactClick }) {
  return <footer className="footer container-wide"><div className="footer-glass-card">
    <div className="footer-banner"><BannerStrip height={140} variant="footer" /></div>
    <div className="footer-main">
      <section className="footer-left footer-section-card"><h4 className="footer-heading">Explore</h4><div className="footer-actions"><a href="/about-us" className="btn small">About Us</a><a href="/#donate" className="btn small">Donate</a><button className="btn small" onClick={onContactClick}>Contact Us</button></div></section>
      <section className="footer-right footer-section-card"><h4 className="footer-heading">Connect With Us</h4><div className="footer-copy">Questions or interested in volunteering? We would love to hear from you.</div><div className="footer-copy"><a href="mailto:contact@amarsevausa.org" className="footer-link">contact@amarsevausa.org</a></div></section>
    </div>
    <div className="footer-copy">© 2026 Amar Seva Sangam USA. All rights reserved.</div>
  </div></footer>;
}

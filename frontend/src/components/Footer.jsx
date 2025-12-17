import BannerStrip from './BannerStrip';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer({ onContactClick }) {
  return (
    <footer className="footer container-wide">
      <div className="footer-glass-card">
        {/* Carousel at top */}
        <div className="footer-banner">
          <BannerStrip height={140} variant="footer" />
        </div>

        <div className="footer-glass-card">
  

  {/* MAIN FOOTER CONTENT */}
  <div className="footer-main">

    {/* LEFT — BUTTONS */}
    <div className="footer-left">
      <h4 className="footer-heading">Explore</h4>
      <p className="footer-copy footer-left-hint">
  Quick links to explore our work
</p>

      <div className="footer-actions">
        <a href="#about" className="btn small">About</a>
        <a href="#donate" className="btn small">Donate</a>
        <a href="#president" className="btn small">Leadership</a>
        <button className="btn small" onClick={onContactClick}>
          Contact Us
        </button>
      </div>
    </div>

    {/* DIVIDER */}
    <div className="footer-divider" />

    {/* RIGHT — SOCIAL + EMAIL */}
    <div className="footer-right">
      <h4 className="footer-heading">Connect With Us</h4>

      <div className="footer-copy">
        Follow us on social media for updates and impact stories.
      </div>

      <div className="footer-social">
        <a
          href="https://facebook.com/YOUR_PAGE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <Facebook size={45} />
        </a>

        <a
          href="https://instagram.com/YOUR_PAGE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={45} />
        </a>

        <a
          href="https://twitter.com/YOUR_PAGE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <Twitter size={45} />
        </a>

        <a
          href="https://linkedin.com/company/YOUR_PAGE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin size={45} />
        </a>
      </div>

      <div className="footer-copy">
        <a
          href="mailto:amarsevasangam.usa@gmail.com"
          className="footer-link"
        >
          amarsevasangam.usa@gmail.com
        </a>
      </div>
    </div>

  </div>

  {/* Copyright stays */}
  <div className="footer-copy" style={{ textAlign: 'center' }}>
    © 2025 Amar Seva Sangam USA. All rights reserved.
  </div>
</div>



        
      </div>
    </footer>
  );
}

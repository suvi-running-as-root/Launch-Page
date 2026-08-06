import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Admin from './components/Admin';
import ContactPanel from './components/ContactPanel';
import Footer from './components/Footer';
import logo from './assets/logo.svg';
import { useScrollReveal } from './hooks/useScrollReveal';
import About from './components/About';
import Donate from './components/Donate';
import Hero from './components/Hero';
import AboutUs from './pages/AboutUs';
import Therapies from './pages/Therapies';
import Education from './pages/Education';
import AssistiveTechnology from './pages/AssistiveTechnology';
import VocationalTraining from './pages/VocationalTraining';

function SiteHeader({ onContactClick }) {
  return <header className="nav"><div className="nav-inner">
    <a href="/" className="logo"><img src={logo} alt="Amar Seva Sangam USA" /></a>
    <nav className="nav-actions" aria-label="Main navigation">
      <a href="/about-us" className="nav-link">About Us</a>
      <a href="/#donate" className="btn small donate-btn">Donate Now</a>
      <button className="btn small invert" onClick={onContactClick}>Contact Us</button>
    </nav>
  </div></header>;
}

function Layout({ children }) {
  const [contactOpen, setContactOpen] = useState(false);
  return <div className="app">
    <SiteHeader onContactClick={() => setContactOpen(true)} />
    <main>{children}</main>
    <Footer onContactClick={() => setContactOpen(true)} />
    <ContactPanel open={contactOpen} onClose={() => setContactOpen(false)} />
  </div>;
}

function Home() {
  useScrollReveal();
  return <Layout>
    <section className="reveal-on-scroll"><Hero /></section>
    <section className="reveal-on-scroll"><About /></section>
    <section className="reveal-on-scroll" id="donate"><Donate /></section>
  </Layout>;
}

function Page({ children }) { return <Layout><section className="page-shell container-wide">{children}</section></Layout>; }

export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/about-us" element={<Page><AboutUs /></Page>} />
    <Route path="/therapies-healthcare" element={<Page><Therapies /></Page>} />
    <Route path="/inclusive-education" element={<Page><Education /></Page>} />
    <Route path="/assistive-technology" element={<Page><AssistiveTechnology /></Page>} />
    <Route path="/vocational-training" element={<Page><VocationalTraining /></Page>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

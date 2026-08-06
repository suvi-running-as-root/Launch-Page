import { createElement } from 'react';
import { Accessibility, GraduationCap, Stethoscope, Users } from 'lucide-react';

const programs = [
  { title: 'Therapies & Healthcare', text: 'Access to essential therapies, rehabilitation services, and ongoing medical support.', icon: Stethoscope, theme: 'health', href: '/therapies-healthcare' },
  { title: 'Inclusive Education', text: 'Quality education programs designed to meet diverse learning needs and abilities.', icon: GraduationCap, theme: 'education', href: '/inclusive-education' },
  { title: 'Assistive Technology', text: 'Assistive devices that promote independence, movement, and everyday accessibility.', icon: Accessibility, theme: 'skills', href: '/assistive-technology' },
  { title: 'Vocational Training', text: 'Inclusive initiatives that build confidence, participation, and long-term empowerment.', icon: Users, theme: 'community', href: '/vocational-training' },
];

export default function Donate() {
  const zeffyLink = import.meta.env.VITE_ZEFFY_DONATE_URL;
  const handleDonate = () => zeffyLink ? window.open(zeffyLink, '_blank', 'noopener,noreferrer') : alert('Online donations will be available shortly.');
  return <section className="donate container-wide">
    <h2 className="centered-title">Support Our Mission</h2>
    <p className="section-intro">Learn how your support enables independence, inclusion, and opportunity.</p>
    <div className="donate-grid">{programs.map(({ title, text, icon: Icon, theme, href }) => <a className="donate-card program-card" href={href} key={title}>
      <div className={`card-media ${theme}`}>{createElement(Icon, { size: 28 })}</div><h3>{title}</h3><p>{text}</p><span className="card-link">Learn more <span aria-hidden="true">→</span></span>
    </a>)}</div>
    <div className="donate-action"><button className="btn primary donate-cta active" onClick={handleDonate}>Donate Now</button><small>Secure checkout powered by Zeffy</small></div>
  </section>;
}

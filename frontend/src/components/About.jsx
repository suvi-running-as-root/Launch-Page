import logo from '../assets/logo.png';

export default function About() {
  return <section id="about" className="about container-wide">
    <div className="about-layout about-layout-expanded">
      <div className="about-copy">
        <h2>About Us</h2>
        <p>Amar Seva Sangam USA is the American chapter of a global movement to empower persons with disabilities. We connect donors and volunteers in the United States to life-changing rehabilitation, education, and community programs in India.</p>
        <h3>Our Mission</h3>
        <p>To empower persons with disabilities by advancing inclusive, community-driven support systems, providing a full range of education and rehabilitation services, and mobilising resources globally.</p>
        <a className="btn hero-secondary-cta" href="/about-us">Learn more about us</a>
      </div>
      <div className="about-logo-panel">
        <img src={logo} alt="Amar Seva Sangam USA" className="about-logo" />
      </div>
    </div>
  </section>;
}

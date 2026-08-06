import { useEffect, useState } from 'react';
import pic3 from '../assets/pic3.png';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';

const SLIDES = [
  { img: slide1, text: 'Empowering children and adults with disabilities since 1981' },
  { img: slide2, text: 'Community-driven care, education, and rehabilitation' },
  { img: slide3, text: 'Your support helps create inclusive futures' },
];

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    interests: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((i) => (i + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () =>
    setActiveSlide((i) => (i + 1) % SLIDES.length);

  const prevSlide = () =>
    setActiveSlide((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch(`${apiBase}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error();
      }

      setStatus('success');
      setForm({ name: '', email: '', interests: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="signup container-wide">
      {/* Banner */}
      <img
        src={pic3}
        alt="Community members engaging with programs"
        className="signup-media"
      />

      <h2>Get in touch</h2>
      <p>
        Share your details and interests so we can reach out with relevant
        updates about our programs, events, and volunteer opportunities.
      </p>

      {/* TWO COLUMN LAYOUT */}
      <div className="signup-layout">
        {/* LEFT — CAROUSEL */}
        <div className="signup-left">
          <div className="signup-carousel">
            <img
              src={SLIDES[activeSlide].img}
              alt=""
              className="carousel-image"
            />

            <p className="carousel-text">
              {SLIDES[activeSlide].text}
            </p>

            <button
              type="button"
              className="carousel-btn left"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ‹
            </button>

            <button
              type="button"
              className="carousel-btn right"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>

        {/* RIGHT — FORM / SUCCESS */}
        <div className="signup-right">
          {status === 'success' ? (
            <div className="success-box" role="status">
              <h3>Message sent 🎉</h3>
              <p>
                Thank you for getting in touch. We’ll keep you updated on
                programs, events, and volunteer opportunities.
              </p>
            </div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Interests (optional)
                <input
                  type="text"
                  name="interests"
                  value={form.interests}
                  onChange={handleChange}
                />
              </label>

              <button
                type="submit"
                className="btn primary"
                disabled={loading}
              >
                {loading ? 'Submitting…' : 'Send'}
              </button>

              {status === 'error' && (
                <div className="error">
                  Something went wrong. Please try again.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';
// src/app/page.js — Landing Page
import { useEffect, useState } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const MENU_SECTIONS = [
  {
    icon: '☕', title: 'Kopi Signature',
    desc: 'Racikan barista kami dari biji pilihan, diseduh dengan penuh perhatian setiap harinya.',
    items: [
      { name: 'Kopi Hitam',    price: 'Rp 12k' },
      { name: 'Kopi Susu',     price: 'Rp 18k' },
      { name: 'V60 Pour Over', price: 'Rp 22k' },
      { name: 'Kopi Aren',     price: 'Rp 20k' },
      { name: 'Es Kopi Susu',  price: 'Rp 20k' },
    ],
  },
  {
    icon: '🧃', title: 'Non-Kopi & Teh',
    desc: 'Buat yang tidak nge-kopi, kami punya banyak pilihan minuman segar dan hangat.',
    items: [
      { name: 'Matcha Latte',  price: 'Rp 22k' },
      { name: 'Teh Susu',      price: 'Rp 15k' },
      { name: 'Lemon Tea',     price: 'Rp 15k' },
      { name: 'Coklat Panas',  price: 'Rp 18k' },
      { name: 'Jus Alpukat',   price: 'Rp 22k' },
    ],
  },
  {
    icon: '🍱', title: 'Makanan & Snack',
    desc: 'Peneman ngopi yang pas, dari yang ringan sampai yang bisa jadi makan malam.',
    items: [
      { name: 'Roti Bakar Coklat',   price: 'Rp 18k' },
      { name: 'Nasi Goreng Spesial', price: 'Rp 28k' },
      { name: 'Pisang Goreng',       price: 'Rp 15k' },
      { name: 'Croissant Butter',    price: 'Rp 20k' },
      { name: 'Brownies',            price: 'Rp 18k' },
    ],
  },
];

const FEATURES = [
  { icon: '🌿', title: 'Full Outdoor',  desc: 'Nikmati angin sore Pontianak sambil ngopi' },
  { icon: '☕', title: 'Kopi Lokal',   desc: 'Biji pilihan dari petani Kalimantan' },
  { icon: '🎵', title: 'Live Musik',   desc: 'Jumat & Sabtu malam, mulai pukul 20:00' },
  { icon: '📶', title: 'WiFi Kencang', desc: 'Cocok buat WFE — Work From Everything' },
];

const ATM_CELLS = [
  { emoji: '🌿', label: 'Area Hijau · Outdoor', tall: true,  bg: 'linear-gradient(160deg,#1A2A12,#0F3A0C 40%,#0D1A0A)' },
  { emoji: '☕', label: 'Pojok Barista',         tall: false, bg: 'linear-gradient(160deg,#2A1A0A,#1A0C05)' },
  { emoji: '🌙', label: 'Malam Hari',            tall: false, bg: 'linear-gradient(160deg,#0A1A0A,#162810)' },
  { emoji: '🎵', label: 'Live Musik',             tall: false, bg: 'linear-gradient(160deg,#1A0C05,#2D1A0A)' },
  { emoji: '🌅', label: 'Golden Hour',            tall: false, bg: 'linear-gradient(160deg,#0D1A08,#1A2D10)' },
];

/* ─────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Scroll listener → sticky nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Kunci scroll saat mobile nav buka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.setAttribute('data-visible', '1');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    /* Wrapper div menggantikan <body> styling — override bg-cream-100 dari root layout */
    <div className="tn-root">
      <style>{STYLES}</style>

      {/* ── Mobile Nav Overlay ── */}
      {mobileOpen && (
        <div className="tn-mobile-nav">
          <button className="tn-mobile-close" onClick={closeMobile}>✕</button>
          {[
            ['#about',      'Tentang'],
            ['#menu',       'Menu'],
            ['#atmosphere', 'Suasana'],
            ['#info',       'Lokasi'],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={closeMobile}>{label}</a>
          ))}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`tn-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="tn-nav-logo">☕ Teman Ngopi</div>
        <ul className="tn-nav-links">
          <li><a href="#about">Tentang</a></li>
          <li><a href="#menu">Menu</a></li>
          <li><a href="#atmosphere">Suasana</a></li>
          <li><a href="#info">Lokasi</a></li>
        </ul>
        <a href="#info" className="tn-nav-cta">Kunjungi Kami</a>
        <button
          className="tn-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="tn-hero">
        <div className="tn-hero-inner">
          <div className="tn-hero-eyebrow">
            Outdoor Coffee Experience · Pontianak
          </div>
          <h1 className="tn-hero-title">
            Teman<br /><em>Ngopi</em>
          </h1>
          <div className="tn-hero-divider" />
          <p className="tn-hero-subtitle">
            Di bawah langit terbuka, di antara angin sore.<br />
            Nikmati kopi yang nyata, di tempat yang terasa seperti rumah.
          </p>
          <div className="tn-hero-actions">
            <a href="#menu" className="tn-btn-primary">☕ Lihat Menu</a>
            <a href="#info" className="tn-btn-ghost">📍 Temukan Kami</a>
          </div>
          <div className="tn-hero-badges">
            {[['30+','Pilihan Menu'],['★ 4.9','Rating Tamu'],['08–22','Jam Buka']].map(([num, lbl]) => (
              <div key={lbl} className="tn-badge-item">
                <strong>{num}</strong>
                <span>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steam particles */}
        <div className="tn-steam">
          <div className="tn-steam-p" style={{ '--dur': '3.5s', '--delay': '0s' }} />
          <div className="tn-steam-p" style={{ '--dur': '4.2s', '--delay': '.7s' }} />
          <div className="tn-steam-p" style={{ '--dur': '3s',   '--delay': '1.4s' }} />
        </div>

        <div className="tn-scroll-hint">
          <span>Scroll</span>
          <div className="tn-scroll-line" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT
      ══════════════════════════════════════ */}
      <section className="tn-section tn-about">
        <div className="tn-container">
          <div className="tn-about-grid">

            {/* Visual kolom */}
            <div className="tn-about-visual" data-reveal>
              <div className="tn-about-frame">
                <div className="tn-about-img">🌿</div>
                <div className="tn-about-overlay" />
              </div>
              <div className="tn-about-badge">
                <div className="tn-about-badge-num">2+</div>
                <div className="tn-about-badge-lbl">Tahun<br />Melayani</div>
              </div>
            </div>

            {/* Teks */}
            <div className="tn-about-text" data-reveal style={{ transitionDelay: '.15s' }}>
              <div className="tn-section-label">Tentang Kami</div>
              <h2>Lebih dari<br />sekadar <em>kopi</em></h2>
              <p>
                Teman Ngopi lahir dari satu keyakinan sederhana — ngopi paling enak
                itu bukan di dalam ruangan ber-AC, tapi di bawah pohon, diterpa angin,
                dengan suara alam sebagai latar.
              </p>
              <p>
                Kami adalah kafe outdoor yang didesain untuk menjadi pelarian harianmu.
                Kursi-kursi kami tersebar di antara tanaman hijau, lampu hangat,
                dan langit yang terus berubah warna dari siang ke senja.
              </p>
              <div className="tn-features">
                {FEATURES.map(f => (
                  <div key={f.title} className="tn-feat">
                    <span className="tn-feat-icon">{f.icon}</span>
                    <div>
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MENU
      ══════════════════════════════════════ */}
      <section className="tn-section tn-menu-section">
        <div className="tn-container">
          <div className="tn-menu-header" data-reveal>
            <div className="tn-section-label" style={{ justifyContent: 'center' }}>
              Pilihan Kami
            </div>
            <h2>Menu <em>Favorit</em></h2>
            <p>Dari kopi single origin hingga camilan gurih yang bikin betah.</p>
          </div>

          <div className="tn-menu-grid">
            {MENU_SECTIONS.map((sec, i) => (
              <div
                key={sec.title}
                className="tn-menu-card"
                data-reveal
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="tn-menu-card-icon">{sec.icon}</span>
                <h3>{sec.title}</h3>
                <p>{sec.desc}</p>
                <ul className="tn-menu-items">
                  {sec.items.map(item => (
                    <li key={item.name}>
                      {item.name}
                      <span>{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="tn-menu-cta" data-reveal>
            <p>Menu lengkap tersedia di meja kami</p>
            <Link href="/menu" className="tn-btn-primary">🍽️ Lihat Menu Lengkap</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUOTE
      ══════════════════════════════════════ */}
      <section className="tn-section tn-quote-section">
        <div className="tn-container">
          <blockquote className="tn-quote" data-reveal>
            "Kopi itu bukan hanya minuman.<br />
            Ia adalah alasan untuk <em>berhenti sejenak</em>,<br />
            menarik napas, dan menikmati saat ini."
          </blockquote>
          <p className="tn-quote-author" data-reveal style={{ transitionDelay: '.2s' }}>
            — Teman Ngopi, Pontianak
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ATMOSPHERE
      ══════════════════════════════════════ */}
      <section className="tn-section tn-atm-section">
        <div className="tn-container">
          <div className="tn-atm-header" data-reveal>
            <div className="tn-section-label">Suasana</div>
            <h2>Tempat yang <em>menyambut</em></h2>
            <p>Setiap sudut dirancang agar kamu betah berlama-lama, sendiri maupun bersama.</p>
          </div>

          <div className="tn-atm-grid" data-reveal style={{ transitionDelay: '.15s' }}>
            {ATM_CELLS.map(cell => (
              <div
                key={cell.label}
                className={`tn-atm-cell${cell.tall ? ' tall' : ''}`}
                style={{ background: cell.bg }}
              >
                <div className="tn-atm-overlay" />
                <div className="tn-atm-emoji">{cell.emoji}</div>
                <span className="tn-atm-label">{cell.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO / LOKASI
      ══════════════════════════════════════ */}
      <section className="tn-section tn-info-section">
        <div className="tn-container">
          <div className="tn-info-grid">

            <div className="tn-info-left">
              <div className="tn-section-label" data-reveal>Kunjungi Kami</div>
              <h2 className="tn-info-h2" data-reveal style={{ transitionDelay: '.1s' }}>
                Selalu ada,<br /><em>selalu hangat</em>
              </h2>
              <p className="tn-info-p" data-reveal style={{ transitionDelay: '.2s' }}>
                Kami buka setiap hari. Hujan atau cerah, kopi kami tetap mengepul
                dan kursi-kursi kami selalu siap menyambutmu.
              </p>

              <div className="tn-info-rows" data-reveal style={{ transitionDelay: '.3s' }}>
                {[
                  { icon: '📍', title: 'Alamat',             lines: ['Jl. [Alamat Lengkap]', 'Pontianak, Kalimantan Barat'] },
                  { icon: '🕗', title: 'Jam Buka',           lines: ['Senin – Minggu: 08:00 – 22:00', 'Live Musik: Jumat & Sabtu · 20:00'] },
                  { icon: '📱', title: 'Kontak & Reservasi', lines: ['WhatsApp: 0812-XXXX-XXXX', 'Instagram: @temanngopi'] },
                ].map(row => (
                  <div key={row.title} className="tn-info-row">
                    <div className="tn-info-row-icon">{row.icon}</div>
                    <div>
                      <strong>{row.title}</strong>
                      <span>{row.lines[0]}<br />{row.lines[1]}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div data-reveal style={{ transitionDelay: '.4s' }}>
                <a
                  href="https://wa.me/62812XXXXXXXX"
                  className="tn-btn-primary"
                  style={{ display: 'inline-flex' }}
                >
                  💬 Chat di WhatsApp
                </a>
              </div>
            </div>

            {/* Map placeholder */}
            <div data-reveal style={{ transitionDelay: '.3s' }}>
              <div className="tn-map">
                <div className="tn-map-grid" />
                <div className="tn-map-pin">📍</div>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <strong>Teman Ngopi</strong>
                  <p>Pontianak, Kalimantan Barat<br />Klik untuk buka di Google Maps</p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="tn-map-link"
                >
                  Buka di Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="tn-footer">
        <div className="tn-footer-inner">
          <div className="tn-footer-logo">
            ☕ Teman Ngopi
            <span>Outdoor Coffee · Pontianak</span>
          </div>
          <div className="tn-footer-socials">
            <a href="#" className="tn-social" aria-label="Instagram">📸</a>
            <a href="#" className="tn-social" aria-label="WhatsApp">💬</a>
            <a href="#" className="tn-social" aria-label="TikTok">🎵</a>
          </div>
          <p className="tn-footer-copy">© 2025 Teman Ngopi · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STYLES — semua pakai prefix "tn-" agar tidak konflik
   dengan Tailwind / globals.css milik halaman POS
───────────────────────────────────────────────────────── */
const STYLES = `
/* ── Reset dalam scope landing ── */
.tn-root {
  --espresso: #1C0F07;
  --amber:    #C8712A;
  --gold:     #E8A84C;
  --honey:    #F5C97A;
  --cream:    #FDF4E7;
  --sage:     #6B8F5E;
  --ff-serif: var(--font-cormorant, 'Georgia', serif);
  --ff-sans:  var(--font-jost, 'system-ui', sans-serif);

  font-family: var(--ff-sans);
  background: var(--espresso);
  color: var(--cream);
  overflow-x: hidden;
  /* grain */
  position: relative;
}
.tn-root::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .025; pointer-events: none; z-index: 1000;
}
.tn-root *, .tn-root *::before, .tn-root *::after {
  box-sizing: border-box;
}
.tn-root a { color: inherit; text-decoration: none; }

/* ── Nav ── */
.tn-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 3rem;
  transition: background .4s;
}
.tn-nav.scrolled {
  background: rgba(28,15,7,.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(200,113,42,.15);
}
.tn-nav-logo {
  font-family: var(--ff-serif);
  font-size: 1.4rem; font-weight: 700;
  letter-spacing: .04em; color: var(--honey);
}
.tn-nav-links {
  display: flex; gap: 2rem; list-style: none;
}
.tn-nav-links a {
  font-size: .78rem; font-weight: 500; letter-spacing: .14em;
  text-transform: uppercase; color: rgba(253,244,231,.65);
  transition: color .25s;
}
.tn-nav-links a:hover { color: var(--honey); }
.tn-nav-cta {
  font-size: .75rem; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase;
  border: 1px solid var(--amber); color: var(--amber);
  padding: .45rem 1.2rem; border-radius: 2px; transition: all .25s;
}
.tn-nav-cta:hover { background: var(--amber); color: var(--espresso); }
.tn-hamburger {
  display: none; flex-direction: column; gap: 5px;
  cursor: pointer; padding: 4px; background: none; border: none;
}
.tn-hamburger span {
  width: 22px; height: 2px; background: var(--cream); display: block;
}

/* ── Hero ── */
.tn-hero {
  position: relative; min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden; padding: 0 2rem;
}
.tn-hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%,  rgba(200,113,42,.22) 0%, transparent 65%),
    radial-gradient(ellipse 60% 80% at 80% 60%,  rgba(45,74,42,.35) 0%,  transparent 60%),
    radial-gradient(ellipse 50% 40% at 10% 80%,  rgba(61,31,13,.6) 0%,   transparent 70%),
    linear-gradient(170deg,#0D0703 0%,#1C0F07 35%,#2A1508 65%,#1C0F07 100%);
}
.tn-hero::after {
  content: ''; position: absolute; inset: 0;
  background-image:
    radial-gradient(circle, rgba(245,201,122,.7) 1px, transparent 1px),
    radial-gradient(circle, rgba(232,168,76,.5)  1px, transparent 1px),
    radial-gradient(circle, rgba(253,244,231,.4) 1px, transparent 1px);
  background-size: 320px 320px, 200px 200px, 150px 150px;
  background-position: 0 0, 80px 120px, 40px 200px;
  opacity: .35;
  animation: tn-twinkle 6s ease-in-out infinite alternate;
}
@keyframes tn-twinkle { 0%{opacity:.25} 100%{opacity:.5} }
.tn-hero-inner { position: relative; z-index: 2; text-align: center; max-width: 900px; }

.tn-hero-eyebrow {
  display: inline-flex; align-items: center; gap: .75rem;
  font-size: .7rem; font-weight: 500; letter-spacing: .22em;
  text-transform: uppercase; color: var(--amber); margin-bottom: 2rem;
  animation: tn-fadeup .8s ease both;
}
.tn-hero-eyebrow::before, .tn-hero-eyebrow::after {
  content: ''; width: 32px; height: 1px; background: var(--amber); opacity: .6;
}

.tn-hero-title {
  font-family: var(--ff-serif);
  font-size: clamp(4rem,10vw,8rem); font-weight: 700;
  letter-spacing: -.01em; line-height: .95; color: var(--cream);
  animation: tn-fadeup .8s .15s ease both;
}
.tn-hero-title em { font-style: italic; color: var(--honey); font-weight: 300; }

.tn-hero-subtitle {
  font-size: clamp(.9rem,1.5vw,1.1rem); font-weight: 300;
  letter-spacing: .08em; color: rgba(253,244,231,.55);
  margin-top: 1.5rem; line-height: 1.7;
  animation: tn-fadeup .8s .3s ease both;
}
.tn-hero-divider {
  width: 80px; height: 1px;
  background: linear-gradient(90deg,transparent,var(--amber),transparent);
  margin: 2.5rem auto;
  animation: tn-fadeup .8s .4s ease both;
}
.tn-hero-actions {
  display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
  margin-top: 2.5rem; animation: tn-fadeup .8s .5s ease both;
}
.tn-hero-badges {
  display: flex; gap: 2.5rem; justify-content: center;
  margin-top: 4rem; animation: tn-fadeup .8s .65s ease both;
}
.tn-badge-item {
  display: flex; flex-direction: column; align-items: center; gap: .4rem;
  font-size: .65rem; letter-spacing: .12em; text-transform: uppercase;
  color: rgba(253,244,231,.4);
}
.tn-badge-item strong {
  font-family: var(--ff-serif);
  font-size: 1.8rem; font-weight: 600; color: var(--honey); line-height: 1;
}

/* Scroll hint */
.tn-scroll-hint {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  font-size: .62rem; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(253,244,231,.3);
  animation: tn-fadeup .8s .8s ease both; z-index: 2;
}
.tn-scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, var(--amber), transparent);
  animation: tn-scrollpulse 2s ease-in-out infinite;
}
@keyframes tn-scrollpulse { 0%,100%{opacity:.3} 50%{opacity:1} }

/* Steam */
.tn-steam {
  position: absolute; bottom: 15%; left: calc(50% - 20px);
  display: flex; gap: 12px; z-index: 1; opacity: .4; pointer-events: none;
}
.tn-steam-p {
  width: 2px; height: 30px; border-radius: 1px;
  background: linear-gradient(to top, rgba(253,244,231,.6), transparent);
  animation: tn-steam var(--dur,4s) ease-in-out var(--delay,0s) infinite;
}
@keyframes tn-steam {
  0%   { transform: translateY(0)    scaleX(1);   opacity: .5; }
  50%  { transform: translateY(-60px) scaleX(1.5); opacity: .3; }
  100% { transform: translateY(-120px)scaleX(.5);  opacity: 0;  }
}

/* Buttons */
.tn-btn-primary {
  display: inline-flex; align-items: center; gap: .6rem;
  background: linear-gradient(135deg, var(--amber), var(--gold));
  color: var(--espresso);
  font-size: .8rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
  padding: .85rem 2.2rem; border-radius: 2px; transition: all .3s;
  box-shadow: 0 4px 24px rgba(200,113,42,.35);
}
.tn-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(200,113,42,.5); }
.tn-btn-ghost {
  display: inline-flex; align-items: center; gap: .6rem;
  border: 1px solid rgba(253,244,231,.25); color: rgba(253,244,231,.75);
  font-size: .8rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase;
  padding: .85rem 2.2rem; border-radius: 2px; transition: all .3s;
}
.tn-btn-ghost:hover { border-color: var(--cream); color: var(--cream); }

/* Section base */
.tn-section { padding: 7rem 2rem; position: relative; }
.tn-container { max-width: 1200px; margin: 0 auto; }
.tn-section-label {
  font-size: .65rem; font-weight: 500; letter-spacing: .22em; text-transform: uppercase;
  color: var(--amber); margin-bottom: 1rem;
  display: flex; align-items: center; gap: .75rem;
}
.tn-section-label::before { content: ''; width: 24px; height: 1px; background: var(--amber); }
.tn-root h2 {
  font-family: var(--ff-serif); font-weight: 600; line-height: 1.05;
}
.tn-root h2 em { font-style: italic; }
.tn-root h3 { font-family: var(--ff-serif); font-weight: 600; }

/* Reveal */
@keyframes tn-fadeup { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
[data-reveal] { opacity: 0; transform: translateY(30px); transition: opacity .7s ease, transform .7s ease; }
[data-reveal][data-visible] { opacity: 1; transform: translateY(0); }

/* ── About ── */
.tn-about { background: linear-gradient(180deg,var(--espresso) 0%,#120A04 100%); overflow: hidden; }
.tn-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }
.tn-about-visual { position: relative; }
.tn-about-frame { aspect-ratio: 3/4; border-radius: 4px; overflow: hidden; position: relative; }
.tn-about-img {
  width: 100%; height: 100%;
  background: radial-gradient(ellipse at 30% 40%,rgba(200,113,42,.3),transparent 60%),
              radial-gradient(ellipse at 70% 70%,rgba(45,74,42,.4),transparent 60%),
              linear-gradient(160deg,#1A0C05,#2D1A0A 50%,#1A2A18);
  display: flex; align-items: center; justify-content: center;
  font-size: 7rem; text-shadow: 0 0 80px rgba(200,113,42,.6);
}
.tn-about-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top,rgba(18,10,4,.8) 0%,transparent 50%);
}
.tn-about-badge {
  position: absolute; bottom: -2rem; right: -2rem;
  width: 160px; height: 160px;
  border: 1px solid rgba(200,113,42,.25); border-radius: 4px;
  background: rgba(28,15,7,.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .25rem;
  backdrop-filter: blur(8px);
}
.tn-about-badge-num {
  font-family: var(--ff-serif); font-size: 3rem; font-weight: 700; color: var(--honey); line-height: 1;
}
.tn-about-badge-lbl {
  font-size: .6rem; letter-spacing: .15em; text-transform: uppercase;
  color: rgba(253,244,231,.4); text-align: center;
}
.tn-about-text h2 { font-size: clamp(2.5rem,4vw,3.8rem); color: var(--cream); margin-bottom: 1.5rem; }
.tn-about-text h2 em { color: var(--honey); }
.tn-about-text p {
  font-size: .95rem; line-height: 1.85; color: rgba(253,244,231,.55);
  margin-bottom: 1.25rem; font-weight: 300;
}
.tn-features { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-top: 2.5rem; }
.tn-feat {
  display: flex; align-items: flex-start; gap: .75rem; padding: 1rem;
  border: 1px solid rgba(200,113,42,.12); border-radius: 4px;
  background: rgba(200,113,42,.04); transition: all .3s;
}
.tn-feat:hover { border-color: rgba(200,113,42,.35); background: rgba(200,113,42,.08); }
.tn-feat-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: .1rem; }
.tn-feat strong { display: block; font-size: .8rem; font-weight: 600; color: var(--honey); margin-bottom: .2rem; letter-spacing:.04em }
.tn-feat span   { font-size: .75rem; color: rgba(253,244,231,.45); line-height: 1.5; }

/* ── Menu ── */
.tn-menu-section { background: #0D0703; overflow: hidden; }
.tn-menu-header { text-align: center; margin-bottom: 4rem; }
.tn-menu-header h2 { font-size: clamp(2.8rem,5vw,4.5rem); color: var(--cream); margin: 1rem 0 .5rem; }
.tn-menu-header h2 em { color: var(--honey); }
.tn-menu-header p { font-size: .9rem; color: rgba(253,244,231,.45); font-weight: 300; }
.tn-menu-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
.tn-menu-card {
  padding: 2rem 1.75rem;
  border: 1px solid rgba(200,113,42,.12); border-radius: 4px;
  background: linear-gradient(160deg,rgba(61,31,13,.4),rgba(18,10,4,.8));
  position: relative; overflow: hidden; transition: all .4s;
}
.tn-menu-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%,rgba(200,113,42,.12),transparent 70%);
  opacity: 0; transition: opacity .4s;
}
.tn-menu-card:hover { border-color: rgba(200,113,42,.35); transform: translateY(-4px); }
.tn-menu-card:hover::before { opacity: 1; }
.tn-menu-card-icon { font-size: 2.5rem; margin-bottom: 1.25rem; display: block; }
.tn-menu-card h3 { font-size: 1.4rem; color: var(--honey); margin-bottom: .5rem; font-weight: 600; }
.tn-menu-card p  { font-size: .8rem; line-height: 1.7; color: rgba(253,244,231,.45); font-weight: 300; margin-bottom: 1.5rem; }
.tn-menu-items { list-style: none; display: flex; flex-direction: column; gap: .5rem; }
.tn-menu-items li {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .78rem; padding: .4rem 0;
  border-bottom: 1px solid rgba(253,244,231,.06); color: rgba(253,244,231,.65);
}
.tn-menu-items li:last-child { border: none; }
.tn-menu-items li span { color: var(--amber); font-weight: 500; }
.tn-menu-cta { text-align: center; margin-top: 3.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.tn-menu-cta p { font-size: .82rem; color: rgba(253,244,231,.4); letter-spacing: .06em; }

/* ── Quote ── */
.tn-quote-section { background: #0D0703; padding: 5rem 2rem; text-align: center; overflow: hidden; position: relative; }
.tn-quote-section::before {
  content: '"'; position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);
  font-family: var(--ff-serif); font-size: 25rem; font-weight: 700; line-height: 1;
  color: rgba(200,113,42,.05); pointer-events: none;
}
.tn-quote {
  font-family: var(--ff-serif);
  font-size: clamp(1.8rem,3.5vw,3rem); font-weight: 300; font-style: italic;
  color: var(--cream); max-width: 800px; margin: 0 auto; line-height: 1.4;
  position: relative; z-index: 1;
}
.tn-quote em { color: var(--honey); font-style: normal; font-weight: 600; }
.tn-quote-author {
  margin-top: 1.5rem; font-size: .7rem; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(253,244,231,.35); position: relative; z-index: 1;
}

/* ── Atmosphere ── */
.tn-atm-section { background: linear-gradient(180deg,#0D0703 0%,#0A1A08 50%,#0D0703 100%); overflow: hidden; }
.tn-atm-header { margin-bottom: 3.5rem; }
.tn-atm-header h2 { font-size: clamp(2.5rem,4vw,3.8rem); color: var(--cream); margin: 1rem 0 .75rem; }
.tn-atm-header h2 em { color: var(--sage); }
.tn-atm-header p { font-size: .9rem; color: rgba(253,244,231,.45); font-weight: 300; max-width: 500px; line-height: 1.7; }
.tn-atm-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 260px 260px;
  gap: 1rem;
}
.tn-atm-cell {
  border-radius: 4px; overflow: hidden; position: relative;
  display: flex; align-items: flex-end; padding: 1.5rem;
  transition: transform .4s;
}
.tn-atm-cell:hover { transform: scale(1.02); }
.tn-atm-cell.tall { grid-row: span 2; }
.tn-atm-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 50%);
}
.tn-atm-emoji {
  position: absolute; font-size: 4rem; opacity: .15;
  top: 50%; left: 50%; transform: translate(-50%,-70%);
}
.tn-atm-cell.tall .tn-atm-emoji { font-size: 8rem; opacity: .12; }
.tn-atm-label {
  position: relative; z-index: 2;
  font-size: .68rem; letter-spacing: .15em; text-transform: uppercase;
  color: rgba(253,244,231,.5); text-shadow: 0 1px 6px rgba(0,0,0,.8);
}

/* ── Info ── */
.tn-info-section { background: linear-gradient(180deg,#0D0703 0%,#120A04 100%); overflow: hidden; }
.tn-info-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 5rem; align-items: start; }
.tn-info-h2 { font-size: clamp(2.5rem,4vw,3.8rem); color: var(--cream); margin: 1rem 0 1.5rem; line-height: 1.1; }
.tn-info-h2 em { color: var(--honey); }
.tn-info-p { font-size: .9rem; color: rgba(253,244,231,.5); line-height: 1.8; margin-bottom: 2rem; font-weight: 300; }
.tn-info-rows { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 3rem; }
.tn-info-row {
  display: flex; align-items: flex-start; gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(200,113,42,.12); border-radius: 4px;
  background: rgba(200,113,42,.03);
}
.tn-info-row-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: rgba(200,113,42,.12); border-radius: 4px;
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.tn-info-row strong {
  display: block; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--amber); margin-bottom: .3rem;
}
.tn-info-row span { font-size: .87rem; color: rgba(253,244,231,.7); line-height: 1.6; }

/* Map */
.tn-map {
  aspect-ratio: 1; border-radius: 4px; overflow: hidden;
  background: radial-gradient(circle at 50% 50%,rgba(45,74,42,.3),transparent 60%),
              linear-gradient(160deg,#0F1F0C,#0A0E09);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1rem; border: 1px solid rgba(200,113,42,.12); position: relative;
}
.tn-map-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(200,113,42,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200,113,42,.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
.tn-map-pin {
  font-size: 3rem; position: relative; z-index: 1;
  animation: tn-pin 2s ease-in-out infinite;
}
@keyframes tn-pin { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.tn-map strong { color: var(--amber); display: block; font-size: .9rem; margin-bottom: .25rem; }
.tn-map p { font-size: .8rem; color: rgba(253,244,231,.4); line-height: 1.6; text-align: center; }
.tn-map-link {
  font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--amber); border: 1px solid rgba(200,113,42,.4);
  padding: .5rem 1.25rem; border-radius: 2px; transition: all .25s;
  position: relative; z-index: 1;
}
.tn-map-link:hover { background: rgba(200,113,42,.15); }

/* ── Footer ── */
.tn-footer { background: #0A0602; padding: 3rem 2rem; border-top: 1px solid rgba(200,113,42,.1); }
.tn-footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem;
}
.tn-footer-logo {
  font-family: var(--ff-serif); font-size: 1.5rem; font-weight: 700; color: var(--honey);
}
.tn-footer-logo span {
  display: block; font-family: var(--ff-sans);
  font-size: .65rem; letter-spacing: .2em; text-transform: uppercase;
  color: rgba(253,244,231,.3); margin-top: .2rem;
}
.tn-footer-socials { display: flex; gap: 1rem; }
.tn-social {
  width: 38px; height: 38px;
  border: 1px solid rgba(200,113,42,.2); border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; transition: all .25s; color: rgba(253,244,231,.5);
}
.tn-social:hover { border-color: var(--amber); color: var(--amber); background: rgba(200,113,42,.08); }
.tn-footer-copy { font-size: .68rem; letter-spacing: .08em; color: rgba(253,244,231,.2); }

/* ── Mobile Nav ── */
.tn-mobile-nav {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(18,10,4,.98); backdrop-filter: blur(20px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem;
}
.tn-mobile-nav a {
  font-family: var(--ff-serif);
  font-size: 2.5rem; font-weight: 600; color: var(--cream); transition: color .2s;
}
.tn-mobile-nav a:hover { color: var(--honey); }
.tn-mobile-close {
  position: absolute; top: 1.5rem; right: 1.5rem;
  font-size: 1.5rem; color: rgba(253,244,231,.5);
  cursor: pointer; background: none; border: none; transition: color .2s;
}
.tn-mobile-close:hover { color: var(--cream); }

/* ── Responsive ── */
@media(max-width: 900px) {
  .tn-nav { padding: 1rem 1.5rem; }
  .tn-nav-links, .tn-nav-cta { display: none; }
  .tn-hamburger { display: flex; }
  .tn-about-grid { grid-template-columns: 1fr; gap: 3rem; }
  .tn-about-visual { display: none; }
  .tn-menu-grid { grid-template-columns: 1fr; }
  .tn-atm-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
  .tn-atm-cell.tall { grid-row: span 1; min-height: 200px; }
  .tn-atm-cell { min-height: 160px; }
  .tn-info-grid { grid-template-columns: 1fr; gap: 3rem; }
  .tn-section { padding: 5rem 1.5rem; }
  .tn-hero-badges { gap: 1.5rem; }
}
@media(max-width: 600px) {
  .tn-atm-grid { grid-template-columns: 1fr; }
  .tn-features { grid-template-columns: 1fr; }
  .tn-hero-title { font-size: 3.5rem; }
}
`;

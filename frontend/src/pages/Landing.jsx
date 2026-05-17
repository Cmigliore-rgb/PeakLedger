import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BG       = '#0a0a0a';
const CARD     = '#111111';
const BORDER   = 'rgba(255,255,255,0.08)';
const TEXT     = '#f1f5f9';
const TEXT2    = '#94a3b8';
const TEXT3    = '#475569';
const BLUE     = '#2563eb';
const BLUE_BTN = '#0066f5';
const GREEN    = '#4ade80';
const PURPLE   = '#c084fc';
const YELLOW   = '#fbbf24';

const DOWNLOAD_URL = 'https://github.com/Cmigliore-rgb/basis/releases/download/v1.0.0/PeakLedger.Setup.1.0.0.exe';

const FEATURES = [
  {
    icon: '◎', color: '#60a5fa',
    title: 'Live Financial Dashboard',
    desc: 'Connect your accounts and see your net worth, cash flow, spending breakdowns, and investment portfolio update in real time.',
  },
  {
    icon: '◫', color: GREEN,
    title: 'Personal Finance Education',
    desc: 'Work through real assignments on budgeting, tax analysis, and investment modeling tied to actual course curriculum.',
  },
  {
    icon: '⊞', color: PURPLE,
    title: 'Professor Hub',
    desc: 'Instructors get a live view of class progress with submissions, grades, engagement metrics, and one-click feedback.',
  },
  {
    icon: '◈', color: YELLOW,
    title: 'Live Market Data',
    desc: 'S&P 500, sector performance, the fear and greed index, yield curve, and macro indicators all in one panel.',
  },
  {
    icon: '◉', color: '#f87171',
    title: 'Tax Planning Tools',
    desc: 'Model federal tax brackets, compare deductions, and estimate your effective rate across different income scenarios.',
  },
  {
    icon: '⬡', color: '#34d399',
    title: 'Goals and Net Worth Tracking',
    desc: 'Set savings targets, track monthly snapshots, and watch your net worth grow over time with visual progress charts.',
  },
];

const STEPS = [
  { n: '01', title: 'Create your account',   desc: 'Sign up free in under a minute. No credit card required.' },
  { n: '02', title: 'Connect your finances', desc: 'Link bank accounts and investment portfolios securely via Plaid.' },
  { n: '03', title: 'Learn and track',       desc: 'Work through assignments, explore your data, and build real financial literacy.' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        transition: 'all 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-icon.png?v=7" alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.5px' }}>PeakLedger</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            style={{ padding: '8px 16px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, color: '#60a5fa', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Register
          </button>
          <a href={DOWNLOAD_URL} download
            style={{ padding: '8px 16px', background: BLUE_BTN, borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Download
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Blue radial glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 28, letterSpacing: '0.3px' }}>
          Free to use · No credit card required
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 800, letterSpacing: '0', lineHeight: 1.05, margin: '0 0 24px', maxWidth: 820, color: TEXT, fontKerning: 'normal', fontFeatureSettings: '"kern" 1, "liga" 0, "calt" 0', textRendering: 'optimizeLegibility' }}>
          <span style={{ letterSpacing: '-0.07em' }}>Y</span>our finances,<br />
          <span style={{ color: BLUE_BTN }}>finally in focus.</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: TEXT2, maxWidth: 520, lineHeight: 1.7, margin: '0 0 40px' }}>
          PeakLedger brings together a live personal finance dashboard and hands-on education tools for students, instructors, and anyone who wants to get serious about their money.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')}
            style={{ padding: '14px 32px', background: BLUE_BTN, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,102,245,0.35)' }}>
            Get Started Free
          </button>
          <a href={DOWNLOAD_URL} download
            style={{ padding: '14px 32px', background: CARD, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>↓</span> Download for Windows
          </a>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: TEXT3 }}>Free to use. No credit card required. Windows desktop app available.</p>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '0 0 12px', color: TEXT }}>Everything in one place</h2>
          <p style={{ fontSize: 17, color: TEXT2, margin: 0 }}>Tools that work together so you can focus on learning, not switching apps.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 28px', transition: 'box-shadow 0.2s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: `${f.color}15`, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: f.color, marginBottom: 18 }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px', color: TEXT }}>{f.title}</div>
              <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 40px', borderTop: `1px solid ${BORDER}`, background: CARD }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '0 0 12px', color: TEXT }}>Up and running in minutes</h2>
          <p style={{ fontSize: 17, color: TEXT2, marginBottom: 56 }}>Use PeakLedger in your browser or download the desktop app. Your account works the same either way.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', textAlign: 'left', paddingBottom: i < STEPS.length - 1 ? 36 : 0, marginBottom: i < STEPS.length - 1 ? 36 : 0, borderBottom: i < STEPS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: BLUE_BTN, letterSpacing: '1px', minWidth: 28, paddingTop: 2 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: TEXT }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section style={{ padding: '80px 40px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Security</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '0 0 14px', color: TEXT }}>Bank-level security, built in</h2>
            <p style={{ fontSize: 17, color: TEXT2, margin: '0 auto', maxWidth: 540, lineHeight: 1.65 }}>
              Your financial data is handled with the same security standards as the institutions that hold it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: GREEN, marginBottom: 18 }}>⊕</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: TEXT }}>Bank connections via Plaid</div>
              <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.65, marginBottom: 16 }}>
                Plaid is the financial data platform trusted by Venmo, Robinhood, Coinbase, and thousands of other apps. Your bank login goes directly to Plaid; PeakLedger never sees or stores your credentials.
              </div>
              {[
                'Read-only access: Plaid can never move or modify your money',
                'Bank credentials go to Plaid directly, never to our servers',
                '256-bit AES encryption in transit and at rest',
                'OAuth connections supported by major banks',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: GREEN, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(99,91,255,0.1)', border: '1px solid rgba(99,91,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: PURPLE, marginBottom: 18 }}>◈</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: TEXT }}>Payments via Stripe</div>
              <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.65, marginBottom: 16 }}>
                All billing is handled by Stripe, the payment infrastructure behind millions of businesses worldwide. Your card number never touches PeakLedger's servers at any point in the transaction.
              </div>
              {[
                'PCI DSS Level 1 certified, the highest payment security standard',
                'Card data is tokenized and stored only by Stripe',
                '3D Secure authentication supported',
                'Cancel your subscription anytime from Settings',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: PURPLE, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#60a5fa', marginBottom: 18 }}>◉</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: TEXT }}>Your data, your control</div>
              <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.65, marginBottom: 16 }}>
                We request only the permissions necessary to power your dashboard. Your data is used to show you your own financial picture; nothing is sold or shared with advertisers or third parties.
              </div>
              {[
                'Disconnect any linked account at any time from Settings',
                'Data is never sold to advertisers or third parties',
                'Only the minimum permissions needed to read balances and transactions',
                'Account data stays within PeakLedger and its service providers',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#60a5fa', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>·</span>
                  <span style={{ fontSize: 13, color: TEXT2, lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: TEXT3 }}>Secured by</span>
            <div style={{ background: '#fff', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://www.google.com/s2/favicons?domain=plaid.com&sz=32" alt="Plaid" style={{ width: 18, height: 18, borderRadius: 3 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#000', letterSpacing: '-0.3px' }}>Plaid</span>
            </div>
            <div style={{ background: '#635bff', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://www.google.com/s2/favicons?domain=stripe.com&sz=32" alt="Stripe" style={{ width: 18, height: 18, borderRadius: 3 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section style={{ padding: '80px 40px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: '#0f172a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '56px 48px', boxShadow: '0 0 60px rgba(37,99,235,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', letterSpacing: '1px', marginBottom: 16 }}>DESKTOP APP</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 14px', color: '#f1f5f9' }}>Get the desktop app</h2>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.65, marginBottom: 36 }}>
            The Windows desktop app gives you a dedicated window for PeakLedger. Your account stays in sync across the app and the web.
          </p>
          <a href={DOWNLOAD_URL} download
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: BLUE_BTN, color: '#fff', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,102,245,0.35)' }}>
            <span style={{ fontSize: 20 }}>↓</span> Download for Windows
          </a>
          <p style={{ marginTop: 16, fontSize: 12, color: '#475569' }}>
            Windows 10 and 11. If Windows shows a security prompt, click "More info" then "Run anyway".
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, background: '#050505' }}>
        {/* Main footer grid */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 40px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 40 }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <img src="/logo-icon.png?v=7" alt="" style={{ width: 26, height: 26, borderRadius: 7 }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px' }}>PeakLedger</span>
            </div>
            <p style={{ fontSize: 13, color: TEXT3, lineHeight: 1.7, maxWidth: 220, margin: 0 }}>
              Personal finance tools built for students, professionals, and investors who want clarity over their money.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT2, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => navigate('/register')} style={{ padding: '8px 18px', background: BLUE_BTN, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Get Started</button>
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Product</div>
            {[
              { label: 'Dashboard', action: () => navigate('/register') },
              { label: 'Pricing', action: () => navigate('/pricing') },
              { label: 'Desktop App', action: () => { const a = document.createElement('a'); a.href = DOWNLOAD_URL; a.download = ''; a.click(); } },
              { label: 'Education Mode', action: () => navigate('/register') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{ display: 'block', background: 'none', border: 'none', color: TEXT2, fontSize: 13, cursor: 'pointer', padding: '5px 0', textAlign: 'left', lineHeight: 1.5 }}>{label}</button>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Company</div>
            {[
              { label: 'About', action: () => {} },
              { label: 'Security', action: () => {} },
              { label: 'For Professors', action: () => navigate('/register') },
              { label: 'Contact', action: () => { window.location.href = 'mailto:support@peakledger.app'; } },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{ display: 'block', background: 'none', border: 'none', color: TEXT2, fontSize: 13, cursor: 'pointer', padding: '5px 0', textAlign: 'left', lineHeight: 1.5 }}>{label}</button>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Legal</div>
            {[
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Security Policy', href: 'mailto:security@peakledger.app' },
              { label: 'Responsible Disclosure', href: 'mailto:security@peakledger.app' },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{ display: 'block', color: TEXT2, fontSize: 13, padding: '5px 0', textAlign: 'left', lineHeight: 1.5, textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${BORDER}`, maxWidth: 1100, margin: '0 auto', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: TEXT3 }}>© {new Date().getFullYear()} PeakLedger. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: TEXT3 }}>Built with</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', borderRadius: 5, padding: '3px 9px' }}>
                <img src="https://www.google.com/s2/favicons?domain=plaid.com&sz=32" alt="" style={{ width: 14, height: 14, borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#000' }}>Plaid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#635bff', borderRadius: 5, padding: '3px 9px' }}>
                <img src="https://www.google.com/s2/favicons?domain=stripe.com&sz=32" alt="" style={{ width: 14, height: 14, borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

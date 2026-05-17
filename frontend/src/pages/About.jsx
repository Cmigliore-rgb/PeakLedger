import React from 'react';
import { Link } from 'react-router-dom';

const S = {
  page: { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' },
  back: { display: 'inline-block', marginBottom: 32, fontSize: 13, color: '#94a3b8', textDecoration: 'none' },
  h1:   { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' },
  sub:  { fontSize: 15, color: '#64748b', marginBottom: 48, lineHeight: 1.6 },
  h2:   { fontSize: 17, fontWeight: 700, marginTop: 40, marginBottom: 12, color: '#e2e8f0' },
  p:    { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', marginBottom: 16 },
  ul:   { paddingLeft: 20, marginBottom: 16 },
  li:   { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', marginBottom: 4 },
  a:    { color: '#4da3ff', textDecoration: 'none' },
  card: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '24px 28px', marginBottom: 16 },
};

export default function About() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link to="/" style={S.back}>← Back</Link>

        <h1 style={S.h1}>About PeakLedger</h1>
        <p style={S.sub}>
          Personal finance tools built for students, professionals, and investors who want clarity over their money.
        </p>

        <h2 style={S.h2}>What we built</h2>
        <p style={S.p}>
          PeakLedger is a personal finance platform that combines a live financial dashboard with structured
          education tools. You can connect real bank and investment accounts through Plaid, track spending
          and net worth over time, model tax scenarios, monitor market data, and work through finance
          assignments tied to actual course curriculum.
        </p>
        <p style={S.p}>
          The education side is built around the same material taught in university personal finance courses,
          with a professor hub that gives instructors a live view of student progress, submissions, and engagement.
        </p>

        <h2 style={S.h2}>Why we built it</h2>
        <p style={S.p}>
          Most personal finance apps are built for people who already understand money. PeakLedger is built
          for people still learning. We wanted a single place where you could see your real financial picture
          and build the skills to improve it, without switching between six different tools.
        </p>

        <h2 style={S.h2}>Who it's for</h2>
        <ul style={S.ul}>
          <li style={S.li}>College students learning personal finance for the first time</li>
          <li style={S.li}>Graduates tracking their first paychecks, loans, and investments</li>
          <li style={S.li}>Professionals who want a cleaner view of net worth and cash flow</li>
          <li style={S.li}>Finance professors who want real software in their curriculum</li>
        </ul>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>
          Questions, feedback, or partnership inquiries: <a href="mailto:support@peakledger.app" style={S.a}>support@peakledger.app</a>
        </p>
      </div>
    </div>
  );
}

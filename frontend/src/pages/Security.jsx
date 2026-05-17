import React from 'react';
import { Link } from 'react-router-dom';

const S = {
  page: { minHeight: '100vh', background: '#0f0f0f', color: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  wrap: { maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' },
  back: { display: 'inline-block', marginBottom: 32, fontSize: 13, color: '#94a3b8', textDecoration: 'none' },
  h1:   { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' },
  date: { fontSize: 13, color: '#64748b', marginBottom: 48 },
  h2:   { fontSize: 17, fontWeight: 700, marginTop: 40, marginBottom: 12, color: '#e2e8f0' },
  p:    { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', marginBottom: 16 },
  ul:   { paddingLeft: 20, marginBottom: 16 },
  li:   { fontSize: 14, lineHeight: 1.75, color: '#94a3b8', marginBottom: 4 },
  a:    { color: '#4da3ff', textDecoration: 'none' },
};

export default function Security() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link to="/" style={S.back}>← Back</Link>

        <h1 style={S.h1}>Security Policy</h1>
        <p style={S.date}>Last updated: May 17, 2026</p>

        <h2 style={S.h2}>Our commitment</h2>
        <p style={S.p}>
          Security is a core part of how PeakLedger is built. We handle sensitive financial data and take
          that responsibility seriously. This page describes the measures we take to protect your information.
        </p>

        <h2 style={S.h2}>Data in transit</h2>
        <p style={S.p}>
          All communication between your browser and PeakLedger's servers is encrypted using HTTPS with
          TLS 1.2 or higher. We redirect all HTTP traffic to HTTPS automatically.
        </p>

        <h2 style={S.h2}>Authentication</h2>
        <ul style={S.ul}>
          <li style={S.li}>Passwords are hashed using bcrypt with a cost factor of 10 before storage; plaintext passwords are never stored or logged</li>
          <li style={S.li}>Sessions are authenticated using signed JWT tokens with configurable expiry</li>
          <li style={S.li}>Two-factor authentication (2FA) via email OTP is available to all users</li>
          <li style={S.li}>Login and registration endpoints are rate-limited to mitigate brute-force attacks</li>
          <li style={S.li}>OAuth login via Google and Microsoft is supported as an alternative to passwords</li>
        </ul>

        <h2 style={S.h2}>Financial data and Plaid</h2>
        <p style={S.p}>
          Bank account connections are made through Plaid, a regulated financial data aggregator. PeakLedger
          stores Plaid access tokens server-side only and never transmits them to the client browser. We
          access the minimum data necessary (balances, transactions, holdings) and do not store bank
          credentials of any kind.
        </p>

        <h2 style={S.h2}>Infrastructure</h2>
        <ul style={S.ul}>
          <li style={S.li}>Servers are hosted on Railway, which runs on Google Cloud infrastructure</li>
          <li style={S.li}>HTTP security headers are set via Helmet (X-Frame-Options, X-Content-Type-Options, etc.)</li>
          <li style={S.li}>Error tracking is handled by Sentry; stack traces do not include user financial data</li>
          <li style={S.li}>Database backups are maintained by the hosting provider</li>
        </ul>

        <h2 style={S.h2}>Reporting a vulnerability</h2>
        <p style={S.p}>
          If you discover a security issue, please report it responsibly by emailing{' '}
          <a href="mailto:security@peakledger.app" style={S.a}>security@peakledger.app</a>. Do not disclose
          the issue publicly until we have had a chance to investigate and address it. See our{' '}
          <Link to="/responsible-disclosure" style={S.a}>Responsible Disclosure policy</Link> for details.
        </p>
      </div>
    </div>
  );
}

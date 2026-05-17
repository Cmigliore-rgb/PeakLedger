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

export default function ResponsibleDisclosure() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link to="/" style={S.back}>← Back</Link>

        <h1 style={S.h1}>Responsible Disclosure</h1>
        <p style={S.date}>Last updated: May 17, 2026</p>

        <h2 style={S.h2}>Overview</h2>
        <p style={S.p}>
          We appreciate the work of security researchers and take all reports seriously. If you have
          discovered a potential security vulnerability in PeakLedger, we ask that you give us a reasonable
          opportunity to investigate and address it before any public disclosure.
        </p>

        <h2 style={S.h2}>How to report</h2>
        <p style={S.p}>
          Send your report to <a href="mailto:security@peakledger.app" style={S.a}>security@peakledger.app</a>.
          Please include:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>A description of the vulnerability and the potential impact</li>
          <li style={S.li}>Steps to reproduce the issue</li>
          <li style={S.li}>Any relevant screenshots, HTTP requests, or proof-of-concept code</li>
          <li style={S.li}>Your contact information if you would like to be kept informed of our progress</li>
        </ul>

        <h2 style={S.h2}>What we ask of you</h2>
        <ul style={S.ul}>
          <li style={S.li}>Do not access, modify, or delete data that does not belong to you</li>
          <li style={S.li}>Do not perform denial-of-service attacks or automated scanning at scale</li>
          <li style={S.li}>Do not disclose the issue publicly until we have resolved it or 90 days have passed, whichever comes first</li>
          <li style={S.li}>Act in good faith; we will do the same</li>
        </ul>

        <h2 style={S.h2}>What you can expect from us</h2>
        <ul style={S.ul}>
          <li style={S.li}>Acknowledgment of your report within 3 business days</li>
          <li style={S.li}>An honest assessment of the severity and scope of the issue</li>
          <li style={S.li}>Updates as we work toward a fix</li>
          <li style={S.li}>Credit in our release notes if you would like to be named</li>
        </ul>

        <h2 style={S.h2}>Out of scope</h2>
        <ul style={S.ul}>
          <li style={S.li}>Vulnerabilities in third-party services we use (Plaid, Stripe, Railway) should be reported directly to them</li>
          <li style={S.li}>Issues that require physical access to a user's device</li>
          <li style={S.li}>Social engineering attacks against our team</li>
          <li style={S.li}>Spam or phishing not involving a vulnerability in our platform</li>
        </ul>

        <p style={S.p}>
          Thank you for helping keep PeakLedger and its users safe. For general security questions see our{' '}
          <Link to="/security" style={S.a}>Security Policy</Link>.
        </p>
      </div>
    </div>
  );
}

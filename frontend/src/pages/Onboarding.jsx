import React, { useState } from 'react';

const BG      = '#0a0a0a';
const TEXT    = '#f1f5f9';
const TEXT2   = '#94a3b8';
const TEXT3   = '#475569';
const BLUE    = '#4da3ff';
const BLUE_BTN = '#0066f5';
const BORDER  = 'rgba(255,255,255,0.08)';

const GOALS = [
  { id: 'budget',  icon: '💰', label: 'Budget and track spending' },
  { id: 'invest',  icon: '📈', label: 'Grow my investments' },
  { id: 'debt',    icon: '💳', label: 'Pay off debt' },
  { id: 'savings', icon: '🏦', label: 'Build my savings' },
  { id: 'learn',   icon: '📚', label: 'Learn personal finance' },
];

const INCOMES = [
  { id: 'u25',    label: 'Under $25K' },
  { id: '25-50',  label: '$25K–$50K' },
  { id: '50-100', label: '$50K–$100K' },
  { id: '100p',   label: '$100K+' },
  { id: 'skip',   label: 'Prefer not to say' },
];

const PRIORITIES = [
  { id: 'save',   label: 'Save more money' },
  { id: 'debt',   label: 'Pay down debt' },
  { id: 'invest', label: 'Grow my investments' },
  { id: 'track',  label: 'Understand where my money goes' },
];

function NavBtns({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
      <button onClick={onBack}
        style={{ padding: '13px 20px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        ← Back
      </button>
      <button onClick={onNext} disabled={nextDisabled}
        style={{ flex: 1, padding: '14px 0', background: nextDisabled ? 'rgba(0,102,245,0.25)' : BLUE_BTN, border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: nextDisabled ? 'default' : 'pointer', opacity: nextDisabled ? 0.55 : 1, fontFamily: 'inherit', transition: 'opacity 0.2s' }}>
        {nextLabel}
      </button>
    </div>
  );
}

function StepWelcome({ firstName, onNext, onSkip }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <img src="/logo-icon.png?v=7" alt="" style={{ width: 68, height: 68, borderRadius: 18, marginBottom: 28, display: 'block', margin: '0 auto 28px' }} />
      <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.25 }}>
        Welcome to PeakLedger,<br />{firstName}.
      </div>
      <div style={{ fontSize: 15, color: TEXT2, lineHeight: 1.75, marginBottom: 40, maxWidth: 360, margin: '0 auto 40px' }}>
        Your complete financial picture in one place. Let's take two minutes to personalize your experience.
      </div>
      <button onClick={onNext}
        style={{ width: '100%', padding: '15px 0', background: BLUE_BTN, border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
        Let's go →
      </button>
      <button onClick={onSkip}
        style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 13, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit', display: 'block', width: '100%' }}>
        Skip and explore on my own
      </button>
    </div>
  );
}

function StepGoals({ goals, onToggle, onNext, onBack }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: '-0.5px', marginBottom: 8 }}>
          What do you want to accomplish?
        </div>
        <div style={{ fontSize: 14, color: TEXT2 }}>Select everything that applies.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GOALS.map(g => {
          const sel = goals.includes(g.id);
          return (
            <button key={g.id} onClick={() => onToggle(g.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: sel ? 'rgba(77,163,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? 'rgba(77,163,255,0.4)' : BORDER}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{g.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: sel ? BLUE : TEXT, flex: 1 }}>{g.label}</span>
              {sel && <span style={{ color: BLUE, fontSize: 15, flexShrink: 0 }}>✓</span>}
            </button>
          );
        })}
      </div>
      <NavBtns onBack={onBack} onNext={onNext} nextLabel={goals.length === 0 ? 'Skip' : 'Continue'} />
    </div>
  );
}

function StepProfile({ income, setIncome, priority, setPriority, onNext, onBack }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Tell us a bit about yourself.
        </div>
        <div style={{ fontSize: 14, color: TEXT2 }}>Helps personalize your experience. Nothing is required.</div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Annual income range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {INCOMES.map(opt => {
            const sel = income === opt.id;
            return (
              <button key={opt.id} onClick={() => setIncome(opt.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: sel ? 'rgba(77,163,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? 'rgba(77,163,255,0.4)' : BORDER}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? BLUE : TEXT3}`, background: sel ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: 13, color: sel ? TEXT : TEXT2, fontWeight: sel ? 600 : 400 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Top financial priority right now</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRIORITIES.map(opt => {
            const sel = priority === opt.id;
            return (
              <button key={opt.id} onClick={() => setPriority(opt.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: sel ? 'rgba(77,163,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? 'rgba(77,163,255,0.4)' : BORDER}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? BLUE : TEXT3}`, background: sel ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: 13, color: sel ? TEXT : TEXT2, fontWeight: sel ? 600 : 400 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <NavBtns onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

function StepConnect({ isPremium, onOpenUpgrade, onOpenConnect, onComplete, onBack }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Connect your accounts.
        </div>
        <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.7 }}>
          Link your bank, credit cards, and investments to see your complete financial picture in real time.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {[
          { icon: '🏦', title: 'Banking', desc: 'Checking, savings, and credit cards' },
          { icon: '📈', title: 'Investments', desc: 'Brokerage, 401(k), and retirement accounts' },
          { icon: '💳', title: 'Liabilities', desc: 'Loans, mortgages, and debt tracking' },
        ].map(item => (
          <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{item.title}</div>
              <div style={{ fontSize: 12, color: TEXT2, marginTop: 1 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={isPremium ? onOpenConnect : onOpenUpgrade}
        style={{ width: '100%', padding: '15px 0', background: BLUE_BTN, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
        {isPremium ? 'Connect my accounts →' : 'Unlock real accounts →'}
      </button>
      <button onClick={onComplete}
        style={{ width: '100%', padding: '13px 0', background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT2, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        Explore demo data first
      </button>

      <div style={{ marginTop: 18 }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

export default function Onboarding({ user, isPremium, onComplete, onOpenUpgrade, onOpenConnect }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [income, setIncome] = useState('');
  const [priority, setPriority] = useState('');
  const STEPS = 4;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const progress = ((step + 1) / STEPS) * 100;

  const toggleGoal = id => setGoals(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id]);

  const savePrefs = () => {
    if (!user?.id) return;
    if (goals.length) localStorage.setItem(`pl_goals_${user.id}`, JSON.stringify(goals));
    if (income) localStorage.setItem(`pl_income_${user.id}`, income);
    if (priority) localStorage.setItem(`pl_priority_${user.id}`, priority);
  };

  const finish = () => { savePrefs(); onComplete(); };
  const next = () => step < STEPS - 1 ? setStep(s => s + 1) : finish();
  const back = () => setStep(s => s - 1);

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: BLUE, transition: 'width 0.4s ease' }} />
      </div>

      {/* Skip (steps 1-2 only) */}
      {step > 0 && step < 3 && (
        <button onClick={finish}
          style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: TEXT3, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', zIndex: 1 }}>
          Skip setup
        </button>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {step === 0 && <StepWelcome firstName={firstName} onNext={next} onSkip={finish} />}
          {step === 1 && <StepGoals goals={goals} onToggle={toggleGoal} onNext={next} onBack={back} />}
          {step === 2 && <StepProfile income={income} setIncome={setIncome} priority={priority} setPriority={setPriority} onNext={next} onBack={back} />}
          {step === 3 && (
            <StepConnect
              isPremium={isPremium}
              onOpenUpgrade={() => { finish(); onOpenUpgrade(); }}
              onOpenConnect={() => { finish(); onOpenConnect(); }}
              onComplete={finish}
              onBack={back}
            />
          )}
        </div>
      </div>

      {/* Step dots */}
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} style={{ height: 6, borderRadius: 3, background: i === step ? BLUE : i < step ? 'rgba(77,163,255,0.4)' : 'rgba(255,255,255,0.12)', width: i === step ? 22 : 6, transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
}

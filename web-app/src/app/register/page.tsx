'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Users, CheckCircle2, ShieldCheck, MailOpen, CalendarCheck, MapPin } from 'lucide-react';
import styles from './register.module.css';

type FormState = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  groomName?: string;
  brideName?: string;
  weddingTitle?: string;
  date?: string;
  time?: string;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  contactEmail?: string;
  contactWhatsApp?: string;
  story?: string;
  profileImageBase64?: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>> & { terms?: string };

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const minWeddingDate = toDateInputValue(new Date());
const maxWeddingDate = `${new Date().getFullYear() + 10}-12-31`;
const weddingDateMessage = `Please select a valid date between ${minWeddingDate} and ${maxWeddingDate}.`;

function isValidWeddingDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  const isRealDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  return isRealDate && value >= minWeddingDate && value <= maxWeddingDate;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setEmailChecking(true);
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setEmailExists(!!data.exists);
    } catch {
      // silently ignore — full validation still happens on submit
    } finally {
      setEmailChecking(false);
    }
  }, []);

  // Step 2 specific states
  const [venueDeciding, setVenueDeciding] = useState(false);
  const [dateDeciding, setDateDeciding] = useState(false);
  const [guestsDeciding, setGuestsDeciding] = useState(false);
  const [guestCount, setGuestCount] = useState(125);
  const [budgetDeciding, setBudgetDeciding] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(2500000);

  function handleNameChange(field: 'firstName' | 'lastName' | 'groomName' | 'brideName', raw: string) {
    // Strip anything that isn't an English letter
    const letters = raw.replace(/[^a-zA-Z]/g, '');
    // Auto-capitalise the first character
    const value = letters.length > 0
      ? letters[0].toUpperCase() + letters.slice(1)
      : '';
    update({ [field]: value });
  }

  function update(up: Partial<FormState>) {
    setForm((s) => ({ ...s, ...up }));
    const keys = Object.keys(up) as (keyof FormState)[];
    setErrors((e) => {
      const next = { ...e };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function validateStep(s: number): FieldErrors {
    const e: FieldErrors = {};
    if (s === 1) {
      if (!form.firstName?.trim()) e.firstName = 'First name is required.';
      else if (!/^[A-Z][a-zA-Z]*$/.test(form.firstName.trim())) e.firstName = 'English letters only, starting with a capital letter.';
      if (!form.lastName?.trim()) e.lastName = 'Last name is required.';
      else if (!/^[A-Z][a-zA-Z]*$/.test(form.lastName.trim())) e.lastName = 'English letters only, starting with a capital letter.';
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        e.email = 'Valid email is required.';
      }
      if (!form.password) e.password = 'Password is required.';
      else {
        if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
        if (!/\d/.test(form.password)) e.password = 'Password must contain a number.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Password must contain a special character.';
      }
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = 'Passwords do not match.';
      }
      if (!termsAccepted) {
        e.terms = 'You must accept the terms and privacy policy.';
      }
    }
    if (s === 2) {
      if (!form.groomName?.trim()) e.groomName = "Groom's first name is required.";
      else if (!/^[A-Z][a-zA-Z]*$/.test(form.groomName.trim())) e.groomName = "English letters only, starting with a capital letter.";
      if (!form.brideName?.trim()) e.brideName = "Bride's first name is required.";
      else if (!/^[A-Z][a-zA-Z]*$/.test(form.brideName.trim())) e.brideName = "English letters only, starting with a capital letter.";
      if (!dateDeciding && !form.date) e.date = 'Please select a wedding date or check "Still deciding".';
      else if (!dateDeciding && form.date && !isValidWeddingDate(form.date)) e.date = weddingDateMessage;
    }
    return e;
  }

  function next() {
    const fieldErrors = validateStep(step);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitError(null);
    const allErrors = { ...validateStep(1), ...validateStep(2) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setSubmitError('Please fix the errors above before submitting.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/couples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateDeciding,
          venueDeciding,
          estimatedGuests: guestsDeciding ? null : guestCount,
          estimatedBudget: budgetDeciding ? null : budgetAmount,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setSubmitError(data?.error || 'Submission failed. Please try again.');
        setLoading(false);
        return;
      }
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setSubmitError('Account created but sign-in failed. Please log in manually.');
        setLoading(false);
        router.push('/login');
        return;
      }
      setLoading(false);
      router.push('/couple');
    } catch (e: unknown) {
      setSubmitError(String(e));
      setLoading(false);
    }
  }

  // Password requirements
  const pwd = form.password || '';
  const has8Chars = pwd.length >= 8;
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logoArea}>
            <div className={styles.logoW}>W</div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>WedPlan</span>
              <span className={styles.logoSubtitle}>Plan Beautiful. Celebrate Forever.</span>
            </div>
          </div>
          
          <h1 className={styles.welcomeText}>
            Begin your<br />
            <span className={styles.highlightText}>perfect wedding</span><br />
            journey
          </h1>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span style={{ fontSize: 16 }}>♥</span>
            <div className={styles.dividerLine}></div>
          </div>

          <p className={styles.subtitleText}>
            Join thousands of happy couples who plan, manage and celebrate their special day with WedPlan.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}><Users size={20} /></div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>All-in-One Management</span>
                <span className={styles.featureDesc}>Manage guests, RSVPs, vendors, budget, checklist & more.</span>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}><MailOpen size={20} /></div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>Beautiful Invitations</span>
                <span className={styles.featureDesc}>Create stunning digital invitations with your own style.</span>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}><CalendarCheck size={20} /></div>
              <div className={styles.featureText}>
                <span className={styles.featureTitle}>Stress-Free Planning</span>
                <span className={styles.featureDesc}>Everything in one place to keep you organized.</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.illustration}>
          <Image src="/public-site/wedding-couple.png" alt="Wedding couple" fill sizes="(max-width: 900px) 100vw, 42vw" className={styles.illustrationImage} />
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.topRight}>
          Already have an account? <Link href="/login" className={styles.signInLink}>Sign In</Link>
        </div>

        <div className={styles.formContainer}>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.stepText}>Step {step} of 2</p>

          <div className={styles.progressHeader}>
            <div className={`${styles.progressStep} ${step >= 1 ? styles.active : styles.inactive}`}>
              <div className={`${styles.progressCircle} ${step >= 1 ? styles.active : styles.inactive}`}>1</div>
              Account Details
            </div>
            <div className={`${styles.progressLine} ${step > 1 ? styles.active : ''}`}></div>
            <div className={`${styles.progressStep} ${step >= 2 ? styles.active : styles.inactive}`}>
              <div className={`${styles.progressCircle} ${step >= 2 ? styles.active : styles.inactive}`}>2</div>
              Wedding Details
            </div>
          </div>

          {step === 1 && (
            <div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
                      placeholder="Enter your first name"
                      value={form.firstName || ''}
                      onChange={(e) => handleNameChange('firstName', e.target.value)}
                    />
                  </div>
                  {errors.firstName && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.firstName}</div>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
                      placeholder="Enter your last name"
                      value={form.lastName || ''}
                      onChange={(e) => handleNameChange('lastName', e.target.value)}
                    />
                  </div>
                  {errors.lastName && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.lastName}</div>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    type="email"
                    className={`${styles.input} ${errors.email || emailExists ? styles.error : ''}`}
                    placeholder="Enter your email address"
                    value={form.email || ''}
                    onChange={(e) => { setEmailExists(false); update({ email: e.target.value }); }}
                    onBlur={(e) => checkEmailExists(e.target.value)}
                  />
                  {emailChecking && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#888' }}>Checking…</span>}
                </div>
                {errors.email && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                {!errors.email && emailExists && (
                  <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                    An account with this email already exists.{' '}
                    <a href="/login" style={{ color: 'red', textDecoration: 'underline' }}>Sign in instead?</a>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="Create a strong password"
                    value={form.password || ''}
                    onChange={(e) => update({ password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
              </div>

              <div className={styles.passwordReqs}>
                <div className={`${styles.reqItem} ${has8Chars ? styles.valid : styles.invalid}`}>
                  <CheckCircle2 size={14} /> At least 8 characters
                </div>
                <div className={`${styles.reqItem} ${hasNumber ? styles.valid : styles.invalid}`}>
                  <CheckCircle2 size={14} /> One number
                </div>
                <div className={`${styles.reqItem} ${hasSpecial ? styles.valid : styles.invalid}`}>
                  <CheckCircle2 size={14} /> One special character
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="Confirm your password"
                    value={form.confirmPassword || ''}
                    onChange={(e) => update({ confirmPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.togglePassword}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.confirmPassword}</div>}
              </div>

              <div className={styles.termsRow}>
                <input 
                  type="checkbox" 
                  className={styles.termsCheckbox} 
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                />
                <div>
                  I agree to the <Link href="#" className={styles.termsLink}>Terms of Service</Link> and <Link href="#" className={styles.termsLink}>Privacy Policy</Link>
                  {errors.terms && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.terms}</div>}
                </div>
              </div>

              <button type="button" className={styles.submitBtn} onClick={next} disabled={emailExists || emailChecking}>
                Continue to Wedding Details →
              </button>

<div className={styles.securityNote}>
                <ShieldCheck size={24} className={styles.securityIcon} />
                <div>
                  <div className={styles.securityTitle}>Your data is safe with us</div>
                  <div className={styles.securityDesc}>We use enterprise-grade security to protect your information.</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Groom&apos;s First Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={`${styles.input} ${errors.groomName ? styles.error : ''}`}
                      placeholder="Enter groom's first name"
                      value={form.groomName || ''}
                      onChange={(e) => handleNameChange('groomName', e.target.value)}
                    />
                  </div>
                  {errors.groomName && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.groomName}</div>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bride&apos;s First Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={`${styles.input} ${errors.brideName ? styles.error : ''}`}
                      placeholder="Enter bride's first name"
                      value={form.brideName || ''}
                      onChange={(e) => handleNameChange('brideName', e.target.value)}
                    />
                  </div>
                  {errors.brideName && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.brideName}</div>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  Event Venue
                  <label className={styles.toggleSwitch}>
                    Still deciding
                    <input type="checkbox" checked={venueDeciding} onChange={(e) => setVenueDeciding(e.target.checked)} style={{ accentColor: '#c2185b' }} />
                  </label>
                </div>
                <div className={styles.inputWrapper}>
                  <MapPin size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={`${styles.input} ${errors.venueName && !venueDeciding ? styles.error : ''}`}
                    placeholder="Enter your venue"
                    value={form.venueName || ''}
                    onChange={(e) => update({ venueName: e.target.value })}
                    disabled={venueDeciding}
                  />
                </div>
                {errors.venueName && !venueDeciding && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.venueName}</div>}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  Event Date
                  <label className={styles.toggleSwitch}>
                    Still deciding
                    <input type="checkbox" checked={dateDeciding} onChange={(e) => setDateDeciding(e.target.checked)} style={{ accentColor: '#c2185b' }} />
                  </label>
                </div>
                <div className={styles.inputWrapper}>
                  <CalendarCheck size={18} className={styles.inputIcon} />
                  <input
                    type="date"
                    className={`${styles.input} ${errors.date && !dateDeciding ? styles.error : ''}`}
                    value={form.date || ''}
                    onChange={(e) => update({ date: e.target.value })}
                    disabled={dateDeciding}
                    min={minWeddingDate}
                    max={maxWeddingDate}
                  />
                </div>
                {errors.date && !dateDeciding && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  Estimated Number of Guests
                  <label className={styles.toggleSwitch}>
                    Still deciding
                    <input type="checkbox" checked={guestsDeciding} onChange={(e) => setGuestsDeciding(e.target.checked)} style={{ accentColor: '#c2185b' }} />
                  </label>
                </div>
                <div className={`${styles.sliderContainer} ${guestsDeciding ? styles.disabled : ''}`}>
                  <div className={styles.sliderHeader}>
                    <span>Number of guests</span>
                    <span className={styles.sliderValue}>{guestCount} guests</span>
                  </div>
                  <div className={styles.sliderControls}>
                    <button type="button" className={styles.sliderBtn} onClick={() => setGuestCount(p => Math.max(0, p - 25))} disabled={guestsDeciding}>-</button>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFill} style={{ width: `${(guestCount / 500) * 100}%` }}></div>
                      <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        step="25" 
                        value={guestCount} 
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        disabled={guestsDeciding}
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0, top: 0, left: 0 }} 
                      />
                      <div className={styles.sliderThumb} style={{ left: `${(guestCount / 500) * 100}%` }}></div>
                    </div>
                    <button type="button" className={styles.sliderBtn} onClick={() => setGuestCount(p => Math.min(500, p + 25))} disabled={guestsDeciding}>+</button>
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>0</span>
                    <span>125</span>
                    <span>250</span>
                    <span>375</span>
                    <span>500</span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  Estimated Budget (LKR)
                  <label className={styles.toggleSwitch}>
                    Still deciding
                    <input type="checkbox" checked={budgetDeciding} onChange={(e) => setBudgetDeciding(e.target.checked)} style={{ accentColor: '#c2185b' }} />
                  </label>
                </div>
                <div className={`${styles.sliderContainer} ${budgetDeciding ? styles.disabled : ''}`}>
                  <div className={styles.sliderHeader}>
                    <span>Budget range</span>
                    <span className={styles.sliderValue}>{(budgetAmount / 1000000).toFixed(1)}M LKR</span>
                  </div>
                  <div className={styles.sliderControls}>
                    <button type="button" className={styles.sliderBtn} onClick={() => setBudgetAmount(p => Math.max(0, p - 500000))} disabled={budgetDeciding}>-</button>
                    <div className={styles.sliderTrack}>
                      <div className={styles.sliderFill} style={{ width: `${(budgetAmount / 10000000) * 100}%` }}></div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10000000" 
                        step="100000" 
                        value={budgetAmount} 
                        onChange={(e) => setBudgetAmount(Number(e.target.value))}
                        disabled={budgetDeciding}
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0, top: 0, left: 0 }} 
                      />
                      <div className={styles.sliderThumb} style={{ left: `${(budgetAmount / 10000000) * 100}%` }}></div>
                    </div>
                    <button type="button" className={styles.sliderBtn} onClick={() => setBudgetAmount(p => Math.min(10000000, p + 500000))} disabled={budgetDeciding}>+</button>
                  </div>
                  <div className={styles.sliderLabels}>
                    <span>0 LKR</span>
                    <span>2.5M LKR</span>
                    <span>5M LKR</span>
                    <span>7.5M LKR</span>
                    <span>10M LKR</span>
                  </div>
                </div>
              </div>

              <button type="button" className={styles.submitBtn} onClick={submit} disabled={loading}>
                {loading ? 'Creating...' : 'Create My Wedding →'}
              </button>
              <button type="button" className={styles.backBtn} onClick={back} disabled={loading}>
                Back
              </button>
              {submitError && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{submitError}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

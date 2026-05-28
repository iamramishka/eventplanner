'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ─────────────────────────── Types ─────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;

type FormState = {
  // Step 1 – Account
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  password: string;
  // Step 2 – Business Profile
  businessName: string;
  category: string;
  subcategory: string;
  description: string;
  yearsInBusiness: string;
  website: string;
  location: string;
  serviceArea: string;
  // Step 3 – Uploads & Documents
  logoBase64: string;
  portfolioImages: string[];   // array of base64 strings (max 5)
  businessRegNumber: string;
  taxIdNumber: string;
  businessRegDocBase64: string;
  // Step 4 – Pricing & Services
  basePrice: string;
  currency: string;
  pricingNotes: string;
  packages: Array<{ name: string; price: string; description: string }>;
};

type FieldErrors = Partial<Record<string, string>>;

/* ─────────────────────────── Constants ─────────────────────────── */
const TOTAL_STEPS: Step = 5;

const STEP_LABELS = [
  'Account',
  'Business Profile',
  'Documents & Uploads',
  'Pricing & Services',
  'Review & Submit',
];

const CATEGORIES = [
  'Photography',
  'Videography',
  'Catering',
  'Venue',
  'Floral & Decor',
  'Music & Entertainment',
  'Bridal Wear',
  'Grooms Wear',
  'Makeup & Hair',
  'Wedding Planning',
  'Cake & Desserts',
  'Transport',
  'Invitations & Stationery',
  'Other',
];

const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'SGD'];

const SUBCATEGORIES: Record<string, string[]> = {
  Photography: ['Wedding Photography', 'Pre-Wedding Shoots', 'Videography', 'Drone Footage'],
  Catering: ['Full-Service Catering', 'Buffet', 'Live Cooking Stations', 'Dessert Tables'],
  Venue: ['Indoor Venue', 'Outdoor Venue', 'Beach Venue', 'Garden Venue', 'Hotel Ballroom'],
  'Floral & Decor': ['Ceremony Decor', 'Reception Decor', 'Bridal Bouquet', 'Table Centerpieces'],
  'Music & Entertainment': ['Live Band', 'DJ', 'String Quartet', 'Solo Vocalist'],
};

const DEFAULT_PACKAGES = [
  { name: '', price: '', description: '' },
];

/* ─────────────────────────── Component ─────────────────────────── */
export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    ownerFirstName: '', ownerLastName: '', email: '', phone: '', password: '',
    businessName: '', category: '', subcategory: '', description: '',
    yearsInBusiness: '', website: '', location: '', serviceArea: '',
    logoBase64: '', portfolioImages: [],
    businessRegNumber: '', taxIdNumber: '', businessRegDocBase64: '',
    basePrice: '', currency: 'LKR', pricingNotes: '',
    packages: DEFAULT_PACKAGES,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [docFileName, setDocFileName] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  /* ── helpers ── */
  function update(up: Partial<FormState>) {
    setForm(s => ({ ...s, ...up }));
    const keys = Object.keys(up);
    setErrors(e => {
      const next = { ...e };
      keys.forEach(k => delete next[k]);
      return next;
    });
  }

  async function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /* ── file handlers ── */
  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErrors(prev => ({ ...prev, logoBase64: 'Please upload a valid image.' }));
    if (f.size > 3 * 1024 * 1024) return setErrors(prev => ({ ...prev, logoBase64: 'Logo must be under 3 MB.' }));
    const b64 = await readFile(f);
    setLogoPreview(b64);
    update({ logoBase64: b64 });
  }

  async function handlePortfolio(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const combined = [...portfolioPreviews, ...Array(files.length).fill('')];
    if (combined.length > 5) {
      setErrors(prev => ({ ...prev, portfolioImages: 'Maximum 5 portfolio images allowed.' }));
      return;
    }
    const results: string[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > 5 * 1024 * 1024) continue;
      results.push(await readFile(f));
    }
    const newPreviews = [...portfolioPreviews, ...results].slice(0, 5);
    setPortfolioPreviews(newPreviews);
    update({ portfolioImages: newPreviews });
  }

  function removePortfolio(idx: number) {
    const updated = portfolioPreviews.filter((_, i) => i !== idx);
    setPortfolioPreviews(updated);
    update({ portfolioImages: updated });
  }

  async function handleBusinessDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) return setErrors(prev => ({ ...prev, businessRegDocBase64: 'Only PDF, JPG, PNG, or WEBP allowed.' }));
    if (f.size > 10 * 1024 * 1024) return setErrors(prev => ({ ...prev, businessRegDocBase64: 'Document must be under 10 MB.' }));
    const b64 = await readFile(f);
    setDocFileName(f.name);
    update({ businessRegDocBase64: b64 });
  }

  /* ── packages ── */
  function updatePackage(idx: number, field: keyof typeof DEFAULT_PACKAGES[0], value: string) {
    const packages = [...form.packages];
    packages[idx] = { ...packages[idx], [field]: value };
    update({ packages });
  }
  function addPackage() {
    if (form.packages.length >= 5) return;
    update({ packages: [...form.packages, { name: '', price: '', description: '' }] });
  }
  function removePackage(idx: number) {
    if (form.packages.length <= 1) return;
    update({ packages: form.packages.filter((_, i) => i !== idx) });
  }

  /* ── validation ── */
  function validateStep(s: number): FieldErrors {
    const e: FieldErrors = {};
    if (s === 1) {
      if (!form.ownerFirstName.trim()) e.ownerFirstName = 'First name is required.';
      if (!form.ownerLastName.trim()) e.ownerLastName = 'Last name is required.';
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required.';
      if (!form.phone.trim() || form.phone.trim().length < 7) e.phone = 'Valid phone number is required.';
      if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    }
    if (s === 2) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required.';
      if (!form.category) e.category = 'Please select a category.';
      if (!form.description.trim() || form.description.trim().length < 30) e.description = 'Description must be at least 30 characters.';
      if (!form.location.trim()) e.location = 'Location is required.';
    }
    if (s === 3) {
      if (!form.businessRegNumber.trim()) e.businessRegNumber = 'Business registration number is required.';
    }
    if (s === 4) {
      if (!form.basePrice || isNaN(Number(form.basePrice)) || Number(form.basePrice) < 0) {
        e.basePrice = 'Please enter a valid starting price.';
      }
    }
    return e;
  }

  function next() {
    const fieldErrors = validateStep(step);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setErrors({});
    setStep(s => (s + 1) as Step);
  }

  function back() {
    setErrors({});
    setStep(s => (s - 1) as Step);
  }

  /* ── submit ── */
  async function submit() {
    setSubmitError(null);
    const allErrors = { ...validateStep(1), ...validateStep(2), ...validateStep(3), ...validateStep(4) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setSubmitError('Please fix all errors before submitting.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setSubmitError(data?.error || 'Submission failed. Please try again.');
        setLoading(false);
        return;
      }
      setResult(data);
      setLoading(false);
    } catch (err: any) {
      setSubmitError(String(err?.message || err));
      setLoading(false);
    }
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  /* ═══════════════════════ SUCCESS SCREEN ═══════════════════════ */
  if (result) {
    return (
      <main style={S.page}>
        <div style={S.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={S.successIcon}>🎉</div>
            <h1 style={S.heading}>Application Submitted!</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Thank you, <strong>{form.ownerFirstName}</strong>! Your vendor application for{' '}
              <strong>{form.businessName}</strong> has been received. Our team will review your
              documents and notify you within <strong>2–3 business days</strong>.
            </p>
            <div style={S.reviewBox}>
              <ReviewRow label="Application ID" value={result.id} />
              <ReviewRow label="Business" value={result.businessName} />
              <ReviewRow label="Category" value={result.category} />
              <ReviewRow label="Status" value="⏳ Pending Review" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button id="go-home-btn" style={{ ...S.btnPrimary, flex: 1 }} onClick={() => router.push('/')}>
                🏠 Go Home
              </button>
              <button id="go-login-btn" style={{ ...S.btnOutline, flex: 1 }} onClick={() => router.push('/login')}>
                Sign In
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '1rem' }}>
              Check your email at <strong>{form.email}</strong> for next steps.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ═══════════════════════ ONBOARDING FORM ═══════════════════════ */
  return (
    <main style={S.page}>
      <div style={S.card}>
        {/* ── Brand header ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={S.brandBadge}>💍 WedInvite</div>
          <h1 style={S.heading}>Vendor Registration</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Step {step} of {TOTAL_STEPS} — <strong style={{ color: '#6b7280' }}>{STEP_LABELS[step - 1]}</strong>
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div style={S.progressTrack}>
          <div style={{ ...S.progressFill, width: `${progressPct}%` }} />
        </div>

        {/* ── Step pills ── */}
        <div style={S.stepPills}>
          {STEP_LABELS.map((label, i) => {
            const idx = i + 1;
            const active = idx === step;
            const done = idx < step;
            return (
              <div key={label} style={{ ...S.pill, ...(done ? S.pillDone : active ? S.pillActive : {}) }}>
                <span style={{ ...S.pillDot, ...(done ? S.pillDotDone : active ? S.pillDotActive : {}) }}>
                  {done ? '✓' : idx}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: active || done ? 600 : 400, display: 'none' as any }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* ══════════════ STEP 1: ACCOUNT ══════════════ */}
        {step === 1 && (
          <section id="step-account">
            <SectionTitle icon="👤" title="Account Information" subtitle="Create your vendor login credentials" />
            <div style={S.twoCol}>
              <Field label="First Name" required error={errors.ownerFirstName}>
                <input id="owner-first-name" style={S.input(!!errors.ownerFirstName)} placeholder="e.g. Kasun" value={form.ownerFirstName} onChange={e => update({ ownerFirstName: e.target.value })} />
              </Field>
              <Field label="Last Name" required error={errors.ownerLastName}>
                <input id="owner-last-name" style={S.input(!!errors.ownerLastName)} placeholder="e.g. Perera" value={form.ownerLastName} onChange={e => update({ ownerLastName: e.target.value })} />
              </Field>
            </div>
            <Field label="Business Email" required error={errors.email}>
              <input id="vendor-email" type="email" style={S.input(!!errors.email)} placeholder="hello@yourbusiness.com" value={form.email} onChange={e => update({ email: e.target.value })} />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
              <input id="vendor-phone" type="tel" style={S.input(!!errors.phone)} placeholder="+94 77 123 4567" value={form.phone} onChange={e => update({ phone: e.target.value })} />
            </Field>
            <Field label="Password" required error={errors.password}>
              <div style={{ position: 'relative' }}>
                <input id="vendor-password" type={showPassword ? 'text' : 'password'} style={{ ...S.input(!!errors.password), paddingRight: '3rem' }} placeholder="At least 8 characters" value={form.password} onChange={e => update({ password: e.target.value })} />
                <button type="button" style={S.eyeBtn} onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </Field>
          </section>
        )}

        {/* ══════════════ STEP 2: BUSINESS PROFILE ══════════════ */}
        {step === 2 && (
          <section id="step-business-profile">
            <SectionTitle icon="🏢" title="Business Profile" subtitle="Tell couples about your business" />
            <Field label="Business / Brand Name" required error={errors.businessName}>
              <input id="business-name" style={S.input(!!errors.businessName)} placeholder="e.g. Lumina Studios" value={form.businessName} onChange={e => update({ businessName: e.target.value })} />
            </Field>
            <div style={S.twoCol}>
              <Field label="Category" required error={errors.category}>
                <select id="vendor-category" style={S.input(!!errors.category)} value={form.category} onChange={e => update({ category: e.target.value, subcategory: '' })}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Sub-category" error={errors.subcategory}>
                <select id="vendor-subcategory" style={S.input(false)} value={form.subcategory} onChange={e => update({ subcategory: e.target.value })}>
                  <option value="">None</option>
                  {(SUBCATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Business Description" required error={errors.description}>
              <textarea
                id="vendor-description"
                style={{ ...S.input(!!errors.description), resize: 'vertical', minHeight: 100 }}
                placeholder="Describe your services, style, and what makes you unique (min. 30 characters)"
                value={form.description}
                onChange={e => update({ description: e.target.value })}
                rows={4}
              />
              <span style={{ fontSize: '0.75rem', color: form.description.length < 30 ? '#ef4444' : '#9ca3af' }}>
                {form.description.length} / 30 min characters
              </span>
            </Field>
            <div style={S.twoCol}>
              <Field label="Years in Business" error={errors.yearsInBusiness}>
                <input id="years-in-business" type="number" min="0" max="100" style={S.input(false)} placeholder="e.g. 5" value={form.yearsInBusiness} onChange={e => update({ yearsInBusiness: e.target.value })} />
              </Field>
              <Field label="Website (optional)" error={errors.website}>
                <input id="vendor-website" type="url" style={S.input(false)} placeholder="https://yourbusiness.com" value={form.website} onChange={e => update({ website: e.target.value })} />
              </Field>
            </div>
            <div style={S.twoCol}>
              <Field label="Primary Location" required error={errors.location}>
                <input id="vendor-location" style={S.input(!!errors.location)} placeholder="e.g. Colombo, Sri Lanka" value={form.location} onChange={e => update({ location: e.target.value })} />
              </Field>
              <Field label="Service Area" error={errors.serviceArea}>
                <input id="vendor-service-area" style={S.input(false)} placeholder="e.g. Island-wide" value={form.serviceArea} onChange={e => update({ serviceArea: e.target.value })} />
              </Field>
            </div>
          </section>
        )}

        {/* ══════════════ STEP 3: DOCUMENTS & UPLOADS ══════════════ */}
        {step === 3 && (
          <section id="step-documents">
            <SectionTitle icon="📂" title="Documents & Portfolio" subtitle="Verify your business and showcase your work" />

            {/* Logo upload */}
            <Field label="Business Logo (optional)" error={errors.logoBase64}>
              <label id="logo-upload-area" style={S.uploadZone}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <div style={S.uploadPlaceholder}>
                    <span style={{ fontSize: '2rem' }}>🖼️</span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>Click to upload logo · Max 3 MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
              </label>
              {logoPreview && (
                <button type="button" style={S.removeBtn} onClick={() => { setLogoPreview(null); update({ logoBase64: '' }); }}>
                  Remove logo
                </button>
              )}
            </Field>

            {/* Portfolio images */}
            <Field label={`Portfolio Images (${portfolioPreviews.length}/5)`} error={errors.portfolioImages}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {portfolioPreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={src} alt={`Portfolio ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid #e5e7eb' }} />
                    <button type="button" style={S.imgRemoveBtn} onClick={() => removePortfolio(i)}>×</button>
                  </div>
                ))}
                {portfolioPreviews.length < 5 && (
                  <label style={{ ...S.uploadZone, width: 80, height: 80, minHeight: 80, cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.5rem', color: '#9ca3af' }}>+</span>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePortfolio} />
                  </label>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Upload up to 5 portfolio images. Max 5 MB each.</p>
            </Field>

            {/* Business registration doc */}
            <Field label="Business Registration Certificate" required error={errors.businessRegDocBase64}>
              <label id="biz-doc-upload-area" style={{ ...S.uploadZone, flexDirection: 'row', gap: '1rem', padding: '1rem 1.5rem', minHeight: 'auto' }}>
                <span style={{ fontSize: '1.75rem' }}>📄</span>
                <div>
                  {docFileName ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{docFileName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Click to replace</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>Upload Business Registration</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>PDF, JPG, PNG or WEBP · Max 10 MB</div>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBusinessDoc} />
              </label>
            </Field>

            {/* Registration number */}
            <div style={S.twoCol}>
              <Field label="Business Reg. Number" required error={errors.businessRegNumber}>
                <input id="business-reg-number" style={S.input(!!errors.businessRegNumber)} placeholder="e.g. PV12345" value={form.businessRegNumber} onChange={e => update({ businessRegNumber: e.target.value })} />
              </Field>
              <Field label="Tax ID / VAT Number (optional)" error={errors.taxIdNumber}>
                <input id="tax-id-number" style={S.input(false)} placeholder="e.g. 123456789V" value={form.taxIdNumber} onChange={e => update({ taxIdNumber: e.target.value })} />
              </Field>
            </div>

            <div style={S.infoBanner}>
              🔒 Your documents are encrypted and used only for identity verification. They will not be shared publicly.
            </div>
          </section>
        )}

        {/* ══════════════ STEP 4: PRICING & SERVICES ══════════════ */}
        {step === 4 && (
          <section id="step-pricing">
            <SectionTitle icon="💰" title="Pricing & Packages" subtitle="Set your starting price and service packages" />
            <div style={S.twoCol}>
              <Field label="Starting Price" required error={errors.basePrice}>
                <input id="base-price" type="number" min="0" style={S.input(!!errors.basePrice)} placeholder="e.g. 50000" value={form.basePrice} onChange={e => update({ basePrice: e.target.value })} />
              </Field>
              <Field label="Currency" error={errors.currency}>
                <select id="price-currency" style={S.input(false)} value={form.currency} onChange={e => update({ currency: e.target.value })}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Pricing Notes (optional)" error={errors.pricingNotes}>
              <textarea
                id="pricing-notes"
                style={{ ...S.input(false), resize: 'vertical', minHeight: 70 }}
                placeholder="e.g. Prices vary by date and guest count. Contact for a custom quote."
                value={form.pricingNotes}
                onChange={e => update({ pricingNotes: e.target.value })}
                rows={3}
              />
            </Field>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Service Packages ({form.packages.length}/5)</h3>
                {form.packages.length < 5 && (
                  <button type="button" id="add-package-btn" style={S.btnSmOutline} onClick={addPackage}>+ Add Package</button>
                )}
              </div>
              {form.packages.map((pkg, i) => (
                <div key={i} style={S.packageCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#6b7280' }}>Package {i + 1}</span>
                    {form.packages.length > 1 && (
                      <button type="button" style={S.removeBtn} onClick={() => removePackage(i)}>Remove</button>
                    )}
                  </div>
                  <div style={S.twoCol}>
                    <Field label="Package Name">
                      <input id={`pkg-name-${i}`} style={S.input(false)} placeholder="e.g. Full Day Coverage" value={pkg.name} onChange={e => updatePackage(i, 'name', e.target.value)} />
                    </Field>
                    <Field label={`Price (${form.currency})`}>
                      <input id={`pkg-price-${i}`} type="number" min="0" style={S.input(false)} placeholder="e.g. 150000" value={pkg.price} onChange={e => updatePackage(i, 'price', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <input id={`pkg-desc-${i}`} style={S.input(false)} placeholder="What's included in this package?" value={pkg.description} onChange={e => updatePackage(i, 'description', e.target.value)} />
                  </Field>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════ STEP 5: REVIEW & SUBMIT ══════════════ */}
        {step === 5 && (
          <section id="step-review">
            <SectionTitle icon="✅" title="Review & Submit" subtitle="Check your details before submitting" />
            <div style={S.reviewBox}>
              <ReviewSection title="Account">
                <ReviewRow label="Name" value={`${form.ownerFirstName} ${form.ownerLastName}`} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Phone" value={form.phone} />
              </ReviewSection>
              <ReviewSection title="Business">
                <ReviewRow label="Business Name" value={form.businessName} />
                <ReviewRow label="Category" value={form.category + (form.subcategory ? ` › ${form.subcategory}` : '')} />
                <ReviewRow label="Location" value={form.location} />
                <ReviewRow label="Website" value={form.website || '—'} />
                <ReviewRow label="Years in Business" value={form.yearsInBusiness || '—'} />
              </ReviewSection>
              <ReviewSection title="Verification">
                <ReviewRow label="Reg. Number" value={form.businessRegNumber} />
                <ReviewRow label="Tax ID" value={form.taxIdNumber || '—'} />
                <ReviewRow label="Business Doc" value={docFileName || '—'} />
                <ReviewRow label="Logo" value={logoPreview ? 'Uploaded ✓' : '—'} />
                <ReviewRow label="Portfolio" value={portfolioPreviews.length > 0 ? `${portfolioPreviews.length} image(s)` : '—'} />
              </ReviewSection>
              <ReviewSection title="Pricing">
                <ReviewRow label="Starting Price" value={`${form.currency} ${form.basePrice}`} />
                <ReviewRow label="Packages" value={`${form.packages.filter(p => p.name).length} package(s) added`} />
              </ReviewSection>
            </div>

            <div style={S.consentBox}>
              <input type="checkbox" id="consent-checkbox" required style={{ marginRight: '0.5rem', accentColor: '#c45a74' }} />
              <label htmlFor="consent-checkbox" style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>
                I confirm that all information provided is accurate. I agree to the{' '}
                <a href="#" style={{ color: '#c45a74', textDecoration: 'underline' }}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" style={{ color: '#c45a74', textDecoration: 'underline' }}>Vendor Policy</a>.
              </label>
            </div>

            {submitError && (
              <div style={S.errorBanner} role="alert">{submitError}</div>
            )}
          </section>
        )}

        {/* ── Navigation ── */}
        <div style={S.navRow}>
          {step > 1 && (
            <button id="back-btn" style={S.btnOutline} onClick={back} disabled={loading}>
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button id="next-btn" style={{ ...S.btnPrimary, marginLeft: 'auto' }} onClick={next}>
              Next →
            </button>
          ) : (
            <button
              id="submit-vendor-btn"
              style={{ ...S.btnPrimary, marginLeft: 'auto', opacity: loading ? 0.7 : 1 }}
              onClick={submit}
              disabled={loading}
            >
              {loading ? '⏳ Submitting…' : '🚀 Submit Application'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#c45a74', textDecoration: 'underline' }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */
function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
      <div style={{ height: 1, background: '#f3f4f6', margin: '0.75rem 0' }} />
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: '#374151' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>{error}</p>}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{title}</div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f3f4f6', gap: '1rem' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.8rem', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: '0.8rem', color: '#111827', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */
const S: Record<string, any> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2rem 1rem 3rem',
    background: 'linear-gradient(135deg, #fdf2f5 0%, #f5f3ff 50%, #f0f9ff 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 620,
    background: '#ffffff',
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    padding: '2.5rem 2rem',
    border: '1px solid #f3f4f6',
  },
  brandBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #c45a74, #a855f7)',
    color: '#fff',
    borderRadius: 24,
    padding: '0.25rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    marginBottom: '0.75rem',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '0.2rem',
  },
  progressTrack: {
    height: 6,
    background: '#f3f4f6',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #c45a74, #a855f7)',
    borderRadius: 99,
    transition: 'width 400ms cubic-bezier(.4,0,.2,1)',
  },
  stepPills: {
    display: 'flex',
    gap: '0.4rem',
    marginBottom: '1.75rem',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.6rem',
    borderRadius: 99,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#9ca3af',
    fontSize: '0.7rem',
  },
  pillActive: { background: '#fdf2f5', borderColor: '#c45a74', color: '#c45a74' },
  pillDone: { background: '#f0fdf4', borderColor: '#22c55e', color: '#22c55e' },
  pillDot: { width: 18, height: 18, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af' },
  pillDotActive: { background: '#c45a74', color: '#fff' },
  pillDotDone: { background: '#22c55e', color: '#fff' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  input: (hasError: boolean) => ({
    width: '100%',
    padding: '0.6rem 0.875rem',
    fontSize: '0.875rem',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: 10,
    outline: 'none',
    background: '#fafafa',
    color: '#111827',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
    appearance: 'auto',
  }),
  uploadZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 140,
    border: '2px dashed #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    background: '#fafafa',
    transition: 'border-color 150ms ease',
  },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  imgRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 },
  infoBanner: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 10,
    color: '#1d4ed8',
    fontSize: '0.8rem',
  },
  packageCard: {
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    marginBottom: '0.75rem',
    background: '#fafafa',
  },
  reviewBox: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  consentBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.25rem',
    padding: '0.875rem',
    background: '#fdf2f5',
    border: '1px solid #fcd7e2',
    borderRadius: 10,
    marginBottom: '1rem',
  },
  errorBanner: {
    padding: '0.75rem 1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    color: '#dc2626',
    fontSize: '0.825rem',
  },
  navRow: { display: 'flex', alignItems: 'center', marginTop: '1.5rem', gap: '0.75rem' },
  btnPrimary: {
    padding: '0.65rem 1.5rem',
    background: 'linear-gradient(135deg, #c45a74, #a855f7)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'opacity 150ms ease',
  },
  btnOutline: {
    padding: '0.65rem 1.25rem',
    background: 'transparent',
    color: '#6b7280',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  btnSmOutline: {
    padding: '0.3rem 0.75rem',
    background: 'transparent',
    color: '#c45a74',
    border: '1.5px solid #c45a74',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0 4px',
    lineHeight: 1,
  },
  successIcon: { fontSize: '4rem', marginBottom: '1rem' },
};

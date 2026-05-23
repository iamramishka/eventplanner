"use client"
import { useState } from "react";
import "../../shared/design-tokens.css";
import "./styles.css";

export const metadata = {
  title: "Sign In - WedPlan",
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire auth
    console.log({ email, password, remember });
  }

  return (
    <div className="auth-shell">
      <aside className="auth-panel">
        <div className="brand">WedPlan</div>
        <h2 className="panel-title">Plan your perfect day</h2>
        <p className="panel-copy">Join couples worldwide using WedPlan to organise invitations, guests and vendors — beautifully.</p>
        <div className="panel-illus" aria-hidden />
      </aside>

      <main className="auth-form-wrap">
        <div className="auth-box">
          <div className="auth-header">
            <h1>Sign in to WedPlan</h1>
            <a className="small-link" href="/register">Create an account</a>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="label">Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@domain.com" />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <div className="password-row">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
                <button type="button" className="toggle" onClick={() => setShowPassword(v => !v)} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </label>

            <div className="form-row between">
              <label className="inline"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label>
              <a className="small-link" href="/forgot-password">Forgot?</a>
            </div>

            <button className="btn primary" type="submit">Sign in</button>

            <div className="divider"><span>or</span></div>

            <div className="socials">
              <a className="btn social google" href="/api/auth/google">Continue with Google</a>
              <a className="btn social apple" href="/api/auth/apple">Continue with Apple</a>
            </div>

            <p className="security-note">We encrypt your data and never share your password. By signing in you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy</a>.</p>
          </form>
        </div>
      </main>
    </div>
  );
}

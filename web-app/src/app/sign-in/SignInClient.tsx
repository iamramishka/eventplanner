"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./styles.css";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="signInShell">
      <aside className="signInPanel">
        <div className="signInBrand">
          <span className="brandMark">W</span>
          <span>
            <strong>WedPlan</strong>
            <small>Plan Beautiful. Celebrate Forever.</small>
          </span>
        </div>
        <h1>Welcome back,<br /><span>Let&apos;s continue your wedding journey</span></h1>
        <div className="panelRule"><span /></div>
        <p>Sign in to access your dashboard and manage every beautiful detail.</p>
        <Image src="/public-site/wedding-couple.png" alt="Wedding couple" width={1024} height={1024} />
      </aside>

      <main className="signInFormPane">
        <div className="languagePill">English</div>
        <form className="signInCard" onSubmit={handleSubmit}>
          <h2>Sign in to your account</h2>
          <p>Enter your email and password<br />to access your dashboard.</p>

          <label>
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </label>

          <label>
            <span>Password</span>
            <div className="passwordField">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </label>

          <div className="signInOptions">
            <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          <button className="primaryAction" type="submit">Sign In</button>
          <div className="orDivider">or continue with</div>
          <Link className="socialAction" href="/api/auth/google">Continue with Google</Link>
          <Link className="socialAction" href="/api/auth/apple">Continue with Apple</Link>
          <div className="secureNote"><strong>Your data is secure with us.</strong><span>We use enterprise-grade security to keep your information safe.</span></div>
        </form>
        <div className="authSwitch">Don&apos;t have an account? <Link href="/register">Sign Up</Link></div>
      </main>
    </div>
  );
}

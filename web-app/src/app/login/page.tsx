"use client";
import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Globe, ChevronDown, Heart, ShieldCheck, LogIn } from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const from = params?.get("from") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
      return;
    }
    // Fetch the session to determine the role and route accordingly
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "COUPLE") { router.push("/couple"); return; }
      if (role === "VENDOR") { router.push("/vendor"); return; }
      if (role === "SUPER_ADMIN") { router.push("/super"); return; }
    } catch {
      // fall through to default redirect
    }
    router.push(from === "/login" ? "/" : from);
  }

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
          
          <div className={styles.welcomeText}>
            Welcome back,<br />
            <span className={styles.highlightText}>Let's continue your<br />wedding journey</span>
          </div>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <Heart size={16} fill="currentColor" className={styles.dividerIcon} />
            <div className={styles.dividerLine}></div>
          </div>

          <p className={styles.subtitleText}>
            Sign in to access your dashboard and manage every beautiful detail.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <button className={styles.languageSelector}>
          <Globe size={16} /> English <ChevronDown size={16} />
        </button>

        <div className={styles.formContainer}>
          <h2 className={styles.title}>Sign in to your account</h2>
          <p className={styles.subtitle}>
            Enter your email and password<br />to access your dashboard.
          </p>

          {error && <div className={styles.errorText}>{error}</div>}

          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={styles.input} 
                  placeholder="you@example.com"
                  required 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={styles.input} 
                  placeholder="Enter your password"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className={styles.togglePassword}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input type="checkbox" /> Remember me
              </label>
              <Link href="#" className={styles.forgotPassword}>Forgot password?</Link>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <LogIn size={18} /> {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className={styles.orDivider}>or continue with</div>

          <div className={styles.socialBtns}>
            <button type="button" className={styles.socialBtn}>
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" unoptimized /> Continue with Google
            </button>
            <button type="button" className={styles.socialBtn}>
              <Image src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" width="20" height="20" unoptimized /> Continue with Apple
            </button>
          </div>

          <div className={styles.securityNote}>
            <ShieldCheck size={24} className={styles.securityIcon} />
            <div>
              <div className={styles.securityTitle}>Your data is secure with us.</div>
              <div className={styles.securityDesc}>We use enterprise-grade security to keep your information safe.</div>
            </div>
          </div>
        </div>
        
        <div className={styles.signupPrompt}>
          Don't have an account? <Link href="/register" className={styles.signupLink}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import SignInClient from "./SignInClient";
import "./styles.css";

export const metadata: Metadata = {
  title: "Sign In - WedPlan",
};

export default function SignInPage() {
  return <SignInClient />;
}

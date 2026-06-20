import { redirect } from 'next/navigation';

// Redirect legacy /forgot-password link to the working password-reset page
export default function ForgotPasswordPage() {
  redirect('/reset');
}

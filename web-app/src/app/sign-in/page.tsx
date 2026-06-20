import { redirect } from 'next/navigation';

// /sign-in was a broken duplicate of /login — redirect permanently to the real auth page
export default function SignInPage() {
  redirect('/login');
}

import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect to the admin login for now
  // We can add a public landing page later if needed.
  redirect('/login');
}

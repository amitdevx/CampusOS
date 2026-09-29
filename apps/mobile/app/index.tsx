import { Redirect } from 'expo-router';

export default function Index() {
  // For now, immediately redirect to the auth flow
  // Later, we'll check secure storage for a JWT token
  return <Redirect href="/(auth)/login" />;
}

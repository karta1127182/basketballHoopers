import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/lib/auth';
import { LeagueProvider } from '@/lib/league';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LeagueProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#050505' },
            animation: 'fade',
          }}
        />
      </LeagueProvider>
    </AuthProvider>
  );
}

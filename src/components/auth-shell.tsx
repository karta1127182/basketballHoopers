import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{ eyebrow: string; title: string; subtitle: string }>;

export function AuthShell({ eyebrow, title, subtitle, children }: Props) {
  const router = useRouter();
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.replace('/')} style={styles.back}>
          <Text style={styles.backText}>‹ 返回首頁</Text>
        </Pressable>
        <View style={styles.card}>
          <Image source={require('../../assets/images/logo-glow.png')} style={styles.logo} contentFit="contain" />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.form}>{children}</View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050505' },
  content: { flexGrow: 1 },
  safe: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  back: { width: '100%', maxWidth: 480, paddingVertical: 12 },
  backText: { color: '#dc9a3e', fontWeight: '700' },
  card: { width: '100%', maxWidth: 480, backgroundColor: '#100d09', borderWidth: 1, borderColor: '#3c2814', padding: 24 },
  logo: { width: 128, height: 112, alignSelf: 'center' },
  eyebrow: { color: '#e8a23f', fontWeight: '900', fontSize: 11, letterSpacing: 3, textAlign: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  subtitle: { color: '#aea59b', lineHeight: 22, textAlign: 'center', marginTop: 8 },
  form: { gap: 14, marginTop: 24 },
});

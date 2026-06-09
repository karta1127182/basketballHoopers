import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthShell } from '@/components/auth-shell';
import { FormInput } from '@/components/form-input';
import { GoldButton } from '@/components/gold-button';
import { api } from '@/lib/api';
import { AuthUser, useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage('');
    try {
      const user = await api<AuthUser>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });
      setUser(user);
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="MEMBER ACCESS" title="會員登入" subtitle="登入後查看你的個人數據與最近比賽紀錄。">
      <FormInput label="手機號碼" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0912 345 678" />
      <FormInput label="密碼" value={password} onChangeText={setPassword} secureTextEntry placeholder="請輸入密碼" />
      {!!message && <Text style={styles.message}>{message}</Text>}
      <GoldButton label={loading ? '登入中...' : '登入'} onPress={login} disabled={loading} />
      <Text style={styles.footer}>還沒有帳號？ <Link href="/register" style={styles.link}>立即註冊</Link></Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  message: { color: '#f3ae4e', lineHeight: 20 },
  footer: { color: '#aaa096', textAlign: 'center', marginTop: 4 },
  link: { color: '#eea43a', fontWeight: '800' },
});

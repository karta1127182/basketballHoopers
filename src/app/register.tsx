import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/auth-shell';
import { FormInput } from '@/components/form-input';
import { GoldButton } from '@/components/gold-button';
import { api } from '@/lib/api';
import { AuthUser, useAuth } from '@/lib/auth';

type Captcha = { captchaId: string; question: string };
type SmsResponse = { verificationId: string; developmentCode?: string };

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'COACH'>('MEMBER');
  const [captcha, setCaptcha] = useState<Captcha>();
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { refreshCaptcha(); }, []);

  async function refreshCaptcha() {
    try {
      setCaptcha(await api<Captcha>('/auth/captcha'));
      setCaptchaAnswer('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '無法取得驗證題目');
    }
  }

  async function sendSms() {
    if (!captcha) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await api<SmsResponse>('/auth/sms/send', {
        method: 'POST',
        body: JSON.stringify({ phone, captchaId: captcha.captchaId, captchaAnswer }),
      });
      setVerificationId(response.verificationId);
      setMessage(response.developmentCode ? `開發環境驗證碼：${response.developmentCode}` : '驗證碼已發送');
      await refreshCaptcha();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '驗證碼發送失敗');
      await refreshCaptcha();
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    setLoading(true);
    setMessage('');
    try {
      const user = await api<AuthUser>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, birthday, phone, password, role, verificationId, smsCode }),
      });
      setUser(user);
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="JOIN THE TEAM" title="建立會員帳號" subtitle="完成手機驗證，開始記錄你的每一次進步。">
      <FormInput label="姓名" value={name} onChangeText={setName} placeholder="請輸入姓名" />
      <FormInput label="生日" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />
      <FormInput label="手機號碼" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0912 345 678" />
      <FormInput label="密碼" value={password} onChangeText={setPassword} secureTextEntry placeholder="至少 8 個字元" />
      <View style={styles.roleRow}>
        <Pressable style={[styles.roleButton, role === 'MEMBER' && styles.roleButtonActive]} onPress={() => setRole('MEMBER')}>
          <Text style={[styles.roleText, role === 'MEMBER' && styles.roleTextActive]}>會員</Text>
        </Pressable>
        <Pressable style={[styles.roleButton, role === 'COACH' && styles.roleButtonActive]} onPress={() => setRole('COACH')}>
          <Text style={[styles.roleText, role === 'COACH' && styles.roleTextActive]}>教練</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormInput label="驗證題目" value={captchaAnswer} onChangeText={setCaptchaAnswer} keyboardType="number-pad" placeholder={captcha?.question ?? '載入中...'} />
        </View>
        <Pressable style={styles.smallButton} onPress={refreshCaptcha}>
          <Text style={styles.smallButtonText}>換一題</Text>
        </Pressable>
      </View>
      <Pressable style={styles.smsButton} onPress={sendSms} disabled={loading}>
        <Text style={styles.smsButtonText}>{verificationId ? '重新發送驗證碼' : '發送手機驗證碼'}</Text>
      </Pressable>
      <FormInput label="手機驗證碼" value={smsCode} onChangeText={setSmsCode} keyboardType="number-pad" placeholder="請輸入 6 位數驗證碼" />
      {!!message && <Text style={styles.message}>{message}</Text>}
      <GoldButton label={loading ? '處理中...' : '完成註冊'} onPress={register} disabled={loading || !verificationId} />
      <Text style={styles.footer}>已經有帳號？ <Link href="/login" style={styles.link}>會員登入</Link></Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  flex: { flex: 1 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleButton: { flex: 1, borderColor: '#704318', borderWidth: 1, padding: 14, alignItems: 'center' },
  roleButtonActive: { backgroundColor: '#241a10', borderColor: '#d5943c' },
  roleText: { color: '#a79e94', fontWeight: '900' },
  roleTextActive: { color: '#f0a642' },
  smallButton: { borderColor: '#704318', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  smallButtonText: { color: '#e6a348', fontWeight: '800' },
  smsButton: { borderColor: '#b66c20', borderWidth: 1, padding: 14, alignItems: 'center' },
  smsButtonText: { color: '#f1aa45', fontWeight: '900' },
  message: { color: '#f3ae4e', lineHeight: 20 },
  footer: { color: '#aaa096', textAlign: 'center', marginTop: 4 },
  link: { color: '#eea43a', fontWeight: '800' },
});

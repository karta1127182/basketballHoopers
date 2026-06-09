import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GoldButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#f2a638', paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  label: { color: '#160d05', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});

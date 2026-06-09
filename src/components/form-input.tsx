import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export function FormInput({ label, ...props }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#756a5d"
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: '#e4d9cc', fontSize: 13, fontWeight: '700' },
  input: {
    color: '#fff',
    backgroundColor: '#090806',
    borderColor: '#3a2b1d',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

interface AuthTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const AuthTextInput: React.FC<AuthTextInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  placeholder,
  multiline = false,
  numberOfLines = 1,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        disabled={disabled}
        error={!!error}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          error && { borderColor: theme.colors.error }
        ]}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        contentStyle={styles.inputContent}
      />
      {error && (
        <Text 
          variant="bodySmall" 
          style={[
            styles.errorText, 
            { color: theme.colors.error }
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
  },
  inputContent: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});

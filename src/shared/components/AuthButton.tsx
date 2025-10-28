import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  icon,
}) => {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      style={[
        styles.button,
        mode === 'contained' && {
          backgroundColor: theme.colors.primary,
        },
        mode === 'outlined' && {
          borderColor: theme.colors.primary,
          borderWidth: 1,
        },
      ]}
      labelStyle={[
        styles.buttonText,
        mode === 'contained' && { color: theme.colors.onPrimary },
        mode === 'outlined' && { color: theme.colors.primary },
        mode === 'text' && { color: theme.colors.primary },
      ]}
      contentStyle={styles.buttonContent}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

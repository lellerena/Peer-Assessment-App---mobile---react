import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface ErrorAlertProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  visible, 
  onDismiss 
}) => {
  const theme = useTheme();

  if (!visible || !message) return null;

  return (
    <Card 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.errorContainer,
          borderLeftColor: theme.colors.error,
          borderLeftWidth: 4,
        }
      ]}
      onPress={onDismiss}
    >
      <Card.Content style={styles.content}>
        <Text 
          variant="bodyMedium" 
          style={[
            styles.text, 
            { color: theme.colors.onErrorContainer }
          ]}
        >
          {message}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontWeight: '500',
  },
});

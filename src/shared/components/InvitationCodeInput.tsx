import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';

interface InvitationCodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  onJoin: () => void;
  loading?: boolean;
}

export const InvitationCodeInput: React.FC<InvitationCodeInputProps> = ({
  code,
  onCodeChange,
  onJoin,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="account-plus" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Unirse con código
          </Text>
        </View>
        
        <Text variant="bodySmall" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Ingresa el código de invitación que te compartió tu profesor
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            label="Código de invitación"
            value={code}
            onChangeText={onCodeChange}
            style={styles.input}
            left={<TextInput.Icon icon="grid" />}
            placeholder="Ej: ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
            disabled={loading}
          />
          <Button
            mode="contained"
            onPress={onJoin}
            style={styles.joinButton}
            disabled={!code.trim() || loading}
            loading={loading}
            icon="arrow-right"
          >
            Unirse
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
  },
  content: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
  },
  joinButton: {
    borderRadius: 8,
    minWidth: 100,
  },
});

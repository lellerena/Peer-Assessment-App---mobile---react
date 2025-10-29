import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

interface CourseHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  loading?: boolean;
  userEmail?: string;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  onRefresh,
  onLogout,
  loading = false,
  userEmail,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Main header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Mis Cursos
          </Text>
          {userEmail && (
            <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {userEmail}
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <Button
            mode="text"
            onPress={onRefresh}
            icon="refresh"
            disabled={loading}
            loading={loading}
            style={styles.actionButton}
            labelStyle={[styles.actionLabel, { color: theme.colors.primary }]}
          >
            Recargar
          </Button>
          
          <Button
            mode="outlined"
            onPress={onLogout}
            icon="logout"
            style={[styles.logoutButton, { borderColor: theme.colors.outline }]}
            labelStyle={[styles.actionLabel, { color: theme.colors.onSurface }]}
          >
            Salir
          </Button>
        </View>
      </View>

      {/* Welcome message */}
      <View style={styles.welcomeContainer}>
        <MaterialCommunityIcons 
          name="school" 
          size={20} 
          color={theme.colors.primary} 
        />
        <Text variant="bodyMedium" style={[styles.welcomeText, { color: theme.colors.onSurfaceVariant }]}>
          Bienvenido a Edu Manage - Evaluate, Learn, Grow
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    minWidth: 0,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    minWidth: 0,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  welcomeText: {
    flex: 1,
    fontWeight: '500',
  },
});

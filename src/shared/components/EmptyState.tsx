import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  type: 'created' | 'enrolled' | 'available';
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  actionLabel,
}) => {
  const theme = useTheme();

  const getContent = () => {
    switch (type) {
      case 'created':
        return {
          icon: 'book-plus',
          title: '¡Crea tu primer curso!',
          description: 'Comienza compartiendo tu conocimiento con otros estudiantes.',
          actionLabel: actionLabel || 'Crear Curso',
        };
      case 'enrolled':
        return {
          icon: 'school',
          title: 'No estás inscrito en ningún curso',
          description: 'Explora los cursos disponibles y únete a uno que te interese.',
          actionLabel: actionLabel || 'Ver Cursos Disponibles',
        };
      case 'available':
        return {
          icon: 'magnify',
          title: 'No hay cursos disponibles',
          description: 'Por ahora no hay cursos nuevos para inscribirse.',
          actionLabel: actionLabel || 'Recargar',
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons 
          name={content.icon as any} 
          size={48} 
          color={theme.colors.onSurfaceVariant} 
        />
      </View>
      
      <Text 
        variant="headlineSmall" 
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        {content.title}
      </Text>
      
      <Text 
        variant="bodyLarge" 
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      >
        {content.description}
      </Text>

      {onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
          icon={type === 'created' ? 'plus' : type === 'available' ? 'refresh' : 'school'}
        >
          {content.actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});

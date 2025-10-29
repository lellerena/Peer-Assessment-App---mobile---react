import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, useTheme } from 'react-native-paper';

interface CourseCardProps {
  course: {
    _id: string;
    name: string;
    description: string;
    teacherId: string;
    studentIds: string[];
  };
  type: 'created' | 'enrolled' | 'available';
  onAction: (courseId: string) => void;
  onEnter?: (courseId: string) => void;
  loading?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  type,
  onAction,
  onEnter,
  loading = false,
}) => {
  const theme = useTheme();

  const getActionButton = () => {
    switch (type) {
      case 'available':
        return (
          <Button
            mode="contained"
            onPress={() => onAction(course._id)}
            loading={loading}
            disabled={loading}
            icon="account-plus"
            style={styles.actionButton}
          >
            Inscribirse
          </Button>
        );
      case 'created':
        return (
          <View style={styles.createdActions}>
            <Button
              mode="outlined"
              onPress={() => onEnter?.(course._id)}
              icon="eye"
              style={styles.actionButton}
            >
              Ver
            </Button>
            <Button
              mode="contained"
              onPress={() => onAction(course._id)}
              icon="cog"
              style={styles.actionButton}
            >
              Gestionar
            </Button>
          </View>
        );
      case 'enrolled':
        return (
          <Button
            mode="contained"
            onPress={() => onEnter?.(course._id)}
            icon="arrow-right"
            style={styles.actionButton}
          >
            Entrar
          </Button>
        );
    }
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'created':
        return {
          icon: 'account-tie',
          label: 'Profesor',
          color: theme.colors.primary,
        };
      case 'enrolled':
        return {
          icon: 'account',
          label: 'Estudiante',
          color: theme.colors.secondary,
        };
      case 'available':
        return {
          icon: 'school',
          label: 'Disponible',
          color: theme.colors.tertiary,
        };
    }
  };

  const typeInfo = getTypeInfo();
  const studentCount = Array.isArray(course.studentIds) ? course.studentIds.length : 0;

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* Header with type indicator */}
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <MaterialCommunityIcons 
              name={typeInfo.icon as any} 
              size={16} 
              color={typeInfo.color} 
            />
            <Text variant="bodySmall" style={[styles.typeLabel, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
          {type === 'created' && (
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.studentChip, { borderColor: theme.colors.outline }]}
            >
              {studentCount} estudiante{studentCount !== 1 ? 's' : ''}
            </Chip>
          )}
        </View>

        {/* Course title */}
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {course.name}
        </Text>

        {/* Course description */}
        <Text 
          variant="bodyMedium" 
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={3}
        >
          {course.description}
        </Text>

        {/* Course stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={14} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
              {studentCount} participante{studentCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        {getActionButton()}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studentChip: {
    height: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: 8,
  },
  createdActions: {
    flexDirection: 'row',
    gap: 8,
  },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function CourseDetailsScreen({ navigation, route }: any) {
  const theme = useTheme();
  const courseId = route?.params?.courseId || 'N/A';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name="book-open" 
          size={64} 
          color={theme.colors.primary} 
        />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Detalles del Curso
        </Text>
        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Contenido del curso: {courseId}
        </Text>
        <Text variant="bodyMedium" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
          Esta funcionalidad estará disponible próximamente.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  note: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

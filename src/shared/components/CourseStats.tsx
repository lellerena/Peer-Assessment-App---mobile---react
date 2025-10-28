import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface CourseStatsProps {
  created: number;
  enrolled: number;
  available: number;
}

export const CourseStats: React.FC<CourseStatsProps> = ({
  created,
  enrolled,
  available,
}) => {
  const theme = useTheme();

  const stats = [
    {
      label: 'Creados',
      value: created,
      icon: 'account-tie',
      color: theme.colors.primary,
    },
    {
      label: 'Inscritos',
      value: enrolled,
      icon: 'account',
      color: theme.colors.secondary,
    },
    {
      label: 'Disponibles',
      value: available,
      icon: 'school',
      color: theme.colors.tertiary,
    },
  ];

  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Resumen de Cursos
        </Text>
        
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
                <MaterialCommunityIcons 
                  name={stat.icon as any} 
                  size={20} 
                  color={stat.color} 
                />
              </View>
              <Text variant="headlineSmall" style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {stat.label}
              </Text>
            </View>
          ))}
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
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

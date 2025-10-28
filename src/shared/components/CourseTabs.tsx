import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

type CourseTab = "available" | "created" | "enrolled";

interface CourseTabsProps {
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
  counts?: {
    created: number;
    enrolled: number;
    available: number;
  };
}

export const CourseTabs: React.FC<CourseTabsProps> = ({
  activeTab,
  onTabChange,
  counts = { created: 0, enrolled: 0, available: 0 },
}) => {
  const theme = useTheme();

  const tabs = [
    {
      key: 'created' as CourseTab,
      label: 'Creados',
      icon: 'account-tie',
      count: counts.created,
    },
    {
      key: 'enrolled' as CourseTab,
      label: 'Inscritos',
      icon: 'account',
      count: counts.enrolled,
    },
    {
      key: 'available' as CourseTab,
      label: 'Disponibles',
      icon: 'school',
      count: counts.available,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Chip
            key={tab.key}
            selected={activeTab === tab.key}
            onPress={() => onTabChange(tab.key)}
            icon={({ size, color }) => (
              <MaterialCommunityIcons 
                name={tab.icon as any} 
                size={size} 
                color={color} 
              />
            )}
            style={[
              styles.tab,
              activeTab === tab.key && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={[
              styles.tabText,
              activeTab === tab.key && {
                color: theme.colors.onPrimary,
              },
            ]}
            compact
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

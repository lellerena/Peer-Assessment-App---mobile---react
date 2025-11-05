import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface AuthLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export const AuthLogo: React.FC<AuthLogoProps> = ({ size = 'medium' }) => {
  const theme = useTheme();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 32, titleSize: 20, subtitleSize: 12 };
      case 'large':
        return { iconSize: 64, titleSize: 36, subtitleSize: 18 };
      default:
        return { iconSize: 48, titleSize: 28, subtitleSize: 14 };
    }
  };

  const { iconSize, titleSize, subtitleSize } = getSizeStyles();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons 
          name="school" 
          size={iconSize} 
          color={theme.colors.primary} 
        />
      </View>
      <Text 
        variant="headlineMedium" 
        style={[
          styles.title, 
          { 
            color: theme.colors.primary,
            fontSize: titleSize,
            fontWeight: 'bold'
          }
        ]}
      >
        Edu Manage
      </Text>
      <Text 
        variant="bodyMedium" 
        style={[
          styles.subtitle, 
          { 
            color: theme.colors.onSurfaceVariant,
            fontSize: subtitleSize
          }
        ]}
      >
        Evaluate - Learn - Grow
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    opacity: 0.8,
    letterSpacing: 0.3,
  },
});

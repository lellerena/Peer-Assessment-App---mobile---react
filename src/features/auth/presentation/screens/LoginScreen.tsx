
import { AuthButton, AuthLogo, AuthTextInput, ErrorAlert } from "@/src/shared/components";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const theme = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo permitido
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$_-])[A-Za-z\d!@#$_-]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    setError(null);

    // Validate email
    if (!email.trim()) {
      setEmailError("El email es requerido");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Ingresa un email válido");
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("La contraseña es requerida");
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo permitido (!, @, #, $, _, -)");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          {/* Logo and Branding */}
          <AuthLogo size="large" />

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text 
              variant="headlineSmall" 
              style={[
                styles.welcomeTitle, 
                { color: theme.colors.onSurface }
              ]}
            >
              ¡Bienvenido de vuelta!
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[
                styles.welcomeSubtitle, 
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Inicia sesión para continuar tu aprendizaje
            </Text>
          </View>

          {/* Error Alert */}
          <ErrorAlert 
            message={error || ""} 
            visible={!!error}
            onDismiss={() => setError(null)}
          />

          {/* Form */}
          <View style={styles.formContainer}>
            <AuthTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
              disabled={loading}
            />

            <AuthTextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError || undefined}
              disabled={loading}
            />

            <AuthButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              mode="contained"
              icon="login"
            />

            <AuthButton
              title="¿No tienes cuenta? Regístrate"
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
              mode="text"
              icon="account-plus"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text 
              variant="bodySmall" 
              style={[
                styles.footerText, 
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Al continuar, aceptas nuestros términos de servicio
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  surface: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },
});


import { AuthButton, AuthLogo, AuthTextInput, ErrorAlert } from "@/src/shared/components";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/authContext";

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup } = useAuth();
  const theme = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo permitido
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$_-])[A-Za-z\d!@#$_-]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    
    // Validar confirmación de contraseña en tiempo real
    if (text.trim() && password.trim()) {
      if (password !== text) {
        setConfirmPasswordError("Las contraseñas no coinciden");
      } else {
        setConfirmPasswordError(null);
      }
    } else if (!text.trim()) {
      setConfirmPasswordError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    
    // Validar contraseña en tiempo real
    if (text.trim()) {
      if (!validatePassword(text)) {
        setPasswordError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo permitido (!, @, #, $, _, -)");
      } else {
        setPasswordError(null);
      }
    } else {
      setPasswordError(null);
    }
    
    // Si ya hay texto en confirmPassword, validar de nuevo
    if (confirmPassword.trim()) {
      if (text !== confirmPassword) {
        setConfirmPasswordError("Las contraseñas no coinciden");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
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

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirma tu contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      await signup(email.trim(), password);
      
      // Después del signup, verificar si el usuario está logueado
      // Si no está logueado, significa que necesita verificar email
      setTimeout(() => {
        // Pequeño delay para que el AuthContext se actualice
        alert("¡Cuenta creada exitosamente! Por favor verifica tu email antes de iniciar sesión.");
        navigation.navigate('Login');
      }, 100);
    } catch (err: any) {
      console.error("Signup failed", err);
      setError(err.message || "Error al crear la cuenta. Intenta de nuevo.");
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
              ¡Únete a Edu Manage!
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[
                styles.welcomeSubtitle, 
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Crea tu cuenta y comienza tu viaje de aprendizaje
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
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={passwordError || undefined}
              disabled={loading}
            />

            <AuthTextInput
              label="Confirmar Contraseña"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              error={confirmPasswordError || undefined}
              disabled={loading}
            />

            <AuthButton
              title="Crear Cuenta"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              mode="contained"
              icon="account-plus"
            />

            <AuthButton
              title="¿Ya tienes cuenta? Inicia sesión"
              onPress={() => navigation.goBack()}
              disabled={loading}
              mode="text"
              icon="login"
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
              Al crear una cuenta, aceptas nuestros términos de servicio
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

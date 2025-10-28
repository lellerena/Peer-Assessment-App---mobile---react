import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { AuthButton, AuthLogo, AuthTextInput, ErrorAlert } from "@/src/shared/components";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useCourses } from "../context/courseContext";

export default function CreateCourseScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { createCourse } = useCourses();
  const theme = useTheme();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Nombre y descripción son requeridos");
      return;
    }

    if (!user?.email) {
      setError("No hay usuario logueado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user ID
      const userId = (user as any).id || (user as any)._id || user.email;

      await createCourse({
        name: name.trim(),
        description: description.trim(),
        teacherId: userId,
        studentIds: [],
        categoryIds: [],
      });

      // Navigate back and show success
      navigation.goBack();
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err instanceof Error ? err.message : "Error al crear el curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Logo and branding */}
        <View style={styles.header}>
          <AuthLogo size="medium" />
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Crear Nuevo Curso
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Comparte tu conocimiento con otros estudiantes
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <ErrorAlert 
            message={error} 
            visible={!!error}
            onDismiss={() => setError(null)} 
          />
        )}

        {/* Form */}
        <View style={styles.form}>
          <AuthTextInput
            label="Nombre del curso"
            value={name}
            onChangeText={setName}
            placeholder="Ej: Matemáticas Avanzadas"
            error={!name.trim() && name.length > 0 ? "El nombre es requerido" : undefined}
          />

          <AuthTextInput
            label="Descripción del curso"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe el contenido y objetivos del curso..."
            multiline
            numberOfLines={4}
            error={!description.trim() && description.length > 0 ? "La descripción es requerida" : undefined}
          />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <AuthButton
              title="Crear Curso"
              onPress={handleCreate}
              loading={loading}
              disabled={loading || !name.trim() || !description.trim()}
              icon="plus"
              mode="contained"
            />

            <AuthButton
              title="Cancelar"
              onPress={() => navigation.goBack()}
              disabled={loading}
              icon="arrow-left"
              mode="outlined"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    gap: 16,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
});


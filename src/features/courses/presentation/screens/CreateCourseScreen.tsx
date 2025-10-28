import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useCourses } from "../context/courseContext";

export default function CreateCourseScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { createCourse } = useCourses();
  
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Crear Nuevo Curso
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Nombre del curso"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !name.trim() || !description.trim()}
          style={styles.button}
        >
          Crear Curso
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancelar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
  },
});


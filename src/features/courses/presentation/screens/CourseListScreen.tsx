import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Chip, FAB, Text, TextInput } from "react-native-paper";
import { useCourses } from "../context/courseContext";

type CourseTab = "available" | "created" | "enrolled";

export default function CourseListScreen({ navigation }: { navigation: any }) {
  const { availableCourses, createdCourses, enrolledCourses, loading, error, refreshCourses, joinCourse } = useCourses();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<CourseTab>("created");
  const [invitationCode, setInvitationCode] = useState("");


  const getCurrentCourses = () => {
    switch (activeTab) {
      case "available":
        return availableCourses;
      case "created":
        return createdCourses;
      case "enrolled":
        return enrolledCourses;
    }
  };

  const handleJoinCourse = async () => {
    console.log("Joining course with code:", invitationCode);
    alert("Funcionalidad de código de invitación pendiente");
    setInvitationCode("");
  };

  const handleEnterCourse = async (courseId: string) => {
    try {
      await joinCourse(courseId);
      alert("Te has inscrito exitosamente al curso");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al inscribirse al curso");
    }
  };

  const renderCourseCard = (course: any) => (
    <Card style={styles.courseCard} key={course._id}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.courseTitle}>
          {course.name}
        </Text>
        <Text variant="bodyMedium" style={styles.courseDescription}>
          {course.description}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => {
            if (activeTab === "available") {
              handleEnterCourse(course._id);
            } else {
              navigation.navigate("CourseDetail", { course });
            }
          }}
        >
          {activeTab === "available" ? "Inscribirse" : "Entrar"}
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Cursos
        </Text>
        <View style={styles.headerActions}>
          <Button 
            mode="text" 
            onPress={() => refreshCourses()} 
            icon="refresh"
            disabled={loading}
          >
            Recargar
          </Button>
          <Button 
            onPress={() => {
              console.log("Logout button pressed");
              logout().catch(err => {
                console.error("Logout error:", err);
              });
            }} 
            icon="logout"
          >
            Salir
          </Button>
        </View>
      </View>

      {/* Invitation Code Input */}
      <View style={styles.invitationContainer}>
        <TextInput
          mode="outlined"
          label="Ingresa código de invitación"
          value={invitationCode}
          onChangeText={setInvitationCode}
          style={styles.invitationInput}
          left={<TextInput.Icon icon="grid" />}
        />
        <Button
          mode="contained"
          onPress={handleJoinCourse}
          style={styles.joinButton}
          disabled={!invitationCode.trim()}
        >
          Unirse
        </Button>
      </View>

      {/* Debug Info - Only show error if exists */}
      {error && (
        <View style={{ padding: 8, backgroundColor: '#ffebee' }}>
          <Text style={{ fontSize: 12, color: 'red' }}>Error: {error}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Chip
          selected={activeTab === "created"}
          onPress={() => setActiveTab("created")}
          style={[styles.tab, activeTab === "created" && styles.tabActive]}
        >
          Creados
        </Chip>
        <Chip
          selected={activeTab === "enrolled"}
          onPress={() => setActiveTab("enrolled")}
          style={[styles.tab, activeTab === "enrolled" && styles.tabActive]}
        >
          Inscritos
        </Chip>
        <Chip
          selected={activeTab === "available"}
          onPress={() => setActiveTab("available")}
          style={[styles.tab, activeTab === "available" && styles.tabActive]}
        >
          Disponibles
        </Chip>
      </View>

      {/* Course List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Cargando cursos...</Text>
        </View>
      ) : getCurrentCourses().length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {activeTab === "available" && "No hay cursos disponibles para inscribirse."}
            {activeTab === "created" && "No has creado ningún curso aún."}
            {activeTab === "enrolled" && "No estás inscrito en ningún curso."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentCourses()}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => renderCourseCard(item)}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB to create course */}
      {activeTab === "created" && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate("CreateCourse")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  invitationContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  invitationInput: {
    flex: 1,
  },
  joinButton: {
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "#6366f1",
  },
  listContent: {
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  courseTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  courseDescription: {
    color: "#666",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 80,
  },
});


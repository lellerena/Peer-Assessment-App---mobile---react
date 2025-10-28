import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import {
    CourseCard,
    CourseHeader,
    CourseStats,
    CourseTabs,
    EmptyState,
    ErrorAlert,
    InvitationCodeInput
} from "@/src/shared/components";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { useCourses } from "../context/courseContext";

type CourseTab = "available" | "created" | "enrolled";

export default function CourseListScreen({ navigation }: { navigation: any }) {
  const { 
    availableCourses, 
    createdCourses, 
    enrolledCourses, 
    loading, 
    error, 
    refreshCourses, 
    joinCourse 
  } = useCourses();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<CourseTab>("created");
  const [invitationCode, setInvitationCode] = useState("");
  const [joiningCourse, setJoiningCourse] = useState(false);

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
    if (!invitationCode.trim()) return;
    
    setJoiningCourse(true);
    try {
      console.log("Joining course with code:", invitationCode);
      // TODO: Implement actual join course functionality
      alert("Funcionalidad de código de invitación pendiente");
      setInvitationCode("");
    } catch (error) {
      console.error("Error joining course:", error);
      alert("Error al unirse al curso");
    } finally {
      setJoiningCourse(false);
    }
  };

  const handleCourseAction = async (courseId: string) => {
    try {
      if (activeTab === "available") {
        await joinCourse(courseId);
        alert("Te has inscrito exitosamente al curso");
      } else if (activeTab === "created") {
        // Navigate to course management
        navigation.navigate("CourseManagement", { courseId });
      }
    } catch (error) {
      console.error("Course action error:", error);
      alert(error instanceof Error ? error.message : "Error al realizar la acción");
    }
  };

  const handleEnterCourse = (courseId: string) => {
    // Navigate to course details/content
    navigation.navigate("CourseDetails", { courseId });
  };

  const handleLogout = async () => {
    try {
      console.log("Logout button pressed");
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleRefresh = () => {
    refreshCourses();
  };

  const handleCreateCourse = () => {
    navigation.navigate("CreateCourse");
  };

  const handleViewAvailableCourses = () => {
    setActiveTab("available");
  };

  const renderCourseCard = ({ item }: { item: any }) => (
    <CourseCard
      course={item}
      type={activeTab}
      onAction={handleCourseAction}
      onEnter={handleEnterCourse}
      loading={loading}
    />
  );

  const renderContent = () => {
    const courses = getCurrentCourses();
    
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState 
            type={activeTab} 
            onAction={activeTab === "available" ? handleRefresh : undefined}
            actionLabel="Recargar"
          />
        </View>
      );
    }

    if (courses.length === 0) {
      return (
        <EmptyState 
          type={activeTab}
          onAction={
            activeTab === "created" ? handleCreateCourse :
            activeTab === "enrolled" ? handleViewAvailableCourses :
            handleRefresh
          }
        />
      );
    }

    return (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderCourseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <CourseHeader
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        loading={loading}
        userEmail={user?.email}
      />

      {/* Course Stats */}
      <CourseStats
        created={createdCourses.length}
        enrolled={enrolledCourses.length}
        available={availableCourses.length}
      />

      {/* Error Alert */}
      {error && (
        <ErrorAlert 
          message={error} 
          visible={!!error}
          onDismiss={() => {}} 
        />
      )}

      {/* Invitation Code Input */}
      <InvitationCodeInput
        code={invitationCode}
        onCodeChange={setInvitationCode}
        onJoin={handleJoinCourse}
        loading={joiningCourse}
      />

      {/* Tabs */}
      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          created: createdCourses.length,
          enrolled: enrolledCourses.length,
          available: availableCourses.length,
        }}
      />

      {/* Course List */}
      {renderContent()}

      {/* FAB to create course */}
      {activeTab === "created" && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleCreateCourse}
          label="Crear Curso"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    borderRadius: 16,
  },
});


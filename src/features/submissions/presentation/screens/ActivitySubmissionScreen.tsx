import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { Activity } from "@/src/features/activities/domain/entities/Activity";
import { Group } from "@/src/features/groups/domain/entities/Group";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { CreateSubmissionUseCase } from "@/src/features/submissions/domain/usecases/CreateSubmissionUseCase";
import { UpdateSubmissionUseCase } from "@/src/features/submissions/domain/usecases/UpdateSubmissionUseCase";
import { GetSubmissionByActivityAndStudentUseCase } from "@/src/features/submissions/domain/usecases/GetSubmissionByActivityAndStudentUseCase";

export default function ActivitySubmissionScreen() {
  const route = useRoute<any>();
  const activity: Activity = route.params?.activity;
  const group: Group = route.params?.group;
  const navigation = useNavigation<any>();
  const di = useDI();
  const { user } = useAuth();
  
  const studentId = (user as any)?.id || (user as any)?._id;
  const createSubmissionUC = di.resolve<CreateSubmissionUseCase>(TOKENS.CreateSubmissionUC);
  const updateSubmissionUC = di.resolve<UpdateSubmissionUseCase>(TOKENS.UpdateSubmissionUC);
  const getSubmissionUC = di.resolve<GetSubmissionByActivityAndStudentUseCase>(TOKENS.GetSubmissionByActivityAndStudentUC);
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);
  const [hasSubmission, setHasSubmission] = useState(false);

  useEffect(() => {
    if (!studentId || !activity._id) return;
    getSubmissionUC.execute(activity._id, studentId).then(sub => {
      if (sub) {
        setContent(sub.content || "");
        setSubmissionDate(sub.submissionDate || null);
        setHasSubmission(true);
      }
    }).catch(() => {});
  }, [activity._id, studentId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async () => {
    if (!studentId || !activity._id || !group._id) return;
    setLoading(true);
    try {
      const payload = {
        studentId,
        activityId: activity._id,
        groupId: group._id,
        content: content.trim(),
        courseId: activity.courseId,
        submissionDate: new Date().toISOString().slice(0,10),
      };
      
      if (hasSubmission) {
        const existing = await getSubmissionUC.execute(activity._id, studentId);
        if (existing?._id) {
          await updateSubmissionUC.execute({ _id: existing._id, ...payload });
        }
      } else {
        await createSubmissionUC.execute(payload);
      }
      
      navigation.goBack();
    } catch (error) {
      alert("Error al guardar la entrega");
    } finally {
      setLoading(false);
    }
  };

  const belongsToGroup = group.studentIds?.includes(studentId || "");

  if (!belongsToGroup) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="titleLarge" style={{ marginBottom: 8, color: "#ffffff" }}>No puedes realizar esta actividad</Text>
            <Text style={{ color: "#e5e5e5" }}>Debes pertenecer al grupo para poder entregar esta actividad.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={{ marginBottom: 4, color: "#ffffff" }}>{activity.title}</Text>
          {activity.description && <Text variant="bodyMedium" style={{ marginTop: 4, color: "#e5e5e5" }}>{activity.description}</Text>}
          {activity.date && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Text style={{ color: "#b0b0b0" }}>📅 Fecha: {formatDate(activity.date)}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.submissionSection}>
        <Text variant="titleLarge" style={{ marginBottom: 8, color: "#ffffff" }}>Tu entrega:</Text>
        {submissionDate && (
          <Text variant="bodyMedium" style={{ marginBottom: 8, color: "#b0b0b0" }}>
            Última entrega: {formatDate(submissionDate)} 00:00
          </Text>
        )}
        <TextInput
          mode="outlined"
          label="Escribe tu entrega aquí..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          style={styles.textArea}
          placeholder="Escribe tu entrega aquí..."
          theme={{ colors: { primary: "#6366f1", text: "#ffffff", placeholder: "#888888", background: "#2d2d2d" } }}
          textColor="#ffffff"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={loading || !content.trim()}
        style={styles.submitButton}
      >
        {hasSubmission ? "Actualizar entrega" : "Enviar entrega"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1e1e" },
  contentContainer: { padding: 16 },
  headerCard: { borderRadius: 12, marginBottom: 16, backgroundColor: "#2d2d2d" },
  submissionSection: { marginBottom: 16 },
  textArea: { backgroundColor: "#2d2d2d", minHeight: 200 },
  submitButton: { marginTop: 8 },
  errorCard: { borderRadius: 12, margin: 16, backgroundColor: "#2d2d2d" },
});


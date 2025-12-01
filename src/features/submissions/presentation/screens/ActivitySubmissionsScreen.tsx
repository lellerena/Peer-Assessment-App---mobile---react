import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { Activity } from '@/src/features/activities/domain/entities/Activity';
import { Course } from '@/src/features/courses/domain/entities/Course';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { Submission } from '@/src/features/submissions/domain/entities/Submission';
import { GetSubmissionsByActivityUseCase } from '@/src/features/submissions/domain/usecases/GetSubmissionsByActivityUseCase';
import { GetGradeByActivityAndStudentUseCase } from '@/src/features/grades/domain/usecases/GetGradeByActivityAndStudentUseCase';
import { SaveGradeUseCase } from '@/src/features/grades/domain/usecases/SaveGradeUseCase';

type GradeInfo = {
  gradeId?: string;
  finalGrade?: number;
  feedback?: string;
  criterias?: Record<string, number>;
};

export default function ActivitySubmissionsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const di = useDI();
  const theme = useTheme();
  const { user } = useAuth();

  const activity: Activity | undefined = route.params?.activity;
  const course: Course | undefined = route.params?.course;
  const fallbackCourseTeacherId: string | undefined = route.params?.courseTeacherId;

  const currentUserId = (user as any)?.id || (user as any)?._id || user?.email;
  const courseTeacherId = course?.teacherId || fallbackCourseTeacherId;
  const isTeacher = !!currentUserId && !!courseTeacherId && currentUserId === courseTeacherId;

  const getSubmissionsUC = di.resolve<GetSubmissionsByActivityUseCase>(TOKENS.GetSubmissionsByActivityUC);
  const getGradeUC = di.resolve<GetGradeByActivityAndStudentUseCase>(TOKENS.GetGradeByActivityAndStudentUC);
  const saveGradeUC = di.resolve<SaveGradeUseCase>(TOKENS.SaveGradeUC);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [creativityScore, setCreativityScore] = useState('');
  const [presentationScore, setPresentationScore] = useState('');
  const [contentScore, setContentScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeFormLoading, setGradeFormLoading] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [currentGradeId, setCurrentGradeId] = useState<string | undefined>(undefined);
  const [gradesMap, setGradesMap] = useState<Record<string, GradeInfo>>({});

  const submissionKey = useCallback(
    (submission: Submission) => submission._id || `${submission.activityId}-${submission.studentId}`,
    []
  );

  const applyGradeInfoToForm = useCallback((info?: GradeInfo) => {
    if (!info) {
      setCurrentGradeId(undefined);
      setCreativityScore('');
      setPresentationScore('');
      setContentScore('');
      setFeedback('');
      return;
    }
    setCurrentGradeId(info.gradeId);
    const criterias = info.criterias || {};
    setCreativityScore(criterias.creatividad !== undefined ? String(criterias.creatividad) : '');
    setPresentationScore(criterias.presentacion !== undefined ? String(criterias.presentacion) : '');
    setContentScore(criterias.contenido !== undefined ? String(criterias.contenido) : '');
    setFeedback(info.feedback || '');
  }, []);

  const upsertGradeInfo = useCallback(
    (submission: Submission, info: GradeInfo) => {
      setGradesMap((prev) => ({
        ...prev,
        [submissionKey(submission)]: info,
      }));
    },
    [submissionKey]
  );

  const preloadGrades = useCallback(
    async (list: Submission[]) => {
      const results = await Promise.all(
        list.map(async (sub) => {
          try {
            const grade = await getGradeUC.execute(sub.activityId, sub.studentId);
            return { sub, grade };
          } catch {
            return { sub, grade: null };
          }
        })
      );
      setGradesMap((prev) => {
        const next = { ...prev };
        results.forEach(({ sub, grade }) => {
          if (grade) {
            next[submissionKey(sub)] = {
              gradeId: grade._id,
              finalGrade: grade.finalGrade,
              feedback: grade.feedback,
              criterias: grade.criterias,
            };
          }
        });
        return next;
      });
    },
    [getGradeUC, submissionKey]
  );

  const loadSubmissions = useCallback(async () => {
    if (!activity?._id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getSubmissionsUC.execute(activity._id);
      setSubmissions(data);
      await preloadGrades(data);
    } catch {
      setErrorMessage('No pudimos cargar las entregas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [activity?._id, getSubmissionsUC, preloadGrades]);

  useEffect(() => {
    loadSubmissions().catch(() => {});
  }, [loadSubmissions]);

  useEffect(() => {
    if (!gradingSubmission || !gradingSubmission.activityId || !gradingSubmission.studentId) {
      applyGradeInfoToForm(undefined);
      setGradeFormLoading(false);
      return;
    }
    setGradeFormLoading(true);
    getGradeUC
      .execute(gradingSubmission.activityId, gradingSubmission.studentId)
      .then((grade) => {
        if (grade) {
          const info: GradeInfo = {
            gradeId: grade._id,
            finalGrade: grade.finalGrade,
            feedback: grade.feedback,
            criterias: grade.criterias,
          };
          applyGradeInfoToForm(info);
          upsertGradeInfo(gradingSubmission, info);
        } else {
          applyGradeInfoToForm(undefined);
        }
      })
      .catch(() => {})
      .finally(() => setGradeFormLoading(false));
  }, [gradingSubmission, getGradeUC, applyGradeInfoToForm, upsertGradeInfo]);

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;
    if (!gradingSubmission.groupId) {
      alert('Esta entrega no tiene grupo asociado. No se puede calificar.');
      return;
    }
    const parseScore = (value: string, label: string) => {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) {
        throw new Error(`El campo ${label} debe ser un número entre 0 y 100.`);
      }
      return num;
    };

    try {
      const creatividad = parseScore(creativityScore, 'Creatividad');
      const presentacion = parseScore(presentationScore, 'Presentación');
      const contenido = parseScore(contentScore, 'Contenido');
      const finalGrade = Number(((creatividad + presentacion + contenido) / 3).toFixed(2));
      const courseId = course?._id || gradingSubmission.courseId || activity.courseId;
      if (!courseId) throw new Error('No encontramos el curso asociado.');
      const groupId = gradingSubmission.groupId;
      const studentId = gradingSubmission.studentId;
      setSavingGrade(true);
      await saveGradeUC.execute({
        gradeId: currentGradeId,
        assessmentId: gradingSubmission.activityId,
        activityId: gradingSubmission.activityId,
        courseId,
        groupId,
        studentId,
        criterias: {
          creatividad,
          presentacion,
          contenido,
        },
        finalGrade,
        feedback: feedback.trim() || undefined,
        gradedBy: currentUserId || 'teacher',
        gradedAt: new Date().toISOString(),
      });

      const refreshedGrade = await getGradeUC.execute(gradingSubmission.activityId, gradingSubmission.studentId);
      if (refreshedGrade) {
        const info: GradeInfo = {
          gradeId: refreshedGrade._id,
          finalGrade: refreshedGrade.finalGrade,
          feedback: refreshedGrade.feedback,
          criterias: refreshedGrade.criterias,
        };
        upsertGradeInfo(gradingSubmission, info);
      } else {
        upsertGradeInfo(gradingSubmission, {
          gradeId: currentGradeId,
          finalGrade,
          feedback: feedback.trim() || undefined,
          criterias: { creatividad, presentacion, contenido },
        });
      }

      alert('Calificación guardada correctamente.');
      setGradingSubmission(null);
    } catch (error: any) {
      alert(error?.message || 'Error al guardar la calificación.');
    } finally {
      setSavingGrade(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sin fecha';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const renderSubmission = ({ item }: { item: Submission }) => {
    const studentLabel = item.studentId?.slice(0, 8) || 'Sin ID';
    const gradeInfo = gradesMap[submissionKey(item)];
    return (
      <Card style={styles.submissionCard}>
        <Card.Content>
          <View style={styles.submissionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar.Text
                label={studentLabel.charAt(0).toUpperCase()}
                size={40}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{`Usuario ${studentLabel}`}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.studentId}
                </Text>
              </View>
            </View>
            <Chip icon="calendar" compact style={{ backgroundColor: theme.colors.secondaryContainer }}>
              {formatDate(item.submissionDate)}
            </Chip>
          </View>
          {item.content && (
            <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurface }}>
              {item.content}
            </Text>
          )}
          <View style={styles.chipsRow}>
            {item.groupId && (
              <Chip icon="account-group">
                Grupo: {item.groupId.slice(0, 6)}
              </Chip>
            )}
            {typeof gradeInfo?.finalGrade === 'number' && (
              <Chip icon="star" style={{ backgroundColor: theme.colors.tertiaryContainer }}>
                Nota: {gradeInfo.finalGrade}
              </Chip>
            )}
          </View>
          {gradeInfo?.feedback && (
            <Card style={styles.feedbackCard}>
              <Card.Content>
                <Text variant="labelLarge" style={{ marginBottom: 4 }}>
                  Retroalimentación
                </Text>
                <Text variant="bodyMedium" style={styles.feedbackText}>
                  {gradeInfo.feedback}
                </Text>
              </Card.Content>
            </Card>
          )}
          {isTeacher && (
            <View style={styles.cardActions}>
              <Button
                mode="contained"
                icon="star"
                onPress={() => {
                  if (!item.groupId) {
                    alert('Esta entrega no tiene grupo asociado. No se puede calificar.');
                    return;
                  }
                  applyGradeInfoToForm(gradesMap[submissionKey(item)]);
                  setGradingSubmission(item);
                }}
              >
                Calificar
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (!activity?._id) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No recibimos la actividad seleccionada.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          Volver
        </Button>
      </View>
    );
  }

  if (!isTeacher) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
      >
        <Card style={{ padding: 24, borderRadius: 16 }}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Avatar.Icon icon="lock" size={64} style={{ marginBottom: 16 }} />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              Solo el profesor del curso puede ver las entregas.
            </Text>
            <Button mode="contained" onPress={() => navigation.goBack()}>
              Volver
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text variant="headlineSmall" style={{ marginBottom: 4, color: theme.colors.onSurface }}>
                {activity.title}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {course?.name || 'Curso'}
              </Text>
              {activity.date && (
                <Chip icon="calendar" compact style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                  Fecha límite: {formatDate(activity.date)}
                </Chip>
              )}
            </View>
            <IconButton icon="refresh" onPress={loadSubmissions} disabled={loading} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Entregas recibidas: {submissions.length}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {errorMessage && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={{ color: theme.colors.error }}>{errorMessage}</Text>
            <Button onPress={loadSubmissions} style={{ marginTop: 8 }}>
              Reintentar
            </Button>
          </Card.Content>
        </Card>
      )}

      {loading && submissions.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator animating />
          <Text style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>Cargando entregas...</Text>
        </View>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Avatar.Icon icon="file-document-outline" size={72} style={{ marginBottom: 12 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
            Aún no hay entregas
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Cuando tus estudiantes envíen su trabajo lo verás aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item._id || `${item.studentId}-${item.activityId}`}
          renderItem={renderSubmission}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={loading}
          onRefresh={loadSubmissions}
        />
      )}

      <Portal>
        <Dialog visible={!!gradingSubmission} onDismiss={() => setGradingSubmission(null)} style={styles.dialog}>
          <Dialog.Title>Calificar Entrega</Dialog.Title>
          <Dialog.Content>
            <ScrollView
              style={{ maxHeight: 420 }}
              bounces={false}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              {gradeFormLoading && (
                <View style={styles.modalLoading}>
                  <ActivityIndicator animating />
                  <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    Cargando calificación...
                  </Text>
                </View>
              )}
              {!gradeFormLoading && gradingSubmission && (
                <>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Estudiante ID:</Text>
                    <Text style={styles.metaValue}>{gradingSubmission.studentId}</Text>
                  </View>
                  {gradingSubmission.groupId && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Grupo ID:</Text>
                      <Text style={styles.metaValue}>{gradingSubmission.groupId}</Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Fecha:</Text>
                    <Text style={styles.metaValue}>{formatDate(gradingSubmission.submissionDate)}</Text>
                  </View>
                  <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Contenido:</Text>
                  <View style={styles.contentPreview}>
                    <Text style={styles.contentText}>{gradingSubmission.content || 'Sin contenido'}</Text>
                  </View>
                </>
              )}

              {!gradeFormLoading && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Criterios de Calificación:</Text>
                  <TextInput
                    mode="outlined"
                    label="Creatividad (0-100)"
                    keyboardType="numeric"
                    value={creativityScore}
                    onChangeText={setCreativityScore}
                    style={{ marginTop: 8 }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Presentación (0-100)"
                    keyboardType="numeric"
                    value={presentationScore}
                    onChangeText={setPresentationScore}
                    style={{ marginTop: 12 }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Contenido (0-100)"
                    keyboardType="numeric"
                    value={contentScore}
                    onChangeText={setContentScore}
                    style={{ marginTop: 12 }}
                  />

                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Retroalimentación:</Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Ingrese comentarios para el estudiante"
                    multiline
                    numberOfLines={4}
                    value={feedback}
                    onChangeText={setFeedback}
                    style={{ marginTop: 8, marginBottom: 16 }}
                  />
                </>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setGradingSubmission(null)}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={handleSaveGrade}
              disabled={gradeFormLoading || savingGrade}
              style={{ marginLeft: 8 }}
              loading={savingGrade}
            >
              Guardar Calificación
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  submissionCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  feedbackCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  feedbackText: {
    color: '#312E81',
    lineHeight: 20,
  },
  cardActions: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FEE2E2',
  },
  dialog: {
    borderRadius: 24,
    paddingBottom: 12,
  },
  metaRow: {
    marginTop: 4,
  },
  metaLabel: {
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  metaValue: {
    color: '#111827',
  },
  sectionLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  contentPreview: {
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F6F5FB',
    minHeight: 60,
  },
  contentText: {
    color: '#1F2937',
    lineHeight: 20,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  modalLoading: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



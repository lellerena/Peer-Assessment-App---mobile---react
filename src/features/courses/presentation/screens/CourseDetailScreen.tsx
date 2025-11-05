import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Chip, Dialog, FAB, IconButton, Portal, RadioButton, Text, TextInput } from "react-native-paper";
import { Course } from "../../domain/entities/Course";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Category } from "@/src/features/categories/domain/entities/Category";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { GetCategoriesByCourseUseCase } from "@/src/features/categories/domain/usecases/GetCategoriesByCourseUseCase";
import { CreateCategoryUseCase } from "@/src/features/categories/domain/usecases/CreateCategoryUseCase";
import { UpdateCategoryUseCase } from "@/src/features/categories/domain/usecases/UpdateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/src/features/categories/domain/usecases/DeleteCategoryUseCase";
import { Activity } from "@/src/features/activities/domain/entities/Activity";
import { GetActivitiesByCourseUseCase } from "@/src/features/activities/domain/usecases/GetActivitiesByCourseUseCase";
import { CreateActivityUseCase } from "@/src/features/activities/domain/usecases/CreateActivityUseCase";
import { UpdateActivityUseCase } from "@/src/features/activities/domain/usecases/UpdateActivityUseCase";
import { DeleteActivityUseCase } from "@/src/features/activities/domain/usecases/DeleteActivityUseCase";
import { CreateGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/CreateGroupUseCase";

type CourseDetailTab = "info" | "categories" | "activities" | "assessments" | "participants" | "reports";

export default function CourseDetailScreen() {
  const route = useRoute<any>();
  const course: Course = route.params?.course;
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<CourseDetailTab>("info");
  const di = useDI();
  const { user } = useAuth();

  const currentUserId = (user as any)?.id || (user as any)?._id || user?.email;
  const isTeacher = currentUserId && course?.teacherId && currentUserId === course.teacherId;

  const getCategoriesUC = di.resolve<GetCategoriesByCourseUseCase>(TOKENS.GetCategoriesByCourseUC);
  const createCategoryUC = di.resolve<CreateCategoryUseCase>(TOKENS.CreateCategoryUC);
  const updateCategoryUC = di.resolve<UpdateCategoryUseCase>(TOKENS.UpdateCategoryUC);
  const deleteCategoryUC = di.resolve<DeleteCategoryUseCase>(TOKENS.DeleteCategoryUC);
  const getActivitiesByCourseUC = di.resolve<GetActivitiesByCourseUseCase>(TOKENS.GetActivitiesByCourseUC);
  const createActivityUC = di.resolve<CreateActivityUseCase>(TOKENS.CreateActivityUC);
  const updateActivityUC = di.resolve<UpdateActivityUseCase>(TOKENS.UpdateActivityUC);
  const deleteActivityUC = di.resolve<DeleteActivityUseCase>(TOKENS.DeleteActivityUC);
  const createGroupUC = di.resolve<CreateGroupUseCase_v2>(TOKENS.CreateGroupUC_v2);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [actTitle, setActTitle] = useState("");
  const [actDescription, setActDescription] = useState("");
  const [actDate, setActDate] = useState("");
  const [actCategoryId, setActCategoryId] = useState<string>("");
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catMethod, setCatMethod] = useState<"manual" | "random" | "selfAssigned">("random");
  const [catSize, setCatSize] = useState("2");

  const refreshCategories = async () => {
    if (!course?._id) return;
    setLoadingCategories(true);
    try {
      const data = await getCategoriesUC.execute(course._id);
      setCategories(data);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    refreshCategories().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?._id]);

  const refreshActivities = async () => {
    if (!course?._id) return;
    setLoadingActivities(true);
    try {
      const data = await getActivitiesByCourseUC.execute(course._id);
      setActivities(data);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (activeTab === "activities") {
      refreshActivities().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, course?._id]);

  const participants = useMemo(() => {
    if (!course) return [] as Array<{ id: string; role: "TEACHER" | "STUDENT" }>;
    const list: Array<{ id: string; role: "TEACHER" | "STUDENT" }> = [];
    if (course.teacherId) list.push({ id: course.teacherId, role: "TEACHER" });
    (course.studentIds || []).forEach((sid) => list.push({ id: sid, role: "STUDENT" }));
    return list;
  }, [course]);

  const categoryNameById = (id?: string) => {
    const found = categories.find(c => c._id === id);
    return found?.name || id || "";
  };

  const openNewActivity = () => {
    setEditingActivity(null);
    setActTitle("");
    setActDescription("");
    setActDate(new Date().toISOString().slice(0,10));
    setActCategoryId(categories[0]?._id || "");
    setShowActivityDialog(true);
  };

  const openEditActivity = (a: Activity) => {
    setEditingActivity(a);
    setActTitle(a.title);
    setActDescription(a.description || "");
    setActDate(a.date || "");
    setActCategoryId(a.categoryId);
    setShowActivityDialog(true);
  };

  const saveActivity = async () => {
    const payload = { title: actTitle.trim(), description: actDescription.trim(), date: actDate, courseId: course._id!, categoryId: actCategoryId } as any;
    if (editingActivity?._id) {
      await updateActivityUC.execute({ _id: editingActivity._id, ...payload });
    } else {
      await createActivityUC.execute(payload);
    }
    setShowActivityDialog(false);
    await refreshActivities();
  };

  const deleteActivity = async (id?: string) => {
    if (!id) return;
    await deleteActivityUC.execute(id);
    await refreshActivities();
  };

  const renderParticipant = ({ item }: { item: { id: string; role: "TEACHER" | "STUDENT" } }) => {
    const display = item.id?.slice(0, 8) || "";
    const name = `Usuario ${display}`;
    return (
      <Card style={styles.participantCard}>
        <Card.Content style={styles.participantContent}>
          <Avatar.Text size={40} label={name.charAt(0).toUpperCase()} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{name}</Text>
            <Text variant="bodySmall" style={{ color: "#6b7280" }}>{item.id}</Text>
            <View style={{ marginTop: 6 }}>
              <Chip compact>{item.role === "TEACHER" ? "PROFESOR" : "ESTUDIANTE"}</Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Chip selected={activeTab === "info"} onPress={() => setActiveTab("info")} style={[styles.tab, activeTab === "info" && styles.tabActive]}>Info</Chip>
        <Chip selected={activeTab === "categories"} onPress={() => setActiveTab("categories")} style={[styles.tab, activeTab === "categories" && styles.tabActive]}>Categorías</Chip>
        <Chip selected={activeTab === "activities"} onPress={() => setActiveTab("activities")} style={[styles.tab, activeTab === "activities" && styles.tabActive]}>Actividades</Chip>
        <Chip selected={activeTab === "assessments"} onPress={() => setActiveTab("assessments")} style={[styles.tab, activeTab === "assessments" && styles.tabActive]}>Evaluaciones</Chip>
        <Chip selected={activeTab === "participants"} onPress={() => setActiveTab("participants")} style={[styles.tab, activeTab === "participants" && styles.tabActive]}>Participantes</Chip>
        <Chip selected={activeTab === "reports"} onPress={() => setActiveTab("reports")} style={[styles.tab, activeTab === "reports" && styles.tabActive]}>Reportes</Chip>
      </View>

      {activeTab === "info" && (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.block}>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 8 }}>Descripción del curso</Text>
              <Text variant="bodyMedium">{course?.description || "Sin descripción"}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.block}>
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 8 }}>Participantes</Text>
              {participants.length === 0 ? (
                <Text style={{ color: "#6b7280" }}>Sin participantes</Text>
              ) : (
                <FlatList
                  data={participants}
                  keyExtractor={(p) => `${p.role}-${p.id}`}
                  renderItem={renderParticipant}
                />
              )}
              <View style={{ marginTop: 12 }}>
                <Button mode="contained" onPress={() => setActiveTab("participants")}>Ver estudiantes</Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {activeTab === "categories" && (
        <View style={styles.listContainer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text variant="titleLarge">Categorías ({categories.length})</Text>
            <IconButton icon="refresh" onPress={refreshCategories} disabled={loadingCategories} />
          </View>
          {categories.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No hay categorías</Text>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(c) => c._id || c.name}
              renderItem={({ item }) => (
                <Card style={styles.participantCard}>
                  <Card.Content>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text variant="titleMedium">{item.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <IconButton disabled={!isTeacher} icon="pencil" onPress={() => { if (!isTeacher) return; setEditingCategory(item); setCatName(item.name); setCatMethod(item.groupingMethod); setCatSize(String(item.groupSize)); setShowCatDialog(true); }} />
                        <IconButton disabled={!isTeacher} icon="delete" iconColor="#b91c1c" onPress={async () => { if (!isTeacher) return; if (!item._id) return; await deleteCategoryUC.execute(item._id); await refreshCategories(); }} />
                      </View>
                    </View>
                    <Text variant="bodySmall" style={{ color: "#6b7280" }}>Grouping: {item.groupingMethod} / Size: {item.groupSize}</Text>
                    <View style={{ marginTop: 8 }}>
                      <Button mode="text" onPress={() => navigation.navigate("CategoryDetail", { category: item, courseTeacherId: course.teacherId, courseStudentIds: course.studentIds })}>Ver grupos</Button>
                    </View>
                  </Card.Content>
                </Card>
              )}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}

          {isTeacher && (
            <FAB icon="plus" style={styles.fab} onPress={() => { setEditingCategory(null); setCatName(""); setCatMethod("random"); setCatSize("2"); setShowCatDialog(true); }} />
          )}

          <Portal>
            <Dialog visible={showCatDialog} onDismiss={() => setShowCatDialog(false)}>
              <Dialog.Title>{editingCategory ? "Editar categoría" : "Agregar categoría"}</Dialog.Title>
              <Dialog.Content>
                <TextInput label="Nombre" value={catName} onChangeText={setCatName} left={<TextInput.Icon icon="folder" />} style={{ marginBottom: 8 }} />
                <RadioButton.Group value={catMethod} onValueChange={(v) => setCatMethod(v as any)}>
                  <RadioButton.Item value="random" label="random" position="leading" style={{ width: "100%" }} />
                  <RadioButton.Item value="manual" label="manual" position="leading" style={{ width: "100%" }} />
                  <RadioButton.Item value="selfAssigned" label="selfAssigned" position="leading" style={{ width: "100%" }} />
                </RadioButton.Group>
                <TextInput label="Tamaño del grupo" keyboardType="numeric" value={catSize} onChangeText={setCatSize} left={<TextInput.Icon icon="format-list-numbered" />} />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowCatDialog(false)}>Cancelar</Button>
                <Button disabled={!isTeacher} onPress={async () => {
                  if (!isTeacher) return;
                  const payload = { courseId: course._id!, name: catName.trim(), groupingMethod: catMethod, groupSize: Number(catSize) } as any;
                  if (editingCategory && editingCategory._id) {
                    await updateCategoryUC.execute({ _id: editingCategory._id, ...payload });
                  } else {
                    const created = await createCategoryUC.execute(payload);
                    // Si es random, crear grupos y asignar estudiantes aleatoriamente
                    if (payload.groupingMethod === "random") {
                      const allStudents = Array.isArray(course.studentIds) ? course.studentIds : [];
                      const groupSizeNum = Math.max(1, Number(catSize));
                      const shuffled = [...allStudents].sort(() => Math.random() - 0.5);
                      const groupsCount = Math.ceil(shuffled.length / groupSizeNum);
                      const createCalls = [] as Promise<any>[];
                      for (let i = 0; i < groupsCount; i++) {
                        const members = shuffled.slice(i * groupSizeNum, (i + 1) * groupSizeNum);
                        createCalls.push(createGroupUC.execute({ categoryId: created._id!, name: `[${created.name}] Grupo ${i + 1}`, studentIds: members, courseId: course._id! }));
                      }
                      await Promise.all(createCalls);
                    }
                  }
                  setShowCatDialog(false);
                  await refreshCategories();
                }} mode="contained">Guardar</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      )}

      {activeTab === "participants" && (
        <View style={styles.listContainer}>
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>Participantes ({participants.length})</Text>
          <FlatList data={participants} keyExtractor={(p) => `${p.role}-${p.id}`} renderItem={renderParticipant} contentContainerStyle={{ paddingBottom: 24 }} />
        </View>
      )}

      {activeTab === "activities" && (
        <View style={styles.listContainer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text variant="titleLarge">Actividades ({activities.length})</Text>
            <IconButton icon="refresh" onPress={refreshActivities} disabled={loadingActivities} />
          </View>
          {loadingActivities ? (
            <Text style={{ color: "#6b7280" }}>Cargando actividades...</Text>
          ) : activities.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No hay actividades</Text>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(a) => a._id || a.title}
              renderItem={({ item }) => (
                <Card style={styles.participantCard}>
                  <Card.Content>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text variant="titleMedium">{item.title}</Text>
                      {isTeacher && (
                        <View style={{ flexDirection: "row" }}>
                          <IconButton icon="pencil" onPress={() => openEditActivity(item)} />
                          <IconButton icon="delete" iconColor="#b91c1c" onPress={() => deleteActivity(item._id)} />
                        </View>
                      )}
                    </View>
                    {item.description && <Text variant="bodyMedium" style={{ marginTop: 4, color: "#6b7280" }}>{item.description}</Text>}
                    {item.date && <Text variant="bodySmall" style={{ marginTop: 4, color: "#6b7280" }}>Fecha: {item.date}</Text>}
                    {item.categoryId && <Chip style={{ marginTop: 8 }} compact>Categoría: {categoryNameById(item.categoryId)}</Chip>}
                    <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                      <Button icon="clipboard-check" mode="contained" onPress={() => alert("Ver Entregas - próximamente")}>Ver Entregas</Button>
                    </View>
                  </Card.Content>
                </Card>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
          {isTeacher && (
            <FAB icon="plus" style={styles.fab} onPress={openNewActivity} />
          )}

          <Portal>
            <Dialog visible={showActivityDialog} onDismiss={() => setShowActivityDialog(false)}>
              <Dialog.Title>{editingActivity ? "Editar actividad" : "Agregar actividad"}</Dialog.Title>
              <Dialog.Content>
                <TextInput label="Title" value={actTitle} onChangeText={setActTitle} style={{ marginBottom: 8 }} />
                <TextInput label="Description" value={actDescription} onChangeText={setActDescription} multiline numberOfLines={4} style={{ marginBottom: 8 }} />
                <TextInput label="Date" value={actDate} onChangeText={setActDate} left={<TextInput.Icon icon="calendar" />} style={{ marginBottom: 8 }} />
                <Text style={{ marginBottom: 4 }}>Category</Text>
                <ScrollView style={{ maxHeight: 160 }}>
                  {categories.map(c => (
                    <Chip key={c._id} selected={actCategoryId === c._id} onPress={() => setActCategoryId(c._id!)} style={{ marginBottom: 6 }}>
                      {c.name}
                    </Chip>
                  ))}
                </ScrollView>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setShowActivityDialog(false)}>Cancel</Button>
                <Button mode="contained" onPress={saveActivity} disabled={!actTitle.trim() || !actCategoryId}>Save</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      )}

      {activeTab !== "info" && activeTab !== "participants" && activeTab !== "activities" && (
        <View style={styles.placeholder}> 
          <Text>Sección en construcción</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: { flexDirection: "row", padding: 16, gap: 8, flexWrap: "wrap" },
  tab: { borderRadius: 20 },
  tabActive: { backgroundColor: "#6366f1" },
  content: { padding: 16, gap: 16 },
  block: { borderRadius: 12 },
  listContainer: { flex: 1, padding: 16 },
  participantCard: { marginBottom: 12, borderRadius: 12 },
  participantContent: { flexDirection: "row", alignItems: "center" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: { position: "absolute", right: 16, bottom: 16 },
});



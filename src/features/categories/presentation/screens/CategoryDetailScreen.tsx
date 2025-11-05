import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Group } from "@/src/features/groups/domain/entities/Group";
import { AddStudentToGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/AddStudentToGroupUseCase";
import { CreateGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/CreateGroupUseCase";
import { DeleteGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/DeleteGroupUseCase";
import { GetGroupsByCategoryUseCase_v2 } from "@/src/features/groups/domain/usecases/GetGroupsByCategoryUseCase";
import { RemoveStudentFromGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/RemoveStudentFromGroupUseCase";
import { UpdateGroupUseCase_v2 } from "@/src/features/groups/domain/usecases/UpdateGroupUseCase";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Checkbox, Chip, Dialog, IconButton, Portal, Text, TextInput } from "react-native-paper";
import { Category } from "../../domain/entities/Category";

export default function CategoryDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const category: Category = route.params?.category;
  const courseStudentIdsParam: string[] | undefined = route.params?.courseStudentIds;
  const di = useDI();
  const getGroupsUC = di.resolve<GetGroupsByCategoryUseCase_v2>(TOKENS.GetGroupsByCategoryUC_v2);
  const createGroupUC = di.resolve<CreateGroupUseCase_v2>(TOKENS.CreateGroupUC_v2);
  const updateGroupUC = di.resolve<UpdateGroupUseCase_v2>(TOKENS.UpdateGroupUC_v2);
  const deleteGroupUC = di.resolve<DeleteGroupUseCase_v2>(TOKENS.DeleteGroupUC_v2);
  const addStudentUC = di.resolve<AddStudentToGroupUseCase_v2>(TOKENS.AddStudentToGroupUC_v2);
  const removeStudentUC = di.resolve<RemoveStudentFromGroupUseCase_v2>(TOKENS.RemoveStudentFromGroupUC_v2);

  const [groups, setGroups] = useState<Group[]>([]);
  const { user } = useAuth();
  const studentId = (user as any)?.id || (user as any)?._id; // usar ID real del usuario para grupos
  const currentUserId = studentId || user?.email;
  const courseTeacherId = route.params?.courseTeacherId as string | undefined;
  const isTeacher = !!currentUserId && !!courseTeacherId && currentUserId === courseTeacherId;
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Group | null>(null);
  const [newStudentId, setNewStudentId] = useState("");
  const [showSelectStudents, setShowSelectStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const refresh = async () => {
    const data = await getGroupsUC.execute(category._id!);
    setGroups(data);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const grouping = (category.groupingMethod || '').toLowerCase();

  const getAvailableStudentsForCategory = (): string[] => {
    const courseStudents = Array.isArray(courseStudentIdsParam) ? courseStudentIdsParam : [];
    const assigned = new Set<string>();
    groups.forEach(g => g.studentIds.forEach(id => assigned.add(id)));
    return courseStudents.filter(id => !assigned.has(id));
  };

  const toggleSelection = (id: string) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="titleMedium">{item.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton disabled={!isTeacher} icon="pencil" onPress={() => { if (!isTeacher) return; setEditing(item); setName(item.name); setShowDialog(true); }} />
            <IconButton disabled={!isTeacher} icon="delete" iconColor="#b91c1c" onPress={async () => { if (!isTeacher) return; if (!item._id) return; await deleteGroupUC.execute(item._id); await refresh(); }} />
          </View>
        </View>
        <Text style={{ marginBottom: 8, color: "#6b7280" }}>{item.studentIds.length} estudiantes</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {item.studentIds.map((sid) => (
            <Chip key={sid} onClose={async () => { if (!isTeacher) return; await removeStudentUC.execute(item._id!, sid); await refresh(); }}>{`Usuario ${sid.slice(0,8)}`}</Chip>
          ))}
        </View>
        <View style={{ marginTop: 8 }}>
          <Button mode="text" onPress={() => {
            navigation.navigate("GroupDetail", { group: item, category, courseTeacherId });
          }}>Ver detalles</Button>
        </View>
        {isTeacher ? (
          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            <Button mode="contained" onPress={() => { setEditing(item); setSelectedStudentIds([]); setShowSelectStudents(true); }}>Agregar estudiantes</Button>
          </View>
        ) : (
          <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
            {grouping === 'selfassigned' && studentId && !item.studentIds.includes(studentId) ? (
              <Button mode="contained" onPress={async () => { await addStudentUC.execute(item._id!, studentId); await refresh(); }}>Unirme</Button>
            ) : grouping === 'selfassigned' && studentId ? (
              <Button mode="outlined" onPress={async () => { await removeStudentUC.execute(item._id!, studentId); await refresh(); }}>Salir del grupo</Button>
            ) : null}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={{ marginBottom: 12 }}>{category.name}</Text>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text>Método de agrupación: {category.groupingMethod}</Text>
          <Text>Tamaño del grupo: {category.groupSize}</Text>
        </Card.Content>
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <Text variant="titleLarge">Grupos ({groups.length})</Text>
        <Button disabled={!isTeacher} mode="contained" onPress={() => { if (!isTeacher) return; setEditing(null); setName(`[${category.name}] Grupo ${groups.length + 1}`); setShowDialog(true); }}>Crear Grupo</Button>
      </View>

      <FlatList data={groups} keyExtractor={(g) => g._id || g.name} renderItem={renderGroup} contentContainerStyle={{ paddingVertical: 12 }} />

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>{editing ? "Editar grupo" : "Crear grupo"}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Nombre" value={name} onChangeText={setName} left={<TextInput.Icon icon="account-group" />} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancelar</Button>
            <Button disabled={!isTeacher} mode="contained" onPress={async () => {
              if (!isTeacher) return;
              if (editing && editing._id) {
                await updateGroupUC.execute({ _id: editing._id, name });
              } else {
                await createGroupUC.execute({ categoryId: category._id!, name, studentIds: [], courseId: category.courseId });
              }
              setShowDialog(false);
              await refresh();
            }}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showSelectStudents} onDismiss={() => setShowSelectStudents(false)}>
          <Dialog.Title>Agregar estudiantes</Dialog.Title>
          <Dialog.Content>
            {(() => {
              const available = getAvailableStudentsForCategory();
              if (available.length === 0) return <Text style={{ color: "#6b7280" }}>No hay estudiantes disponibles</Text>;
              return (
                <View style={{ maxHeight: 360 }}>
                  {available.map(id => {
                    const label = `Usuario ${id.slice(0,8)}`;
                    const checked = selectedStudentIds.includes(id);
                    return (
                      <View key={id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => toggleSelection(id)} />
                        <View style={{ marginLeft: 8 }}>
                          <Text>{label}</Text>
                          <Text style={{ color: "#6b7280" }}>{id}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSelectStudents(false)}>Cancelar</Button>
            <Button mode="contained" disabled={selectedStudentIds.length === 0 || !isTeacher} onPress={async () => {
              if (!editing) return;
              const assigns = selectedStudentIds.map(sid => addStudentUC.execute(editing._id!, sid));
              await Promise.all(assigns);
              setShowSelectStudents(false);
              setSelectedStudentIds([]);
              await refresh();
            }}>Agregar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerCard: { borderRadius: 12 },
  card: { marginTop: 12, borderRadius: 12 },
});



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
import { Button, Card, Checkbox, Chip, Dialog, IconButton, Portal, Text, TextInput, useTheme, Avatar } from "react-native-paper";
import { Category } from "../../domain/entities/Category";

export default function CategoryDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const category: Category = route.params?.category;
  const courseStudentIdsParam: string[] | undefined = route.params?.courseStudentIds;
  const di = useDI();
  const theme = useTheme();
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
  const [showSelectStudents, setShowSelectStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const refresh = async () => {
    const data = await getGroupsUC.execute(category._id!);
    setGroups(data);
  };

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Avatar.Icon icon="account-group" size={40} style={{ backgroundColor: theme.colors.primaryContainer, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{item.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.studentIds.length} estudiantes</Text>
            </View>
          </View>
          {isTeacher && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton icon="pencil" onPress={() => { setEditing(item); setName(item.name); setShowDialog(true); }} />
              <IconButton icon="delete" iconColor={theme.colors.error} onPress={async () => { if (!item._id) return; await deleteGroupUC.execute(item._id); await refresh(); }} />
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {item.studentIds.map((sid) => (
            <Chip 
              key={sid} 
              avatar={<Avatar.Text size={24} label={sid.charAt(0).toUpperCase()} />}
              onClose={isTeacher ? async () => { await removeStudentUC.execute(item._id!, sid); await refresh(); } : undefined}
            >
              {`Usuario ${sid.slice(0,8)}`}
            </Chip>
          ))}
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Button 
            mode="text" 
            icon="eye"
            onPress={() => navigation.navigate("GroupDetail", { group: item, category, courseTeacherId })}
          >
            Ver detalles
          </Button>
          {isTeacher && (
            <Button 
              mode="contained-tonal" 
              icon="account-plus"
              onPress={() => { setEditing(item); setSelectedStudentIds([]); setShowSelectStudents(true); }}
            >
              Agregar estudiantes
            </Button>
          )}
          {!isTeacher && grouping === 'selfassigned' && (
            <>
              {studentId && !item.studentIds.includes(studentId) ? (
                <Button mode="contained" icon="login" onPress={async () => { await addStudentUC.execute(item._id!, studentId); await refresh(); }}>Unirme</Button>
              ) : studentId && (
                <Button mode="outlined" icon="logout" onPress={async () => { await removeStudentUC.execute(item._id!, studentId); await refresh(); }}>Salir del grupo</Button>
              )}
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={{ marginBottom: 16, color: theme.colors.onSurface, fontWeight: 'bold' }}>{category.name}</Text>
      <Card style={styles.headerCard} elevation={2}>
        <Card.Content>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
            <Chip icon="cog" style={{ backgroundColor: theme.colors.secondaryContainer }}>
              {category.groupingMethod}
            </Chip>
            <Chip icon="account-multiple" style={{ backgroundColor: theme.colors.tertiaryContainer }}>
              Tamaño: {category.groupSize}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>👥 Grupos ({groups.length})</Text>
        {isTeacher && (
          <Button 
            mode="contained" 
            icon="plus"
            onPress={() => { setEditing(null); setName(`[${category.name}] Grupo ${groups.length + 1}`); setShowDialog(true); }}
          >
            Crear Grupo
          </Button>
        )}
      </View>

      {groups.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Avatar.Icon icon="account-group-outline" size={80} style={{ backgroundColor: 'transparent', marginBottom: 16 }} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            No hay grupos creados aún
          </Text>
          {isTeacher && (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
              Crea el primer grupo para comenzar
            </Text>
          )}
        </View>
      ) : (
        <FlatList data={groups} keyExtractor={(g) => g._id || g.name} renderItem={renderGroup} contentContainerStyle={{ paddingBottom: 24 }} />
      )}

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
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },
  headerCard: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, marginBottom: 8 },
  card: { marginTop: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
});



import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import { Card, Text, Chip, IconButton, Button, Avatar, useTheme, Divider } from "react-native-paper";
import { Group } from "@/src/features/groups/domain/entities/Group";
import { Category } from "@/src/features/categories/domain/entities/Category";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { Activity } from "@/src/features/activities/domain/entities/Activity";
import { GetActivitiesByCategoryUseCase } from "@/src/features/activities/domain/usecases/GetActivitiesByCategoryUseCase";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";

export default function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const group: Group = route.params?.group;
  const category: Category = route.params?.category;
  const di = useDI();
  const { user } = useAuth();
  const theme = useTheme();
  const getActivitiesByCategoryUC = di.resolve<GetActivitiesByCategoryUseCase>(TOKENS.GetActivitiesByCategoryUC);
  
  const studentId = (user as any)?.id || (user as any)?._id;
  const belongsToGroup = !!studentId && group.studentIds?.includes(studentId);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshActivities = async () => {
    if (!category?._id) return;
    setLoading(true);
    try {
      const data = await getActivitiesByCategoryUC.execute(category._id);
      setActivities(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshActivities().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?._id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Avatar.Icon icon="account-group" size={56} style={{ backgroundColor: theme.colors.primaryContainer, marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={{ marginBottom: 4, color: theme.colors.onSurface }}>{group.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Categoría: {category?.name}</Text>
            </View>
          </View>
          
          <Divider style={{ marginVertical: 12 }} />
          
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <Chip icon="cog" style={{ backgroundColor: theme.colors.secondaryContainer }}>
              {category?.groupingMethod}
            </Chip>
            <Chip icon="account-multiple" style={{ backgroundColor: theme.colors.tertiaryContainer }}>
              Max: {category?.groupSize}
            </Chip>
          </View>
          
          <Text variant="titleMedium" style={{ marginBottom: 12, marginTop: 8, color: theme.colors.onSurface }}>👥 Estudiantes ({group.studentIds.length})</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {group.studentIds.map((sid) => (
              <Chip key={sid} avatar={<Avatar.Text size={24} label={sid.charAt(0).toUpperCase()} />}>
                {`Usuario ${sid.slice(0,8)}`}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>📋 Actividades ({activities.length})</Text>
            <IconButton icon="refresh" onPress={refreshActivities} disabled={loading} />
          </View>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Cargando actividades...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Avatar.Icon icon="clipboard-text-off" size={64} style={{ backgroundColor: 'transparent', marginBottom: 8 }} />
              <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>No hay actividades para esta categoría</Text>
            </View>
          ) : (
            <View style={{ maxHeight: 600 }}>
              <FlatList
                data={activities}
                keyExtractor={(a) => a._id || a.title}
                scrollEnabled={true}
                renderItem={({ item }) => (
                  <Card style={{ marginBottom: 16, borderRadius: 16, elevation: 1 }}>
                    <Card.Content>
                      <Text variant="titleMedium" style={{ marginBottom: 4, color: theme.colors.onSurface }}>{item.title}</Text>
                      {item.description && <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>{item.description}</Text>}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        {item.date && <Chip icon="calendar" style={{ backgroundColor: theme.colors.primaryContainer }}>Due: {formatDate(item.date)}</Chip>}
                        {category?.name && <Chip icon="folder" style={{ backgroundColor: theme.colors.secondaryContainer }}>{category.name}</Chip>}
                      </View>
                      {belongsToGroup && (
                        <View style={{ alignItems: "flex-end" }}>
                          <Button
                            icon="upload"
                            mode="contained"
                            onPress={() => navigation.navigate("ActivitySubmission", { activity: item, group })}
                          >
                            Entregar
                          </Button>
                        </View>
                      )}
                      {!belongsToGroup && (
                        <Chip icon="alert" style={{ marginTop: 8, backgroundColor: theme.colors.errorContainer }}>
                          <Text style={{ color: theme.colors.onErrorContainer, fontSize: 12 }}>No perteneces a este grupo</Text>
                        </Chip>
                      )}
                    </Card.Content>
                  </Card>
                )}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },
  headerCard: { borderRadius: 16, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  card: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
});


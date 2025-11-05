import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import { Card, Text, Chip, IconButton, Button } from "react-native-paper";
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
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={{ marginBottom: 8 }}>{group.name}</Text>
          <Text style={{ marginBottom: 4 }}>Categoría: {category?.name}</Text>
          <Text style={{ marginBottom: 4 }}>Método: {category?.groupingMethod}</Text>
          <Text style={{ marginBottom: 8 }}>Tamaño máximo: {category?.groupSize}</Text>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>Estudiantes ({group.studentIds.length})</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {group.studentIds.map((sid) => (
              <Chip key={sid}>{`Usuario ${sid.slice(0,8)}`}</Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text variant="titleLarge">Actividades ({activities.length})</Text>
            <IconButton icon="refresh" onPress={refreshActivities} disabled={loading} />
          </View>
          {loading ? (
            <Text style={{ color: "#6b7280" }}>Cargando actividades...</Text>
          ) : activities.length === 0 ? (
            <Text style={{ color: "#6b7280" }}>No hay actividades para esta categoría</Text>
          ) : (
            <View style={{ maxHeight: 600 }}>
              <FlatList
                data={activities}
                keyExtractor={(a) => a._id || a.title}
                scrollEnabled={true}
                renderItem={({ item }) => (
                  <Card style={{ marginBottom: 12, borderRadius: 12 }}>
                    <Card.Content>
                      <Text variant="titleMedium" style={{ marginBottom: 4 }}>{item.title}</Text>
                      {item.description && <Text variant="bodyMedium" style={{ marginTop: 4, color: "#6b7280", marginBottom: 8 }}>{item.description}</Text>}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                        {item.date && <Chip style={{ backgroundColor: "#6366f1" }} textStyle={{ color: "#fff" }}>Due: {formatDate(item.date)}</Chip>}
                        {category?.name && <Chip>{`Category: ${category.name}`}</Chip>}
                      </View>
                      {belongsToGroup && (
                        <View style={{ alignItems: "flex-end" }}>
                          <Button
                            icon="upload"
                            mode="contained"
                            onPress={() => navigation.navigate("ActivitySubmission", { activity: item, group })}
                            style={{ backgroundColor: "#6366f1" }}
                          >
                            Entregar
                          </Button>
                        </View>
                      )}
                      {!belongsToGroup && (
                        <Text style={{ color: "#b91c1c", fontSize: 12, marginTop: 8 }}>No perteneces a este grupo</Text>
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
  container: { flex: 1, padding: 16 },
  headerCard: { borderRadius: 12, marginBottom: 16 },
  card: { borderRadius: 12 },
});


import { useDI } from '@/src/core/di/DIProvider'
import { TOKENS } from '@/src/core/di/tokens'
import { Activity } from '@/src/features/activities/domain/entities/Activity'
import { CreateActivityUseCase } from '@/src/features/activities/domain/usecases/CreateActivityUseCase'
import { DeleteActivityUseCase } from '@/src/features/activities/domain/usecases/DeleteActivityUseCase'
import { GetActivitiesByCourseUseCase } from '@/src/features/activities/domain/usecases/GetActivitiesByCourseUseCase'
import { UpdateActivityUseCase } from '@/src/features/activities/domain/usecases/UpdateActivityUseCase'
import { useAuth } from '@/src/features/auth/presentation/context/authContext'
import { Category } from '@/src/features/categories/domain/entities/Category'
import { CreateCategoryUseCase } from '@/src/features/categories/domain/usecases/CreateCategoryUseCase'
import { DeleteCategoryUseCase } from '@/src/features/categories/domain/usecases/DeleteCategoryUseCase'
import { GetCategoriesByCourseUseCase } from '@/src/features/categories/domain/usecases/GetCategoriesByCourseUseCase'
import { UpdateCategoryUseCase } from '@/src/features/categories/domain/usecases/UpdateCategoryUseCase'
import { CreateGroupUseCase_v2 } from '@/src/features/groups/domain/usecases/CreateGroupUseCase'
import { GetGroupsByCategoryUseCase_v2 } from '@/src/features/groups/domain/usecases/GetGroupsByCategoryUseCase'
import { GetGradesByCourseUseCase } from '@/src/features/grades/domain/usecases/GetGradesByCourseUseCase'
import { GetGradesByActivityUseCase } from '@/src/features/grades/domain/usecases/GetGradesByActivityUseCase'
import { Grade } from '@/src/features/grades/domain/entities/Grade'
import { Group } from '@/src/features/groups/domain/entities/Group'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, View } from 'react-native'
import {
    Avatar,
    Button,
    Card,
    Chip,
    Dialog,
    FAB,
    IconButton,
    Portal,
    RadioButton,
    Text,
    TextInput
} from 'react-native-paper'
import { Course } from '../../domain/entities/Course'

type CourseDetailTab =
    | 'info'
    | 'categories'
    | 'activities'
    | 'assessments'
    | 'participants'
    | 'reports'

export default function CourseDetailScreen() {
    const route = useRoute<any>()
    const course: Course = route.params?.course
    const navigation = useNavigation<any>()
    const [activeTab, setActiveTab] = useState<CourseDetailTab>('info')
    const di = useDI()
    const { user } = useAuth()

    const currentUserId = (user as any)?.id || (user as any)?._id || user?.email
    const isTeacher =
        currentUserId && course?.teacherId && currentUserId === course.teacherId

    const getCategoriesUC = di.resolve<GetCategoriesByCourseUseCase>(
        TOKENS.GetCategoriesByCourseUC
    )
    const createCategoryUC = di.resolve<CreateCategoryUseCase>(
        TOKENS.CreateCategoryUC
    )
    const updateCategoryUC = di.resolve<UpdateCategoryUseCase>(
        TOKENS.UpdateCategoryUC
    )
    const deleteCategoryUC = di.resolve<DeleteCategoryUseCase>(
        TOKENS.DeleteCategoryUC
    )
    const getActivitiesByCourseUC = di.resolve<GetActivitiesByCourseUseCase>(
        TOKENS.GetActivitiesByCourseUC
    )
    const createActivityUC = di.resolve<CreateActivityUseCase>(
        TOKENS.CreateActivityUC
    )
    const updateActivityUC = di.resolve<UpdateActivityUseCase>(
        TOKENS.UpdateActivityUC
    )
    const deleteActivityUC = di.resolve<DeleteActivityUseCase>(
        TOKENS.DeleteActivityUC
    )
    const createGroupUC = di.resolve<CreateGroupUseCase_v2>(
        TOKENS.CreateGroupUC_v2
    )
    const getGroupsByCategoryUC = di.resolve<GetGroupsByCategoryUseCase_v2>(
        TOKENS.GetGroupsByCategoryUC_v2
    )
    const getGradesByCourseUC = di.resolve<GetGradesByCourseUseCase>(
        TOKENS.GetGradesByCourseUC
    )
    const getGradesByActivityUC = di.resolve<GetGradesByActivityUseCase>(
        TOKENS.GetGradesByActivityUC
    )

    const [categories, setCategories] = useState<Category[]>([])
    const [activities, setActivities] = useState<Activity[]>([])
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [loadingActivities, setLoadingActivities] = useState(false)
    const [showActivityDialog, setShowActivityDialog] = useState(false)
    const [editingActivity, setEditingActivity] = useState<Activity | null>(
        null
    )
    const [actTitle, setActTitle] = useState('')
    const [actDescription, setActDescription] = useState('')
    const [actDate, setActDate] = useState('')
    const [actCategoryId, setActCategoryId] = useState<string>('')
    const [showCatDialog, setShowCatDialog] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    )
    const [catName, setCatName] = useState('')
    const [catMethod, setCatMethod] = useState<
        'manual' | 'random' | 'selfAssigned'
    >('random')
    const [catSize, setCatSize] = useState('2')
    const [allGroups, setAllGroups] = useState<Group[]>([])
    const [allGrades, setAllGrades] = useState<Grade[]>([])
    const [loadingReports, setLoadingReports] = useState(false)

    const refreshCategories = async () => {
        if (!course?._id) return
        setLoadingCategories(true)
        try {
            const data = await getCategoriesUC.execute(course._id)
            setCategories(data)
        } finally {
            setLoadingCategories(false)
        }
    }

    useEffect(() => {
        refreshCategories().catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course?._id])

    const refreshActivities = async () => {
        if (!course?._id) return
        setLoadingActivities(true)
        try {
            const data = await getActivitiesByCourseUC.execute(course._id)
            setActivities(data)
        } finally {
            setLoadingActivities(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'activities') {
            refreshActivities().catch(() => {})
        }
        if (activeTab === 'reports' && course?._id) {
            // Set loading immediately to prevent showing "No hay actividades" before data loads
            setLoadingReports(true)
            // Reset allGrades to ensure we fetch fresh data from Roble
            setAllGrades([])
            loadReportsData().catch(() => {})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, course?._id])

    const loadReportsData = useCallback(async () => {
        if (!course?._id) {
            setLoadingReports(false)
            return
        }
        try {
            // Always load activities when loading reports - do this first
            const activitiesData = await getActivitiesByCourseUC.execute(course._id)
            setActivities(activitiesData)
            console.log('Activities loaded for reports:', activitiesData.length)

            // Load all groups from all categories
            const groupsPromises = categories.map((cat) =>
                getGroupsByCategoryUC.execute(cat._id!).catch(() => [] as Group[])
            )
            const groupsArrays = await Promise.all(groupsPromises)
            const groups = groupsArrays.flat()
            setAllGroups(groups)

            // Always fetch fresh grades from Roble (never use local state)
            console.log('Fetching all grades from Roble for course:', course._id)
            const grades = await getGradesByCourseUC.execute(course._id)
            console.log('Grades loaded from Roble:', grades.length, 'grades:', grades)
            // Ensure we're setting the grades from Roble, not any local state
            setAllGrades(grades)
            console.log('allGrades state updated with', grades.length, 'grades')
        } catch (error) {
            console.error('Error loading reports data:', error)
            // On error, ensure we don't have stale data
            setAllGrades([])
        } finally {
            setLoadingReports(false)
        }
    }, [course?._id, categories, getActivitiesByCourseUC, getGroupsByCategoryUC, getGradesByCourseUC])

    const participants = useMemo(() => {
        if (!course)
            return [] as Array<{ id: string; role: 'TEACHER' | 'STUDENT' }>
        const list: Array<{ id: string; role: 'TEACHER' | 'STUDENT' }> = []
        if (course.teacherId)
            list.push({ id: course.teacherId, role: 'TEACHER' })
        ;(course.studentIds || []).forEach((sid) =>
            list.push({ id: sid, role: 'STUDENT' })
        )
        return list
    }, [course])

    const categoryNameById = (id?: string) => {
        const found = categories.find((c) => c._id === id)
        return found?.name || id || ''
    }

    const openNewActivity = () => {
        setEditingActivity(null)
        setActTitle('')
        setActDescription('')
        setActDate(new Date().toISOString().slice(0, 10))
        setActCategoryId(categories[0]?._id || '')
        setShowActivityDialog(true)
    }

    const openEditActivity = (a: Activity) => {
        setEditingActivity(a)
        setActTitle(a.title)
        setActDescription(a.description || '')
        setActDate(a.date || '')
        setActCategoryId(a.categoryId)
        setShowActivityDialog(true)
    }

    const saveActivity = async () => {
        const payload = {
            title: actTitle.trim(),
            description: actDescription.trim(),
            date: actDate,
            courseId: course._id!,
            categoryId: actCategoryId
        } as any
        if (editingActivity?._id) {
            await updateActivityUC.execute({
                _id: editingActivity._id,
                ...payload
            })
        } else {
            await createActivityUC.execute(payload)
        }
        setShowActivityDialog(false)
        await refreshActivities()
    }

    const deleteActivity = async (id?: string) => {
        if (!id) return
        await deleteActivityUC.execute(id)
        await refreshActivities()
    }

    const renderParticipant = ({
        item
    }: {
        item: { id: string; role: 'TEACHER' | 'STUDENT' }
    }) => {
        const display = item.id?.slice(0, 8) || ''
        const name = `Usuario ${display}`
        return (
            <Card style={styles.participantCard}>
                <Card.Content style={styles.participantContent}>
                    <Avatar.Text
                        size={40}
                        label={name.charAt(0).toUpperCase()}
                        style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">{name}</Text>
                        <Text variant="bodySmall" style={{ color: '#6b7280' }}>
                            {item.id}
                        </Text>
                        <View style={{ marginTop: 6 }}>
                            <Chip compact>
                                {item.role === 'TEACHER'
                                    ? 'PROFESOR'
                                    : 'ESTUDIANTE'}
                            </Chip>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        )
    }

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <Chip
                    selected={activeTab === 'info'}
                    onPress={() => setActiveTab('info')}
                    style={[
                        styles.tab,
                        activeTab === 'info' && styles.tabActive
                    ]}
                >
                    Info
                </Chip>
                <Chip
                    selected={activeTab === 'categories'}
                    onPress={() => setActiveTab('categories')}
                    style={[
                        styles.tab,
                        activeTab === 'categories' && styles.tabActive
                    ]}
                >
                    Categorías
                </Chip>
                <Chip
                    selected={activeTab === 'activities'}
                    onPress={() => setActiveTab('activities')}
                    style={[
                        styles.tab,
                        activeTab === 'activities' && styles.tabActive
                    ]}
                >
                    Actividades
                </Chip>
                <Chip
                    selected={activeTab === 'assessments'}
                    onPress={() => setActiveTab('assessments')}
                    style={[
                        styles.tab,
                        activeTab === 'assessments' && styles.tabActive
                    ]}
                >
                    Evaluaciones
                </Chip>
                <Chip
                    selected={activeTab === 'participants'}
                    onPress={() => setActiveTab('participants')}
                    style={[
                        styles.tab,
                        activeTab === 'participants' && styles.tabActive
                    ]}
                >
                    Participantes
                </Chip>
                <Chip
                    selected={activeTab === 'reports'}
                    onPress={() => setActiveTab('reports')}
                    style={[
                        styles.tab,
                        activeTab === 'reports' && styles.tabActive
                    ]}
                >
                    Reportes
                </Chip>
            </View>

            {activeTab === 'info' && (
                <ScrollView contentContainerStyle={styles.content}>
                    <Card style={styles.block}>
                        <Card.Content>
                            <Text
                                variant="titleLarge"
                                style={{ marginBottom: 8 }}
                            >
                                Descripción del curso
                            </Text>
                            <Text variant="bodyMedium">
                                {course?.description || 'Sin descripción'}
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.block}>
                        <Card.Content>
                            <Text
                                variant="titleLarge"
                                style={{ marginBottom: 8 }}
                            >
                                Participantes
                            </Text>
                            {participants.length === 0 ? (
                                <Text style={{ color: '#6b7280' }}>
                                    Sin participantes
                                </Text>
                            ) : (
                                <FlatList
                                    data={participants}
                                    keyExtractor={(p) => `${p.role}-${p.id}`}
                                    renderItem={renderParticipant}
                                />
                            )}
                            <View style={{ marginTop: 12 }}>
                                <Button
                                    mode="contained"
                                    onPress={() => setActiveTab('participants')}
                                >
                                    Ver estudiantes
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>
            )}

            {activeTab === 'categories' && (
                <View style={styles.listContainer}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text variant="titleLarge">
                            Categorías ({categories.length})
                        </Text>
                        <IconButton
                            icon="refresh"
                            onPress={refreshCategories}
                            disabled={loadingCategories}
                        />
                    </View>
                    {categories.length === 0 ? (
                        <Text style={{ color: '#6b7280' }}>
                            No hay categorías
                        </Text>
                    ) : (
                        <FlatList
                            data={categories}
                            keyExtractor={(c) => c._id || c.name}
                            renderItem={({ item }) => (
                                <Card style={styles.participantCard}>
                                    <Card.Content>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Text variant="titleMedium">
                                                {item.name}
                                            </Text>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <IconButton
                                                    disabled={!isTeacher}
                                                    icon="pencil"
                                                    onPress={() => {
                                                        if (!isTeacher) return
                                                        setEditingCategory(item)
                                                        setCatName(item.name)
                                                        setCatMethod(
                                                            item.groupingMethod
                                                        )
                                                        setCatSize(
                                                            String(
                                                                item.groupSize
                                                            )
                                                        )
                                                        setShowCatDialog(true)
                                                    }}
                                                />
                                                <IconButton
                                                    disabled={!isTeacher}
                                                    icon="delete"
                                                    iconColor="#b91c1c"
                                                    onPress={async () => {
                                                        if (!isTeacher) return
                                                        if (!item._id) return
                                                        await deleteCategoryUC.execute(
                                                            item._id
                                                        )
                                                        await refreshCategories()
                                                    }}
                                                />
                                            </View>
                                        </View>
                                        <Text
                                            variant="bodySmall"
                                            style={{ color: '#6b7280' }}
                                        >
                                            Grouping: {item.groupingMethod} /
                                            Size: {item.groupSize}
                                        </Text>
                                        <View style={{ marginTop: 8 }}>
                                            <Button
                                                mode="text"
                                                onPress={() =>
                                                    navigation.navigate(
                                                        'CategoryDetail',
                                                        {
                                                            category: item,
                                                            courseTeacherId:
                                                                course.teacherId,
                                                            courseStudentIds:
                                                                course.studentIds
                                                        }
                                                    )
                                                }
                                            >
                                                Ver grupos
                                            </Button>
                                        </View>
                                    </Card.Content>
                                </Card>
                            )}
                            contentContainerStyle={{ paddingBottom: 80 }}
                        />
                    )}

                    {isTeacher && (
                        <FAB
                            icon="plus"
                            style={styles.fab}
                            onPress={() => {
                                setEditingCategory(null)
                                setCatName('')
                                setCatMethod('random')
                                setCatSize('2')
                                setShowCatDialog(true)
                            }}
                        />
                    )}

                    <Portal>
                        <Dialog
                            visible={showCatDialog}
                            onDismiss={() => setShowCatDialog(false)}
                        >
                            <Dialog.Title>
                                {editingCategory
                                    ? 'Editar categoría'
                                    : 'Agregar categoría'}
                            </Dialog.Title>
                            <Dialog.Content>
                                <TextInput
                                    label="Nombre"
                                    value={catName}
                                    onChangeText={setCatName}
                                    left={<TextInput.Icon icon="folder" />}
                                    style={{ marginBottom: 8 }}
                                />
                                <RadioButton.Group
                                    value={catMethod}
                                    onValueChange={(v) =>
                                        setCatMethod(v as any)
                                    }
                                >
                                    <RadioButton.Item
                                        value="random"
                                        label="random"
                                        position="leading"
                                        style={{ width: '100%' }}
                                    />
                                    <RadioButton.Item
                                        value="manual"
                                        label="manual"
                                        position="leading"
                                        style={{ width: '100%' }}
                                    />
                                    <RadioButton.Item
                                        value="selfAssigned"
                                        label="selfAssigned"
                                        position="leading"
                                        style={{ width: '100%' }}
                                    />
                                </RadioButton.Group>
                                <TextInput
                                    label="Tamaño del grupo"
                                    keyboardType="numeric"
                                    value={catSize}
                                    onChangeText={setCatSize}
                                    left={
                                        <TextInput.Icon icon="format-list-numbered" />
                                    }
                                />
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => setShowCatDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={!isTeacher}
                                    onPress={async () => {
                                        if (!isTeacher) return
                                        const payload = {
                                            courseId: course._id!,
                                            name: catName.trim(),
                                            groupingMethod: catMethod,
                                            groupSize: Number(catSize)
                                        } as any
                                        if (
                                            editingCategory &&
                                            editingCategory._id
                                        ) {
                                            await updateCategoryUC.execute({
                                                _id: editingCategory._id,
                                                ...payload
                                            })
                                        } else {
                                            const created =
                                                await createCategoryUC.execute(
                                                    payload
                                                )
                                            // Si es random, crear grupos y asignar estudiantes aleatoriamente
                                            if (
                                                payload.groupingMethod ===
                                                'random'
                                            ) {
                                                const allStudents =
                                                    Array.isArray(
                                                        course.studentIds
                                                    )
                                                        ? course.studentIds
                                                        : []
                                                const groupSizeNum = Math.max(
                                                    1,
                                                    Number(catSize)
                                                )
                                                const shuffled = [
                                                    ...allStudents
                                                ].sort(
                                                    () => Math.random() - 0.5
                                                )
                                                const groupsCount = Math.ceil(
                                                    shuffled.length /
                                                        groupSizeNum
                                                )
                                                const createCalls =
                                                    [] as Promise<any>[]
                                                for (
                                                    let i = 0;
                                                    i < groupsCount;
                                                    i++
                                                ) {
                                                    const members =
                                                        shuffled.slice(
                                                            i * groupSizeNum,
                                                            (i + 1) *
                                                                groupSizeNum
                                                        )
                                                    createCalls.push(
                                                        createGroupUC.execute({
                                                            categoryId:
                                                                created._id!,
                                                            name: `[${
                                                                created.name
                                                            }] Grupo ${i + 1}`,
                                                            studentIds: members,
                                                            courseId:
                                                                course._id!
                                                        })
                                                    )
                                                }
                                                await Promise.all(createCalls)
                                            }
                                        }
                                        setShowCatDialog(false)
                                        await refreshCategories()
                                    }}
                                    mode="contained"
                                >
                                    Guardar
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </View>
            )}

            {activeTab === 'participants' && (
                <View style={styles.listContainer}>
                    <Text variant="titleLarge" style={{ marginBottom: 8 }}>
                        Participantes ({participants.length})
                    </Text>
                    <FlatList
                        data={participants}
                        keyExtractor={(p) => `${p.role}-${p.id}`}
                        renderItem={renderParticipant}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    />
                </View>
            )}

            {activeTab === 'activities' && (
                <View style={styles.listContainer}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text variant="titleLarge">
                            Actividades ({activities.length})
                        </Text>
                        <IconButton
                            icon="refresh"
                            onPress={refreshActivities}
                            disabled={loadingActivities}
                        />
                    </View>
                    {loadingActivities ? (
                        <Text style={{ color: '#6b7280' }}>
                            Cargando actividades...
                        </Text>
                    ) : activities.length === 0 ? (
                        <Text style={{ color: '#6b7280' }}>
                            No hay actividades
                        </Text>
                    ) : (
                        <FlatList
                            data={activities}
                            keyExtractor={(a) => a._id || a.title}
                            renderItem={({ item }) => (
                                <Card style={styles.participantCard}>
                                    <Card.Content>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Text variant="titleMedium">
                                                {item.title}
                                            </Text>
                                            {isTeacher && (
                                                <View
                                                    style={{
                                                        flexDirection: 'row'
                                                    }}
                                                >
                                                    <IconButton
                                                        icon="pencil"
                                                        onPress={() =>
                                                            openEditActivity(
                                                                item
                                                            )
                                                        }
                                                    />
                                                    <IconButton
                                                        icon="delete"
                                                        iconColor="#b91c1c"
                                                        onPress={() =>
                                                            deleteActivity(
                                                                item._id
                                                            )
                                                        }
                                                    />
                                                </View>
                                            )}
                                        </View>
                                        {item.description && (
                                            <Text
                                                variant="bodyMedium"
                                                style={{
                                                    marginTop: 4,
                                                    color: '#6b7280'
                                                }}
                                            >
                                                {item.description}
                                            </Text>
                                        )}
                                        {item.date && (
                                            <Text
                                                variant="bodySmall"
                                                style={{
                                                    marginTop: 4,
                                                    color: '#6b7280'
                                                }}
                                            >
                                                Fecha: {item.date}
                                            </Text>
                                        )}
                                        {item.categoryId && (
                                            <Chip
                                                style={{ marginTop: 8 }}
                                                compact
                                            >
                                                Categoría:{' '}
                                                {categoryNameById(
                                                    item.categoryId
                                                )}
                                            </Chip>
                                        )}
                                        {isTeacher && (
                                            <View
                                                style={{
                                                    marginTop: 8,
                                                    alignItems: 'flex-end'
                                                }}
                                            >
                                                <Button
                                                    icon="clipboard-check"
                                                    mode="contained"
                                                    onPress={() =>
                                                        navigation.navigate(
                                                            'ActivitySubmissions',
                                                            {
                                                                activity: item,
                                                                course
                                                            }
                                                        )
                                                    }
                                                >
                                                    Ver entregas
                                                </Button>
                                            </View>
                                        )}
                                    </Card.Content>
                                </Card>
                            )}
                            contentContainerStyle={{ paddingBottom: 24 }}
                        />
                    )}
                    {isTeacher && (
                        <FAB
                            icon="plus"
                            style={styles.fab}
                            onPress={openNewActivity}
                        />
                    )}

                    <Portal>
                        <Dialog
                            visible={showActivityDialog}
                            onDismiss={() => setShowActivityDialog(false)}
                        >
                            <Dialog.Title>
                                {editingActivity
                                    ? 'Editar actividad'
                                    : 'Agregar actividad'}
                            </Dialog.Title>
                            <Dialog.Content>
                                <TextInput
                                    label="Title"
                                    value={actTitle}
                                    onChangeText={setActTitle}
                                    style={{ marginBottom: 8 }}
                                />
                                <TextInput
                                    label="Description"
                                    value={actDescription}
                                    onChangeText={setActDescription}
                                    multiline
                                    numberOfLines={4}
                                    style={{ marginBottom: 8 }}
                                />
                                <TextInput
                                    label="Date"
                                    value={actDate}
                                    onChangeText={setActDate}
                                    left={<TextInput.Icon icon="calendar" />}
                                    style={{ marginBottom: 8 }}
                                />
                                <Text style={{ marginBottom: 4 }}>
                                    Category
                                </Text>
                                <ScrollView style={{ maxHeight: 160 }}>
                                    {categories.map((c) => (
                                        <Chip
                                            key={c._id}
                                            selected={actCategoryId === c._id}
                                            onPress={() =>
                                                setActCategoryId(c._id!)
                                            }
                                            style={{ marginBottom: 6 }}
                                        >
                                            {c.name}
                                        </Chip>
                                    ))}
                                </ScrollView>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button
                                    onPress={() => setShowActivityDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={saveActivity}
                                    disabled={
                                        !actTitle.trim() || !actCategoryId
                                    }
                                >
                                    Save
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </View>
            )}

            {activeTab === 'reports' && (
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.reportsContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16
                            }}
                        >
                            <Text variant="titleLarge">Reportes de Calificaciones</Text>
                            <IconButton
                                icon="refresh"
                                onPress={loadReportsData}
                                disabled={loadingReports}
                            />
                        </View>
                        {loadingReports ? (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <Text style={{ color: '#6b7280' }}>
                                    Cargando reportes...
                                </Text>
                            </View>
                        ) : (
                            <>
                            {/* Activity Average (all groups) */}
                            <Card style={styles.reportCard}>
                                <Card.Content>
                                    <Text variant="titleLarge" style={{ marginBottom: 12 }}>
                                        Promedio por Actividad (Todos los Grupos)
                                    </Text>
                                    {loadingReports ? (
                                        <Text style={{ color: '#6b7280' }}>
                                            Cargando actividades...
                                        </Text>
                                    ) : activities.length === 0 ? (
                                        <Text style={{ color: '#6b7280' }}>
                                            No hay actividades
                                        </Text>
                                    ) : (
                                        <View style={{ gap: 8 }}>
                                            {activities.map((activity) => {
                                                const activityGrades = allGrades.filter(
                                                    (g) => g.activityId === activity._id
                                                )
                                                const avg =
                                                    activityGrades.length > 0
                                                        ? activityGrades.reduce(
                                                              (sum, g) => sum + g.finalGrade,
                                                              0
                                                          ) / activityGrades.length
                                                        : 0
                                                return (
                                                    <View
                                                        key={activity._id}
                                                        style={styles.reportRow}
                                                    >
                                                        <Text variant="bodyMedium" style={{ flex: 1, marginRight: 8 }}>
                                                            {activity.title}
                                                        </Text>
                                                        <Chip
                                                            icon="star"
                                                            iconColor="#000000"
                                                            style={{
                                                                backgroundColor: '#E0E7FF',
                                                                minWidth: 70
                                                            }}
                                                            textStyle={{ fontSize: 14, fontWeight: '600', color: '#000000' }}
                                                        >
                                                            {avg > 0 ? avg.toFixed(2) : '0.00'}
                                                        </Chip>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>

                            {/* Group Average (across activities) */}
                            <Card style={styles.reportCard}>
                                <Card.Content>
                                    <Text variant="titleLarge" style={{ marginBottom: 12 }}>
                                        Promedio por Grupo (Todas las Actividades)
                                    </Text>
                                    {allGroups.length === 0 ? (
                                        <Text style={{ color: '#6b7280' }}>
                                            No hay grupos
                                        </Text>
                                    ) : (
                                        <View style={{ gap: 8 }}>
                                            {allGroups.map((group) => {
                                                const groupGrades = allGrades.filter(
                                                    (g) => g.groupId === group._id
                                                )
                                                const avg =
                                                    groupGrades.length > 0
                                                        ? groupGrades.reduce(
                                                              (sum, g) => sum + g.finalGrade,
                                                              0
                                                          ) / groupGrades.length
                                                        : 0
                                                return (
                                                    <View
                                                        key={group._id}
                                                        style={styles.reportRow}
                                                    >
                                                        <Text variant="bodyMedium" style={{ flex: 1, marginRight: 8 }}>
                                                            {group.name}
                                                        </Text>
                                                        <Chip
                                                            icon="account-group"
                                                            iconColor="#000000"
                                                            style={{
                                                                backgroundColor: '#D1FAE5',
                                                                minWidth: 70
                                                            }}
                                                            textStyle={{ fontSize: 14, fontWeight: '600', color: '#000000' }}
                                                        >
                                                            {avg > 0 ? avg.toFixed(2) : '0.00'}
                                                        </Chip>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>

                            {/* Student Average (across activities) */}
                            <Card style={styles.reportCard}>
                                <Card.Content>
                                    <Text variant="titleLarge" style={{ marginBottom: 12 }}>
                                        Promedio por Estudiante (Todas las Actividades)
                                    </Text>
                                    {participants.filter((p) => p.role === 'STUDENT').length ===
                                    0 ? (
                                        <Text style={{ color: '#6b7280' }}>
                                            No hay estudiantes
                                        </Text>
                                    ) : (
                                        <View style={{ gap: 8 }}>
                                            {participants
                                                .filter((p) => p.role === 'STUDENT')
                                                .map((student) => {
                                                    const studentGrades = allGrades.filter(
                                                        (g) => g.studentId === student.id
                                                    )
                                                    const avg =
                                                        studentGrades.length > 0
                                                            ? studentGrades.reduce(
                                                                  (sum, g) =>
                                                                      sum + g.finalGrade,
                                                                  0
                                                              ) / studentGrades.length
                                                            : 0
                                                    return (
                                                        <View
                                                            key={student.id}
                                                            style={styles.reportRow}
                                                        >
                                                            <Text
                                                                variant="bodyMedium"
                                                                style={{ flex: 1, marginRight: 8 }}
                                                            >
                                                                Usuario{' '}
                                                                {student.id.slice(0, 8)}
                                                            </Text>
                                                            <Chip
                                                                icon="account"
                                                                iconColor="#000000"
                                                                style={{
                                                                    backgroundColor:
                                                                        '#FEF3C7',
                                                                    minWidth: 70
                                                                }}
                                                                textStyle={{ fontSize: 14, fontWeight: '600', color: '#000000' }}
                                                            >
                                                                {avg > 0 ? avg.toFixed(2) : '0.00'}
                                                            </Chip>
                                                        </View>
                                                    )
                                                })}
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>

                            {/* Detailed Results per Group > Student > Criteria Score */}
                            <Card style={styles.reportCard}>
                                <Card.Content>
                                    <Text variant="titleLarge" style={{ marginBottom: 12 }}>
                                        Resultados Detallados
                                    </Text>
                                    {allGroups.length === 0 ? (
                                        <Text style={{ color: '#6b7280' }}>
                                            No hay grupos
                                        </Text>
                                    ) : (
                                        <View style={{ gap: 16 }}>
                                            {allGroups.map((group) => {
                                                const groupGrades = allGrades.filter(
                                                    (g) => g.groupId === group._id
                                                )
                                                const groupStudents = Array.from(
                                                    new Set(
                                                        groupGrades.map((g) => g.studentId)
                                                    )
                                                )
                                                if (groupStudents.length === 0) return null
                                                return (
                                                    <View key={group._id}>
                                                        <Text
                                                            variant="titleMedium"
                                                            style={{
                                                                marginBottom: 8,
                                                                color: '#4B5563'
                                                            }}
                                                        >
                                                            {group.name}
                                                        </Text>
                                                        {groupStudents.map((studentId) => {
                                                            const studentGrades =
                                                                groupGrades.filter(
                                                                    (g) =>
                                                                        g.studentId ===
                                                                        studentId
                                                                )
                                                            if (studentGrades.length === 0)
                                                                return null
                                                            return (
                                                                <Card
                                                                    key={studentId}
                                                                    style={{
                                                                        marginBottom: 8,
                                                                        backgroundColor:
                                                                            '#F9FAFB'
                                                                    }}
                                                                >
                                                                    <Card.Content>
                                                                        <Text
                                                                            variant="bodyLarge"
                                                                            style={{
                                                                                marginBottom: 8,
                                                                                fontWeight:
                                                                                    '600'
                                                                            }}
                                                                        >
                                                                            Usuario{' '}
                                                                            {studentId.slice(
                                                                                0,
                                                                                8
                                                                            )}
                                                                        </Text>
                                                                        {studentGrades.map(
                                                                            (grade) => {
                                                                                const activity =
                                                                                    activities.find(
                                                                                        (a) =>
                                                                                            a._id ===
                                                                                            grade.activityId
                                                                                    )
                                                                                const criterias =
                                                                                    grade.criterias ||
                                                                                    {}
                                                                                return (
                                                                                    <View
                                                                                        key={
                                                                                            grade._id
                                                                                        }
                                                                                        style={{
                                                                                            marginBottom: 8,
                                                                                            paddingLeft: 8,
                                                                                            borderLeftWidth: 3,
                                                                                            borderLeftColor:
                                                                                                '#6750A4'
                                                                                        }}
                                                                                    >
                                                                                        <Text
                                                                                            variant="bodyMedium"
                                                                                            style={{
                                                                                                marginBottom: 4,
                                                                                                fontWeight:
                                                                                                    '500'
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                activity?.title ||
                                                                                                'Actividad'
                                                                                            }
                                                                                        </Text>
                                                                                        <View
                                                                                            style={{
                                                                                                flexDirection:
                                                                                                    'row',
                                                                                                flexWrap:
                                                                                                    'wrap',
                                                                                                gap: 4
                                                                                            }}
                                                                                        >
                                                                                            {Object.entries(
                                                                                                criterias
                                                                                            ).map(
                                                                                                ([
                                                                                                    key,
                                                                                                    value
                                                                                                ]) => (
                                                                                                    <Chip
                                                                                                        key={key}
                                                                                                        compact
                                                                                                        style={{
                                                                                                            backgroundColor:
                                                                                                                '#E0E7FF',
                                                                                                            marginRight: 4,
                                                                                                            marginBottom: 4
                                                                                                        }}
                                                                                                        textStyle={{ fontSize: 12, fontWeight: '500' }}
                                                                                                    >
                                                                                                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                                                                                    </Chip>
                                                                                                )
                                                                                            )}
                                                                                            <Chip
                                                                                                icon="star"
                                                                                                compact
                                                                                                style={{
                                                                                                    backgroundColor:
                                                                                                        '#FEF3C7',
                                                                                                    marginBottom: 4
                                                                                                }}
                                                                                                textStyle={{ fontSize: 12, fontWeight: '600' }}
                                                                                            >
                                                                                                Final: {grade.finalGrade.toFixed(2)}
                                                                                            </Chip>
                                                                                        </View>
                                                                                    </View>
                                                                                )
                                                                            }
                                                                        )}
                                                                    </Card.Content>
                                                                </Card>
                                                            )
                                                        })}
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        </>
                        )}
                    </ScrollView>
                </View>
            )}

            {activeTab !== 'info' &&
                activeTab !== 'participants' &&
                activeTab !== 'activities' &&
                activeTab !== 'reports' && (
                    <View style={styles.placeholder}>
                        <Text>Sección en construcción</Text>
                    </View>
                )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 12,
        gap: 8,
        flexWrap: 'wrap',
        backgroundColor: 'transparent'
    },
    tab: { borderRadius: 20, elevation: 1 },
    tabActive: { backgroundColor: '#6750A4', elevation: 3 },
    content: { padding: 20, gap: 20 },
    block: {
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8
    },
    listContainer: { flex: 1, padding: 20 },
    participantCard: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8
    },
    participantContent: { flexDirection: 'row', alignItems: 'center' },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
    },
    fab: { position: 'absolute', right: 20, bottom: 20, elevation: 6 },
    reportsContent: {
        padding: 20,
        gap: 16,
        paddingBottom: 400
    },
    reportCard: {
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8
    },
    reportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4
    }
})

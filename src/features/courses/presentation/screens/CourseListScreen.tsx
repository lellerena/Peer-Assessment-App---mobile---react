import { useAuth } from '@/src/features/auth/presentation/context/authContext'
import { useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import {
    Avatar,
    Button,
    Card,
    Chip,
    FAB,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper'
import { useCourses } from '../context/courseContext'

type CourseTab = 'available' | 'created' | 'enrolled'

// Placeholder for course images
const courseImages = [
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1974&auto=format&fit=crop'
]

const getCourseImage = (id: string) => {
    const index = id.charCodeAt(0) % courseImages.length
    return courseImages[index]
}

export default function CourseListScreen({ navigation }: { navigation: any }) {
    const theme = useTheme()
    const {
        availableCourses,
        createdCourses,
        enrolledCourses,
        loading,
        error,
        refreshCourses,
        joinCourse
    } = useCourses()
    const { logout } = useAuth()
    const [activeTab, setActiveTab] = useState<CourseTab>('created')
    const [invitationCode, setInvitationCode] = useState('')

    const getCurrentCourses = () => {
        switch (activeTab) {
            case 'available':
                return availableCourses
            case 'created':
                return createdCourses
            case 'enrolled':
                return enrolledCourses
        }
    }

    const handleJoinCourse = async () => {
        console.log('Joining course with code:', invitationCode)
        // TODO: Implement join course by invitation code
        try {
            await joinCourse(invitationCode)
            alert('Te has inscrito exitosamente al curso')
            setInvitationCode('')
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Error al unirse al curso'
            )
        }
    }

    const handleEnterCourse = async (courseId: string) => {
        try {
            await joinCourse(courseId)
            alert('Te has inscrito exitosamente al curso')
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Error al inscribirse al curso'
            )
        }
    }

    const renderCourseCard = ({
        item: course,
        index
    }: {
        item: any
        index: number
    }) => (
        <Card style={styles.courseCard} key={course._id} elevation={2}>
            <Card.Cover source={{ uri: getCourseImage(course._id) }} />
            <Card.Title
                title={course.name}
                titleStyle={styles.courseTitle}
                subtitle={`Profesor: ${course.teacher?.name || 'N/A'}`}
                subtitleStyle={styles.courseSubtitle}
                left={(props) => (
                    <Avatar.Icon
                        {...props}
                        icon="school"
                        style={{ backgroundColor: theme.colors.primary }}
                    />
                )}
            />
            <Card.Content>
                <Text
                    variant="bodyMedium"
                    style={styles.courseDescription}
                    numberOfLines={2}
                >
                    {course.description}
                </Text>
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="contained"
                    onPress={() => {
                        if (activeTab === 'available') {
                            handleEnterCourse(course._id)
                        } else {
                            // TODO: Navigate to course details
                            console.log('Enter course', course._id)
                        }
                    }}
                    style={{ marginRight: 8 }}
                >
                    {activeTab === 'available' ? 'Inscribirse' : 'Entrar'}
                </Button>
            </Card.Actions>
        </Card>
    )

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background }
            ]}
        >
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
                        compact
                    >
                        Recargar
                    </Button>
                    <Button
                        onPress={() => {
                            console.log('Logout button pressed')
                            logout().catch((err) => {
                                console.error('Logout error:', err)
                            })
                        }}
                        icon="logout"
                        compact
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
                <View
                    style={[
                        styles.errorContainer,
                        { backgroundColor: theme.colors.errorContainer }
                    ]}
                >
                    <Text
                        style={[
                            styles.errorText,
                            { color: theme.colors.onErrorContainer }
                        ]}
                    >
                        Error: {error}
                    </Text>
                </View>
            )}

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <Chip
                    selected={activeTab === 'created'}
                    onPress={() => setActiveTab('created')}
                    style={[
                        styles.tab,
                        activeTab === 'created' && {
                            backgroundColor: theme.colors.primary
                        }
                    ]}
                    textStyle={[
                        styles.tabText,
                        activeTab === 'created' && {
                            color: theme.colors.onPrimary
                        }
                    ]}
                    icon="creation"
                >
                    Creados
                </Chip>
                <Chip
                    selected={activeTab === 'enrolled'}
                    onPress={() => setActiveTab('enrolled')}
                    style={[
                        styles.tab,
                        activeTab === 'enrolled' && {
                            backgroundColor: theme.colors.primary
                        }
                    ]}
                    textStyle={[
                        styles.tabText,
                        activeTab === 'enrolled' && {
                            color: theme.colors.onPrimary
                        }
                    ]}
                    icon="book-check"
                >
                    Inscritos
                </Chip>
                <Chip
                    selected={activeTab === 'available'}
                    onPress={() => setActiveTab('available')}
                    style={[
                        styles.tab,
                        activeTab === 'available' && {
                            backgroundColor: theme.colors.primary
                        }
                    ]}
                    textStyle={[
                        styles.tabText,
                        activeTab === 'available' && {
                            color: theme.colors.onPrimary
                        }
                    ]}
                    icon="explore"
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
                    <Avatar.Icon
                        icon="magnify-close"
                        size={80}
                        style={{ backgroundColor: 'transparent' }}
                    />
                    <Text
                        variant="titleMedium"
                        style={{
                            marginTop: 16,
                            color: theme.colors.onSurfaceVariant
                        }}
                    >
                        No se encontraron cursos
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                        {activeTab === 'available' &&
                            'No hay cursos disponibles para inscribirse.'}
                        {activeTab === 'created' &&
                            'Aún no has creado ningún curso. ¡Anímate a empezar!'}
                        {activeTab === 'enrolled' &&
                            'Todavía no estás inscrito en ningún curso.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={getCurrentCourses()}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCourseCard}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* FAB to create course */}
            {activeTab === 'created' && (
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => navigation.navigate('CreateCourse')}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingTop: 40, // For status bar
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontWeight: 'bold'
    },
    invitationContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        alignItems: 'center'
    },
    invitationInput: {
        flex: 1
    },
    joinButton: {
        justifyContent: 'center',
        paddingVertical: 2
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 12
    },
    tab: {
        borderRadius: 20,
        height: 40,
        justifyContent: 'center'
    },
    tabText: {
        fontWeight: 'bold'
    },
    tabActive: {
        // This is now handled inline with theme colors
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100 // To avoid FAB overlap
    },
    courseCard: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden'
    },
    courseTitle: {
        fontWeight: 'bold',
        fontSize: 18
    },
    courseSubtitle: {
        fontSize: 12,
        color: '#666'
    },
    courseDescription: {
        color: '#666',
        marginTop: 4
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 8
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        borderRadius: 28
    },
    errorContainer: {
        padding: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500'
    }
})

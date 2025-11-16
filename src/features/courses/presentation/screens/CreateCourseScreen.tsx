import { useAuth } from '@/src/features/auth/presentation/context/authContext'
import { useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native'
import {
    Avatar,
    Button,
    Card,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper'
import { useCourses } from '../context/courseContext'

export default function CreateCourseScreen({
    navigation
}: {
    navigation: any
}) {
    const theme = useTheme()
    const { user } = useAuth()
    const { createCourse } = useCourses()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) {
            setError('Nombre y descripción son requeridos')
            return
        }

        if (!user?.email) {
            setError('No hay usuario logueado')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Get user ID
            const userId = (user as any).id || (user as any)._id || user.email

            await createCourse({
                name: name.trim(),
                description: description.trim(),
                teacherId: userId,
                studentIds: [],
                categoryIds: []
            })

            // Navigate back and show success
            navigation.goBack()
        } catch (err) {
            console.error('Error creating course:', err)
            setError(
                err instanceof Error ? err.message : 'Error al crear el curso'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <Avatar.Icon
                            icon="plus"
                            size={50}
                            style={styles.avatar}
                        />
                        <Text variant="headlineSmall" style={styles.title}>
                            Crear Nuevo Curso
                        </Text>
                        <Text variant="bodyMedium" style={styles.subtitle}>
                            Completa los detalles para empezar una nueva clase.
                        </Text>

                        {error && (
                            <View
                                style={[
                                    styles.errorContainer,
                                    {
                                        backgroundColor:
                                            theme.colors.errorContainer
                                    }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.errorText,
                                        { color: theme.colors.onErrorContainer }
                                    ]}
                                >
                                    {error}
                                </Text>
                            </View>
                        )}

                        <TextInput
                            label="Nombre del curso"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="format-title" />}
                        />

                        <TextInput
                            label="Descripción"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={4}
                            left={<TextInput.Icon icon="text-subject" />}
                        />
                    </Card.Content>
                    <Card.Actions style={styles.cardActions}>
                        <Button
                            mode="text"
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                            style={styles.cancelButton}
                        >
                            Cancelar
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreate}
                            loading={loading}
                            disabled={
                                loading || !name.trim() || !description.trim()
                            }
                            style={styles.button}
                            icon="check"
                        >
                            Crear Curso
                        </Button>
                    </Card.Actions>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16
    },
    card: {
        borderRadius: 20,
        padding: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12
    },
    avatar: {
        alignSelf: 'center',
        marginBottom: 20,
        elevation: 2
    },
    title: {
        marginBottom: 8,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    subtitle: {
        marginBottom: 24,
        textAlign: 'center',
        color: '#666'
    },
    input: {
        marginBottom: 16
    },
    cardActions: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        justifyContent: 'flex-end'
    },
    button: {
        paddingVertical: 4,
        marginLeft: 8
    },
    cancelButton: {},
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
    },
    errorText: {
        fontWeight: 'bold'
    }
})

# Información de Depuración

## Pasos para Depurar

1. **Recarga la app** (presiona `r` en la terminal de Expo o refresca el navegador)

2. **Abre la consola del navegador** (F12 en Chrome/Edge)

3. **Busca estos logs en orden:**
   - `"AuthContext - Starting login for:"` - Confirma que el login inició
   - `"Full login response:"` - Muestra qué devuelve la API de Roble
   - `"User data saved:"` - Confirma que se guardó el usuario
   - `"AuthContext - Login successful, user data:"` - Muestra el usuario después del login
   - `"CourseContext - User changed:"` - Confirma que el usuario cambió
   - `"Loading courses for user:"` - Muestra el userId usado
   - `"All courses from API:"` - Muestra TODOS los cursos de la API
   - `"Filtering created courses..."` - Muestra el proceso de filtrado

## Posibles Problemas

### 1. Si no ves "All courses from API:"
   - La petición a la API está fallando
   - Revisa: ¿Hay tokens? ¿La URL es correcta?

### 2. Si ves cursos en "All courses from API:" pero no en las listas
   - El problema está en el filtrado
   - Revisa los logs de "Filtering" para ver si los userId coinciden

### 3. Si ves "Total courses: 0"
   - La tabla está vacía en Roble
   - O el nombre de la tabla es incorrecto

## Envía los logs completos de la consola después de hacer login


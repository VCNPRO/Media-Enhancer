# Guía Paso a Paso SIMPLE para Configurar Supabase

## PARTE 1: Obtener la URL de Conexión

### Paso 1: Abrir Supabase
1. Abre tu navegador
2. Ve a: **https://supabase.com/dashboard**
3. Inicia sesión

### Paso 2: Seleccionar o Crear Proyecto
- ¿Ves un proyecto llamado "Media Enhancer" o similar?
  - **SÍ** → Click en el proyecto y ve al Paso 3
  - **NO** → Haz lo siguiente:
    1. Click en **"New Project"** (botón verde)
    2. Nombre: `Media Enhancer`
    3. Database Password: Escribe una contraseña (¡GUÁRDALA!)
    4. Region: Elige la más cercana a ti
    5. Click **"Create new project"**
    6. **ESPERA 2-3 minutos** hasta que aparezca el dashboard

### Paso 3: Copiar la URL de Conexión
1. En el menú lateral izquierdo, busca el icono de ⚙️ **"Settings"**
2. Click en **"Settings"**
3. En el sub-menú, click en **"Database"**
4. Scroll hacia abajo hasta ver **"Connection string"**
5. Verás varias pestañas: **Session**, **Transaction**, **URI**
6. Click en la pestaña **"URI"**
7. Verás algo como:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
8. **Copia esta URL completa**

### Paso 4: Reemplazar la Contraseña
La URL que copiaste tiene `[YOUR-PASSWORD]` en el medio.

**Ejemplo:**
```
postgresql://postgres.abcd1234:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Debes reemplazar `[YOUR-PASSWORD]` con la contraseña que escribiste en el Paso 2.

**Resultado final:**
```
postgresql://postgres.abcd1234:MiContraseña123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**¡GUARDA ESTA URL! La necesitarás en el siguiente paso.**

---

## PARTE 2: Actualizar el archivo .env

### Paso 5: Abrir el archivo .env
1. En VS Code (o tu editor), abre el proyecto
2. Ve a la carpeta: **backend**
3. Encuentra el archivo: **.env**
4. Abre el archivo

### Paso 6: Cambiar la DATABASE_URL
1. Busca la línea que dice:
   ```
   DATABASE_URL= postgresql://postgres:Calafell20@db.mdwinslynumlxhccuqis.supabase.co:5432/postgres
   ```

2. **BORRA** todo lo que está después del `=`

3. **PEGA** la URL que guardaste en el Paso 4

4. Debería quedar así:
   ```
   DATABASE_URL=postgresql://postgres.abcd1234:MiContraseña123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

5. **GUARDA** el archivo (Ctrl+S o Cmd+S)

---

## PARTE 3: Crear las Tablas en Supabase

### Paso 7: Copiar el Schema SQL
1. En tu editor, abre el archivo:
   ```
   backend/src/database/schema.sql
   ```

2. **Selecciona TODO** el contenido (Ctrl+A o Cmd+A)

3. **Copia** todo (Ctrl+C o Cmd+C)

### Paso 8: Ejecutar el SQL en Supabase
1. Vuelve a tu navegador con Supabase abierto

2. En el menú lateral izquierdo, busca **"SQL Editor"** (icono de documento con <>)

3. Click en **"SQL Editor"**

4. Click en el botón **"New query"** (arriba a la derecha)

5. Se abrirá un editor vacío

6. **Pega** el contenido que copiaste (Ctrl+V o Cmd+V)

7. Abajo a la derecha, verás un botón verde que dice **"RUN"**

8. Click en **"RUN"**

9. Espera unos segundos...

10. Deberías ver un mensaje de éxito:
    ```
    Success. No rows returned
    ```

### Paso 9: Verificar que se crearon las tablas
1. En el menú lateral izquierdo, click en **"Table Editor"** (icono de tabla)

2. Deberías ver estas tablas en la lista:
   - users
   - subscription_plans
   - user_subscriptions
   - media_files
   - projects
   - project_media
   - exports
   - ai_jobs
   - usage_logs

3. Si ves estas tablas, **¡PERFECTO!** ✅

---

## PARTE 4: Verificar la Conexión del Backend

El backend debería reiniciarse automáticamente cuando guardaste el .env.

### Paso 10: Ver los logs del backend
En la terminal donde corre el backend, deberías ver:

```
🚀 Server running on port 3001
📝 Environment: development
🔗 Health check: http://localhost:3001/health
✅ Connected to PostgreSQL database
✅ Database connected successfully
```

**Si ves estos mensajes SIN errores** → ¡TODO FUNCIONÓ! 🎉

**Si todavía ves errores** → Revisa:
1. Que la URL en el .env sea correcta (sin espacios al inicio o final)
2. Que la contraseña sea la correcta
3. Que hayas guardado el archivo .env

---

## ¿Necesitas ayuda?

Si algo no funciona, dime EN QUÉ PASO te quedaste y te ayudo específicamente con ese paso.

Ejemplos:
- "No encuentro el botón Settings en Supabase"
- "No sé dónde está el archivo .env"
- "El SQL me da error cuando lo ejecuto"
- "Sigo viendo el error de database connection"

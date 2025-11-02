# Guía de Configuración de Supabase para Media Enhancer

## Problema Actual

El backend muestra este error:
```
❌ Database connection failed: Error: getaddrinfo ENOTFOUND db.mdwinslynumlxhccuqis.supabase.co
```

Esto significa que el hostname de Supabase no existe o es incorrecto.

---

## Solución: Verificar y Configurar Supabase Correctamente

### Paso 1: Verificar tu Proyecto en Supabase

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Verifica que tengas un proyecto creado para "Media Enhancer"
   - Si NO tienes ningún proyecto, ve al **Paso 2**
   - Si SÍ tienes un proyecto, ve al **Paso 3**

---

### Paso 2: Crear un Nuevo Proyecto en Supabase (si no existe)

1. Click en **"New Project"**
2. Completa:
   - **Name**: `Media Enhancer`
   - **Database Password**: Crea una contraseña segura (GUÁRDALA, la necesitarás)
   - **Region**: Elige la más cercana (ej: `West EU (Ireland)` para Europa)
   - **Pricing Plan**: Free (suficiente para desarrollo)

3. Click **"Create new project"**

4. **ESPERA 2-3 minutos** mientras Supabase provisiona la base de datos
   - Verás un spinner que dice "Setting up project..."
   - NO continúes hasta que el proyecto esté completamente creado

---

### Paso 3: Obtener la Connection String CORRECTA

Una vez que tu proyecto esté listo:

1. En el dashboard de Supabase, ve a **Settings** (⚙️ en el menú lateral)

2. Click en **Database** en el menú de Settings

3. Scroll hasta encontrar **"Connection string"**

4. Selecciona la pestaña **"URI"**

5. Verás algo como:
   ```
   postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

6. **IMPORTANTE**:
   - Click en el botón **"Copy"** o copia manualmente
   - Esta URL contiene un placeholder `[YOUR-PASSWORD]`
   - Debes reemplazar `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 2

7. La URL final debería verse así (ejemplo):
   ```
   postgresql://postgres.xxxxxx:TuContraseñaAqui@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

---

### Paso 4: Actualizar el archivo .env

1. Abre `backend/.env` en tu editor

2. Encuentra la línea que dice:
   ```
   DATABASE_URL=postgresql://postgres:Calafell20@db.mdwinslynumlxhccuqis.supabase.co:5432/postgres
   ```

3. Reemplázala con la URL correcta que copiaste de Supabase:
   ```
   DATABASE_URL=postgresql://postgres.xxxxxx:TuContraseñaAqui@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

4. **Guarda el archivo** (Ctrl+S)

---

### Paso 5: Ejecutar el Schema SQL

Una vez que tengas la conexión correcta, necesitas crear las tablas en Supabase:

1. En el dashboard de Supabase, ve a **SQL Editor** (menú lateral)

2. Click en **"New query"**

3. Abre el archivo `backend/src/database/schema.sql` de este proyecto

4. Copia TODO el contenido del archivo

5. Pégalo en el SQL Editor de Supabase

6. Click en **"Run"** (botón verde abajo a la derecha)

7. Deberías ver un mensaje de éxito que dice algo como:
   ```
   Success. No rows returned
   ```

8. Verifica que las tablas se crearon:
   - Ve a **Table Editor** en el menú lateral
   - Deberías ver estas tablas:
     - `users`
     - `subscription_plans`
     - `user_subscriptions`
     - `media_files`
     - `projects`
     - `project_media`
     - `exports`
     - `ai_jobs`
     - `usage_logs`

---

### Paso 6: Reiniciar el Backend

Ya actualizaste el .env, ahora el backend necesita reiniciarse para leer la nueva configuración.

**El backend se reiniciará automáticamente** cuando guardes el .env (si está corriendo con `npm run dev`).

Si no se reinicia automáticamente:
1. Detén el servidor (Ctrl+C en la terminal del backend)
2. Inicia de nuevo: `npm run dev`

---

## Verificación Final

Cuando el backend arranque correctamente, deberías ver:

```
🚀 Server running on port 3001
📝 Environment: development
🔗 Health check: http://localhost:3001/health
✅ Connected to PostgreSQL database
✅ Database connected successfully
```

Si ves estos mensajes **SIN el error ENOTFOUND**, la conexión está funcionando correctamente.

---

## Troubleshooting

### Error: "password authentication failed"
- La contraseña en el DATABASE_URL es incorrecta
- Ve a Supabase → Settings → Database → Reset Database Password
- Actualiza el DATABASE_URL con la nueva contraseña

### Error: "ENOTFOUND" persiste
- La URL está incorrecta o incompleta
- Verifica que copiaste la URL completa de Supabase
- Asegúrate de estar usando la URL de la pestaña "URI" (no "Session" ni "Transaction")

### Error: "too many connections"
- Cierra las terminales antiguas del backend que puedan estar corriendo
- En Windows: `taskkill //F //IM node.exe` (cuidado, esto cierra TODOS los procesos Node)

### Las tablas no se crearon
- Verifica que ejecutaste TODO el schema.sql
- Verifica que no haya errores en el SQL Editor de Supabase
- Si hay errores, lee el mensaje y corrígelos

---

## Próximos Pasos

Una vez que la base de datos esté conectada:

1. ✅ Configurar Clerk Webhook (ver `CLERK_WEBHOOK_SETUP.md`)
2. ✅ Probar el registro de usuarios
3. ✅ Verificar que los usuarios se sincronicen con PostgreSQL
4. ✅ Probar las subscripciones
5. ✅ Deploy a producción (Railway + Vercel)

---

## URLs Importantes

- Supabase Dashboard: https://supabase.com/dashboard
- Documentación de Supabase: https://supabase.com/docs
- Troubleshooting de conexiones: https://supabase.com/docs/guides/database/connecting-to-postgres

---

**Nota**: Si sigues teniendo problemas, verifica:
1. Que estás usando la contraseña correcta
2. Que la URL no tiene espacios al inicio o final
3. Que el proyecto de Supabase está activo (no pausado)

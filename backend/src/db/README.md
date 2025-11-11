# Base de Datos - Setup

Este directorio contiene el schema y migraciones para PostgreSQL.

## Setup Inicial

### 1. Crear Base de Datos en Supabase

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. Copia la `Connection String` (está en Settings → Database)
3. Agrégala a tu `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### 2. Ejecutar Schema

Conéctate a tu base de datos y ejecuta el archivo `schema.sql`:

#### Opción A: Desde Supabase Dashboard
1. Ve a **SQL Editor** en el dashboard de Supabase
2. Copia y pega el contenido de `schema.sql`
3. Haz clic en **Run**

#### Opción B: Desde psql (línea de comandos)
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < src/db/schema.sql
```

#### Opción C: Usando node
```bash
# Crear un script temporal
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = fs.readFileSync('./src/db/schema.sql', 'utf8');
pool.query(schema).then(() => {
  console.log('✅ Schema ejecutado exitosamente');
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err);
  pool.end();
});
"
```

### 3. Verificar Tablas

Ejecuta este query para verificar que las tablas se crearon:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Deberías ver:
- `users`
- `subscription_plans`
- `user_subscriptions`
- `media_files`
- `projects`
- `exports`
- `ai_jobs`

## Estructura de Tablas

### `media_files`
Almacena información sobre archivos subidos:
- `id`: UUID único
- `user_id`: ID del usuario (de Clerk)
- `filename`: Nombre generado del archivo
- `original_filename`: Nombre original
- `file_size`: Tamaño en bytes
- `mime_type`: Tipo MIME (video/mp4, etc.)
- `storage_key`: Key en R2
- `storage_url`: URL pública
- `status`: Estado (ready, processing, error)

### `subscription_plans`
Planes de suscripción disponibles (pre-poblado con Starter, Creator, Professional)

### `user_subscriptions`
Suscripciones activas de usuarios

### `projects`
Proyectos de edición de video

### `exports`
Exportaciones completadas

### `ai_jobs`
Jobs de procesamiento con IA

## Migraciones Futuras

Para agregar nuevas migraciones, crea archivos con el formato:
```
001_add_column_xyz.sql
002_create_table_abc.sql
```

Y ejecútalos en orden usando la misma metodología de arriba.

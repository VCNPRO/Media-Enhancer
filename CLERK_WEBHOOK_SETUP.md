# 🔗 Configuración del Webhook de Clerk

Esta guía te explica cómo configurar el webhook de Clerk para sincronizar automáticamente los usuarios con tu base de datos.

---

## ¿Por qué necesitas esto?

El webhook de Clerk permite que cuando alguien se registre en tu app:
1. Clerk crea el usuario
2. Clerk envía una notificación a tu backend
3. Tu backend crea automáticamente el usuario en PostgreSQL
4. Se le asigna la subscripción "Starter" por defecto

---

## 📋 Configuración Paso a Paso

### OPCIÓN A: Para Desarrollo Local (Testing)

**1. Exponer tu localhost al internet (temporal)**

Necesitas que Clerk pueda acceder a tu localhost. Usaremos **Ngrok** (gratis):

```bash
# Instalar ngrok (si no lo tienes)
npm install -g ngrok

# Exponer el puerto 3001 (tu backend)
ngrok http 3001
```

Esto te dará una URL tipo: `https://abc123.ngrok.io`

**2. Configurar el webhook en Clerk**

1. Ve a: https://dashboard.clerk.com
2. Selecciona tu aplicación "Media Enhancer"
3. En el menú lateral, click en "Webhooks"
4. Click en "Add Endpoint"

**Configuración del Endpoint:**
- Endpoint URL: `https://abc123.ngrok.io/api/webhooks/clerk`
  (Reemplaza `abc123.ngrok.io` con tu URL de ngrok)

- Message Filtering: Selecciona estos eventos:
  - ✅ `user.created`
  - ✅ `user.updated`
  - ✅ `user.deleted`

- Click "Create"

**3. Copiar el Signing Secret**

Clerk te mostrará un "Signing Secret" tipo: `whsec_xxxxxxxxxxxxx`

1. Cópialo
2. Abre `backend/.env`
3. Añade:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
4. Guarda el archivo
5. Reinicia el backend (Ctrl+C y `npm run dev` again)

**4. Probar**

1. Abre tu app en el navegador: http://localhost:5173
2. Regístrate con un nuevo usuario (usa un email de prueba)
3. Verifica en Supabase que el usuario se creó en la tabla `users`

---

### OPCIÓN B: Para Producción (Railway/Vercel)

**1. Una vez desplegado en Railway**

Tu backend tendrá una URL tipo: `https://media-enhancer-production.up.railway.app`

**2. Configurar el webhook en Clerk**

1. Ve a: https://dashboard.clerk.com
2. Webhooks → Add Endpoint
3. Endpoint URL: `https://media-enhancer-production.up.railway.app/api/webhooks/clerk`
4. Selecciona eventos: `user.created`, `user.updated`, `user.deleted`
5. Click "Create"

**3. Añadir el Signing Secret a Railway**

1. Copia el "Signing Secret" de Clerk
2. Ve a tu proyecto en Railway
3. Variables → Add Variable
4. Nombre: `CLERK_WEBHOOK_SECRET`
5. Valor: `whsec_xxxxxxxxxxxxx` (tu secret)
6. Railway se redeployará automáticamente

**4. Probar**

1. Abre tu app en producción
2. Regístrate con un usuario
3. Verifica en Supabase que se creó

---

## 🧪 Verificar que Funciona

### En Desarrollo (Ngrok)

1. Mantén ngrok corriendo en una terminal
2. Mantén el backend corriendo en otra terminal
3. Abre los logs del backend (verás mensajes cuando lleguen webhooks)
4. Regístrate en la app
5. Deberías ver en los logs:
   ```
   Received Clerk webhook: user.created
   ✅ User created in database: user@example.com
   ```

### En Producción

1. Ve a Railway → Deployments → View Logs
2. Regístrate en tu app
3. Verifica los logs en Railway
4. Verifica en Supabase → Table Editor → users

---

## ⚠️ Troubleshooting

**Error: "Missing svix headers"**
- Verifica que la URL del webhook sea correcta
- Asegúrate de que termina en `/api/webhooks/clerk`

**Error: "Invalid signature"**
- Verifica que `CLERK_WEBHOOK_SECRET` esté configurado correctamente
- Asegúrate de que copiaste el secret completo (empieza con `whsec_`)

**Usuario no se crea en la base de datos**
- Verifica que la base de datos esté conectada (check DATABASE_URL)
- Revisa los logs del backend para errores
- Verifica que el schema.sql se ejecutó correctamente en Supabase

---

## 📝 Nota Importante

**Para desarrollo local:**
- Ngrok es temporal. Cada vez que lo ejecutes, tendrás una URL diferente
- Necesitarás actualizar el webhook en Clerk cada vez
- Alternativa: Puedes pagar Ngrok Pro ($5/mes) para una URL fija

**Para producción:**
- El webhook se configura una sola vez
- No necesitas ngrok
- La URL de Railway es permanente

---

## ✅ Checklist Final

- [ ] Webhook creado en Clerk dashboard
- [ ] Eventos seleccionados (user.created, updated, deleted)
- [ ] CLERK_WEBHOOK_SECRET configurado en .env
- [ ] Backend reiniciado
- [ ] Probado registrando un usuario nuevo
- [ ] Usuario aparece en Supabase
- [ ] Usuario tiene subscripción "starter" automáticamente

---

**¡Listo!** Ahora los usuarios se sincronizarán automáticamente con tu base de datos. 🎉

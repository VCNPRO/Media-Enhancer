FROM node:18

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies después del build para reducir tamaño
RUN npm prune --production

# Crear directorio temporal
RUN mkdir -p /tmp/uploads

EXPOSE 8080

CMD ["node", "dist/server.js"]

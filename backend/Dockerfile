FROM node:18-slim

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar TypeScript)
RUN npm ci

# Copiar código fuente TypeScript
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Crear directorio temporal
RUN mkdir -p /tmp/uploads

# Eliminar devDependencies para reducir tamaño de imagen
RUN npm prune --production

EXPOSE 8080

# Variable de entorno para el puerto
ENV PORT=8080

# Ejecutar código compilado (JavaScript)
CMD ["node", "dist/server.js"]

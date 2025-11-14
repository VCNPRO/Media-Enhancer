FROM node:18-slim

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Crear directorio temporal
RUN mkdir -p /tmp/uploads

EXPOSE 8080

# Variable de entorno para el puerto
ENV PORT=8080

CMD ["node", "src/server.js"]

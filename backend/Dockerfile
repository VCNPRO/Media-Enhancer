FROM node:18

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY server.js ./
COPY cors.json ./

# Crear directorio temporal
RUN mkdir -p /tmp/uploads

EXPOSE 8080

CMD ["node", "server.js"]

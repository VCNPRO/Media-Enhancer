FROM node:18

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar todo el código fuente y compilar TypeScript
COPY . .
RUN npm run build

# Crear directorio temporal
RUN mkdir -p /tmp/uploads

EXPOSE 8080

CMD ["node", "dist/server.js"]

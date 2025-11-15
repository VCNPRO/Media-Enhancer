#!/bin/bash

# Configuración CORS para R2 bucket
# Este script configura CORS en el bucket de Cloudflare R2

ACCOUNT_ID="65353fa961d2c394ab3d630c0f548d63"
BUCKET_NAME="media-enhancer-videos"
ACCESS_KEY_ID="f398706ecb361929c306fd167b2b793b"
SECRET_ACCESS_KEY="ea9dcfa74cfcf2bc943604e75b0a52ea565a28228b9ff16a2971bae91f253e3c"

# Endpoint de R2
R2_ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

echo "Configurando CORS para bucket: $BUCKET_NAME"

# Crear archivo de configuración CORS
cat > cors-config.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
    <CORSRule>
        <AllowedOrigin>https://media-enhancer.vercel.app</AllowedOrigin>
        <AllowedOrigin>http://localhost:5173</AllowedOrigin>
        <AllowedOrigin>http://localhost:5174</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>DELETE</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
        <ExposeHeader>ETag</ExposeHeader>
        <ExposeHeader>x-amz-request-id</ExposeHeader>
        <MaxAgeSeconds>3600</MaxAgeSeconds>
    </CORSRule>
</CORSConfiguration>
EOF

echo "Archivo de configuración CORS creado: cors-config.xml"
echo ""
echo "Para aplicar la configuración CORS, ejecuta uno de estos comandos:"
echo ""
echo "Opción 1 - Usando AWS CLI:"
echo "aws s3api put-bucket-cors \\"
echo "  --bucket $BUCKET_NAME \\"
echo "  --cors-configuration file://cors-config.xml \\"
echo "  --endpoint-url $R2_ENDPOINT"
echo ""
echo "Opción 2 - Usando curl:"
echo "curl -X PUT \"$R2_ENDPOINT/$BUCKET_NAME?cors\" \\"
echo "  -H \"Content-Type: application/xml\" \\"
echo "  --aws-sigv4 \"aws:amz:auto:s3\" \\"
echo "  --user \"$ACCESS_KEY_ID:$SECRET_ACCESS_KEY\" \\"
echo "  --data-binary @cors-config.xml"

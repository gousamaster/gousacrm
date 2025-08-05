import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Configuración del cliente S3 con mejor manejo de errores
const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_CONNECTION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_ID!,
        secretAccessKey: process.env.S3_ACCESS_KEY!,
    },
    forcePathStyle: true, // Necesario para algunos proveedores S3 compatibles
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "documentos"

export interface UploadResult {
    success: boolean
    data?: {
        path: string
        publicUrl: string
    }
    error?: string
}

export interface DeleteResult {
    success: boolean
    error?: string
}

// Subir archivo a S3 con mejor manejo de errores
export async function uploadFileToSupabase(file: File, folder = "uploads", subfolder = ""): Promise<UploadResult> {
    try {
        console.log("📤 Iniciando subida a S3:", {
            fileName: file.name,
            fileSize: file.size,
            folder,
            subfolder,
            endpoint: process.env.S3_CONNECTION,
            bucket: BUCKET_NAME,
        })

        // Verificar configuración
        if (!process.env.S3_CONNECTION) {
            throw new Error("S3_CONNECTION no está configurado")
        }
        if (!process.env.S3_ACCESS_ID) {
            throw new Error("S3_ACCESS_ID no está configurado")
        }
        if (!process.env.S3_ACCESS_KEY) {
            throw new Error("S3_ACCESS_KEY no está configurado")
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const extension = file.name.split(".").pop()
        const fileName = `${file.name.replace(/\.[^/.]+$/, "")}_${timestamp}.${extension}`

        // Construir la ruta completa
        const path = subfolder ? `${folder}/${subfolder}/${fileName}` : `${folder}/${fileName}`

        console.log("📁 Ruta del archivo:", path)

        // Convertir File a Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Configurar el comando de subida
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: path,
            Body: buffer,
            ContentType: file.type,
            ContentLength: file.size,
            // Agregar metadatos adicionales
            Metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
            },
        })

        console.log("⬆️ Ejecutando comando de subida...")

        // Ejecutar la subida con timeout
        const uploadPromise = s3Client.send(command)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout: La subida tardó más de 30 segundos")), 30000)
        })

        const result = await Promise.race([uploadPromise, timeoutPromise])

        console.log("✅ Archivo subido exitosamente:", result)

        // Construir URL pública
        const publicUrl = `${process.env.S3_CONNECTION}/${BUCKET_NAME}/${path}`

        return {
            success: true,
            data: {
                path,
                publicUrl,
            },
        }
    } catch (error) {
        console.error("❌ Error al subir archivo a S3:", error)

        let errorMessage = "Error desconocido al subir archivo"

        if (error instanceof Error) {
            errorMessage = error.message

            // Mensajes de error más específicos
            if (error.message.includes("NetworkingError")) {
                errorMessage = "Error de conexión con el servidor de almacenamiento. Verifica la configuración de S3."
            } else if (error.message.includes("AccessDenied")) {
                errorMessage = "Acceso denegado. Verifica las credenciales de S3."
            } else if (error.message.includes("NoSuchBucket")) {
                errorMessage = `El bucket '${BUCKET_NAME}' no existe.`
            } else if (error.message.includes("Timeout")) {
                errorMessage = "La subida tardó demasiado tiempo. Intenta con un archivo más pequeño."
            }
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}

// Eliminar archivo de S3
export async function deleteFileFromSupabase(path: string): Promise<DeleteResult> {
    try {
        console.log("🗑️ Eliminando archivo de S3:", path)

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: path,
        })

        await s3Client.send(command)

        console.log("✅ Archivo eliminado de S3")

        return {
            success: true,
        }
    } catch (error) {
        console.error("❌ Error al eliminar archivo de S3:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al eliminar archivo",
        }
    }
}

// Obtener URL firmada para acceso temporal
export async function getFileUrl(path: string): Promise<string> {
    try {
        console.log("🔗 Generando URL firmada para:", path)

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: path,
        })

        // Generar URL firmada válida por 1 hora
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        console.log("✅ URL firmada generada")

        return signedUrl
    } catch (error) {
        console.error("❌ Error al generar URL firmada:", error)
        // Fallback a URL pública
        return `${process.env.S3_CONNECTION}/${BUCKET_NAME}/${path}`
    }
}

// Funciones de compatibilidad (aliases)
export const uploadToS3 = uploadFileToSupabase
export const deleteFromS3 = deleteFileFromSupabase

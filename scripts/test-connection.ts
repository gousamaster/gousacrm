import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import dns from 'dns/promises';
import net from 'net';

// Función para cargar .env.local manualmente (tu función original, está perfecta)
function loadEnv() {
    try {
        const envPath = join(process.cwd(), '.env');
        const envContent = readFileSync(envPath, 'utf8');

        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            }
        });
        console.log("✅ Variables de entorno cargadas desde .env.local");
    } catch (error) {
        console.error("❌ No se pudo encontrar o leer el archivo .env.local. Asegúrate de que exista.");
        process.exit(1);
    }
}

async function testConnection() {
    console.log("=============================================");
    console.log("  INICIANDO DIAGNÓSTICO DE CONEXIÓN A SUPABASE  ");
    console.log("=============================================\n");

    loadEnv();

    const dbUrlString = process.env.DATABASE_URL;
    if (!dbUrlString) {
        console.error("❌ FATAL: La variable de entorno DATABASE_URL no está configurada.");
        return;
    }

    let url;
    try {
        url = new URL(dbUrlString);
    } catch (error) {
        console.error("❌ FATAL: El formato de DATABASE_URL es inválido.");
        return;
    }

    const hostname = url.hostname;
    const port = parseInt(url.port, 10);
    const password = url.password;
    const user = url.username;

    console.log(`📋 DATOS DE CONEXIÓN:`);
    console.log(`   - Host: ${hostname}`);
    console.log(`   - Puerto: ${port}`);
    console.log(`   - Usuario: ${user}`);
    console.log(`   - Contraseña: ${password ? '********' : 'No definida'}\n`);

    // --- PASO 1: Verificación de DNS ---
    console.log(`[PASO 1/3] 🌐 Verificando resolución DNS para '${hostname}'...`);
    let ipAddress: string;
    try {
        const lookupResult = await dns.lookup(hostname);
        ipAddress = lookupResult.address;
        console.log(`✅ Éxito: '${hostname}' resuelve a la dirección IP: ${ipAddress}\n`);
    } catch (error) {
        console.error(`❌ FALLO EN DNS: No se pudo resolver el nombre de dominio '${hostname}'.`);
        if (typeof error === 'object' && error !== null && 'code' in error) {
            console.error(`   - Código de error: ${(error as { code?: string }).code}`);
        } else {
            console.error(`   - Código de error: desconocido`);
        }
        console.log("\n=================== INFORME PARA EL EQUIPO DE TI ===================");
        console.log("  El sistema no puede encontrar la dirección IP del servidor de la base de datos.");
        console.log("  Esto puede deberse a un bloqueo en el servidor DNS de la empresa.");
        console.log("  ACCIÓN REQUERIDA: Por favor, asegúrese de que los DNS de la red corporativa");
        console.log(`  puedan resolver correctamente el dominio: ${hostname}`);
        console.log("====================================================================");
        return;
    }

    // --- PASO 2: Verificación de Conexión TCP (Firewall) ---
    console.log(`[PASO 2/3] 🧱 Verificando conexión TCP al puerto ${port} en ${hostname} (${ipAddress})...`);
    try {
        await new Promise<void>((resolve, reject) => {
            const socket = new net.Socket();
            const timeout = 10000; // 10 segundos

            socket.setTimeout(timeout);

            socket.on('connect', () => {
                console.log(`✅ Éxito: Conexión TCP establecida con el puerto ${port}.\n`);
                socket.destroy();
                resolve();
            });

            socket.on('error', (err) => {
                reject(err);
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Timeout de conexión'));
            });

            socket.connect(port, hostname);
        });
    } catch (error) {
        console.error(`❌ FALLO EN TCP: No se pudo establecer una conexión con el servidor en el puerto ${port}.`);
        console.error(`   - Mensaje de error: ${(error instanceof Error ? error.message : String(error))}`);
        console.log("\n=================== INFORME PARA EL EQUIPO DE TI ===================");
        console.log("  El sistema pudo resolver la IP del servidor, pero la conexión fue bloqueada.");
        console.log("  Esto es un indicador claro de un firewall o una política de red.");
        console.log("  ACCIÓN REQUERIDA: Por favor, habilite el tráfico TCP saliente");
        console.log(`  desde esta máquina hacia el host '${hostname}' (${ipAddress}) en el puerto ${port}.`);
        console.log("====================================================================");
        return;
    }

    // --- PASO 3: Verificación de Autenticación y Query ---
    console.log("[PASO 3/3] 🔐 Verificando autenticación y ejecutando consulta de prueba...");
    try {
        const sql = postgres(dbUrlString, {
            max: 1,
            ssl: { rejectUnauthorized: false }, // En producción, esto debería ser más estricto
            connect_timeout: 10,
        });

        const result = await sql`SELECT NOW() as current_time`;
        console.log("✅ ¡Éxito! Autenticación correcta y consulta ejecutada.");
        console.log("   - Hora del servidor de la base de datos:", result[0].current_time);

        await sql.end();
    } catch (error) {
        console.error("❌ FALLO EN AUTENTICACIÓN/SSL: La conexión TCP se estableció, pero la autenticación falló.");
        console.error(`   - Mensaje de error: ${error instanceof Error ? error.message : String(error)}`);
        console.log("\n=================== INFORME PARA EL EQUIPO DE TI ===================");
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
            const errMsg = (error as any).message.toLowerCase();
            if (errMsg.includes('authentication')) {
                console.log("  El error indica un problema con el usuario o la contraseña.");
                console.log("  ACCIÓN REQUERIDA (Desarrollador): Verificar las credenciales en el archivo .env.local.");
            } else if (errMsg.includes('ssl')) {
                console.log("  El error indica un problema con el handshake SSL. Esto puede ser un firewall");
                console.log("  que realiza 'inspección profunda de paquetes' (Deep Packet Inspection).");
                console.log("  ACCIÓN REQUERIDA: Por favor, ponga en la lista blanca (whitelist) el tráfico SSL");
                console.log(`  hacia el host '${hostname}' (${ipAddress}) en el puerto ${port}.`);
            } else {
                console.log("  Ha ocurrido un error inesperado durante la fase de conexión segura.");
                console.log("  ACCIÓN REQUERIDA: Revisar el mensaje de error anterior y, si es necesario,");
                console.log(`  permitir el tráfico SSL hacia '${hostname}' (${ipAddress}) en el puerto ${port}.`);
            }
        } else {
            console.log("  Ha ocurrido un error inesperado durante la fase de conexión segura.");
            console.log("  ACCIÓN REQUERIDA: Revisar el mensaje de error anterior y, si es necesario,");
            console.log(`  permitir el tráfico SSL hacia '${hostname}' (${ipAddress}) en el puerto ${port}.`);
        }
        console.log("====================================================================");
        return;
    }

    console.log("\n🎉 DIAGNÓSTICO COMPLETO: ¡La conexión a la base de datos funciona perfectamente!");
}

testConnection();
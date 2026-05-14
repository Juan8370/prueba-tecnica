# 🩺 MediPrescription - Sistema de Gestión de Prescripciones Médicas

Este es un MVP sólido y profesional para la gestión de prescripciones médicas, construido como una aplicación Full-Stack moderna. El sistema permite a los médicos crear recetas, a los pacientes gestionarlas y descargarlas en PDF, y a los administradores visualizar métricas críticas del sistema.

---

## 🚀 Tecnologías Utilizadas

### Backend
*   **NestJS**: Framework de Node.js para aplicaciones escalables.
*   **Prisma ORM**: Modelado de datos y consultas tipo-seguras.
*   **PostgreSQL**: Base de datos relacional.
*   **Passport + JWT**: Autenticación segura con **HttpOnly Cookies**.
*   **PDFKit**: Generación dinámica de prescripciones en PDF.
*   **Swagger**: Documentación interactiva de la API.

### Frontend
*   **Next.js 15 (App Router)**: Framework de React para producción.
*   **TailwindCSS**: Estilizado moderno y responsive.
*   **Recharts**: Visualización de datos y métricas para el Admin.
*   **Framer Motion**: Animaciones fluidas para una mejor UX.
*   **Sonner**: Sistema de notificaciones (Toasts).

---

## 🔒 Seguridad y Arquitectura (Decisiones Técnicas)

Durante el desarrollo se priorizó la seguridad y la eficiencia:

1.  **Protección XSS con HttpOnly Cookies**: A diferencia de los sistemas estándar que guardan tokens en LocalStorage, esta app implementa almacenamiento de JWT en cookies con flags `HttpOnly`, `Secure` y `SameSite=Lax`. Esto impide que atacantes accedan a las credenciales mediante scripts maliciosos.
2.  **Seguridad Global**: Implementación de **Helmet** para cabeceras de seguridad y **Rate Limiting** para prevenir ataques de fuerza bruta y DoS.
3.  **Optimización de Consultas (N+1)**: Las consultas al ORM (Prisma) se optimizaron para evitar el problema de N+1 peticiones, especialmente en el dashboard de métricas del administrador.
4.  **RBAC (Role-Based Access Control)**: Sistema robusto de permisos mediante Guards y Decoradores personalizados en el backend, replicado en el frontend mediante protección de rutas por contexto de autenticación.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el proyecto
```bash
git clone <url-del-repo>
cd prueba-tecnica
```

### 2. Configuración del Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/` con lo siguiente:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/medidb?schema=public"
JWT_ACCESS_SECRET="tu_secreto_super_seguro_1"
JWT_REFRESH_SECRET="tu_secreto_super_seguro_2"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"
APP_ORIGIN="http://localhost:3000"
PORT=3001
```

### 3. Base de Datos y Seed
```bash
# Ejecutar migraciones (Local)
npx prisma migrate dev --name init

# Sincronizar esquema con Producción (ej: Railway)
# Asegúrate de configurar la DATABASE_URL de producción en tu .env
npx prisma db push

# Poblar la base de datos con datos de prueba
npm run seed
```

---

## 🌐 Despliegue en Producción (Railway / Vercel)

Para un despliegue exitoso, ten en cuenta:

1.  **Backend (Railway)**:
    *   Configura la variable `PORT` (Railway la asigna automáticamente).
    *   Configura `APP_ORIGIN` con la URL de tu frontend (ej: `https://tu-app.vercel.app`). **Sin barra final `/`**.
    *   Ejecuta `npx prisma db push` desde tu terminal local apuntando a la DB de Railway para crear las tablas.

2.  **Frontend (Vercel)**:
    *   Configura `NEXT_PUBLIC_API_URL` con la URL de tu backend en Railway.


### 4. Configuración del Frontend
```bash
cd ../frontend
npm install
```
Crea un archivo `.env.local` en la carpeta `frontend/` con lo siguiente:
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 🏃‍♂️ Ejecución

**Backend:**
```bash
# En /backend
npm run start:dev
```
*API disponible en:* `http://localhost:3001`
*Swagger Docs:* `http://localhost:3001/docs`

**Frontend:**
```bash
# En /frontend
npm run dev
```
*App disponible en:* `http://localhost:3000`

---

## 🧪 Testing

El proyecto cuenta con una cobertura integral:

*   **Tests Unitarios (Backend):** `npm run test` (Cubre servicios de Auth y Prescripciones).
*   **Tests E2E (Backend):** `npm run test:e2e` (Simula flujo completo: Registro -> Login -> Crear Receta -> Consumir -> PDF).
*   **Tests Unitarios (Frontend):** `npm run test` (Verifica componentes y flujo de Login).

---

## 👥 Cuentas de Prueba (Seeds)

| Rol | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `admin123` |
| **Médico** | `dr@test.com` | `dr123` |
| **Paciente** | `patient@test.com` | `patient123` |

---

## 📄 Entregables Adicionales
*   **PDF con QR**: Las recetas generadas incluyen los datos del médico, paciente y un código único.
*   **Dashboard de Admin**: Gráficos interactivos de prescripciones por día y por estado.
*   **Manejo de Errores**: Filtros globales de excepciones para respuestas consistentes.

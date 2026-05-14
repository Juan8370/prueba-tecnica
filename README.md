# MediAdmin - Sistema de Gestión de Prescripciones Médicas

MediAdmin es una solución Full-Stack moderna para la gestión de recetas médicas digitales, implementando separación de roles, panel de administración con métricas, y un sistema seguro y auditable para la emisión y consumo de prescripciones.

## 🚀 Tecnologías Principales

**Backend:**
* NestJS (Framework)
* Prisma ORM
* PostgreSQL
* JWT (Access & Refresh tokens) + Bcrypt
* Swagger (OpenAPI)
* PDFKit & QRCode

**Frontend:**
* Next.js (App Router)
* React + TypeScript
* Tailwind CSS
* Recharts
* Framer Motion (Animaciones)
* Jest & React Testing Library

---

## 🛠️ Requisitos Previos

* Node.js (v18 o superior)
* PostgreSQL instalado y en ejecución

---

## ⚙️ Configuración y Puesta en Marcha

Sigue estos pasos para levantar el entorno local en menos de 5 minutos. El proyecto está estructurado como un monorepo usando `npm workspaces`.

### 1. Instalación de Dependencias

Ejecuta el siguiente comando en la **raíz del proyecto**:
```bash
npm install
```

### 2. Variables de Entorno

**Backend:**
Navega a la carpeta `/backend` y crea un archivo `.env`:
```bash
cd backend
touch .env
```
Contenido de `/backend/.env`:
```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/prueba_tecnica?schema=public"
JWT_ACCESS_SECRET="mi_secreto_super_seguro_access"
JWT_REFRESH_SECRET="mi_secreto_super_seguro_refresh"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"
FRONTEND_URL="http://localhost:3002"
PORT=3001
```
*(Nota: Asegúrate de cambiar USUARIO y CONTRASEÑA por tus credenciales de PostgreSQL)*

**Frontend:**
Navega a la carpeta `/frontend` y crea un archivo `.env.local`:
```bash
cd ../frontend
touch .env.local
```
Contenido de `/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Base de Datos: Migraciones y Seed

Desde la raíz del proyecto o desde el directorio `backend`, ejecuta las migraciones para estructurar la base de datos y luego el seed para llenarla de datos de prueba.

```bash
# Ejecutar migraciones
npm run prisma migrate dev --workspace=backend

# Ejecutar seed (Semillas)
npm run prisma db seed --workspace=backend
```

### 4. Ejecución del Proyecto

Desde la raíz del proyecto, puedes levantar ambos entornos:

```bash
# Levantar el Backend (Puerto 3001)
npm run start:dev --workspace=backend

# Levantar el Frontend (Puerto 3002)
npm run dev --workspace=frontend -- --port 3002
```

---

## 🔑 Cuentas de Prueba (Generadas por el Seed)

El sistema genera automáticamente 3 cuentas, una para cada rol:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@test.com` | `admin123` |
| **Médico** | `dr@test.com` | `dr123` |
| **Paciente** | `patient@test.com` | `patient123` |

---

## 🧪 Testing

Se ha configurado un entorno de pruebas tanto para el Backend como para el Frontend.

**Pruebas del Backend (Unitarias de Servicios con Jest):**
```bash
npm run test --workspace=backend
```

**Pruebas del Frontend (Componentes y Hooks con React Testing Library):**
```bash
npm run test --workspace=frontend
```

---

## 📚 Documentación de la API (Swagger)

Con el servidor backend en ejecución, puedes acceder a la documentación interactiva de la API, probar los endpoints, visualizar los esquemas (DTOs) y autenticarte en:

👉 **http://localhost:3001/docs**

---

## 💎 Features Implementadas (Checklist Cumplido)

### Obligatorias:
- [x] Autenticación robusta JWT + Refresh Tokens.
- [x] Autorización mediante RBAC (Guards y Decoradores personalizados).
- [x] **Médicos:** Generación de prescripciones con ítems de texto libre.
- [x] **Pacientes:** Listado de sus recetas, cambiar estado a consumido y descargar PDF.
- [x] **Admin:** Dashboard de métricas con filtros de tiempo y separación por roles.
- [x] UI Premium: Responsive, animaciones, Toasts y Dark Mode (preferencia guardada).
- [x] Setup, Migraciones y Semillas configuradas.

### Plus Opcionales:
- [x] **Swagger:** Documentación completa y endpoints tipados.
- [x] **Firma Médica:** Los doctores pueden subir su firma en Base64, y el sistema la estampa automáticamente en los PDFs.
- [x] **Código QR:** El PDF inyecta un código QR que enlaza a la ruta pública/privada de la prescripción generada.
- [x] **Top Doctores:** Métricas avanzadas para el Administrador para ver los doctores más activos.
- [x] **Gestión de Usuarios:** Interfaz de administración de usuarios para crear cuentas nuevas del sistema (Doctores, Pacientes).
- [x] Búsqueda inteligente por nombre de usuario, rol o email en las listas de usuarios y prescripciones.

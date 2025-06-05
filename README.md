# 🐾 PetTravelBuddy

**PetTravelBuddy** es una plataforma web para facilitar el transporte y acompañamiento de mascotas en tren o avión, permitiendo a los dueños enviar a sus animales a cualquier destino sin necesidad de viajar con ellos. Funciona como un marketplace donde acompañantes verificados ofrecen sus servicios a cambio de una compensación económica.

---

## 🔗 Demo del Proyecto

- **Frontend desplegado**: [pettravelbuddy.vercel.app](https://pettravelbuddy.vercel.app)
- **Backend**: Render (requiere `.env` para funcionar en local)

---

## 🛠 Tecnologías utilizadas

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn-ui**
- **Node.js** + **Express**
- **MongoDB Atlas** (base de datos)
- **Socket.IO** (chat en tiempo real)
- **Leaflet** + **OverlappingMarkerSpiderfier** (visualización de mapas y rutas)
- **Multer** (subida de imágenes y documentos)
- **Nodemailer** (notificaciones por correo)
- **ExcelJS** + **html-to-image** (exportación de dashboard a Excel)

---

## 🧪 Funcionalidades destacadas

- Registro y login con distinción de roles: **cliente**, **acompañante** y **administrador**
- Solicitud de traslado de mascotas por parte del cliente
- Publicación de viajes por parte del acompañante
- Sistema de verificación de acompañantes con DNI
- Chat privado entre cliente y acompañante
- Soporte en tiempo real con el administrador
- Panel de administración con métricas y evolución mensual
- Exportación de estadísticas y gráficas a Excel
- Validaciones en formularios y control de dimensiones
- Envío de notificaciones por correo según estado y conexión
- Visualización de trayectos realistas con Directions API

---

## 📦 Instalación local

### 1. Clonar el repositorio

```bash
git clone <REPO_URL>
cd AppWeb-TFG-main
```

---

### 2. Instalación de dependencias

#### En la raíz del proyecto (frontend):

```bash
npm install
npm install react-icons axios
npm install react-leaflet@4.2.1 leaflet
npm install --save-dev @types/leaflet
npm install overlapping-marker-spiderfier-leaflet
npm install exceljs html-to-image
npm install file-saver xlsx
```

#### En el backend (`/server`):

```bash
cd server
npm install
npm install express cors multer nodemailer mongodb socket.io
mkdir uploads
```

---

### 3. Configurar el archivo `.env`

> ⚠️ Este archivo **no está incluido** por seguridad. Deberás crearlo manualmente en `server/.env` con el siguiente contenido:

```env
MONGO_URI=<tu cadena de conexión de MongoDB Atlas>
JWT_SECRET=<tu clave secreta para JWT>
EMAIL_FROM=<tu correo de Gmail para notificaciones>
EMAIL_PASSWORD=<contraseña de aplicación de Gmail>
ORS_API_KEY=<tu API key de OpenRouteService>
VITE_API_URL=http://localhost:5000
```

#### 🔑 ¿Cómo obtener las claves necesarias?

- **MONGO_URI**: Crea una base de datos gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y copia la cadena de conexión.
- **EMAIL_FROM / EMAIL_PASSWORD**:
  - Usa un correo de Gmail
  - Activa la verificación en dos pasos
  - Genera una contraseña de aplicación desde: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- **ORS_API_KEY**: Regístrate en [openrouteservice.org](https://openrouteservice.org/dev/#/signup) y crea una clave gratuita.

---

### 4. Iniciar la aplicación en local

#### ▶️ Frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

> El frontend se abrirá en http://localhost:8080 

#### ▶️ Backend

Desde la carpeta `/server`:

```bash
node index.js
```

> El backend se ejecutará en http://localhost:5000

---


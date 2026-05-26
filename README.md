## 📂 Estructura Completa del Repositorio

El proyecto sigue una estructura de monorrepo que agrupa tanto el backend como el frontend, manteniendo el archivo de configuración de Git y la documentación en la raíz del repositorio.

```text
/ (Raíz del Repositorio)
├── admin-frontend/            # Aplicación Frontend (React + Vite + TS)
│   ├── public/                # Recursos estáticos públicos
│   ├── src/
│   │   ├── api/               # Configuración y cliente de Axios
│   │   │   └── api.ts
│   │   ├── assets/            # Recursos locales (imágenes, fuentes, logos)
│   │   ├── components/        # Componentes globales de la aplicación
│   │   │   ├── ui/            # Componentes de UI genéricos y reutilizables
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── FormAlert.tsx
│   │   │   ├── Navbar.tsx     # Barra de navegación superior
│   │   │   └── ProtectedRoute.tsx # Guardián de rutas basado en roles de usuario
│   │   ├── features/          # Módulos basados en lógica de negocio
│   │   │   ├── auth/          # Gestión de autenticación y sesiones
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   │   └── LoginPage.tsx
│   │   │   │   └── services/
│   │   │   ├── categorias/    # Gestión de jerarquías de categorías
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   │       └── CategoriasPage.tsx
│   │   │   ├── ingredientes/  # Control de materias primas y alérgenos
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   │       └── IngredientesPage.tsx
│   │   │   ├── productos/     # Catálogo de productos y control de stock
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   │       └── ProductosPage.tsx
│   │   │   └── pedidos/       # Máquina de estados de pedidos (Rol Cajero)
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── pages/
│   │   │           ├── ListaPedidosPage.tsx
│   │   │           └── DetallePedidoPage.tsx
│   │   ├── router/            # Configuración y enrutado central de la app
│   │   │   └── AppRouter.tsx
│   │   ├── shared/            # Elementos transversales compartidos
│   │   │   └── components/
│   │   │       └── ConfirmModal.tsx
│   │   ├── store/             # Manejo del estado global (Zustand)
│   │   │   └── useAuthStore.ts
│   │   ├── types/             # Definición de interfaces de TypeScript
│   │   │   ├── categoria.ts
│   │   │   ├── ingrediente.ts
│   │   │   ├── producto.ts
│   │   │   └── usuario.ts
│   │   ├── App.css
│   │   ├── App.tsx            # Componente raíz y proveedor de TanStack Query
│   │   ├── index.css          # Estilos globales y directivas de Tailwind
│   │   └── main.tsx           # Punto de entrada de React
│   ├── .env                   # Variables de entorno locales del frontend
│   ├── index.html
│   ├── package.json           # Dependencias y scripts del frontend
│   ├── tsconfig.json          # Configuración de TypeScript
│   └── vite.config.ts         # Configuración del empaquetador Vite
│
├── backend/                   # Aplicación Backend (API)
│
├── .gitignore                 # Archivo de exclusiones de Git para todo el repositorio
└── README.md                  # Documentación general del sistema
# Food Store — Panel de Administración

Panel de administración para la cadena de comida Food Store. Permite gestionar pedidos, productos, categorías e ingredientes con control de acceso por roles.

## Stack tecnológico

- **React 19** + **TypeScript 6**
- **Vite 8** — build tool
- **Tailwind CSS 4** — estilos (vía `@tailwindcss/vite`)
- **Zustand** — estado global (autenticación)
- **TanStack React Query** — cache, fetching y sincronización de datos
- **TanStack React Form** — formularios
- **TanStack React Table** — tablas
- **Recharts** — gráficos (LineChart, BarChart, PieChart)
- **Axios** — HTTP client con cookies HttpOnly
- **React Router DOM v7** — enrutamiento

## Rutas del panel

| Ruta | Vista | Descripción | Roles |
|------|-------|-------------|-------|
| `/login` | LoginPage | Inicio de sesión | público |
| `/pedidos` | ListaPedidosPage | Gestión de pedidos | ADMIN, STOCK, PEDIDOS |
| `/pedidos/:id` | DetallePedidoPage | Detalle + cambio de estado | ADMIN, STOCK, PEDIDOS |
| `/productos` | ProductosPage | CRUD de productos con imágenes | ADMIN, STOCK |
| `/categorias` | CategoriasPage | CRUD de categorías con jerarquía | ADMIN |
| `/ingredientes` | IngredientesPage | CRUD de ingredientes | ADMIN |
| `/reportes` | ReportesPage | Gráficos de ventas, productos, pedidos e ingresos | ADMIN |
| `/unauthorized` | — | Redirección si el rol no tiene permiso | público |

Las rutas protegidas redirigen a `/login` si no hay sesión y a `/unauthorized` si el rol no tiene permiso.

## Setup

1. Clonar el repositorio
2. `npm install`
3. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL`
4. Tener el backend de Food Store corriendo (véase seed de credenciales abajo)
5. `npm run dev`

El dev server corre en **`http://localhost:5174`** (configurado en `vite.config.ts`). No usa HTTPS (HTTP plano).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | TypeScript check + build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint sobre todo el proyecto |

## Autenticación

- Login con email y contraseña (`POST /auth/login`)
- Usa cookies HttpOnly (`withCredentials: true` en Axios)
- El token se mantiene en memoria (Zustand), no en localStorage
- Interceptor 401 redirige automáticamente a `/login`
- Roles del sistema: `ADMIN`, `STOCK`, `PEDIDOS`, `CLIENT`

### Redirección post-login por rol

| Rol | Redirige a |
|-----|-----------|
| ADMIN | `/pedidos` |
| STOCK | `/productos` |
| PEDIDOS | `/pedidos` |

## WebSocket en tiempo real

- Se conecta a `VITE_WS_URL/ws/admin/pedidos?token={token}` (por defecto `ws://localhost:8000`)
- Eventos: `pago_verificado`, cambios de estado (`estado_nuevo`)
- Invalida React Query automáticamente (`pedidos`, `pedido/{id}`)
- Reconexión automática cada 3 segundos ante caída

## Credenciales por defecto (seed del backend)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@foodstore.com | Admin1234! |

## Estructura del proyecto

```
src/
├── api/              # Cliente Axios (baseURL, interceptors)
├── components/       # Componentes reutilizables (UI)
│   └── ui/           # Button, Table, FormAlert
├── features/         # Módulos por dominio
│   ├── auth/         # LoginPage, authService
│   ├── pedidos/      # ListaPedidosPage, DetallePedidoPage, usePedidos
│   ├── productos/    # ProductosPage, useProductos
│   ├── categorias/   # CategoriasPage, useCategorias
│   ├── ingredientes/ # IngredientesPage, useIngredientes
│   └── reportes/     # ReportesPage, useReportes (gráficos)
├── router/           # AppRouter con rutas protegidas por rol
├── shared/           # Hooks y componentes compartidos
│   ├── hooks/        # useAdminWebSocket
│   └── components/   # ConfirmModal
├── store/            # Zustand (useAuthStore)
└── types/            # Interfaces TypeScript
```

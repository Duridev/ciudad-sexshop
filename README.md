# Ciudad Sex Shop - Frontend Headless

Frontend moderno, ultra rápido y optimizado para SEO desarrollado con **Astro 5** y **Tailwind CSS v4**, conectado a **WooCommerce** mediante Store REST API.

---

## 🚀 Características Principales

- **Rendimiento Ultrarrápido:** Arquitectura Astro con generación de sitios estáticos (SSG) y cero JavaScript innecesario en el cliente.
- **Conexión Headless WooCommerce:** Sincronización de productos, categorías, imágenes y precios directamente desde la REST API (`/wp-json/wc/store/v1/products`).
- **Catálogo Completo:** Visualización de todos los productos y páginas dedicadas por categoría (`/categoria/[slug]`) y por producto (`/producto/[slug]`).
- **Buscador en Tiempo Real:** Modal de búsqueda instantánea con atajo de teclado (`Ctrl + K` / `Cmd + K`) indexado localmente.
- **Carrito de Compras Integrado:** Carrito deslizable (*Drawer Cart*) persistente mediante `localStorage`, con cálculo automático de totales en pesos chilenos (CLP).
- **Diseño Luxury Dark:** Interfaz moderna con paleta oscura, acentos neón magenta/violeta, efectos glassmorphism y micro-interacciones fluidas.
- **100% Responsivo:** Adaptado para móviles, tablets y escritorios.
- **Privacidad y Discreción:** Énfasis visual en la confidencialidad de envíos y métodos de pago seguros chilenos (Webpay, Mercado Pago).

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Astro 5](https://astro.build/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Lenguaje:** TypeScript
- **Backend:** WordPress + WooCommerce (Store REST API)

---

## 📁 Estructura del Proyecto

```text
ciudadsexshop-frontend/
├── public/
│   ├── images/               # Imágenes locales de soporte
│   ├── logo-ciudadsexshop.webp # Logo oficial de la marca
│   └── search-index.json     # Índice para búsqueda en tiempo real
├── src/
│   ├── components/
│   │   ├── BestSellers.astro # Sección de productos destacados
│   │   ├── BlogSection.astro # Artículos y guías de bienestar
│   │   ├── CategoryGrid.astro# Grilla visual de categorías
│   │   ├── Footer.astro      # Pie de página y enlaces
│   │   ├── Header.astro      # Barra de navegación, mega menú y buscador
│   │   ├── Hero.astro        # Banner principal de inicio
│   │   ├── ProductCard.astro # Tarjeta individual de producto
│   │   └── TrustBadges.astro # Sellos de garantía y confidencialidad
│   ├── data/
│   │   └── products-catalog.json # Catálogo sincronizado de productos
│   ├── layouts/
│   │   └── Layout.astro      # Layout base (SEO, Drawer Cart, Search Modal)
│   ├── lib/
│   │   └── woocommerce.ts    # Cliente fetch y utilidades del catálogo
│   ├── pages/
│   │   ├── index.astro       # Página de inicio (Home)
│   │   ├── productos.astro   # Catálogo completo con filtros
│   │   ├── categoria/
│   │   │   └── [slug].astro  # Páginas dinámicas por categoría
│   │   └── producto/
│   │       └── [slug].astro  # Páginas de detalle de producto
│   ├── styles/
│   │   └── global.css        # Variables CSS, Tailwind y diseño glass
│   └── types/
│       └── woocommerce.ts    # Tipos TypeScript para WooCommerce
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 📦 Instalación y Uso

### 1. Clonar o descargar el repositorio
```bash
git clone <url-del-repositorio>
cd ciudadsexshop-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321` (o el puerto asignado).

### 4. Generar la versión de producción (Build)
```bash
npm run build
```
Los archivos estáticos listos para desplegar se generarán en la carpeta `dist/`.

### 5. Previsualizar la versión de producción
```bash
npm run preview
```

---

## 🌐 Conexión con WooCommerce

El cliente de datos en `src/lib/woocommerce.ts` consume los datos públicos de la API de WooCommerce:
- **Endpoint:** `https://ciudadsexshop.cl/wp-json/wc/store/v1/products`
- **Fallback local:** Cuenta con copia sincronizada en `src/data/products-catalog.json` para garantizar disponibilidad instantánea y compilar sin dependencias de red lentas.

---

## 📄 Licencia

Desarrollado para **Ciudad Sex Shop Chile**. Todos los derechos reservados.

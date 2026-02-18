# Neo Communities — Legal Site

> Sitio legal estático para Google Play Console.  
> Alojado en **GitHub Pages**. Sin frameworks, sin dependencias, sin tracking.

## Páginas

| Ruta                   | Descripción                                        |
|------------------------|----------------------------------------------------|
| `/`                    | Home — acceso rápido a todos los documentos        |
| `/privacy.html`        | Política de Privacidad (requerida por Play Console)|
| `/terms.html`          | Términos de Servicio                               |
| `/support.html`        | Soporte y FAQ                                      |
| `/delete-account.html` | Instrucciones de eliminación de cuenta y datos     |

## Estructura de archivos

```
neo-communities-legal/
├── index.html
├── privacy.html
├── terms.html
├── support.html
├── delete-account.html
└── assets/
    ├── style.css
    └── i18n.js
```

---

## Deploy en GitHub Pages — paso a paso

### 1. Crear el repositorio en GitHub

Ve a [github.com/new](https://github.com/new) y crea un repositorio **público** con el nombre:

```
neo-communities-legal
```

- Visibilidad: **Public** (obligatorio para GitHub Pages gratuito)
- No inicialices con README (ya existe en estos archivos)

---

### 2. Inicializar y subir desde la carpeta local

Desde la carpeta `NeoWeb/` (donde están los archivos):

```bash
git init
git add .
git commit -m "chore: initial legal site for Neo Communities"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/neo-communities-legal.git
git push -u origin main
```

> Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

---

### 3. Activar GitHub Pages

1. Abre el repositorio en GitHub.
2. Ve a **Settings** → **Pages** (en el menú lateral izquierdo).
3. En **Source**, selecciona:
   - Branch: **main**
   - Folder: **/ (root)**
4. Haz clic en **Save**.

GitHub Pages tardará 1–2 minutos en desplegarse.

---

### 4. URL resultante

Una vez activo, tu sitio estará disponible en:

```
https://TU_USUARIO.github.io/neo-communities-legal/
```

> **Ejemplo real:** `https://felinosky.github.io/neo-communities-legal/`

Las URLs de cada página serán:

| Página                | URL pública                                                                     |
|-----------------------|---------------------------------------------------------------------------------|
| Home                  | `https://TU_USUARIO.github.io/neo-communities-legal/`                           |
| **Privacidad**        | `https://TU_USUARIO.github.io/neo-communities-legal/privacy.html`               |
| Términos              | `https://TU_USUARIO.github.io/neo-communities-legal/terms.html`                 |
| Soporte               | `https://TU_USUARIO.github.io/neo-communities-legal/support.html`               |
| **Eliminar cuenta**   | `https://TU_USUARIO.github.io/neo-communities-legal/delete-account.html`        |

---

### 5. Configurar en Google Play Console

Una vez desplegado, en **Play Console → Configuración de la app → Información de la app**:

| Campo                          | URL a poner                                                              |
|--------------------------------|--------------------------------------------------------------------------|
| **Política de privacidad**     | `https://TU_USUARIO.github.io/neo-communities-legal/privacy.html`        |
| Sitio web (opcional)           | `https://TU_USUARIO.github.io/neo-communities-legal/`                    |
| Email de soporte               | `feelinosky@gmail.com`                                            |

En **Contenido de la app → Eliminación de datos**:

| Campo                          | URL a poner                                                              |
|--------------------------------|--------------------------------------------------------------------------|
| **URL de eliminación de datos**| `https://TU_USUARIO.github.io/neo-communities-legal/delete-account.html` |

---

### 6. (Opcional) Dominio personalizado

Si en el futuro quieres usar `https://neocommunities.app/`, crea un archivo `CNAME` en la raíz del repositorio con el contenido:

```
neocommunities.app
```

Y configura el DNS correspondiente en tu proveedor de dominio con los registros A de GitHub Pages.

---

## Notas de mantenimiento

- **Email de soporte:** `feelinosky@gmail.com` — cámbialo en todos los HTML si obtienes un email propio.
- **Año del copyright:** actualmente `2025` — actualiza en el footer de cada página cada año.
- **Fecha "Última actualización":** se encuentra en el `page-hero` de `privacy.html` y `terms.html`.
- **Idioma:** el switch ES/EN está implementado en `assets/i18n.js` usando atributos `data-es` / `data-en` en el HTML. El idioma seleccionado se guarda en `localStorage`.

## Diseño

- Fondo: `#000` (OLED-first)
- Tipografía: `system-ui` — sin fuentes externas
- Ancho máximo: `860px`
- Sin cookies, sin tracking, sin analytics
- Sin dependencias externas

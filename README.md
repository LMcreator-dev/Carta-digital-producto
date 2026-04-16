# CartaDigitalLM

Carta digital para bares y restaurantes con panel de administracion en Astro y backend en Supabase.

El estado actual del proyecto ya no coincide con la documentacion antigua basada en `iMenu`. La configuracion real de trabajo en este repo gira alrededor de:

- Schema principal: `CartaDigitalLM`
- Frontend publico: [src/scripts/index.js](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/src/scripts/index.js>)
- Frontend admin: [src/scripts/admin.js](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/src/scripts/admin.js>)
- Demo visual y seed: [public/demo/bar-tropical](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/public/demo/bar-tropical>) y [supabase/bar-tropical-template.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/bar-tropical-template.sql>)
- Guia de backend actualizada: [supabase/README.md](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/README.md>)
- SQL de setup y permisos: [supabase/setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>)

## Estructura

- `src/pages` contiene las entradas Astro.
- `src/scripts/index.js` carga la carta publica.
- `src/scripts/admin.js` gestiona login, perfil, categorias, platos y storage.
- `public/alergenos` contiene los SVG de alergenos que consume la carta.
- `public/demo/bar-tropical` contiene la portada y las imagenes demo para poblar una carta de ejemplo.
- `supabase` contiene documentacion y SQL operativo para backend.

## Comportamiento actual

### Vista publica

La carta:

- acepta `?cliente=<uuid>` o `?cliente=<slug>`
- consulta `CartaDigitalLM.Categorias` y `CartaDigitalLM.Menu`
- usa `CartaDigitalLM.Perfil_publico` para resolver `slug` y cargar branding publico
- usa `public.imenu_get_wifi_by_user(uuid, text)` para revelar la clave WiFi por PIN
- resuelve iconos de alergenos desde `/alergenos`

### Admin

El panel:

- inicia sesion con Supabase Auth
- lee y escribe `CartaDigitalLM.Perfil`
- hace CRUD sobre `CartaDigitalLM.Categorias`
- hace CRUD sobre `CartaDigitalLM.Menu`
- sube imagenes al bucket `imenu`

Si el admin muestra `permission denied for table Perfil`, el problema no esta en el frontend: faltan `GRANT` o policies RLS del owner sobre `CartaDigitalLM.Perfil`. El SQL para dejarlo bien esta en [supabase/setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>).

## Arranque local

```bash
pnpm install
pnpm run dev
```

Build:

```bash
pnpm run build
```

## GitHub Pages

El deploy se hace con GitHub Actions desde `.github/workflows/deploy.yml`.

Puntos importantes:

- los assets en `public/` se publican tal cual en Pages
- el seed demo referencia rutas relativas como `demo/bar-tropical/cover.svg`
- para que esas imagenes se vean en produccion, los cambios del repo tienen que estar publicados en `main`

## Plantilla demo

Se ha preparado una plantilla amplia para el perfil `88b4b1c8-f270-4f75-90dc-0d5f7c9a0d91`:

- 8 categorias
- 40 platos
- portada y artes demo
- alergenos usando las keys reales de `/alergenos`

Pasos:

1. Ejecuta [supabase/setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>) en Supabase si aun no has dejado permisos, vista publica y RPCs listos.
2. Ejecuta [supabase/bar-tropical-template.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/bar-tropical-template.sql>) para poblar la carta demo.
3. Publica los cambios del repo para que `public/demo/bar-tropical` exista en GitHub Pages.

## Notas operativas

- La carta publica necesita que `CartaDigitalLM` este incluido en `Settings > API > Exposed schemas`.
- Los RPCs de WiFi viven en `public`, no en `CartaDigitalLM`.
- El seed demo asume que `Menu.alergenos` acepta arrays tipo `text[]`. Si esa columna fuera `json` o `jsonb`, el seed debe ajustarse.
- La guia detallada de backend y troubleshooting esta en [supabase/README.md](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/README.md>).

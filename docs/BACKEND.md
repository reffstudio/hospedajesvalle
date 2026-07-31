# Integración backend — Hospedajes Valle

Guía para conectar Supabase y reemplazar datos estáticos / localStorage por datos reales.

## Estado actual

| Capa | Implementación | Archivos clave |
|------|----------------|----------------|
| Sitio público | Provider `static` — catálogo legacy + metadata del seed | `lib/properties/queries.ts`, `lib/properties/static-catalog.ts` |
| Dashboard CMS | localStorage | `lib/dashboard/property-store.tsx` |
| Auth dashboard | Mock (sessionStorage) | `components/dashboard/dashboard-auth-provider.tsx` |
| Imágenes | Blob URLs en dev | `lib/data/property-image-upload.ts` |
| Pre-reservas | Log en consola (static) | `lib/properties/queries.ts` → `submitPreReservationLead` |
| Supabase | Stubs listos | `lib/supabase/*`, `supabase/schema.sql` |

## Variables de entorno

Copia `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_DATA_PROVIDER=static   # cambiar a supabase al conectar
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_PROPERTY_IMAGES_BUCKET=property-images
```

## Checklist de conexión (orden recomendado)

### 1. Supabase proyecto + schema

1. Crear proyecto en [supabase.com](https://supabase.com).
2. Ejecutar `supabase/schema.sql` en el SQL Editor.
3. Crear bucket Storage `property-images` (lectura pública, escritura autenticada).
4. Ajustar políticas RLS de admin según tu modelo de roles (ej. `app_metadata.role = 'admin'`).

### 2. Dependencias

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Los clientes ya están en `lib/supabase/client.ts` y `lib/supabase/server.ts`.

Regenerar tipos:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/database.types.ts
```

### 3. Implementar queries públicas

Archivo: `lib/supabase/queries/properties.ts`

- JOIN `properties` + `property_images` + junctions + `custom_amenities`.
- Filtrar `status = 'published'`.
- Ordenar featured por `featured_order`.
- Mapear filas → `DashboardProperty` → `mapDashboardPropertyToPublic()` en `lib/properties/map-to-public.ts`.

**Importante:** usar el mismo mapper que el preview del dashboard para que lo que ves en CMS = lo que ve el usuario.

### 4. Implementar repository del dashboard

Implementar `PropertyRepository` (`lib/data/repository.types.ts`):

| Método | Tabla(s) |
|--------|----------|
| `listProperties` | `properties` + relaciones |
| `createProperty` / `updateProperty` | `properties`, junctions, imágenes |
| `reorderFeatured` | `featured_order` batch update |
| `addCustomAmenityDefinition` | `custom_amenities` |

Reemplazar lógica de `property-store.tsx` por llamadas al repository Supabase (mantener el Context como capa UI).

### 5. IDs estables vs slug

- **Producción:** `id` = UUID (PK), `slug` = URL única editable.
- **Dev localStorage:** hoy `id === slug`. Al migrar, generar UUIDs y conservar slug.
- Script de migración sugerido: export localStorage → JSON → insert Supabase.

### 6. Imágenes

Implementar `SupabasePropertyImageUploadService` en `lib/supabase/storage/property-images.ts`:

```
Path: {property_id}/{uuid}-{filename}
```

Guardar en `property_images`: `storage_path`, `public_url`, `sort_order`, `is_cover`.

Actualizar `PropertyImage` con `storagePath` al subir (`lib/dashboard/types.ts`).

### 7. Auth dashboard

1. Supabase Auth (email/password o magic link para admins).
2. Reemplazar `dashboard-auth-provider.tsx` con `supabase.auth.signInWithPassword`.
3. Proteger rutas `/dashboard/*` con middleware Next.js + `getSupabaseServerClient()`.
4. Ajustar RLS para solo usuarios admin.

### 8. Pre-reservas

Implementar `lib/supabase/queries/leads.ts`:

- Insert en `pre_reservation_leads`.
- Opcional: Edge Function + email (Resend/SendGrid) al admin.
- Rate limiting en Route Handler `/api/leads`.

### 9. Activar provider Supabase

```bash
NEXT_PUBLIC_DATA_PROVIDER=supabase
```

Verificar:

- [ ] Hero muestra solo `featured` + orden correcto
- [ ] `/propiedades` respeta `status = published`
- [ ] Filtros Discover → amenidades (`lib/properties/discover-filter.ts`)
- [ ] Quick Look usa `amenityItems` (incluye custom amenities)
- [ ] Pre-reserva persiste en DB
- [ ] Dashboard CRUD refleja cambios en sitio público sin redeploy

## Modelo de datos (resumen)

```
properties (uuid, slug, name, price_label, currency, status, featured, ...)
property_images (property_id, storage_path, public_url, sort_order, is_cover)
custom_amenities (uuid, label, icon_id)
property_amenities (property_id, amenity_id)
property_highlight_amenities (property_id, amenity_id)
property_custom_amenities (property_id, custom_amenity_id, is_highlight)
pre_reservation_leads (...)
```

Schema completo: `supabase/schema.sql`.

## API pública unificada

Usar siempre estas funciones en componentes:

```ts
import {
  getPublishedProperties,
  getFeaturedCarouselProperties,
  getPublicPropertyBySlug,
  getPublicProperties,        // async — Supabase
  submitPreReservationLead,
} from "@/lib/properties/queries"
```

No importar directamente `lib/i18n/products.ts` en código nuevo (deprecated).

## i18n de contenido

**MVP:** contenido de propiedades en un solo idioma (español). UI bilingüe vía `translations.ts`.

**Futuro:** columnas `name_en`, `includes_en` o tabla `property_translations`.

## Notas conocidas

- Ediciones del dashboard en localStorage **no** afectan el sitio público hasta conectar Supabase.
- Blob URLs de imágenes se pierden al recargar — normal en dev.
- `getPublicPropertiesSync` emite warning si `DATA_PROVIDER=supabase`; usar la versión async en RSC.

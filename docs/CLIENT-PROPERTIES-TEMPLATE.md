# Plantilla — propiedades reales del cliente

Copia este bloque **por cada propiedad** y rellénalo. Puedes mandármelo por chat tal cual.

---

## Propiedad 1

```yaml
nombre_es: 
nombre_en:                    # opcional; si no hay, uso traducción aproximada
slug:                         # opcional; ej. "casa-luna" — si no, lo genero del nombre
precio:                       # ej. "$4,500" o "4500"
moneda: MXN                   # MXN o USD
badge:                        # Nuevo | Popular | Limitado | (vacío)
featured: true                # true = aparece en carrusel del home
orden_featured: 1             # 1 = primera en carrusel (solo si featured: true)

# Capacidad (para Quick Look)
max_huespedes: 
recamaras: 
banos_completos:              # ej. 2
medios_banos:                 # ej. 0

# Tarjeta (3 bullets cortos, separados por coma o lista)
highlights:
  - 
  - 
  - 

# Amenidades (elige de la lista abajo)
amenidades:
  - 

# Amenidades destacadas en tarjeta (máx ~3, subset de amenidades o custom)
amenidades_destacadas:
  - 

# Quick Look — bullets "Incluye"
incluye:
  - 
  - 

# Fotos — súbelas a public/properties/<slug>/ o pásame los archivos
foto_portada:                 # nombre archivo o ruta
galeria:
  - 
  - 
```

---

## Amenidades disponibles (copia el id exacto)

| id | Español |
|----|---------|
| `pool` | Alberca |
| `jacuzzi` | Jacuzzi |
| `wifi` | Wifi |
| `fire-pit` | Fogata / chimenea |
| `terrace` | Terraza |
| `vineyard-view` | Vista al valle |
| `wine-cellar` | Cava de vinos |
| `spa` | Spa |
| `pet-friendly` | Pet friendly |
| `breakfast` | Desayuno incluido |
| `bbq` | Asador |
| `patio` | Patio |

---

## Notas

- **¿Cuántas propiedades?** Pueden ser 3, 6, 10… reemplazamos las 6 demo actuales.
- **Featured:** solo las que tengan `featured: true` salen en el carrusel del home.
- **Fotos:** ideal JPG/WebP, mínimo 1200px ancho. Las pondremos en `public/properties/`.
- **Precio:** en producción se muestra como `{precio} {moneda}` (ej. `$4,500 MXN`).
- **Inglés:** si no mandas `nombre_en`, traduzco lo básico; lo ideal es texto real del cliente.

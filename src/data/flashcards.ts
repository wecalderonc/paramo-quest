/**
 * Mazo de tarjetas de repaso (reemplaza a Anki).
 *
 * Las tarjetas ya vienen escritas: el usuario NO tiene que crearlas ni instalar
 * nada. Cada tarjeta está asociada a una semana del plan (`weekId`) y solo se
 * "desbloquea" para repasar cuando esa semana ya empezó (ver `reviewQueue.ts`).
 *
 * `front` = pregunta · `back` = respuesta corta.
 */
export interface Flashcard {
  id: string;
  weekId: string;
  topic: string;
  front: string;
  back: string;
}

export const flashcards: Flashcard[] = [
  // ── S01 · Setup + Python moderno ──────────────────────────────────────────
  {
    id: "c-s01-uv-init",
    weekId: "s01",
    topic: "uv / entornos",
    front: "¿Qué comando crea un proyecto nuevo con uv?",
    back: "`uv init` (crea la carpeta del proyecto y el pyproject). Luego `uv add paquete` para dependencias.",
  },
  {
    id: "c-s01-uv-add",
    weekId: "s01",
    topic: "uv / entornos",
    front: "¿Cómo agregas una dependencia (p. ej. numpy) con uv?",
    back: "`uv add numpy`. uv la instala en el entorno `.venv` del proyecto y la anota en el pyproject.",
  },
  {
    id: "c-s01-uv-run",
    weekId: "s01",
    topic: "uv / entornos",
    front: "¿Cómo ejecutas un script de Python dentro del entorno del proyecto con uv?",
    back: "`uv run python archivo.py` (usa el `.venv` sin activarlo a mano).",
  },
  {
    id: "c-s01-venv",
    weekId: "s01",
    topic: "uv / entornos",
    front: "¿Qué es un entorno virtual (.venv) y por qué se usa?",
    back: "Una carpeta aislada con su propio Python y paquetes, para que cada proyecto tenga sus versiones sin chocar con otros.",
  },
  {
    id: "c-s01-commit-push",
    weekId: "s01",
    topic: "git",
    front: "¿Qué hacen `git commit` y `git push`?",
    back: "`commit` guarda un punto en el historial local; `push` sube esos commits al repositorio remoto (GitHub).",
  },

  // ── S02 · numpy + matplotlib ──────────────────────────────────────────────
  {
    id: "c-s02-ndarray",
    weekId: "s02",
    topic: "numpy",
    front: "¿Qué es un ndarray de numpy?",
    back: "Un arreglo n-dimensional de números del mismo tipo, almacenado de forma contigua. Base de casi todo el cómputo científico en Python.",
  },
  {
    id: "c-s02-shape",
    weekId: "s02",
    topic: "numpy",
    front: "¿Qué te dice `a.shape` de un array numpy?",
    back: "Una tupla con el tamaño de cada dimensión. Ej: `(4, 5)` = 4 filas × 5 columnas.",
  },
  {
    id: "c-s02-reshape",
    weekId: "s02",
    topic: "numpy",
    front: "¿Qué hace `np.arange(20).reshape(4, 5)`?",
    back: "Crea 0..19 y los reacomoda en una matriz de 4 filas × 5 columnas (mismo dato, nueva forma).",
  },
  {
    id: "c-s02-slice-2d",
    weekId: "s02",
    topic: "numpy",
    front: "En un array 2D `m`, ¿cómo extraes la columna 3?",
    back: "`m[:, 3]` — los dos puntos toman todas las filas; el 3 fija la columna.",
  },
  {
    id: "c-s02-vectorization",
    weekId: "s02",
    topic: "numpy",
    front: "¿Por qué numpy es rápido comparado con loops de Python?",
    back: "Vectorización: opera sobre todo el array en código C compilado, evitando el bucle interpretado de Python.",
  },
  {
    id: "c-s02-boolean-mask",
    weekId: "s02",
    topic: "numpy",
    front: "¿Qué es una máscara booleana en numpy?",
    back: "Un array de True/False (ej: `a > 0`) que se usa para filtrar: `a[a > 0]` devuelve solo los que cumplen.",
  },
  {
    id: "c-s02-where",
    weekId: "s02",
    topic: "numpy",
    front: "¿Qué hace `np.where(cond, x, y)`?",
    back: "Devuelve un array con valores de `x` donde `cond` es True e `y` donde es False (un if/else vectorizado).",
  },
  {
    id: "c-s02-plt-savefig",
    weekId: "s02",
    topic: "matplotlib",
    front: "¿Cómo guardas una figura de matplotlib a un PNG?",
    back: "`plt.savefig(\"salida.png\", dpi=150, bbox_inches=\"tight\")`.",
  },
  {
    id: "c-s02-imshow",
    weekId: "s02",
    topic: "matplotlib",
    front: "¿Qué hace `plt.imshow(array)`?",
    back: "Muestra un array 2D como imagen, mapeando cada valor a un color según el colormap.",
  },

  // ── S03 · pandas ──────────────────────────────────────────────────────────
  {
    id: "c-s03-dataframe",
    weekId: "s03",
    topic: "pandas",
    front: "¿Qué es un DataFrame de pandas?",
    back: "Una tabla en memoria: filas y columnas con nombre, donde cada columna es una Series (puede tener su propio tipo).",
  },
  {
    id: "c-s03-read-csv",
    weekId: "s03",
    topic: "pandas",
    front: "¿Cómo cargas un CSV en pandas?",
    back: "`df = pd.read_csv(\"archivo.csv\")`.",
  },
  {
    id: "c-s03-head-info-describe",
    weekId: "s03",
    topic: "pandas",
    front: "¿Qué te muestran `df.head()`, `df.info()` y `df.describe()`?",
    back: "head: primeras filas; info: columnas, tipos y nulos; describe: estadísticas (media, min, max, cuartiles).",
  },
  {
    id: "c-s03-filter",
    weekId: "s03",
    topic: "pandas",
    front: "¿Cómo filtras filas de un DataFrame por una condición?",
    back: "Con una máscara booleana: `df[df[\"poblacion\"] > 1000]`.",
  },
  {
    id: "c-s03-groupby",
    weekId: "s03",
    topic: "pandas",
    front: "¿Qué hace `df.groupby(\"col\").agg(...)`?",
    back: "Agrupa las filas por el valor de `col` y calcula un resumen (suma, media, conteo…) por grupo.",
  },
  {
    id: "c-s03-merge",
    weekId: "s03",
    topic: "pandas",
    front: "¿Para qué sirve `df.merge(otro, on=\"clave\")`?",
    back: "Une dos tablas emparejando filas que comparten el valor de la columna clave (como un JOIN de SQL).",
  },
  {
    id: "c-s03-nan",
    weekId: "s03",
    topic: "pandas",
    front: "¿Cómo cuentas los valores nulos por columna y cómo los tratas?",
    back: "`df.isna().sum()` para contarlos; luego `fillna(valor)` para rellenar o `dropna(subset=[...])` para quitar.",
  },

  // ── S04 · QGIS básico + CRS ────────────────────────────────────────────────
  {
    id: "c-s04-crs",
    weekId: "s04",
    topic: "CRS",
    front: "¿Qué es un CRS (Sistema de Referencia de Coordenadas)?",
    back: "La regla que define cómo las coordenadas (números) se corresponden con puntos reales de la Tierra.",
  },
  {
    id: "c-s04-epsg",
    weekId: "s04",
    topic: "CRS",
    front: "¿Qué es un código EPSG?",
    back: "Un identificador numérico estándar para un CRS concreto. Ej: EPSG:4326 = WGS84 en grados.",
  },
  {
    id: "c-s04-4326",
    weekId: "s04",
    topic: "CRS",
    front: "¿Qué es EPSG:4326?",
    back: "WGS84: coordenadas geográficas en grados (lat/lon). Ideal para GPS/global, pero no para medir áreas/distancias.",
  },
  {
    id: "c-s04-9377",
    weekId: "s04",
    topic: "CRS",
    front: "¿Qué es EPSG:9377 y cuándo lo usas?",
    back: "CRS oficial de Colombia en metros (MAGNA-SIRGAS / origen nacional). Úsalo para medir áreas y distancias.",
  },
  {
    id: "c-s04-reproject",
    weekId: "s04",
    topic: "CRS",
    front: "¿Qué significa reproyectar una capa?",
    back: "Crear una copia con sus coordenadas traducidas de un CRS a otro (p. ej. de grados 4326 a metros 9377).",
  },
  {
    id: "c-s04-crs-metros",
    weekId: "s04",
    topic: "CRS",
    front: "¿Cuándo necesitas un CRS en metros (proyectado)?",
    back: "Siempre que midas áreas, distancias o hagas buffers: en grados esas medidas quedan distorsionadas.",
  },
  {
    id: "c-s04-vector-raster",
    weekId: "s04",
    topic: "GIS",
    front: "Diferencia entre datos vectoriales y raster.",
    back: "Vector = geometrías (puntos/líneas/polígonos) con atributos. Raster = cuadrícula de píxeles con un valor por celda.",
  },

  // ── S05 · QGIS intermedio ──────────────────────────────────────────────────
  {
    id: "c-s05-buffer",
    weekId: "s05",
    topic: "GIS ops",
    front: "¿Qué hace una operación de buffer?",
    back: "Genera una zona alrededor de una geometría a una distancia dada (ej: 100 m alrededor de un río).",
  },
  {
    id: "c-s05-clip",
    weekId: "s05",
    topic: "GIS ops",
    front: "¿Qué hace un clip (recorte)?",
    back: "Corta una capa dejando solo la parte que cae dentro de otra (como recortar con tijeras usando un molde).",
  },
  {
    id: "c-s05-intersection",
    weekId: "s05",
    topic: "GIS ops",
    front: "¿Qué devuelve una intersección entre dos capas de polígonos?",
    back: "Solo la superficie común a ambas (lo que se solapa).",
  },
  {
    id: "c-s05-area-ha",
    weekId: "s05",
    topic: "GIS ops",
    front: "¿Cómo pasas de m² a hectáreas y cómo se calcula el área en QGIS?",
    back: "1 ha = 10.000 m². En la calculadora de campos: `$area / 10000` (con la capa en un CRS en metros).",
  },
  {
    id: "c-s05-layout",
    weekId: "s05",
    topic: "cartografía",
    front: "¿Qué elementos mínimos debe tener un mapa 'de verdad'?",
    back: "Título, leyenda, escala, flecha de norte y fuente de datos. Opcional pro: grilla de coordenadas.",
  },

  // ── S06 · Python geoespacial I (geopandas) ─────────────────────────────────
  {
    id: "c-s06-geodataframe",
    weekId: "s06",
    topic: "geopandas",
    front: "¿Qué es un GeoDataFrame?",
    back: "Un DataFrame de pandas con una columna especial `geometry` que guarda la geometría de cada fila.",
  },
  {
    id: "c-s06-read-file",
    weekId: "s06",
    topic: "geopandas",
    front: "¿Cómo lees un shapefile/GeoPackage en geopandas?",
    back: "`gdf = gpd.read_file(\"ruta/capa.shp\")`.",
  },
  {
    id: "c-s06-gdf-crs",
    weekId: "s06",
    topic: "geopandas",
    front: "¿Cómo consultas y cómo cambias el CRS de un GeoDataFrame?",
    back: "Consultar: `gdf.crs`. Reproyectar: `gdf.to_crs(9377)`. (Fijar sin reproyectar: `set_crs`).",
  },
  {
    id: "c-s06-overlay",
    weekId: "s06",
    topic: "geopandas",
    front: "¿Qué hace `gpd.overlay(a, b, how=\"intersection\")`?",
    back: "La intersección espacial en código: devuelve la superficie común de ambas capas.",
  },
  {
    id: "c-s06-area-code",
    weekId: "s06",
    topic: "geopandas",
    front: "En geopandas, ¿cómo obtienes el área total en hectáreas de un GeoDataFrame reproyectado a metros?",
    back: "`gdf.geometry.area.sum() / 10000`.",
  },

  // ── S07 · rasters (rasterio) ───────────────────────────────────────────────
  {
    id: "c-s07-raster-array",
    weekId: "s07",
    topic: "rasterio",
    front: "Frase clave: ¿qué 'es' un raster para numpy?",
    back: "Un raster ES un array numpy + metadata espacial (CRS, transform, resolución).",
  },
  {
    id: "c-s07-transform",
    weekId: "s07",
    topic: "rasterio",
    front: "¿Qué es el `transform` (transformación afín) de un raster?",
    back: "La fórmula que convierte índices de fila/columna del array en coordenadas del mundo real.",
  },
  {
    id: "c-s07-nodata",
    weekId: "s07",
    topic: "rasterio",
    front: "¿Qué es 'nodata' y por qué importa antes de sacar estadísticas?",
    back: "Un valor centinela (p. ej. -32768) que marca píxeles sin dato. Hay que enmascararlo o distorsiona media/min/max.",
  },
  {
    id: "c-s07-mask",
    weekId: "s07",
    topic: "rasterio",
    front: "¿Para qué usas `rasterio.mask` con una geometría?",
    back: "Para recortar el raster a la forma de un polígono (p. ej. quedarte solo con los píxeles de tu lote).",
  },
  {
    id: "c-s07-band",
    weekId: "s07",
    topic: "rasterio",
    front: "¿Qué es una banda en una imagen satelital?",
    back: "Una capa que mide la reflectancia en un rango del espectro (ej: rojo, verde, azul, infrarrojo cercano).",
  },

  // ── S08 · Teledetección + NDVI ─────────────────────────────────────────────
  {
    id: "c-s08-teledeteccion",
    weekId: "s08",
    topic: "teledetección",
    front: "¿Qué es la teledetección (remote sensing)?",
    back: "Medir características de la superficie de la Tierra a distancia, con sensores en satélites o aviones.",
  },
  {
    id: "c-s08-ndvi-formula",
    weekId: "s08",
    topic: "teledetección",
    front: "¿Cuál es la fórmula del NDVI?",
    back: "NDVI = (NIR − Rojo) / (NIR + Rojo), usando las bandas infrarrojo cercano y rojo.",
  },
  {
    id: "c-s08-ndvi-range",
    weekId: "s08",
    topic: "teledetección",
    front: "¿Entre qué valores está el NDVI y qué indica un valor alto?",
    back: "Entre −1 y 1. Valores altos (~0.6–0.9) = vegetación densa y sana; cercanos a 0 = suelo/roca; negativos = agua/nubes.",
  },
  {
    id: "c-s08-ndvi-why",
    weekId: "s08",
    topic: "teledetección",
    front: "¿Por qué el NDVI detecta vegetación sana?",
    back: "La vegetación sana refleja mucho infrarrojo cercano y absorbe rojo (clorofila); la resta/normalización resalta ese contraste.",
  },
  {
    id: "c-s08-resolution",
    weekId: "s08",
    topic: "teledetección",
    front: "¿Qué es la resolución espacial de una imagen satelital?",
    back: "El tamaño de terreno que representa cada píxel (ej: Sentinel-2 = 10 m/píxel en las bandas visibles).",
  },

  // ── S09–S11 · Google Earth Engine ──────────────────────────────────────────
  {
    id: "c-s09-gee",
    weekId: "s09",
    topic: "GEE",
    front: "¿Qué es Google Earth Engine (GEE)?",
    back: "Una plataforma en la nube para procesar catálogos enormes de imágenes satelitales sin descargarlas.",
  },
  {
    id: "c-s09-image-collection",
    weekId: "s09",
    topic: "GEE",
    front: "En GEE, ¿qué diferencia hay entre una Image y una ImageCollection?",
    back: "Image = un raster (con bandas). ImageCollection = un conjunto/serie de imágenes (p. ej. todas las de Sentinel-2 de un año).",
  },
  {
    id: "c-s09-server-side",
    weekId: "s09",
    topic: "GEE",
    front: "¿Por qué en GEE el cómputo es 'del lado del servidor'?",
    back: "Tú describes las operaciones; Google las ejecuta en sus servidores y solo te devuelve el resultado (mapa o estadística).",
  },
  {
    id: "c-s10-reducer",
    weekId: "s10",
    topic: "GEE",
    front: "¿Qué es un reducer en GEE?",
    back: "Una operación que colapsa muchos valores en uno: media, mediana, suma, etc. (ej: mediana anual de NDVI por píxel).",
  },
  {
    id: "c-s10-cloud-mask",
    weekId: "s10",
    topic: "GEE",
    front: "¿Por qué se hace enmascaramiento de nubes en series de tiempo satelitales?",
    back: "Las nubes tapan la superficie y ensucian los índices; se filtran para que las estadísticas reflejen el suelo real.",
  },
  {
    id: "c-s10-composite",
    weekId: "s10",
    topic: "GEE",
    front: "¿Qué es un composite (p. ej. mediana anual)?",
    back: "Una imagen única construida reduciendo muchas imágenes en el tiempo, para obtener una vista limpia y sin nubes.",
  },
  {
    id: "c-s11-geemap",
    weekId: "s11",
    topic: "GEE",
    front: "¿Qué aporta la librería geemap en Python?",
    back: "Conecta la Python API de Earth Engine con mapas interactivos en notebooks (visualizar capas, dibujar, exportar).",
  },

  // ── S12–S13 · Clasificación supervisada ────────────────────────────────────
  {
    id: "c-s12-supervised",
    weekId: "s12",
    topic: "clasificación",
    front: "¿Qué es una clasificación supervisada?",
    back: "Entrenar un modelo con ejemplos etiquetados (muestras de cada clase) para que asigne una clase a cada píxel.",
  },
  {
    id: "c-s12-training-samples",
    weekId: "s12",
    topic: "clasificación",
    front: "¿Qué son las muestras de entrenamiento (training samples)?",
    back: "Puntos o polígonos que tú etiquetas con su clase real (bosque, agua, cultivo…) para enseñarle al clasificador.",
  },
  {
    id: "c-s13-random-forest",
    weekId: "s13",
    topic: "clasificación",
    front: "¿Qué es un clasificador Random Forest?",
    back: "Un conjunto de muchos árboles de decisión que votan; robusto y muy usado para clasificar imágenes satelitales.",
  },
  {
    id: "c-s13-overfitting",
    weekId: "s13",
    topic: "clasificación",
    front: "¿Qué es el sobreajuste (overfitting)?",
    back: "Cuando el modelo memoriza los datos de entrenamiento y falla con datos nuevos. Se detecta validando aparte.",
  },

  // ── S14–S16 · Cambio, accuracy, SAR ────────────────────────────────────────
  {
    id: "c-s15-confusion-matrix",
    weekId: "s15",
    topic: "accuracy",
    front: "¿Qué es una matriz de confusión?",
    back: "Una tabla que compara clase predicha vs. clase real; de ahí salen aciertos y errores por clase.",
  },
  {
    id: "c-s15-user-producer",
    weekId: "s15",
    topic: "accuracy",
    front: "Diferencia entre user's accuracy y producer's accuracy.",
    back: "User's: de lo que el mapa dice ser clase X, cuánto lo es (fiabilidad). Producer's: de la clase X real, cuánto capturó el mapa.",
  },
  {
    id: "c-s15-olofsson",
    weekId: "s15",
    topic: "accuracy",
    front: "¿Por qué importa el enfoque de Olofsson para estimar áreas?",
    back: "Corrige el área de cada clase usando la matriz de confusión y da intervalos de confianza, en vez de contar píxeles sin más.",
  },
  {
    id: "c-s16-sar",
    weekId: "s16",
    topic: "SAR",
    front: "¿Qué es el radar SAR y qué ventaja tiene sobre lo óptico?",
    back: "Radar de apertura sintética: emite su propia señal, así ve de día/noche y atraviesa nubes (clave en zonas tropicales).",
  },
  {
    id: "c-s16-backscatter",
    weekId: "s16",
    topic: "SAR",
    front: "¿Qué es el backscatter en SAR?",
    back: "La fracción de la señal de radar que la superficie devuelve al sensor; depende de rugosidad, humedad y estructura.",
  },

  // ── S24–S27 · Carbono ──────────────────────────────────────────────────────
  {
    id: "c-s24-carbon-credit",
    weekId: "s24",
    topic: "carbono",
    front: "¿Qué es un crédito de carbono?",
    back: "Un certificado que representa 1 tonelada de CO₂e evitada o removida de la atmósfera, verificable y transable.",
  },
  {
    id: "c-s24-additionality",
    weekId: "s24",
    topic: "carbono",
    front: "¿Qué es la adicionalidad en un proyecto de carbono?",
    back: "Que la reducción de emisiones NO habría ocurrido sin el proyecto (si igual pasaba, no es adicional).",
  },
  {
    id: "c-s25-baseline",
    weekId: "s25",
    topic: "carbono",
    front: "¿Qué es la línea base (baseline) de un proyecto de carbono?",
    back: "El escenario de referencia de emisiones sin proyecto, contra el que se mide cuánto se redujo/removió.",
  },
  {
    id: "c-s26-arr",
    weekId: "s26",
    topic: "carbono",
    front: "¿Qué es ARR (metodología VM0047)?",
    back: "Afforestation, Reforestation and Revegetation: proyectos que capturan carbono estableciendo o recuperando vegetación.",
  },
  {
    id: "c-s27-redd",
    weekId: "s27",
    topic: "carbono",
    front: "¿Qué es REDD+?",
    back: "Reducir Emisiones por Deforestación y Degradación (+ conservación y manejo sostenible de bosques).",
  },
  {
    id: "c-s27-biomass",
    weekId: "s27",
    topic: "carbono",
    front: "¿Por qué se estima la biomasa para calcular carbono?",
    back: "Cerca de la mitad de la biomasa seca es carbono; medir biomasa (con alometría/teledetección) permite estimar CO₂ almacenado.",
  },
];

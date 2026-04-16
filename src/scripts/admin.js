import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://tdeyzdaocphjopxrwykj.supabase.co";
const supabaseKey =
  "sb_publishable_LQrgEx8EeVDW2ExtHKgLsQ_OoOIwv-g";
const supabase = createClient(supabaseUrl, supabaseKey);

const db = supabase.schema("CartaDigitalLM");
// Bucket recomendado para imágenes (Supabase Storage)
const STORAGE_BUCKET = "imenu";
const DEFAULT_PRIMARY_COLOR = "#FFE800";
const ADMIN_THEME_STORAGE_KEY = "imenu.admin.primary_color";
const PROFILE_PRIMARY_COLOR_KEYS = [
  "color_principal",
  "primary_color",
  "brand_color",
  "accent_color",
  "color",
];
const PROFILE_DISH_PLACEHOLDER_KEYS = [
  "plato_imagen_default_url",
  "imagen_plato_default_url",
  "imagen_plato_fallback_url",
  "default_dish_image_url",
  "dish_placeholder_url",
];
const PROFILE_LOGO_KEYS = [
  "logo_url",
  "emblema_url",
  "brand_logo_url",
  "logo",
  "emblema",
];
const PROFILE_MENU_METADATA_KEYS = ["personalizacion_menu"];
const MENU_SUBCATEGORIA_BY_CATEGORY_KEYS = [
  "subcategorias_por_categoria",
  "subcategorias_by_category",
  "subcategories_by_category",
];
const MENU_SUBCATEGORIA_CATALOG_KEYS = [
  "subcategorias_catalogo",
  "subcategorias",
  "subcategories",
];
const MENU_MULTI_CATEGORY_KEYS = [
  "categorias_ids",
  "categoria_ids",
  "categories_ids",
  "category_ids",
];
const DISH_GALLERY_FOLDERS = ["platos", "platos-default", "portadas", "logos"];
const STORAGE_FOLDER_LABELS = {
  platos: "Platos",
  "platos-default": "Platos default",
  portadas: "Portadas",
  logos: "Logos",
};
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
];

let user = null;

// Debug helpers (solo para consola)
window.imenuAdmin = {
  supabase,
  getSession: () => supabase.auth.getSession(),
  getUser: () => user,
};

const ALERGENOS = [
  "gluten",
  "crustaceos",
  "huevos",
  "pescado",
  "cacahuetes",
  "soja",
  "lacteos",
  "frutos_secos",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
];
const MENU_WEEKDAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
];

let alergenosSeleccionados = [];

// Cache para UI (filtro/buscador/badges)
let ALL_CATEGORIAS = [];
let ALL_PLATOS = [];
let ALL_MENUS_COMPUESTOS = [];
let ALL_MENUS_PROGRAMACION = [];
let ALL_MENUS_CAMPOS = [];
let ALL_MENUS_CAMPOS_PLATOS = [];
let SUBCATEGORIAS_POR_CATEGORIA = {};
let profileMenuMetadataCache = {};
let menuEditorState = null;
let menuEditorFieldSeq = 0;
let menuDishPickerState = null;
let menusFeatureAvailable = true;
let menusFeatureUnavailableReason = "";

// Sortable instances (para destruir/recrear al re-render)
let sortableCategorias = null;
let sortablePlatos = null;
let platoPreviewObjectUrl = null;
let platoGalleryImages = [];
let profileGalleryImages = [];
let activeProfileMediaTargetKey = null;
const profilePreviewObjectUrls = {
  portada: null,
  logo: null,
  platoDefault: null,
};

// ========== DOM (LOGIN) ==========
const loginForm = document.getElementById("login-form");
const adminPanel = document.getElementById("admin-panel");
const loginError = document.getElementById("loginError");

// PERFIL
const perfilNombre = document.getElementById("perfilNombre");
const perfilUid = document.getElementById("perfilUid");
const perfilSlug = document.getElementById("perfilSlug");
const perfilSlugUrl = document.getElementById("perfilSlugUrl");
const perfilSlugCopyBtn = document.getElementById("perfilSlugCopyBtn");
const perfilSlugOpenBtn = document.getElementById("perfilSlugOpenBtn");
const perfilTelefono = document.getElementById("perfilTelefono");
const perfilDireccion = document.getElementById("perfilDireccion");
const perfilWifi = document.getElementById("perfilWifi");
const perfilWifiPass = document.getElementById("perfilWifiPass");
const perfilWifiPin = document.getElementById("perfilWifiPin");
const perfilWifiPinToggleBtn = document.getElementById("perfilWifiPinToggleBtn");
const perfilReviews = document.getElementById("perfilReviews");
const perfilPortadaUrl = document.getElementById("perfilPortadaUrl");
const perfilPortadaFile = document.getElementById("perfilPortadaFile");
const perfilPortadaPreview = document.getElementById("perfilPortadaPreview");
const perfilPortadaGaleriaBtn = document.getElementById("perfilPortadaGaleriaBtn");
const perfilPortadaClearBtn = document.getElementById("perfilPortadaClearBtn");
const perfilLogoUrl = document.getElementById("perfilLogoUrl");
const perfilLogoFile = document.getElementById("perfilLogoFile");
const perfilLogoPreview = document.getElementById("perfilLogoPreview");
const perfilLogoGaleriaBtn = document.getElementById("perfilLogoGaleriaBtn");
const perfilLogoClearBtn = document.getElementById("perfilLogoClearBtn");
const perfilPlatoDefaultUrl = document.getElementById("perfilPlatoDefaultUrl");
const perfilPlatoDefaultFile = document.getElementById("perfilPlatoDefaultFile");
const perfilPlatoDefaultPreview = document.getElementById(
  "perfilPlatoDefaultPreview",
);
const perfilPlatoDefaultGaleriaBtn = document.getElementById(
  "perfilPlatoDefaultGaleriaBtn",
);
const perfilPlatoDefaultClearBtn = document.getElementById(
  "perfilPlatoDefaultClearBtn",
);
const perfilGooglePlaceId = document.getElementById("perfilGooglePlaceId");
const buscarPlaceIdBtn = document.getElementById("buscarPlaceIdBtn");
const perfilColorPrincipal = document.getElementById("perfilColorPrincipal");
const perfilColorPrincipalLabel = document.getElementById(
  "perfilColorPrincipalLabel",
);
const colorSwatches = Array.from(
  document.querySelectorAll(".color-swatch[data-color]"),
);

// Modal Place ID
const placeIdModal = document.getElementById("placeIdModal");
const placeIdModalBackdrop = document.getElementById("placeIdModalBackdrop");
const placeIdModalClose = document.getElementById("placeIdModalClose");
const placeSearchInput = document.getElementById("placeSearchInput");
const placeResultName = document.getElementById("placeResultName");
const placeResultAddr = document.getElementById("placeResultAddr");
const placeResultId = document.getElementById("placeResultId");
const usePlaceIdBtn = document.getElementById("usePlaceIdBtn");

// CATEGORIAS
const editCategoriaId = document.getElementById("editCategoriaId");
const categoriaNombre = document.getElementById("categoriaNombre");
const guardarCategoriaBtn = document.getElementById("guardarCategoriaBtn");
const cancelCategoriaBtn = document.getElementById("cancelCategoriaBtn");
const categoriaFormTitle = document.getElementById("categoria-form-title");
const categoriaSubcategoriasEditor = document.getElementById(
  "categoriaSubcategoriasEditor",
);
const categoriaSubcategoriaNombre = document.getElementById(
  "categoriaSubcategoriaNombre",
);
const addCategoriaSubcategoriaBtn = document.getElementById(
  "addCategoriaSubcategoriaBtn",
);
const categoriaSubcategoriasList = document.getElementById(
  "categoriaSubcategoriasList",
);

// PLATOS (form)
const editPlatoId = document.getElementById("editPlatoId");
const platoNombre = document.getElementById("platoNombre");
const platoDescripcion = document.getElementById("platoDescripcion");
const platoPrecio = document.getElementById("platoPrecio");
const platoSubcategoria = document.getElementById("platoSubcategoria");
const platoCategoria = document.getElementById("platoCategoria");
const platoImagenUrl = document.getElementById("platoImagenUrl");
const platoImagenFile = document.getElementById("platoImagenFile");
const platoImagenUploadBtn = document.getElementById("platoImagenUploadBtn");
const platoImagenGaleriaBtn = document.getElementById("platoImagenGaleriaBtn");
const platoImagenClearBtn = document.getElementById("platoImagenClearBtn");
const platoImagenStatus = document.getElementById("platoImagenStatus");
const platoImagenPreview = document.getElementById("platoImagenPreview");
const guardarPlatoBtn = document.getElementById("guardarPlatoBtn");
const cancelPlatoBtn = document.getElementById("cancelPlatoBtn");
const platoFormTitle = document.getElementById("plato-form-title");
const platoSubcategoriaHint = document.getElementById("platoSubcategoriaHint");
const platoEditAside = document.getElementById("platoEditAside");
const platoEditAsideBody = document.getElementById("platoEditAsideBody");
const platoImagenGalleryModal = document.getElementById("platoImagenGalleryModal");
const platoImagenGalleryBackdrop = document.getElementById(
  "platoImagenGalleryBackdrop",
);
const platoImagenGalleryClose = document.getElementById("platoImagenGalleryClose");
const platoImagenGalleryRefresh = document.getElementById(
  "platoImagenGalleryRefresh",
);
const platoImagenGalleryGrid = document.getElementById("platoImagenGalleryGrid");
const profileImageGalleryModal = document.getElementById("profileImageGalleryModal");
const profileImageGalleryBackdrop = document.getElementById(
  "profileImageGalleryBackdrop",
);
const profileImageGalleryClose = document.getElementById("profileImageGalleryClose");
const profileImageGalleryRefresh = document.getElementById(
  "profileImageGalleryRefresh",
);
const profileImageGalleryGrid = document.getElementById("profileImageGalleryGrid");
const profileImageGalleryTitle = document.getElementById("profileImageGalleryTitle");
const openMenuEditorBtn = document.getElementById("openMenuEditorBtn");
const menusCompuestosContainer = document.getElementById(
  "menusCompuestosContainer",
);
const menuEditorModal = document.getElementById("menuEditorModal");
const menuEditorTitle = document.getElementById("menuEditorTitle");
const menuEditorId = document.getElementById("menuEditorId");
const menuEditorNombre = document.getElementById("menuEditorNombre");
const menuEditorDescripcion = document.getElementById("menuEditorDescripcion");
const menuEditorActivo = document.getElementById("menuEditorActivo");
const menuEditorWeekdays = document.getElementById("menuEditorWeekdays");
const menuEditorCamposContainer = document.getElementById(
  "menuEditorCamposContainer",
);
const menuEditorAddCampoBtn = document.getElementById("menuEditorAddCampoBtn");
const menuEditorDeleteBtn = document.getElementById("menuEditorDeleteBtn");
const menuEditorSaveBtn = document.getElementById("menuEditorSaveBtn");
const menuDishPickerModal = document.getElementById("menuDishPickerModal");
const menuDishPickerTitle = document.getElementById("menuDishPickerTitle");
const menuDishPickerCategoria = document.getElementById("menuDishPickerCategoria");
const menuDishPickerSubcategoria = document.getElementById(
  "menuDishPickerSubcategoria",
);
const menuDishPickerList = document.getElementById("menuDishPickerList");
const menuDishPickerDoneBtn = document.getElementById("menuDishPickerDoneBtn");

// PLATOS (toolbar)
const platosCategoriaFilter = document.getElementById("platosCategoriaFilter");
const platosSearch = document.getElementById("platosSearch");
const PROFILE_MEDIA_TARGETS = {
  portada: {
    label: "Portada principal",
    urlInput: perfilPortadaUrl,
    fileInput: perfilPortadaFile,
    preview: perfilPortadaPreview,
  },
  logo: {
    label: "Logo / emblema",
    urlInput: perfilLogoUrl,
    fileInput: perfilLogoFile,
    preview: perfilLogoPreview,
  },
  platoDefault: {
    label: "Imagen fallback de platos",
    urlInput: perfilPlatoDefaultUrl,
    fileInput: perfilPlatoDefaultFile,
    preview: perfilPlatoDefaultPreview,
  },
};

// ========== HELPERS ==========
function safeText(v) {
  return (v ?? "").toString();
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function idsEqual(a, b) {
  return safeText(a).trim() === safeText(b).trim();
}

function pickFirst(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value != null && value !== "") return value;
  }
  return null;
}

function parseJsonObjectValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }
  return null;
}

function toNullableInputValue(value) {
  const text = safeText(value).trim();
  return text || null;
}

function normalizeWeekday(value) {
  const weekday = Number(value);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  return weekday;
}

function getMenuWeekdayLabel(value) {
  const weekday = normalizeWeekday(value);
  if (weekday == null) return "";
  const item = MENU_WEEKDAY_OPTIONS.find((entry) => entry.value === weekday);
  return item?.label || "";
}

function normalizeCategoryId(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
}

function normalizeSubcategoriaLabel(value) {
  return safeText(value)
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeSubcategoriaCatalogValue(value) {
  return safeText(value).trim().replace(/\s+/g, " ");
}

function dedupeSubcategoriasCatalog(values) {
  const deduped = new Map();
  (values || []).forEach((entry) => {
    const label = normalizeSubcategoriaCatalogValue(entry);
    if (!label) return;
    const normalized = normalizeSubcategoriaLabel(label);
    if (!normalized || deduped.has(normalized)) return;
    deduped.set(normalized, label);
  });
  return Array.from(deduped.values()).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}

function normalizeSubcategoriaCategoryKey(value) {
  const numeric = normalizeCategoryId(value);
  if (numeric != null) return safeText(numeric);
  const text = safeText(value).trim();
  return text || "";
}

function normalizeSubcategoriasByCategoria(value) {
  const normalizedMap = {};
  const source = parseJsonObjectValue(value);
  if (!source) return normalizedMap;

  Object.entries(source).forEach(([rawKey, rawItems]) => {
    const key = normalizeSubcategoriaCategoryKey(rawKey);
    if (!key) return;
    const items = dedupeSubcategoriasCatalog(
      Array.isArray(rawItems) ? rawItems : [rawItems],
    );
    if (!items.length) return;
    normalizedMap[key] = items;
  });

  return normalizedMap;
}

function getProfileMenuMetadata(profileData) {
  const metadata = parseJsonObjectValue(
    pickFirst(profileData, PROFILE_MENU_METADATA_KEYS),
  );
  return metadata && typeof metadata === "object" ? { ...metadata } : {};
}

function extractSubcategoriasByCategoria(profileData) {
  const menuMetadata = getProfileMenuMetadata(profileData);
  const rawByCategory = pickFirst(menuMetadata, MENU_SUBCATEGORIA_BY_CATEGORY_KEYS);
  return normalizeSubcategoriasByCategoria(rawByCategory);
}

function parseCategoryIds(rawValue) {
  const toNum = (v) => Number(v);
  const uniqNums = (values) =>
    [...new Set(values.map(toNum).filter((n) => Number.isFinite(n)))];

  if (Array.isArray(rawValue)) return uniqNums(rawValue);
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) return [rawValue];

  const raw = safeText(rawValue).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return uniqNums(parsed);
  } catch {}

  if (raw.includes(",")) {
    return uniqNums(
      raw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    );
  }

  const single = Number(raw);
  return Number.isFinite(single) ? [single] : [];
}

function getPlatoCategoryIds(plato) {
  const single = Number(plato?.categoria_id);
  if (Number.isFinite(single)) return [single];
  const multiRaw = pickFirst(plato, MENU_MULTI_CATEGORY_KEYS);
  const multi = parseCategoryIds(multiRaw);
  if (multi.length) return multi;
  return [];
}

function normalizeHexColor(value) {
  const raw = safeText(value).trim();
  if (!raw) return null;
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[\da-fA-F]{3}$/.test(withHash)) {
    const short = withHash.slice(1);
    return `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toUpperCase();
  }
  if (!/^#[\da-fA-F]{6}$/.test(withHash)) return null;
  return withHash.toUpperCase();
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const clean = normalized.slice(1);
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function toRgba(hex, alpha) {
  const rgb = hexToRgb(hex) || { r: 255, g: 232, b: 0 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function mixHex(hexA, hexB, amount = 0.5) {
  const a = hexToRgb(hexA) || hexToRgb(DEFAULT_PRIMARY_COLOR);
  const b = hexToRgb(hexB) || hexToRgb("#FFFFFF");
  const t = Math.max(0, Math.min(1, Number(amount) || 0));
  const mix = (va, vb) => Math.round(va * (1 - t) + vb * t);
  const rgb = [mix(a.r, b.r), mix(a.g, b.g), mix(a.b, b.b)];
  return `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hexA, hexB) {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 1;
  const lumA = relativeLuminance(rgbA);
  const lumB = relativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureContrast(colorHex, againstHex, minRatio = 3.2) {
  const base = normalizeHexColor(colorHex) || DEFAULT_PRIMARY_COLOR;
  const against = normalizeHexColor(againstHex) || "#1C1C1C";
  if (contrastRatio(base, against) >= minRatio) return base;

  const againstLum = relativeLuminance(hexToRgb(against) || { r: 28, g: 28, b: 28 });
  const target = againstLum < 0.5 ? "#FFFFFF" : "#000000";
  for (let i = 1; i <= 20; i++) {
    const candidate = mixHex(base, target, i / 20);
    if (contrastRatio(candidate, against) >= minRatio) return candidate;
  }
  return target;
}

function bestTextColor(backgroundHex) {
  const whiteContrast = contrastRatio(backgroundHex, "#FFFFFF");
  const darkContrast = contrastRatio(backgroundHex, "#111111");
  return darkContrast >= whiteContrast ? "#111111" : "#FFFFFF";
}

let activePrimaryColor = normalizeHexColor(
  localStorage.getItem(ADMIN_THEME_STORAGE_KEY),
);
if (!activePrimaryColor) activePrimaryColor = DEFAULT_PRIMARY_COLOR;

function markActiveSwatches(colorHex) {
  const normalized = normalizeHexColor(colorHex) || DEFAULT_PRIMARY_COLOR;
  colorSwatches.forEach((swatch) => {
    const swatchColor = normalizeHexColor(swatch.dataset.color);
    const isActive = swatchColor === normalized;
    swatch.classList.toggle("is-active", isActive);
    swatch.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (perfilColorPrincipal) {
    perfilColorPrincipal.value = normalized.toLowerCase();
  }
  if (perfilColorPrincipalLabel) {
    perfilColorPrincipalLabel.textContent = normalized;
  }
}

function applyAdminTheme(color, { persist = true } = {}) {
  const normalized = normalizeHexColor(color) || DEFAULT_PRIMARY_COLOR;
  const accentUi = ensureContrast(normalized, "#1C1C1C", 3.2);
  const accentStrong = mixHex(normalized, "#FFFFFF", 0.16);
  const accentUiStrong = ensureContrast(accentStrong, "#1C1C1C", 3.4);
  const accentSoft = toRgba(accentUi, 0.16);
  const accentSoftAlt = toRgba(accentUi, 0.1);
  const accentShadow = toRgba(accentUi, 0.28);
  const accentShadowStrong = toRgba(accentUi, 0.36);
  const accentGlow1 = toRgba(accentUi, 0.2);
  const accentGlow2 = toRgba(accentUi, 0.12);
  const accentTintBg = toRgba(accentUi, 0.14);
  const accentTintPanel = toRgba(accentUi, 0.2);
  const accentInk = bestTextColor(normalized);

  const root = document.documentElement;
  root.style.setProperty("--accent", normalized);
  root.style.setProperty("--accent-strong", accentStrong);
  root.style.setProperty("--accent-ui", accentUi);
  root.style.setProperty("--accent-ui-strong", accentUiStrong);
  root.style.setProperty("--accent-soft", accentSoft);
  root.style.setProperty("--accent-soft-alt", accentSoftAlt);
  root.style.setProperty("--accent-shadow", accentShadow);
  root.style.setProperty("--accent-shadow-strong", accentShadowStrong);
  root.style.setProperty("--accent-glow-1", accentGlow1);
  root.style.setProperty("--accent-glow-2", accentGlow2);
  root.style.setProperty("--accent-tint-bg", accentTintBg);
  root.style.setProperty("--accent-tint-panel", accentTintPanel);
  root.style.setProperty("--accent-ink", accentInk);

  activePrimaryColor = normalized;
  markActiveSwatches(normalized);
  if (persist) {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, normalized);
  }
  return normalized;
}

function getCurrentPrimaryColor() {
  return (
    normalizeHexColor(perfilColorPrincipal?.value) ||
    normalizeHexColor(activePrimaryColor) ||
    normalizeHexColor(localStorage.getItem(ADMIN_THEME_STORAGE_KEY)) ||
    DEFAULT_PRIMARY_COLOR
  );
}

const APP_BASE_URL = new URL("../", import.meta.url);

function assetUrl(path) {
  const clean = String(path || "").replace(/^\//, "");
  return new URL(clean, APP_BASE_URL).toString();
}

function menuUrlFromSlug(slug) {
  const clean = safeText(slug).trim().replace(/^\//, "");
  if (!clean) return "";
  const baseUrl = new URL(APP_BASE_URL);
  baseUrl.searchParams.set("cliente", clean);
  return baseUrl.toString();
}

function normalizeAdminAssetUrl(url) {
  const clean = safeText(url).trim();
  if (!clean) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(clean)) return clean;
  if (/^(data|blob|mailto|tel):/i.test(clean)) return clean;
  return assetUrl(clean);
}

function showPreview(el, url) {
  if (!el) return;
  if (!url) {
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }
  el.style.display = "";
  const normalized = normalizeAdminAssetUrl(url);
  el.innerHTML = `<img src="${normalized}" alt="preview" style="max-width:100%;border-radius:12px;display:block" onerror="this.style.display='none';this.parentElement.style.background='transparent'"/>`;
}

function syncModalBodyLock() {
  const hasOpenModal =
    placeIdModal?.getAttribute("aria-hidden") === "false" ||
    platoImagenGalleryModal?.getAttribute("aria-hidden") === "false" ||
    profileImageGalleryModal?.getAttribute("aria-hidden") === "false" ||
    menuEditorModal?.getAttribute("aria-hidden") === "false" ||
    menuDishPickerModal?.getAttribute("aria-hidden") === "false";
  document.body.style.overflow = hasOpenModal ? "hidden" : "";
}

function revokePlatoPreviewObjectUrl() {
  if (!platoPreviewObjectUrl) return;
  URL.revokeObjectURL(platoPreviewObjectUrl);
  platoPreviewObjectUrl = null;
}

function setPlatoImageStatus(message, { error = false } = {}) {
  if (!platoImagenStatus) return;
  platoImagenStatus.textContent = message;
  platoImagenStatus.classList.toggle("is-error", Boolean(error));
}

function setPlatoImageFromUrl(url, { clearFile = true, status = null } = {}) {
  const clean = safeText(url).trim();
  revokePlatoPreviewObjectUrl();
  if (platoImagenUrl) platoImagenUrl.value = clean;
  if (clearFile && platoImagenFile) platoImagenFile.value = "";
  showPreview(platoImagenPreview, clean || null);
  if (status) {
    setPlatoImageStatus(status);
  } else {
    setPlatoImageStatus(
      clean ? "Imagen seleccionada para el plato." : "Sin imagen seleccionada.",
    );
  }
}

function setPlatoImageFromFile(file) {
  if (!file) return;
  revokePlatoPreviewObjectUrl();
  platoPreviewObjectUrl = URL.createObjectURL(file);
  showPreview(platoImagenPreview, platoPreviewObjectUrl);
  setPlatoImageStatus(`Archivo listo para subir: ${file.name}`);
}

function getProfileMediaTarget(targetKey) {
  return PROFILE_MEDIA_TARGETS[targetKey] || null;
}

function revokeProfilePreviewObjectUrl(targetKey) {
  const objectUrl = profilePreviewObjectUrls[targetKey];
  if (!objectUrl) return;
  URL.revokeObjectURL(objectUrl);
  profilePreviewObjectUrls[targetKey] = null;
}

function setProfileMediaFromUrl(targetKey, url, { clearFile = true } = {}) {
  const target = getProfileMediaTarget(targetKey);
  if (!target) return;
  const clean = safeText(url).trim();
  revokeProfilePreviewObjectUrl(targetKey);
  if (target.urlInput) target.urlInput.value = clean;
  if (clearFile && target.fileInput) target.fileInput.value = "";
  showPreview(target.preview, clean || null);
}

function setProfileMediaFromFile(targetKey, file) {
  const target = getProfileMediaTarget(targetKey);
  if (!target || !file) return;
  revokeProfilePreviewObjectUrl(targetKey);
  const blob = URL.createObjectURL(file);
  profilePreviewObjectUrls[targetKey] = blob;
  showPreview(target.preview, blob);
}

function isImageFileName(name) {
  const lower = safeText(name).trim().toLowerCase();
  if (!lower || lower.endsWith("/")) return false;
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function listStorageImagesInFolder(prefix) {
  const images = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "desc" },
    });

    if (error) throw error;
    const page = Array.isArray(data) ? data : [];

    page
      .filter((item) => isImageFileName(item?.name))
      .forEach((item) => {
        const path = `${prefix}/${item.name}`;
        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(path);
        const url = safeText(publicData?.publicUrl).trim();
        if (!url) return;
        images.push({
          name: item.name,
          url,
          path,
          updatedAt: item?.updated_at || item?.created_at || "",
          folder: prefix.split("/").slice(-1)[0] || "platos",
        });
      });

    if (page.length < limit) break;
    offset += limit;
  }

  return images;
}

async function fetchDishGalleryImages() {
  const currentUser = await requireUser();
  const userRoot = safeText(currentUser?.id).trim();
  if (!userRoot) return [];

  const allImages = [];
  for (const folder of DISH_GALLERY_FOLDERS) {
    const prefix = `${userRoot}/${folder}`;
    try {
      const folderImages = await listStorageImagesInFolder(prefix);
      allImages.push(...folderImages);
    } catch (error) {
      const msg = safeText(error?.message).toLowerCase();
      if (msg.includes("not found")) continue;
      throw error;
    }
  }

  const uniqueByUrl = [];
  const seen = new Set();
  allImages
    .sort((a, b) => safeText(b.updatedAt).localeCompare(safeText(a.updatedAt)))
    .forEach((item) => {
      if (seen.has(item.url)) return;
      seen.add(item.url);
      uniqueByUrl.push(item);
    });

  return uniqueByUrl;
}

async function deleteDishGalleryImage(item) {
  const fileName = safeText(item?.name) || "imagen";
  const filePath = safeText(item?.path);
  if (!filePath) return false;

  const ok = confirm(
    `¿Borrar esta imagen de Storage?\n\n${fileName}\n\nSi está en uso (platos, portada, logo o fallback), dejará de mostrarse hasta que pongas otra.`,
  );
  if (!ok) return false;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  if (error) {
    throw new Error(`No se pudo borrar la imagen: ${error.message}`);
  }

  const deletedUrl = safeText(item?.url).trim();
  const currentDishUrl = safeText(platoImagenUrl?.value).trim();
  const dishMatched = currentDishUrl && currentDishUrl === deletedUrl;
  if (dishMatched) {
    setPlatoImageFromUrl("", {
      status:
        "La imagen seleccionada fue borrada. Guarda el plato para aplicar el cambio.",
    });
  } else {
    setPlatoImageStatus("Imagen borrada de tu galería.");
  }

  Object.entries(PROFILE_MEDIA_TARGETS).forEach(([targetKey, target]) => {
    const targetUrl = safeText(target?.urlInput?.value).trim();
    if (!targetUrl || targetUrl !== deletedUrl) return;
    setProfileMediaFromUrl(targetKey, "");
  });
  return true;
}

async function deleteProfileGalleryImage(item) {
  const fileName = safeText(item?.name) || "imagen";
  const filePath = safeText(item?.path);
  if (!filePath) return false;

  const ok = confirm(
    `¿Borrar esta imagen de Storage?\n\n${fileName}\n\nSi está en uso (platos, portada, logo o fallback), dejará de mostrarse hasta que pongas otra.`,
  );
  if (!ok) return false;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  if (error) {
    throw new Error(`No se pudo borrar la imagen: ${error.message}`);
  }

  const deletedUrl = safeText(item?.url).trim();
  Object.entries(PROFILE_MEDIA_TARGETS).forEach(([targetKey, target]) => {
    const targetUrl = safeText(target?.urlInput?.value).trim();
    if (!targetUrl || targetUrl !== deletedUrl) return;
    setProfileMediaFromUrl(targetKey, "");
  });

  const currentDishUrl = safeText(platoImagenUrl?.value).trim();
  if (currentDishUrl && currentDishUrl === deletedUrl) {
    setPlatoImageFromUrl("", {
      status:
        "La imagen del plato en edición fue borrada. Guarda el plato para aplicar el cambio.",
    });
  }

  return true;
}

function renderPlatoGalleryGrid(items) {
  if (!platoImagenGalleryGrid) return;
  platoImagenGalleryGrid.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "plato-gallery-empty";
    empty.textContent =
      "No hay imágenes en tu galería todavía. Sube una imagen y luego podrás reutilizarla.";
    platoImagenGalleryGrid.appendChild(empty);
    return;
  }

  const selectedUrl = safeText(platoImagenUrl?.value).trim();
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "plato-gallery-item";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    if (item.url === selectedUrl) card.classList.add("is-selected");
    card.title = item.name;

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.name;
    img.loading = "lazy";
    img.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "plato-gallery-name";
    caption.textContent = item.name;

    const meta = document.createElement("small");
    meta.className = "plato-gallery-meta";
    meta.textContent = STORAGE_FOLDER_LABELS[item.folder] || safeText(item.folder);

    const actions = document.createElement("div");
    actions.className = "plato-gallery-actions";

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "plato-gallery-pick";
    useBtn.textContent = "Usar";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "plato-gallery-delete";
    deleteBtn.textContent = "Borrar";

    const selectItem = () => {
      setPlatoImageFromUrl(item.url, {
        status: "Imagen seleccionada desde tu galería.",
      });
      closePlatoImageGalleryModal();
    };

    useBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      selectItem();
    });

    deleteBtn.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Borrando...";
      try {
        const deleted = await deleteDishGalleryImage(item);
        if (deleted) {
          await refreshPlatoImageGallery();
          return;
        }
      } catch (error) {
        alert(error?.message || "No se pudo borrar la imagen.");
      }
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Borrar";
    });

    actions.appendChild(useBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(img);
    card.appendChild(caption);
    card.appendChild(meta);
    card.appendChild(actions);
    card.addEventListener("click", selectItem);
    card.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      selectItem();
    });

    platoImagenGalleryGrid.appendChild(card);
  });
}

function renderProfileGalleryGrid(items) {
  if (!profileImageGalleryGrid) return;
  profileImageGalleryGrid.innerHTML = "";

  const activeTarget = getProfileMediaTarget(activeProfileMediaTargetKey);
  if (!activeTarget) {
    profileImageGalleryGrid.innerHTML =
      '<div class="plato-gallery-empty">No se pudo determinar el destino de la imagen.</div>';
    return;
  }

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "plato-gallery-empty";
    empty.textContent =
      "No hay imágenes en tu galería todavía. Sube una imagen y luego podrás reutilizarla.";
    profileImageGalleryGrid.appendChild(empty);
    return;
  }

  const selectedUrl = safeText(activeTarget.urlInput?.value).trim();
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "plato-gallery-item";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    if (item.url === selectedUrl) card.classList.add("is-selected");
    card.title = item.name;

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.name;
    img.loading = "lazy";
    img.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "plato-gallery-name";
    caption.textContent = item.name;

    const meta = document.createElement("small");
    meta.className = "plato-gallery-meta";
    meta.textContent = STORAGE_FOLDER_LABELS[item.folder] || safeText(item.folder);

    const actions = document.createElement("div");
    actions.className = "plato-gallery-actions";

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "plato-gallery-pick";
    useBtn.textContent = "Usar";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "plato-gallery-delete";
    deleteBtn.textContent = "Borrar";

    const selectItem = () => {
      setProfileMediaFromUrl(activeProfileMediaTargetKey, item.url);
      closeProfileImageGalleryModal();
    };

    useBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      selectItem();
    });

    deleteBtn.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Borrando...";
      try {
        const deleted = await deleteProfileGalleryImage(item);
        if (deleted) {
          await refreshProfileImageGallery();
          return;
        }
      } catch (error) {
        alert(error?.message || "No se pudo borrar la imagen.");
      }
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Borrar";
    });

    actions.appendChild(useBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(img);
    card.appendChild(caption);
    card.appendChild(meta);
    card.appendChild(actions);
    card.addEventListener("click", selectItem);
    card.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      selectItem();
    });

    profileImageGalleryGrid.appendChild(card);
  });
}

async function refreshPlatoImageGallery() {
  if (!platoImagenGalleryGrid) return;
  platoImagenGalleryGrid.innerHTML =
    '<div class="plato-gallery-empty">Cargando imágenes...</div>';

  try {
    platoGalleryImages = await fetchDishGalleryImages();
    renderPlatoGalleryGrid(platoGalleryImages);
  } catch (error) {
    console.warn("Galería platos:", error?.message || error);
    platoImagenGalleryGrid.innerHTML =
      '<div class="plato-gallery-empty">No se pudieron cargar tus imágenes. Revisa permisos de Storage y vuelve a intentar.</div>';
  }
}

async function refreshProfileImageGallery() {
  if (!profileImageGalleryGrid) return;
  profileImageGalleryGrid.innerHTML =
    '<div class="plato-gallery-empty">Cargando imágenes...</div>';

  try {
    profileGalleryImages = await fetchDishGalleryImages();
    renderProfileGalleryGrid(profileGalleryImages);
  } catch (error) {
    console.warn("Galería perfil:", error?.message || error);
    profileImageGalleryGrid.innerHTML =
      '<div class="plato-gallery-empty">No se pudieron cargar tus imágenes. Revisa permisos de Storage y vuelve a intentar.</div>';
  }
}

function openPlatoImageGalleryModal() {
  if (!platoImagenGalleryModal) return;
  platoImagenGalleryModal.setAttribute("aria-hidden", "false");
  syncModalBodyLock();
  void refreshPlatoImageGallery();
}

function closePlatoImageGalleryModal() {
  if (!platoImagenGalleryModal) return;
  platoImagenGalleryModal.setAttribute("aria-hidden", "true");
  syncModalBodyLock();
}

function openProfileImageGalleryModal(targetKey) {
  if (!profileImageGalleryModal) return;
  const target = getProfileMediaTarget(targetKey);
  if (!target) return;
  activeProfileMediaTargetKey = targetKey;
  if (profileImageGalleryTitle) {
    profileImageGalleryTitle.textContent = `🖼️ Mis imágenes · ${target.label}`;
  }
  profileImageGalleryModal.setAttribute("aria-hidden", "false");
  syncModalBodyLock();
  void refreshProfileImageGallery();
}

function closeProfileImageGalleryModal() {
  if (!profileImageGalleryModal) return;
  profileImageGalleryModal.setAttribute("aria-hidden", "true");
  syncModalBodyLock();
}

function normalizeAllergenKey(v) {
  const raw = safeText(v).trim().toLowerCase();
  if (!raw) return "";
  const clean = raw.replace(/^alergenos\//, "").replace(/\.svg$/, "");
  const n = clean
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  const includes = (needle) => n.includes(needle);
  if (includes("gluten")) return "gluten";
  if (includes("huevo")) return "huevos";
  if (includes("lact") || includes("leche")) return "lacteos";
  if (includes("crust")) return "crustaceos";
  if (includes("molusc")) return "moluscos";
  if (includes("cacahuet")) return "cacahuetes";
  if (includes("sesam")) return "sesamo";
  if (includes("mostaz")) return "mostaza";
  if (includes("pescad")) return "pescado";
  if (includes("soja")) return "soja";
  if (includes("apio")) return "apio";
  if (includes("altram")) return "altramuces";
  if (includes("sulfit")) return "sulfitos";
  if (includes("frutos") && (includes("cascara") || includes("secos")))
    return "frutos_secos";
  return n.replace(/\s+/g, "_");
}

function categoriaNombreById(id) {
  const c = ALL_CATEGORIAS.find((x) => Number(x.id) === Number(id));
  return c?.nombre || "";
}

function formatMoneyEur(value) {
  if (value == null || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return `${num.toFixed(2)} EUR`;
}

function renderAdminAllergenBadges(allergens = []) {
  const items = Array.isArray(allergens) ? allergens : [];
  const icons = items
    .map((item) => normalizeAllergenKey(item))
    .filter(Boolean)
    .slice(0, 4)
    .map((key) => {
      const label = key.replace(/_/g, " ");
      const url = assetUrl(`alergenos/${key}.svg`);
      return `
        <span class="plato-alergeno-badge" title="${label}">
          <img src="${url}" alt="${label}" loading="lazy" onerror="this.parentElement.textContent='•'"/>
        </span>
      `;
    })
    .join("");

  if (!icons) return "";
  return `<div class="plato-alergenos">${icons}</div>`;
}

function getConfiguredSubcategoriasByCategoria(categoryId) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  return dedupeSubcategoriasCatalog(SUBCATEGORIAS_POR_CATEGORIA?.[key] || []);
}

function getCategorySubcategories(categoryId) {
  const bucket = new Map();
  getConfiguredSubcategoriasByCategoria(categoryId).forEach((name) => {
    bucket.set(normalizeSubcategoriaLabel(name), {
      name,
      total: 0,
      active: 0,
      configured: true,
    });
  });

  ALL_PLATOS.forEach((plato) => {
    if (!getPlatoCategoryIds(plato).includes(Number(categoryId))) return;
    const name = safeText(plato.subcategoria).trim();
    if (!name) return;
    const normalized = normalizeSubcategoriaLabel(name);
    const current = bucket.get(normalized) || {
      name,
      total: 0,
      active: 0,
      configured: false,
    };
    current.total += 1;
    if (plato.activo) current.active += 1;
    bucket.set(normalized, current);
  });

  return [...bucket.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
}

function getAvailableSubcategoriasForCategoria(categoryId) {
  return getCategorySubcategories(categoryId).map((item) => item.name);
}

function getAllConfiguredSubcategorias() {
  return dedupeSubcategoriasCatalog(
    Object.values(SUBCATEGORIAS_POR_CATEGORIA || {}).flat(),
  );
}

async function persistSubcategoriasCatalog() {
  const currentUser = await requireUser();
  const personalizacionMenu = {
    ...profileMenuMetadataCache,
    subcategorias_catalogo: getAllConfiguredSubcategorias(),
    subcategorias_por_categoria: normalizeSubcategoriasByCategoria(
      SUBCATEGORIAS_POR_CATEGORIA,
    ),
  };

  const { data: existing, error: existingError } = await db
    .from("Perfil")
    .select("user_id")
    .eq("user_id", currentUser.id)
    .maybeSingle();
  if (existingError) throw existingError;

  const writer = existing
    ? db
        .from("Perfil")
        .update({ personalizacion_menu: personalizacionMenu })
        .eq("user_id", currentUser.id)
    : db
        .from("Perfil")
        .insert({ user_id: currentUser.id, personalizacion_menu: personalizacionMenu });

  const { error } = await writer;
  if (error) throw error;

  profileMenuMetadataCache = { ...personalizacionMenu };
  SUBCATEGORIAS_POR_CATEGORIA = normalizeSubcategoriasByCategoria(
    personalizacionMenu.subcategorias_por_categoria,
  );
}

function renderCategoriaSubcategoriasEditor() {
  if (!categoriaSubcategoriasEditor || !categoriaSubcategoriasList) return;
  const categoryId = editCategoriaId?.value;
  if (!categoryId) {
    categoriaSubcategoriasEditor.style.display = "none";
    categoriaSubcategoriasList.innerHTML = "";
    if (categoriaSubcategoriaNombre) categoriaSubcategoriaNombre.value = "";
    return;
  }

  categoriaSubcategoriasEditor.style.display = "";
  const subcategorias = getCategorySubcategories(categoryId);
  if (!subcategorias.length) {
    categoriaSubcategoriasList.innerHTML =
      '<div class="category-subeditor__empty">Todavia no has creado subcategorias para esta categoria.</div>';
    return;
  }

  categoriaSubcategoriasList.innerHTML = subcategorias
    .map((item) => {
      const canDelete = item.total === 0;
      const usageLabel = item.total
        ? `${item.active}/${item.total} platos activos`
        : "Sin platos vinculados";
      return `
        <div class="category-subeditor__item">
          <div class="category-subeditor__item-main">
            <div class="category-subeditor__item-name">${escapeHtml(item.name)}</div>
            <div class="category-subeditor__item-meta">${escapeHtml(usageLabel)}</div>
          </div>
          <button
            type="button"
            class="btn-eliminar category-subeditor__item-remove"
            data-role="remove-category-subcat"
            data-subcat="${escapeHtml(item.name)}"
            ${canDelete ? "" : 'disabled title="Esta subcategoria tiene platos asignados"'}
          >
            Quitar
          </button>
        </div>
      `;
    })
    .join("");

  categoriaSubcategoriasList
    .querySelectorAll("[data-role='remove-category-subcat']")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const subcatName = safeText(button.dataset.subcat).trim();
        if (!subcatName) return;
        const categoryKey = normalizeSubcategoriaCategoryKey(categoryId);
        const nextValues = getConfiguredSubcategoriasByCategoria(categoryId).filter(
          (entry) => normalizeSubcategoriaLabel(entry) !== normalizeSubcategoriaLabel(subcatName),
        );
        if (nextValues.length) {
          SUBCATEGORIAS_POR_CATEGORIA[categoryKey] = nextValues;
        } else {
          delete SUBCATEGORIAS_POR_CATEGORIA[categoryKey];
        }
        try {
          await persistSubcategoriasCatalog();
          renderCategoriaSubcategoriasEditor();
          renderCategoriasList();
          updatePlatoSubcategoriaOptions(platoCategoria?.value);
        } catch (error) {
          alert(error?.message || "No se pudo quitar la subcategoria.");
        }
      });
    });
}

async function uploadToStorage(file, folder) {
  if (!file) return null;
  if (!(file instanceof File)) {
    throw new Error("El archivo no es un File válido");
  }
  const currentUser = await requireUser();
  const baseFolder = folder ? `${currentUser.id}/${folder}` : currentUser.id;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${baseFolder}/${crypto.randomUUID()}.${ext}`;
  const contentType =
    file.type || (ext === "png" ? "image/png" : "image/jpeg");
  console.log("[upload]", {
    path,
    size: file.size,
    type: contentType,
    user: currentUser.id,
  });

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType });

  if (upErr) {
    throw new Error(`No se pudo subir la imagen a Storage: ${upErr.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

async function requireUser() {
  if (user?.id) return user;
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) {
    user = data.session.user;
    return user;
  }
  // Intenta refrescar por si el token expiró.
  const { data: refreshed } = await supabase.auth.refreshSession();
  if (refreshed?.session?.user) {
    user = refreshed.session.user;
    return user;
  }
  throw new Error("Sesión caducada. Inicia sesión de nuevo.");
}

colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    applyAdminTheme(swatch.dataset.color);
  });
});

perfilColorPrincipal?.addEventListener("input", (event) => {
  applyAdminTheme(event.target?.value);
});

applyAdminTheme(activePrimaryColor, { persist: false });

// ========== LOGIN ==========
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    loginError.textContent = error.message;
    return;
  }
  if (data?.session) {
    await supabase.auth.setSession(data.session);
  }
  user = data.user;
  loginForm.style.display = "none";
  adminPanel.style.display = "block";
  await cargarTodo();
};

document.getElementById("logoutBtn").onclick = async () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.disabled = true;

  try {
    // "local" asegura borrar sesión incluso si falla la red
    let result;
    try {
      result = await supabase.auth.signOut({ scope: "local" });
    } catch {
      result = await supabase.auth.signOut();
    }
    if (result?.error) throw result.error;
  } catch (e) {
    console.warn("Logout:", e?.message || e);
  } finally {
    user = null;
    if (loginForm) loginForm.style.display = "block";
    if (adminPanel) adminPanel.style.display = "none";
    if (perfilUid) perfilUid.value = "";
    if (logoutBtn) logoutBtn.disabled = false;
  }
};

// ========== TABS ==========
document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
  };
});

// ========== PERFIL ==========
async function cargarPerfil() {
  const { data, error } = await db
    .from("Perfil")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Perfil:", error.message);
    return;
  }

  if (data) {
    profileMenuMetadataCache = getProfileMenuMetadata(data);
    SUBCATEGORIAS_POR_CATEGORIA = extractSubcategoriasByCategoria(data);

    perfilNombre.value = safeText(data.nombre);
    perfilSlug.value = safeText(data.slug);
    if (perfilSlugUrl) perfilSlugUrl.value = menuUrlFromSlug(data.slug);
    perfilTelefono.value = safeText(data.telefono);
    perfilDireccion.value = safeText(data.direccion);

    // Wi-Fi: SOLO nombre + clave (sin columna legacy "wifi")
    perfilWifi.value = safeText(data.wifi_name);
    if (perfilWifiPass) perfilWifiPass.value = safeText(data.wifi_pass);

    // El PIN no se puede leer (se guarda hasheado). Déjalo en blanco.
    if (perfilWifiPin) {
      perfilWifiPin.value = "";
      perfilWifiPin.type = "password";
    }
    if (perfilWifiPinToggleBtn) {
      perfilWifiPinToggleBtn.classList.remove("is-active");
      perfilWifiPinToggleBtn.textContent = "Ver";
      perfilWifiPinToggleBtn.setAttribute("aria-label", "Mostrar PIN");
    }

    perfilReviews.value = safeText(data.reviews_url);
    setProfileMediaFromUrl("portada", safeText(data.portada_url));
    perfilGooglePlaceId.value = safeText(data.google_place_id);
    const logoUrl = safeText(pickFirst(data, PROFILE_LOGO_KEYS));
    setProfileMediaFromUrl("logo", logoUrl);
    const platoDefaultUrl = safeText(
      pickFirst(data, PROFILE_DISH_PLACEHOLDER_KEYS),
    );
    setProfileMediaFromUrl("platoDefault", platoDefaultUrl);

    const perfilPrimaryColor = pickFirst(data, PROFILE_PRIMARY_COLOR_KEYS);
    if (perfilPrimaryColor) {
      applyAdminTheme(perfilPrimaryColor, { persist: true });
    } else {
      markActiveSwatches(getCurrentPrimaryColor());
    }
  } else {
    profileMenuMetadataCache = {};
    SUBCATEGORIAS_POR_CATEGORIA = {};
  }
}

perfilPortadaUrl?.addEventListener("input", () => {
  setProfileMediaFromUrl("portada", perfilPortadaUrl.value, { clearFile: false });
});

perfilPortadaFile?.addEventListener("change", () => {
  const f = perfilPortadaFile.files?.[0];
  if (!f) {
    setProfileMediaFromUrl("portada", perfilPortadaUrl?.value || "", {
      clearFile: false,
    });
    return;
  }
  setProfileMediaFromFile("portada", f);
});

perfilLogoUrl?.addEventListener("input", () => {
  setProfileMediaFromUrl("logo", perfilLogoUrl.value, { clearFile: false });
});

perfilLogoFile?.addEventListener("change", () => {
  const f = perfilLogoFile.files?.[0];
  if (!f) {
    setProfileMediaFromUrl("logo", perfilLogoUrl?.value || "", {
      clearFile: false,
    });
    return;
  }
  setProfileMediaFromFile("logo", f);
});

perfilPlatoDefaultUrl?.addEventListener("input", () => {
  setProfileMediaFromUrl("platoDefault", perfilPlatoDefaultUrl.value, {
    clearFile: false,
  });
});

perfilPlatoDefaultFile?.addEventListener("change", () => {
  const f = perfilPlatoDefaultFile.files?.[0];
  if (!f) {
    setProfileMediaFromUrl("platoDefault", perfilPlatoDefaultUrl?.value || "", {
      clearFile: false,
    });
    return;
  }
  setProfileMediaFromFile("platoDefault", f);
});

perfilPortadaGaleriaBtn?.addEventListener("click", () => {
  openProfileImageGalleryModal("portada");
});
perfilLogoGaleriaBtn?.addEventListener("click", () => {
  openProfileImageGalleryModal("logo");
});
perfilPlatoDefaultGaleriaBtn?.addEventListener("click", () => {
  openProfileImageGalleryModal("platoDefault");
});

perfilPortadaClearBtn?.addEventListener("click", () => {
  setProfileMediaFromUrl("portada", "");
});
perfilLogoClearBtn?.addEventListener("click", () => {
  setProfileMediaFromUrl("logo", "");
});
perfilPlatoDefaultClearBtn?.addEventListener("click", () => {
  setProfileMediaFromUrl("platoDefault", "");
});

perfilSlugCopyBtn?.addEventListener("click", async () => {
  const url = safeText(perfilSlugUrl?.value).trim();
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
    const originalText = perfilSlugCopyBtn.textContent;
    perfilSlugCopyBtn.textContent = "Copiado";
    window.setTimeout(() => {
      perfilSlugCopyBtn.textContent = originalText;
    }, 1400);
  } catch (error) {
    console.warn("Copiar URL:", error?.message || error);
  }
});

perfilSlugOpenBtn?.addEventListener("click", () => {
  const url = safeText(perfilSlugUrl?.value).trim();
  if (!url) return;
  window.open(url, "_blank", "noopener");
});

perfilWifiPinToggleBtn?.addEventListener("click", () => {
  if (!perfilWifiPin) return;
  const shouldShow = perfilWifiPin.type === "password";
  perfilWifiPin.type = shouldShow ? "text" : "password";
  perfilWifiPinToggleBtn.classList.toggle("is-active", shouldShow);
  perfilWifiPinToggleBtn.textContent = shouldShow ? "Ocultar" : "Ver";
  perfilWifiPinToggleBtn.setAttribute(
    "aria-label",
    shouldShow ? "Ocultar PIN" : "Mostrar PIN",
  );
});

profileImageGalleryBackdrop?.addEventListener("click", closeProfileImageGalleryModal);
profileImageGalleryClose?.addEventListener("click", closeProfileImageGalleryModal);
profileImageGalleryRefresh?.addEventListener("click", () => {
  void refreshProfileImageGallery();
});

document.getElementById("guardarPerfilBtn").onclick = async () => {
  try {
    const currentUser = await requireUser();
    const primaryColor = getCurrentPrimaryColor();
    let portadaFinal = perfilPortadaUrl.value.trim();
    let logoFinal = perfilLogoUrl?.value.trim() || "";
    let platoDefaultFinal = perfilPlatoDefaultUrl?.value.trim() || "";
    const f = perfilPortadaFile.files?.[0];
    if (f) {
      portadaFinal = await uploadToStorage(f, "portadas");
      setProfileMediaFromUrl("portada", portadaFinal);
    }
    const logoFile = perfilLogoFile?.files?.[0];
    if (logoFile) {
      logoFinal = await uploadToStorage(logoFile, "logos");
      setProfileMediaFromUrl("logo", logoFinal);
    }
    const platoDefaultFile = perfilPlatoDefaultFile?.files?.[0];
    if (platoDefaultFile) {
      platoDefaultFinal = await uploadToStorage(platoDefaultFile, "platos-default");
      setProfileMediaFromUrl("platoDefault", platoDefaultFinal);
    }

    const payload = {
      user_id: currentUser.id,
      nombre: perfilNombre.value.trim() || null,
      telefono: perfilTelefono.value.trim() || null,
      direccion: perfilDireccion.value.trim() || null,

      // Wi-Fi nuevo: SOLO wifi_name y wifi_pass
      wifi_name: perfilWifi.value.trim() || null,

      reviews_url: perfilReviews.value.trim() || null,
      google_place_id: perfilGooglePlaceId.value.trim() || null,
      portada_url: portadaFinal || null,
    };
    const wifiPassValue = perfilWifiPass?.value.trim();
    if (wifiPassValue) payload.wifi_pass = wifiPassValue;

    const { data: existing, error: existsErr } = await db
      .from("Perfil")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (existsErr) throw existsErr;

    const upsertPerfil = (writePayload) =>
      existing
        ? db.from("Perfil").update(writePayload).eq("user_id", currentUser.id)
        : db.from("Perfil").insert(writePayload);

    const platoDefaultValue = platoDefaultFinal || null;
    const logoValue = logoFinal || null;
    const isOptionalProfileColumnError = (err) => {
      const msg = safeText(err?.message).toLowerCase();
      const isMissingCol =
        msg.includes("column") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache") ||
        msg.includes("unknown");
      const mentionsBranding =
        msg.includes("color") ||
        msg.includes("accent") ||
        msg.includes("brand") ||
        msg.includes("theme") ||
        msg.includes("plato") ||
        msg.includes("dish") ||
        msg.includes("imagen") ||
        msg.includes("image") ||
        msg.includes("foto") ||
        msg.includes("logo") ||
        msg.includes("emblema") ||
        msg.includes("emblem") ||
        msg.includes("placeholder") ||
        msg.includes("fallback") ||
        msg.includes("default");
      return isMissingCol && mentionsBranding;
    };

    const buildProfileOptionalCandidates = (basePayload) => {
      const candidates = [];
      const seen = new Set();
      const addCandidate = (candidatePayload) => {
        const signature = JSON.stringify(
          Object.entries(candidatePayload).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        );
        if (seen.has(signature)) return;
        seen.add(signature);
        candidates.push(candidatePayload);
      };

      const colorPatches = PROFILE_PRIMARY_COLOR_KEYS.map((colorKey) => ({
        [colorKey]: primaryColor || null,
      }));
      const dishPatches = PROFILE_DISH_PLACEHOLDER_KEYS.map((dishKey) => ({
        [dishKey]: platoDefaultValue,
      }));
      const logoPatches = PROFILE_LOGO_KEYS.map((logoKey) => ({
        [logoKey]: logoValue,
      }));

      for (const colorPatch of colorPatches) {
        for (const dishPatch of dishPatches) {
          for (const logoPatch of logoPatches) {
            addCandidate({
              ...basePayload,
              ...colorPatch,
              ...dishPatch,
              ...logoPatch,
            });
          }
        }
      }
      for (const colorPatch of colorPatches) {
        for (const logoPatch of logoPatches) {
          addCandidate({
            ...basePayload,
            ...colorPatch,
            ...logoPatch,
          });
        }
      }
      for (const colorPatch of colorPatches) {
        for (const dishPatch of dishPatches) {
          addCandidate({
            ...basePayload,
            ...colorPatch,
            ...dishPatch,
          });
        }
      }
      for (const colorPatch of colorPatches) {
        addCandidate({
          ...basePayload,
          ...colorPatch,
        });
      }
      for (const logoPatch of logoPatches) {
        addCandidate({
          ...basePayload,
          ...logoPatch,
        });
      }
      for (const dishPatch of dishPatches) {
        addCandidate({
          ...basePayload,
          ...dishPatch,
        });
      }
      return candidates;
    };

    let error = null;
    let optionalSaved = false;
    for (const optionalPayload of buildProfileOptionalCandidates(payload)) {
      const { error: optionalErr } = await upsertPerfil(optionalPayload);
      if (!optionalErr) {
        optionalSaved = true;
        error = null;
        break;
      }

      if (!isOptionalProfileColumnError(optionalErr)) {
        error = optionalErr;
        break;
      }
      error = optionalErr;
    }

    if (!optionalSaved && !error) {
      const { error: fallbackErr } = await upsertPerfil(payload);
      error = fallbackErr || null;
    } else if (!optionalSaved && isOptionalProfileColumnError(error)) {
      console.warn(
        "Perfil sin columnas opcionales compatibles (branding / imagen por defecto de platos). Guardando perfil base.",
        error.message,
      );
      const { error: fallbackErr } = await upsertPerfil(payload);
      error = fallbackErr || null;
    }
    if (error) throw error;

    // Si el usuario ha escrito un PIN, lo guardamos (hasheado) via RPC
    const pinRaw = (perfilWifiPin?.value || "").trim();
    if (pinRaw) {
      const { error: pinErr } = await supabase.rpc("imenu_set_wifi_pin", {
        p_pin: pinRaw,
      });
      if (pinErr) throw pinErr;
      // Limpia el input por seguridad (no se queda visible)
      try {
        perfilWifiPin.value = "";
      } catch {}
    }

    await cargarPerfil();
    alert("Perfil guardado ✅");
  } catch (e) {
    alert(e.message);
  }
};

// ========== PLACE ID FINDER (Google Places Autocomplete) ==========
function openPlaceIdModal() {
  if (!placeIdModal) return;
  placeIdModal.setAttribute("aria-hidden", "false");
  syncModalBodyLock();
  // reset
  if (placeSearchInput) placeSearchInput.value = "";
  if (placeResultName) placeResultName.textContent = "-";
  if (placeResultAddr) placeResultAddr.textContent = "-";
  if (placeResultId) placeResultId.textContent = "-";
  setTimeout(() => placeSearchInput?.focus(), 50);

  // Inicializa Autocomplete si no está ya
  initPlaceAutocompleteOnce();
}

function closePlaceIdModal() {
  if (!placeIdModal) return;
  placeIdModal.setAttribute("aria-hidden", "true");
  syncModalBodyLock();
}

let __placeAutocompleteInit = false;
function initPlaceAutocompleteOnce() {
  if (__placeAutocompleteInit) return;
  if (!placeSearchInput) return;

  // Espera a que cargue Google Maps JS
  if (!window.google?.maps?.places) {
    console.warn(
      "Google Maps JS no está cargado. Revisa TU_API_KEY y libraries=places.",
    );
    return;
  }

  const ac = new google.maps.places.Autocomplete(placeSearchInput, {
    fields: ["place_id", "name", "formatted_address"],
    componentRestrictions: { country: "es" },
  });

  ac.addListener("place_changed", () => {
    const p = ac.getPlace();
    const pid = p?.place_id || "";
    if (placeResultName) placeResultName.textContent = p?.name || "-";
    if (placeResultAddr)
      placeResultAddr.textContent = p?.formatted_address || "-";
    if (placeResultId) placeResultId.textContent = pid || "-";
  });

  __placeAutocompleteInit = true;
}

buscarPlaceIdBtn?.addEventListener("click", () => {
  window.open(
    "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder",
    "_blank",
    "noopener",
  );
});
// (El modal/autocomplete antiguo se mantiene en el archivo, pero ya no se usa)
placeIdModalBackdrop?.addEventListener("click", closePlaceIdModal);
placeIdModalClose?.addEventListener("click", closePlaceIdModal);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (menuDishPickerModal?.getAttribute("aria-hidden") === "false") {
    closeMenuDishPicker();
    return;
  }
  if (menuEditorModal?.getAttribute("aria-hidden") === "false") {
    closeMenuEditor();
    return;
  }
  if (profileImageGalleryModal?.getAttribute("aria-hidden") === "false") {
    closeProfileImageGalleryModal();
    return;
  }
  if (platoImagenGalleryModal?.getAttribute("aria-hidden") === "false") {
    closePlatoImageGalleryModal();
    return;
  }
  if (placeIdModal?.getAttribute("aria-hidden") === "false") {
    closePlaceIdModal();
  }
});

usePlaceIdBtn?.addEventListener("click", async () => {
  const pid = safeText(placeResultId?.textContent).trim();
  if (!pid || pid === "-") return;
  if (perfilGooglePlaceId) perfilGooglePlaceId.value = pid;

  try {
    await navigator.clipboard.writeText(pid);
  } catch {}

  closePlaceIdModal();
});

// ========== ALERGENOS ==========
function cargarAlergenosGrid() {
  const grid = document.getElementById("alergenosGrid");
  grid.innerHTML = "";

  ALERGENOS.forEach((a) => {
    const div = document.createElement("div");
    div.className = "alergeno-item";
    div.dataset.alergeno = a;
    if (alergenosSeleccionados.includes(a)) div.classList.add("selected");

    const imgSrc = assetUrl(`alergenos/${a}.svg`);
    div.innerHTML = `
      <img src="${imgSrc}" alt="${a}" onerror="this.style.display='none'">
      <span>${a.replace(/_/g, " ")}</span>
    `;

    div.onclick = () => {
      const idx = alergenosSeleccionados.indexOf(a);
      if (idx > -1) {
        alergenosSeleccionados.splice(idx, 1);
        div.classList.remove("selected");
      } else {
        alergenosSeleccionados.push(a);
        div.classList.add("selected");
      }
    };

    grid.appendChild(div);
  });
}

// ========== CATEGORIAS ==========
async function cargarCategorias() {
  const { data: categorias, error } = await db
    .from("Categorias")
    .select("*")
    .eq("user_id", user.id)
    .order("orden", { ascending: true });

  if (error) {
    console.warn("Categorias:", error.message);
    return;
  }

  ALL_CATEGORIAS = categorias || [];
  renderCategoriasList();

  // Select del form de platos + select del filtro
  actualizarSelectCategorias(ALL_CATEGORIAS);
  fillPlatosCategoriaFilter(ALL_CATEGORIAS);
  renderCategoriaSubcategoriasEditor();
}

function renderCategoriasList() {
  const container = document.getElementById("categoriasContainer");
  if (!container) return;
  container.innerHTML = "";

  if (!ALL_CATEGORIAS.length) {
    container.innerHTML =
      '<div class="empty-state empty-state--panel">No hay categorias. Crea la primera para empezar.</div>';
    if (sortableCategorias) {
      sortableCategorias.destroy();
      sortableCategorias = null;
    }
    return;
  }

  ALL_CATEGORIAS.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "categoria-item" + (cat.activa ? "" : " inactiva");
    div.dataset.id = cat.id;
    const subcategorias = getCategorySubcategories(cat.id);
    const dishesCount = ALL_PLATOS.filter((plato) =>
      getPlatoCategoryIds(plato).includes(Number(cat.id)),
    ).length;
    const subcategoriesHtml = subcategorias.length
      ? `
        <div class="category-card__subsection">
          <div class="category-card__subheading">Subcategorias</div>
          <div class="category-card__sublist">
            ${subcategorias
              .map(
                (item) => `
                  <div class="category-card__subitem">
                    <div class="category-card__subitem-name">${safeText(item.name)}</div>
                    <div class="category-card__subitem-meta">${
                      item.total
                        ? `${item.active}/${item.total} platos activos`
                        : "Sin platos asignados"
                    }</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      `
      : `
        <div class="category-card__subsection">
          <div class="category-card__subheading">Subcategorias</div>
          <div class="category-card__empty">Todavia no hay subcategorias creadas en esta categoria.</div>
        </div>
      `;

    div.innerHTML = `
      <div class="category-card__main">
        <span class="drag-handle">☰</span>

        <div class="category-card__content">
          <div class="category-card__header">
            <div>
              <div class="category-card__title">${safeText(cat.nombre)}</div>
              <div class="category-card__meta">
                <span class="status-pill ${cat.activa ? "is-on" : ""}">${cat.activa ? "Visible" : "Oculta"}</span>
                <span class="meta-pill">${subcategorias.length || 0} subcategorias</span>
                <span class="meta-pill">${dishesCount} platos vinculados</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-editar" data-id="${cat.id}" type="button">Editar</button>
              <button
                class="btn-toggle toggle-switch ${cat.activa ? "is-on" : ""}"
                data-id="${cat.id}"
                type="button"
                aria-label="${cat.activa ? "Ocultar categoria" : "Mostrar categoria"}"
              >
                <span class="toggle-switch__track"><span class="toggle-switch__thumb"></span></span>
                <span class="toggle-switch__label">Activo</span>
              </button>
              <button class="btn-eliminar" data-id="${cat.id}" type="button">Eliminar</button>
            </div>
          </div>

          ${subcategoriesHtml}
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  container
    .querySelectorAll(".btn-editar")
    .forEach((btn) => (btn.onclick = () => editarCategoria(btn.dataset.id)));
  container
    .querySelectorAll(".btn-toggle")
    .forEach((btn) => (btn.onclick = () => toggleCategoria(btn.dataset.id)));
  container
    .querySelectorAll(".btn-eliminar")
    .forEach((btn) => (btn.onclick = () => eliminarCategoria(btn.dataset.id)));

  // Sortable (móvil y PC)
  makeSortableCategorias(container);
}

function actualizarSelectCategorias(categorias) {
  if (!platoCategoria) return;
  const prevSelected = safeText(platoCategoria.value).trim();
  platoCategoria.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent =
    categorias && categorias.length
      ? "Selecciona una categoria"
      : "Crea una categoria primero";
  platoCategoria.appendChild(placeholder);
  platoCategoria.disabled = !(categorias && categorias.length);

  if (!categorias || !categorias.length) {
    platoCategoria.value = "";
    updatePlatoSubcategoriaOptions("");
    return;
  }
  categorias.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    platoCategoria.appendChild(opt);
  });

  if ([...platoCategoria.options].some((option) => option.value === prevSelected)) {
    platoCategoria.value = prevSelected;
  } else {
    platoCategoria.value = "";
  }

  updatePlatoSubcategoriaOptions(platoCategoria.value, platoSubcategoria?.value);
}

function fillPlatosCategoriaFilter(categorias) {
  if (!platosCategoriaFilter) return;

  const prev = platosCategoriaFilter.value;
  platosCategoriaFilter.innerHTML =
    `<option value="">Todas</option>` +
    (categorias || [])
      .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
      .join("");

  // intenta mantener selección previa
  if ([...platosCategoriaFilter.options].some((o) => o.value === prev)) {
    platosCategoriaFilter.value = prev;
  } else {
    platosCategoriaFilter.value = "";
  }
}

function updatePlatoSubcategoriaOptions(categoryId, selectedValue = "") {
  if (!(platoSubcategoria instanceof HTMLSelectElement)) return;
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  const subcategorias =
    normalizedCategoryId != null
      ? getAvailableSubcategoriasForCategoria(normalizedCategoryId)
      : [];

  platoSubcategoria.innerHTML = "";

  if (normalizedCategoryId == null) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Selecciona una categoria primero";
    platoSubcategoria.appendChild(option);
    platoSubcategoria.disabled = true;
    if (platoSubcategoriaHint) {
      platoSubcategoriaHint.textContent =
        "Selecciona una categoria para ver sus subcategorias.";
    }
    return;
  }

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = subcategorias.length
    ? "Sin subcategoria"
    : "No hay subcategorias creadas";
  platoSubcategoria.appendChild(emptyOption);

  subcategorias.forEach((subcat) => {
    const option = document.createElement("option");
    option.value = subcat;
    option.textContent = subcat;
    platoSubcategoria.appendChild(option);
  });

  platoSubcategoria.disabled = subcategorias.length === 0;
  if (platoSubcategoriaHint) {
    platoSubcategoriaHint.textContent = subcategorias.length
      ? "Solo se muestran las subcategorias de la categoria seleccionada."
      : "Esta categoria no tiene subcategorias creadas todavia.";
  }

  const normalizedSelected = normalizeSubcategoriaLabel(selectedValue);
  const matchingOption = [...platoSubcategoria.options].find(
    (option) => normalizeSubcategoriaLabel(option.value) === normalizedSelected,
  );
  platoSubcategoria.value = matchingOption ? matchingOption.value : "";
}

function editarCategoria(id) {
  const cat = ALL_CATEGORIAS.find((c) => String(c.id) === String(id));
  editCategoriaId.value = id;
  categoriaNombre.value = cat?.nombre || "";
  categoriaFormTitle.textContent = "Editar categoria";
  cancelCategoriaBtn.style.display = "";
  renderCategoriaSubcategoriasEditor();
  categoriaSubcategoriaNombre?.focus();
}

cancelCategoriaBtn.onclick = () => {
  editCategoriaId.value = "";
  categoriaNombre.value = "";
  categoriaFormTitle.textContent = "Nueva categoria";
  cancelCategoriaBtn.style.display = "none";
  renderCategoriaSubcategoriasEditor();
};

guardarCategoriaBtn.onclick = async () => {
  const nombre = categoriaNombre.value.trim();
  if (!nombre) return alert("Pon un nombre");

  const id = editCategoriaId.value;
  if (id) {
    await db.from("Categorias").update({ nombre }).eq("id", id);
  } else {
    // orden al final
    const nextOrden = ALL_CATEGORIAS.length;
    await db
      .from("Categorias")
      .insert({ nombre, user_id: user.id, activa: true, orden: nextOrden });
  }

  cancelCategoriaBtn.onclick();
  await cargarCategorias();
  await cargarPlatos();
};

async function addCategoriaSubcategoria() {
  const categoryId = safeText(editCategoriaId?.value).trim();
  if (!categoryId) {
    alert("Primero edita una categoria para anadir subcategorias.");
    return;
  }

  const nuevoNombre = safeText(categoriaSubcategoriaNombre?.value).trim();
  if (!nuevoNombre) {
    alert("Escribe un nombre para la subcategoria.");
    return;
  }

  const current = getConfiguredSubcategoriasByCategoria(categoryId);
  const alreadyExists = getCategorySubcategories(categoryId).some(
    (entry) =>
      normalizeSubcategoriaLabel(entry.name) === normalizeSubcategoriaLabel(nuevoNombre),
  );
  if (alreadyExists) {
    alert("Esa subcategoria ya existe en esta categoria.");
    return;
  }

  SUBCATEGORIAS_POR_CATEGORIA[normalizeSubcategoriaCategoryKey(categoryId)] = [
    ...current,
    nuevoNombre,
  ];

  try {
    await persistSubcategoriasCatalog();
    if (categoriaSubcategoriaNombre) categoriaSubcategoriaNombre.value = "";
    renderCategoriaSubcategoriasEditor();
    renderCategoriasList();
    updatePlatoSubcategoriaOptions(platoCategoria?.value);
  } catch (error) {
    alert(error?.message || "No se pudo guardar la subcategoria.");
  }
}

async function toggleCategoria(id) {
  const cat = ALL_CATEGORIAS.find((c) => String(c.id) === String(id));
  await db.from("Categorias").update({ activa: !cat.activa }).eq("id", id);
  await cargarCategorias();
}

async function eliminarCategoria(id) {
  if (
    !confirm("¿Eliminar categoría? También se quedarán platos sin categoría.")
  )
    return;
  if (idsEqual(editCategoriaId?.value, id)) {
    cancelCategoriaBtn.onclick();
  }
  await db.from("Categorias").delete().eq("id", id);
  delete SUBCATEGORIAS_POR_CATEGORIA[normalizeSubcategoriaCategoryKey(id)];
  try {
    await persistSubcategoriasCatalog();
  } catch (error) {
    alert(error?.message || "No se pudo limpiar las subcategorias de la categoria.");
  }
  await cargarCategorias();
  await cargarPlatos();
}

function makeSortableCategorias(container) {
  if (!window.Sortable) return;

  if (sortableCategorias) {
    sortableCategorias.destroy();
    sortableCategorias = null;
  }

  sortableCategorias = Sortable.create(container, {
    animation: 150,
    handle: ".drag-handle",
    ghostClass: "drag-ghost",
    onEnd: async () => {
      const items = [...container.querySelectorAll(".categoria-item")];
      for (let i = 0; i < items.length; i++) {
        const id = items[i].dataset.id;
        await db.from("Categorias").update({ orden: i }).eq("id", id);
      }
      await cargarCategorias();
    },
  });
}

// ========== PLATOS ==========
function resetPlatoForm() {
  editPlatoId.value = "";
  platoNombre.value = "";
  platoDescripcion.value = "";
  platoPrecio.value = "";
  if (platoCategoria) platoCategoria.value = "";
  updatePlatoSubcategoriaOptions("");
  setPlatoImageFromUrl("", { status: "Sin imagen seleccionada." });
  platoFormTitle.textContent = "Nuevo plato";
  cancelPlatoBtn.style.display = "none";
  alergenosSeleccionados = [];
  cargarAlergenosGrid();
  if (platoEditAside) platoEditAside.style.display = "none";
  if (platoEditAsideBody) platoEditAsideBody.innerHTML = "";
}

addCategoriaSubcategoriaBtn?.addEventListener("click", addCategoriaSubcategoria);
categoriaSubcategoriaNombre?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  void addCategoriaSubcategoria();
});

platoCategoria?.addEventListener("change", () => {
  updatePlatoSubcategoriaOptions(platoCategoria.value);
});

platoImagenUrl?.addEventListener("input", () => {
  setPlatoImageFromUrl(platoImagenUrl.value, { clearFile: false });
});

platoImagenFile?.addEventListener("change", () => {
  const f = platoImagenFile.files?.[0];
  if (!f) {
    const keepUrl = safeText(platoImagenUrl?.value).trim();
    if (keepUrl) showPreview(platoImagenPreview, keepUrl);
    return;
  }
  setPlatoImageFromFile(f);
});

platoImagenUploadBtn?.addEventListener("click", () => {
  platoImagenFile?.click();
});

platoImagenGaleriaBtn?.addEventListener("click", () => {
  openPlatoImageGalleryModal();
});

platoImagenClearBtn?.addEventListener("click", () => {
  setPlatoImageFromUrl("", { status: "Imagen eliminada del plato." });
});

platoImagenGalleryBackdrop?.addEventListener("click", closePlatoImageGalleryModal);
platoImagenGalleryClose?.addEventListener("click", closePlatoImageGalleryModal);
platoImagenGalleryRefresh?.addEventListener("click", () => {
  void refreshPlatoImageGallery();
});

cancelPlatoBtn.onclick = resetPlatoForm;

async function cargarPlatos() {
  const { data: platos, error } = await db
    .from("Menu")
    .select("*")
    .eq("user_id", user.id)
    // ayuda a que "Todas" se vea agrupado
    .order("categoria_id", { ascending: true })
    .order("orden", { ascending: true });

  if (error) {
    console.warn("Menu:", error.message);
    return;
  }

  ALL_PLATOS = platos || [];
  renderCategoriasList();
  renderPlatosFiltrados();
  renderMenusCompuestosList();
}

function renderPlatosFiltrados() {
  const catId = platosCategoriaFilter?.value
    ? Number(platosCategoriaFilter.value)
    : null;
  const q = (platosSearch?.value || "").trim().toLowerCase();

  const filtered = ALL_PLATOS.filter((p) => {
    const cats = getPlatoCategoryIds(p);
    const okCat = !catId || cats.includes(catId);
    const okQ =
      !q ||
      (p.plato || "").toLowerCase().includes(q) ||
      (p.descripcion || "").toLowerCase().includes(q);
    return okCat && okQ;
  });

  renderPlatosList(filtered);
}

function renderPlatosList(platos) {
  const container = document.getElementById("platosContainer");
  container.innerHTML = "";

  if (!platos || !platos.length) {
    container.innerHTML =
      '<div class="empty-state empty-state--panel">No hay platos con este filtro.</div>';
    if (sortablePlatos) {
      sortablePlatos.destroy();
      sortablePlatos = null;
    }
    return;
  }

  platos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "plato-item" + (p.activo ? "" : " inactiva");
    div.dataset.id = p.id;
    const normalizedDishImage = normalizeAdminAssetUrl(p.imagen_url || "");

    const img = normalizedDishImage
      ? `
        <div class="plato-thumb">
          <img src="${normalizedDishImage}" alt="" onerror="this.style.display='none';this.parentElement.classList.add('plato-thumb--empty')"/>
        </div>
      `
      : '<div class="plato-thumb plato-thumb--empty"></div>';

    const catNames = getPlatoCategoryIds(p)
      .map((id) => categoriaNombreById(id))
      .filter(Boolean);
    const allergenBadges = renderAdminAllergenBadges(p.alergenos);

    div.innerHTML = `
      <div class="plato-card__main">
        <span class="drag-handle">☰</span>
        ${img}

        <div class="plato-card__content">
          <div class="plato-nombre">${safeText(p.plato)}</div>
          <div class="plato-desc">${p.descripcion ? safeText(p.descripcion) : "Sin descripcion."}</div>
          ${allergenBadges}
          <div class="plato-meta">
            ${catNames.map((name) => `<span class="badge-cat">${name}</span>`).join("")}
            ${p.subcategoria ? `<span class="chipmini">${safeText(p.subcategoria)}</span>` : ""}
            ${p.activo ? "" : '<span class="meta-pill">Oculto</span>'}
          </div>
        </div>

        <div class="plato-card__price">
          <div class="plato-precio">${formatMoneyEur(p.precio)}</div>
        </div>

        <div class="plato-actions card-actions plato-card__actions">
          <button class="btn-editar" data-id="${p.id}" type="button">Editar</button>
          <button
            class="btn-toggle toggle-switch ${p.activo ? "is-on" : ""}"
            data-id="${p.id}"
            type="button"
            aria-label="${p.activo ? "Ocultar plato" : "Mostrar plato"}"
          >
            <span class="toggle-switch__track"><span class="toggle-switch__thumb"></span></span>
            <span class="toggle-switch__label">Activo</span>
          </button>
          <button class="btn-eliminar" data-id="${p.id}" type="button">Eliminar</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });

  container
    .querySelectorAll(".btn-editar")
    .forEach((btn) => (btn.onclick = () => editarPlato(btn.dataset.id)));
  container
    .querySelectorAll(".btn-toggle")
    .forEach((btn) => (btn.onclick = () => togglePlato(btn.dataset.id)));
  container
    .querySelectorAll(".btn-eliminar")
    .forEach((btn) => (btn.onclick = () => eliminarPlato(btn.dataset.id)));

  makeSortablePlatos(container);
}

function editarPlato(id) {
  const p = ALL_PLATOS.find((x) => String(x.id) === String(id));
  if (!p) return;

  editPlatoId.value = p.id;
  platoNombre.value = p.plato || "";
  platoDescripcion.value = p.descripcion || "";
  platoPrecio.value = p.precio ?? "";
  const selectedCategoryId = safeText(getPlatoCategoryIds(p)[0] || "");
  if (platoCategoria) platoCategoria.value = selectedCategoryId;
  updatePlatoSubcategoriaOptions(selectedCategoryId, p.subcategoria || "");
  setPlatoImageFromUrl(p.imagen_url || "", {
    status: p.imagen_url
      ? "Mostrando imagen actual del plato."
      : "Este plato no tiene imagen.",
  });

  const existing = Array.isArray(p.alergenos) ? p.alergenos : [];
  alergenosSeleccionados = existing
    .map(normalizeAllergenKey)
    .filter(Boolean)
    .filter((k) => ALERGENOS.includes(k));

  cargarAlergenosGrid();

  // Aside "Editando"
  if (platoEditAside && platoEditAsideBody) {
    const catNames = getPlatoCategoryIds(p)
      .map((id) => categoriaNombreById(id))
      .filter(Boolean);
    const normalizedEditImage = normalizeAdminAssetUrl(p.imagen_url || "");
    const thumb = normalizedEditImage
      ? `<img class="edit-aside-thumb" src="${normalizedEditImage}" alt="" onerror="this.style.display='none';this.parentElement.style.background='transparent'">`
      : `<div class="edit-aside-thumb"></div>`;

    const tags = [];
    catNames.forEach((catName) => tags.push(`<span class="edit-tag">${catName}</span>`));
    if (p.subcategoria)
      tags.push(`<span class="edit-tag">${safeText(p.subcategoria)}</span>`);
    if (p.precio != null)
      tags.push(
        `<span class="edit-tag">${Number(p.precio).toFixed(2)} €</span>`,
      );

    platoEditAsideBody.innerHTML = `
      ${thumb}
      <div class="edit-aside-meta">
        <div class="edit-aside-name">${safeText(p.plato)}</div>
        <div class="edit-aside-tags">${tags.join("")}</div>
      </div>
    `;
    platoEditAside.style.display = "";
  }

  platoFormTitle.textContent = "Editar plato";
  cancelPlatoBtn.style.display = "";
}

async function togglePlato(id) {
  const p = ALL_PLATOS.find((x) => String(x.id) === String(id));
  await db.from("Menu").update({ activo: !p.activo }).eq("id", id);
  await cargarPlatos();
}

async function eliminarPlato(id) {
  if (!confirm("¿Eliminar plato?")) return;
  await db.from("Menu").delete().eq("id", id);
  await cargarPlatos();
}

function makeSortablePlatos(container) {
  if (!window.Sortable) return;

  if (sortablePlatos) {
    sortablePlatos.destroy();
    sortablePlatos = null;
  }

  sortablePlatos = Sortable.create(container, {
    animation: 150,
    handle: ".drag-handle",
    ghostClass: "drag-ghost",
    onEnd: async () => {
      const visibleIds = [...container.querySelectorAll(".plato-item")].map(
        (el) => Number(el.dataset.id),
      );

      // Si hay filtro de categoría, ordenamos SOLO dentro de esa categoría (lo más lógico)
      const catId = platosCategoriaFilter?.value
        ? Number(platosCategoriaFilter.value)
        : null;

      for (let i = 0; i < visibleIds.length; i++) {
        const id = visibleIds[i];
        const plato = ALL_PLATOS.find((p) => Number(p.id) === Number(id));
        if (!plato) continue;

        if (!catId || getPlatoCategoryIds(plato).includes(catId)) {
          await db.from("Menu").update({ orden: i }).eq("id", id);
        }
      }

      await cargarPlatos();
    },
  });
}

guardarPlatoBtn.onclick = async () => {
  const nombre = platoNombre.value.trim();
  if (!nombre) return alert("Pon un nombre");

  const primaryCatId = normalizeCategoryId(platoCategoria?.value);
  if (!primaryCatId) return alert("Selecciona una categoria");

  try {
    const currentUser = await requireUser();
    let imgFinal = platoImagenUrl.value.trim();
    const f = platoImagenFile.files?.[0];
    if (f) {
      imgFinal = await uploadToStorage(f, "platos");
      setPlatoImageFromUrl(imgFinal, {
        status: "Imagen subida y guardada para el plato.",
      });
    }

    const payload = {
      plato: nombre,
      descripcion: platoDescripcion.value.trim() || null,
      precio: platoPrecio.value !== "" ? Number(platoPrecio.value) : null,
      categoria_id: primaryCatId,
      subcategoria: toNullableInputValue(platoSubcategoria?.value),
      imagen_url: imgFinal || null,
      alergenos: alergenosSeleccionados,
      user_id: currentUser.id,
    };

    const id = editPlatoId.value;
    const { error } = id
      ? await db.from("Menu").update(payload).eq("id", id)
      : await db
          .from("Menu")
          .insert({ ...payload, activo: true, orden: 0 });
    if (error) throw error;

    resetPlatoForm();
    await cargarPlatos();
  } catch (e) {
    alert(e.message);
  }
};

// ========== MENUS COMPUESTOS ==========
function isMissingMenusFeatureError(error) {
  const message = safeText(error?.message).toLowerCase();
  if (!message) return false;
  const mentionsMenuTables = [
    "menus",
    "menus_programacion",
    "menus_campos",
    "menus_campos_platos",
  ].some((fragment) => message.includes(fragment));
  const indicatesMissingRelation =
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("relation") ||
    message.includes("not found");
  return mentionsMenuTables && indicatesMissingRelation;
}

function setMenusFeatureAvailability(isAvailable, reason = "") {
  menusFeatureAvailable = Boolean(isAvailable);
  menusFeatureUnavailableReason = menusFeatureAvailable ? "" : safeText(reason).trim();

  if (openMenuEditorBtn instanceof HTMLButtonElement) {
    openMenuEditorBtn.disabled = !menusFeatureAvailable;
    openMenuEditorBtn.title = menusFeatureAvailable
      ? ""
      : menusFeatureUnavailableReason || "Menus no esta disponible.";
  }

  if (!menusFeatureAvailable) {
    closeMenuDishPicker();
    closeMenuEditor();
  }
}

function ensureMenusFeatureAvailable() {
  if (menusFeatureAvailable) return true;
  alert(
    menusFeatureUnavailableReason ||
      "La funcionalidad Menus no esta disponible en esta base de datos.",
  );
  return false;
}

function getMenuCompuestoById(menuId) {
  return ALL_MENUS_COMPUESTOS.find((menu) => idsEqual(menu?.id, menuId)) || null;
}

function getMenuCamposByMenuId(menuId) {
  return (ALL_MENUS_CAMPOS || [])
    .filter((campo) => idsEqual(campo?.menu_id, menuId))
    .sort((a, b) => {
      const ao = Number(a?.orden) || 0;
      const bo = Number(b?.orden) || 0;
      if (ao !== bo) return ao - bo;
      return safeText(a?.id).localeCompare(safeText(b?.id));
    });
}

function getMenuCampoPlatosByCampoId(campoId) {
  return (ALL_MENUS_CAMPOS_PLATOS || [])
    .filter((item) => idsEqual(item?.menu_campo_id, campoId))
    .sort((a, b) => {
      const ao = Number(a?.orden) || 0;
      const bo = Number(b?.orden) || 0;
      if (ao !== bo) return ao - bo;
      return safeText(a?.id).localeCompare(safeText(b?.id));
    });
}

function getMenuProgramacionByMenuId(menuId) {
  return (ALL_MENUS_PROGRAMACION || [])
    .filter(
      (entry) =>
        idsEqual(entry?.menu_id, menuId) &&
        (entry?.activa == null || Boolean(entry?.activa)),
    )
    .sort((a, b) => Number(a?.weekday) - Number(b?.weekday));
}

function getMenuProgramacionWeekdays(menuId) {
  return getMenuProgramacionByMenuId(menuId)
    .map((entry) => normalizeWeekday(entry?.weekday))
    .filter((entry) => entry != null);
}

function getPlatoById(platoId) {
  return ALL_PLATOS.find((plato) => idsEqual(plato?.id, platoId)) || null;
}

function getSortedCatalogDishes() {
  return [...(ALL_PLATOS || [])].sort((a, b) =>
    safeText(a?.plato).localeCompare(safeText(b?.plato), "es", {
      sensitivity: "base",
    }),
  );
}

function formatMenuProgramacionSummary(menuId) {
  const weekdays = getMenuProgramacionWeekdays(menuId);
  if (!weekdays.length) return "Siempre";
  return weekdays.map((day) => getMenuWeekdayLabel(day)).join(", ");
}

function nextMenuEditorFieldKey() {
  menuEditorFieldSeq += 1;
  return `field_${Date.now()}_${menuEditorFieldSeq}`;
}

function createMenuEditorDishEntry(seed = {}) {
  return {
    linkId: seed?.linkId ?? null,
    plato_id: safeText(seed?.plato_id).trim(),
    precio_override:
      seed?.precio_override == null ? "" : safeText(seed?.precio_override).trim(),
    notas: safeText(seed?.notas).trim(),
  };
}

function createMenuEditorField(seed = {}) {
  const dishes = Array.isArray(seed?.dishes)
    ? seed.dishes
        .map((entry) => createMenuEditorDishEntry(entry))
        .filter((entry) => safeText(entry?.plato_id).trim())
    : [];

  return {
    key: safeText(seed?.key).trim() || nextMenuEditorFieldKey(),
    id: seed?.id ?? null,
    nombre: safeText(seed?.nombre),
    descripcion: safeText(seed?.descripcion),
    dishes,
  };
}

function createEmptyMenuEditorState() {
  return {
    id: "",
    nombre: "",
    descripcion: "",
    activo: true,
    weekdays: [],
    fields: [],
  };
}

function setMenuEditorOpen(isOpen) {
  if (!(menuEditorModal instanceof HTMLElement)) return;
  menuEditorModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  syncModalBodyLock();
}

function setMenuDishPickerOpen(isOpen) {
  if (!(menuDishPickerModal instanceof HTMLElement)) return;
  menuDishPickerModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  syncModalBodyLock();
}

function isMenuEditorOpen() {
  return menuEditorModal?.getAttribute("aria-hidden") === "false";
}

function isMenuDishPickerOpen() {
  return menuDishPickerModal?.getAttribute("aria-hidden") === "false";
}

function closeMenuDishPicker() {
  menuDishPickerState = null;
  setMenuDishPickerOpen(false);
}

function closeMenuEditor() {
  closeMenuDishPicker();
  menuEditorState = null;
  setMenuEditorOpen(false);
}

function setMenuEditorWeekdays(values) {
  if (!(menuEditorWeekdays instanceof HTMLElement)) return;
  const selected = new Set(
    (values || [])
      .map((value) => normalizeWeekday(value))
      .filter((value) => value != null),
  );
  menuEditorWeekdays.querySelectorAll("input[type='checkbox']").forEach((input) => {
    const normalized = normalizeWeekday(input.value);
    input.checked = normalized != null && selected.has(normalized);
  });
}

function getMenuEditorWeekdays() {
  if (!(menuEditorWeekdays instanceof HTMLElement)) return [];
  return Array.from(
    menuEditorWeekdays.querySelectorAll("input[type='checkbox']:checked"),
  )
    .map((input) => normalizeWeekday(input.value))
    .filter((value) => value != null)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort((a, b) => a - b);
}

function getMenuEditorFieldByKey(fieldKey) {
  if (!menuEditorState) return null;
  const key = safeText(fieldKey).trim();
  return (
    menuEditorState.fields.find((field) => safeText(field?.key).trim() === key) ||
    null
  );
}

function getMenuEditorFieldDish(field, dishId) {
  if (!field) return null;
  return field.dishes.find((entry) => idsEqual(entry?.plato_id, dishId)) || null;
}

function formatMenuEditorDishMeta(dish) {
  if (!dish) return "Plato no disponible";
  const categories = getPlatoCategoryIds(dish)
    .map((id) => categoriaNombreById(id))
    .filter(Boolean);
  const categoryText = categories.length ? categories.join(" / ") : "Sin categoria";
  const subcat = safeText(dish?.subcategoria).trim();
  return subcat ? `${categoryText} · ${subcat}` : categoryText;
}

function getMenuDishPickerField() {
  return getMenuEditorFieldByKey(menuDishPickerState?.fieldKey);
}

function getDishPickerSelectedCategoryId() {
  const value = Number(menuDishPickerCategoria?.value);
  return Number.isFinite(value) ? value : null;
}

function getDishPickerSelectedSubcategoria() {
  return safeText(menuDishPickerSubcategoria?.value).trim();
}

function fillMenuDishPickerCategoryOptions() {
  if (!(menuDishPickerCategoria instanceof HTMLSelectElement)) return;
  const selectedCategoryId = Number(menuDishPickerState?.categoryId);
  menuDishPickerCategoria.innerHTML = '<option value="">Todas</option>';
  [...(ALL_CATEGORIAS || [])]
    .sort((a, b) =>
      safeText(a?.nombre).localeCompare(safeText(b?.nombre), "es", {
        sensitivity: "base",
      }),
    )
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = safeText(category?.id);
      option.textContent = safeText(category?.nombre).trim() || `Categoria ${category?.id}`;
      menuDishPickerCategoria.appendChild(option);
    });

  if (
    Number.isFinite(selectedCategoryId) &&
    [...menuDishPickerCategoria.options].some(
      (option) => Number(option.value) === selectedCategoryId,
    )
  ) {
    menuDishPickerCategoria.value = safeText(selectedCategoryId);
  } else {
    menuDishPickerCategoria.value = "";
    if (menuDishPickerState) menuDishPickerState.categoryId = null;
  }
}

function fillMenuDishPickerSubcategoriaOptions() {
  if (!(menuDishPickerSubcategoria instanceof HTMLSelectElement)) return;
  const selectedCategoryId = getDishPickerSelectedCategoryId();
  const selectedSubcategoria = safeText(menuDishPickerState?.subcategoria).trim();
  const subcategorias = Array.from(
    new Set(
      (ALL_PLATOS || [])
        .filter((dish) =>
          selectedCategoryId == null ? true : getPlatoCategoryIds(dish).includes(selectedCategoryId),
        )
        .map((dish) => safeText(dish?.subcategoria).trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  menuDishPickerSubcategoria.innerHTML = '<option value="">Todas</option>';
  subcategorias.forEach((subcategoria) => {
    const option = document.createElement("option");
    option.value = subcategoria;
    option.textContent = subcategoria;
    menuDishPickerSubcategoria.appendChild(option);
  });

  if (
    selectedSubcategoria &&
    [...menuDishPickerSubcategoria.options].some(
      (option) => option.value === selectedSubcategoria,
    )
  ) {
    menuDishPickerSubcategoria.value = selectedSubcategoria;
  } else {
    menuDishPickerSubcategoria.value = "";
    if (menuDishPickerState) menuDishPickerState.subcategoria = "";
  }
}

function getMenuDishPickerFilteredDishes() {
  const selectedCategoryId = getDishPickerSelectedCategoryId();
  const selectedSubcategoria = getDishPickerSelectedSubcategoria();

  return getSortedCatalogDishes().filter((dish) => {
    const matchesCategory =
      selectedCategoryId == null ||
      getPlatoCategoryIds(dish).includes(selectedCategoryId);
    if (!matchesCategory) return false;
    if (!selectedSubcategoria) return true;
    return safeText(dish?.subcategoria).trim() === selectedSubcategoria;
  });
}

function renderMenuDishPickerList() {
  if (!(menuDishPickerList instanceof HTMLElement)) return;
  const field = getMenuDishPickerField();
  if (!field) {
    menuDishPickerList.innerHTML =
      '<div class="empty-state">Selecciona un campo antes de anadir platos.</div>';
    return;
  }

  const filteredDishes = getMenuDishPickerFilteredDishes();
  const selectedDishIds = new Set(
    (field.dishes || [])
      .map((entry) => safeText(entry?.plato_id).trim())
      .filter(Boolean),
  );

  if (!filteredDishes.length) {
    menuDishPickerList.innerHTML =
      '<div class="empty-state">No hay platos para ese filtro.</div>';
    return;
  }

  menuDishPickerList.innerHTML = filteredDishes
    .map((dish) => {
      const dishId = safeText(dish?.id).trim();
      const dishName = safeText(dish?.plato).trim() || `Plato #${dishId}`;
      const checked = selectedDishIds.has(dishId);
      return `
        <label class="menu-dish-picker-item${checked ? " is-selected" : ""}">
          <input
            type="checkbox"
            class="menu-check-input"
            data-role="picker-dish-toggle"
            data-field-key="${escapeHtml(field.key)}"
            data-dish-id="${escapeHtml(dishId)}"
            ${checked ? "checked" : ""}
          />
          <span class="menu-dish-picker-main">
            <span class="menu-dish-picker-name">${escapeHtml(dishName)}</span>
            <span class="menu-dish-picker-meta">${escapeHtml(formatMenuEditorDishMeta(dish))}</span>
          </span>
          <span class="menu-dish-picker-price">${escapeHtml(formatMoneyEur(dish?.precio) || "Sin precio")}</span>
        </label>
      `;
    })
    .join("");

  menuDishPickerList
    .querySelectorAll("[data-role='picker-dish-toggle']")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const targetField = getMenuEditorFieldByKey(checkbox.dataset.fieldKey);
        if (!targetField) return;
        const dishId = safeText(checkbox.dataset.dishId).trim();
        if (!dishId) return;

        if (checkbox.checked) {
          if (!getMenuEditorFieldDish(targetField, dishId)) {
            targetField.dishes.push(createMenuEditorDishEntry({ plato_id: dishId }));
          }
        } else {
          targetField.dishes = targetField.dishes.filter(
            (entry) => !idsEqual(entry?.plato_id, dishId),
          );
        }

        renderMenuEditorFields();
        renderMenuDishPickerList();
      });
    });
}

function openMenuDishPicker(fieldKey) {
  const field = getMenuEditorFieldByKey(fieldKey);
  if (!field) return;

  menuDishPickerState = {
    fieldKey: safeText(field.key).trim(),
    categoryId: null,
    subcategoria: "",
  };

  if (menuDishPickerTitle) {
    const fieldName = safeText(field.nombre).trim() || "Sin nombre";
    menuDishPickerTitle.textContent = `Seleccionar platos · ${fieldName}`;
  }

  fillMenuDishPickerCategoryOptions();
  fillMenuDishPickerSubcategoriaOptions();
  renderMenuDishPickerList();
  setMenuDishPickerOpen(true);
}

function renderMenuEditorFields() {
  if (!(menuEditorCamposContainer instanceof HTMLElement)) return;
  if (!menuEditorState) {
    menuEditorCamposContainer.innerHTML = "";
    return;
  }

  const fields = Array.isArray(menuEditorState.fields) ? menuEditorState.fields : [];

  if (!fields.length) {
    menuEditorCamposContainer.innerHTML =
      '<div class="empty-state">No hay campos todavia. Pulsa "+ Campo".</div>';
    return;
  }

  menuEditorCamposContainer.innerHTML = fields
    .map((field) => {
      const fieldTitle = safeText(field?.nombre).trim() || "Sin nombre";
      const selectedCount = field.dishes.length;
      const selectedDishRows = (field.dishes || [])
        .map((entry) => {
          const dishId = safeText(entry?.plato_id).trim();
          if (!dishId) return "";
          const dish = getPlatoById(dishId);
          const dishName = safeText(dish?.plato).trim() || `Plato #${dishId}`;
          const overrideValue = safeText(entry?.precio_override).trim();
          return `
            <div class="menu-selected-dish-row">
              <div class="menu-selected-dish-main">
                <span class="menu-selected-dish-name">${escapeHtml(dishName)}</span>
                <span class="menu-selected-dish-meta">${escapeHtml(formatMenuEditorDishMeta(dish))}</span>
              </div>
              <label class="field menu-selected-dish-price-field">
                Precio en menu
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Base"
                  data-role="dish-price"
                  data-field-key="${escapeHtml(field.key)}"
                  data-dish-id="${escapeHtml(dishId)}"
                  value="${escapeHtml(overrideValue)}"
                />
              </label>
              <button
                type="button"
                class="btn-eliminar"
                data-role="dish-remove"
                data-field-key="${escapeHtml(field.key)}"
                data-dish-id="${escapeHtml(dishId)}"
              >
                Quitar
              </button>
            </div>
          `;
        })
        .filter(Boolean)
        .join("");

      return `
        <article class="menu-editor-field" data-field-key="${escapeHtml(field.key)}">
          <div class="menu-editor-field-top">
            <strong data-role="field-title">${escapeHtml(fieldTitle)}</strong>
            <span class="menu-chip">${selectedCount} platos</span>
            <button
              type="button"
              class="btn-editar"
              data-role="field-add-dishes"
              data-field-key="${escapeHtml(field.key)}"
            >
              + Anadir platos
            </button>
            <button
              type="button"
              class="btn-eliminar"
              data-role="field-delete"
              data-field-key="${escapeHtml(field.key)}"
            >
              Eliminar campo
            </button>
          </div>

          <div class="grid-2">
            <label class="field">
              Nombre del campo
              <input
                data-role="field-name"
                data-field-key="${escapeHtml(field.key)}"
                value="${escapeHtml(safeText(field.nombre))}"
                placeholder="Ej: Principal"
              />
            </label>
            <label class="field">
              Descripcion (opcional)
              <input
                data-role="field-description"
                data-field-key="${escapeHtml(field.key)}"
                value="${escapeHtml(safeText(field.descripcion))}"
                placeholder="Opcional"
              />
            </label>
          </div>

          <div class="menu-field-dishes-list">
            ${
              selectedDishRows ||
              '<div class="empty-state">No has seleccionado platos en este campo.</div>'
            }
          </div>
        </article>
      `;
    })
    .join("");

  menuEditorCamposContainer.querySelectorAll("[data-role='field-name']").forEach((input) => {
    input.addEventListener("input", () => {
      const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
      if (!field) return;
      field.nombre = input.value;
      const card = input.closest(".menu-editor-field");
      const titleNode = card?.querySelector("[data-role='field-title']");
      if (titleNode) {
        titleNode.textContent = safeText(input.value).trim() || "Sin nombre";
      }
    });
  });

  menuEditorCamposContainer
    .querySelectorAll("[data-role='field-description']")
    .forEach((input) => {
      input.addEventListener("input", () => {
        const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
        if (!field) return;
        field.descripcion = input.value;
      });
    });

  menuEditorCamposContainer.querySelectorAll("[data-role='field-delete']").forEach((button) => {
    button.addEventListener("click", () => {
      if (!menuEditorState) return;
      const fieldKey = safeText(button.dataset.fieldKey).trim();
      menuEditorState.fields = menuEditorState.fields.filter(
        (field) => safeText(field?.key).trim() !== fieldKey,
      );
      if (idsEqual(menuDishPickerState?.fieldKey, fieldKey)) {
        closeMenuDishPicker();
      }
      renderMenuEditorFields();
    });
  });

  menuEditorCamposContainer
    .querySelectorAll("[data-role='field-add-dishes']")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const field = getMenuEditorFieldByKey(button.dataset.fieldKey);
        if (!field) return;
        openMenuDishPicker(field.key);
      });
    });

  menuEditorCamposContainer.querySelectorAll("[data-role='dish-remove']").forEach((button) => {
    button.addEventListener("click", () => {
      const field = getMenuEditorFieldByKey(button.dataset.fieldKey);
      if (!field) return;
      const dishId = safeText(button.dataset.dishId).trim();
      field.dishes = field.dishes.filter((entry) => !idsEqual(entry?.plato_id, dishId));
      renderMenuEditorFields();
      if (isMenuDishPickerOpen() && idsEqual(menuDishPickerState?.fieldKey, field.key)) {
        renderMenuDishPickerList();
      }
    });
  });

  menuEditorCamposContainer.querySelectorAll("[data-role='dish-price']").forEach((input) => {
    input.addEventListener("input", () => {
      const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
      if (!field) return;
      const entry = getMenuEditorFieldDish(field, input.dataset.dishId);
      if (!entry) return;
      entry.precio_override = safeText(input.value).trim();
    });
  });
}

function applyMenuEditorStateToForm() {
  if (!menuEditorState) return;

  if (menuEditorTitle) {
    menuEditorTitle.textContent = menuEditorState.id ? "Editar menu" : "Nuevo menu";
  }
  if (menuEditorId) menuEditorId.value = safeText(menuEditorState.id);
  if (menuEditorNombre) menuEditorNombre.value = safeText(menuEditorState.nombre);
  if (menuEditorDescripcion) {
    menuEditorDescripcion.value = safeText(menuEditorState.descripcion);
  }
  if (menuEditorActivo) menuEditorActivo.checked = Boolean(menuEditorState.activo);
  setMenuEditorWeekdays(menuEditorState.weekdays);
  if (menuEditorDeleteBtn) {
    menuEditorDeleteBtn.style.display = menuEditorState.id ? "" : "none";
  }
  renderMenuEditorFields();
}

function openMenuEditorForCreate() {
  if (!ensureMenusFeatureAvailable()) return;
  menuEditorState = createEmptyMenuEditorState();
  applyMenuEditorStateToForm();
  setMenuEditorOpen(true);
  menuEditorNombre?.focus();
}

function openMenuEditorForEdit(menuId) {
  if (!ensureMenusFeatureAvailable()) return;
  const menu = getMenuCompuestoById(menuId);
  if (!menu) return;

  const fields = getMenuCamposByMenuId(menu.id).map((field) => {
    const dishes = getMenuCampoPlatosByCampoId(field.id).map((item) =>
      createMenuEditorDishEntry({
        linkId: item.id,
        plato_id: item.plato_id,
        precio_override: item.precio_override,
        notas: item.notas,
      }),
    );
    return createMenuEditorField({
      id: field.id,
      nombre: field.nombre,
      descripcion: field.descripcion,
      dishes,
    });
  });

  menuEditorState = {
    id: safeText(menu.id).trim(),
    nombre: safeText(menu.nombre),
    descripcion: safeText(menu.descripcion),
    activo: menu?.activo == null ? true : Boolean(menu.activo),
    weekdays: getMenuProgramacionWeekdays(menu.id),
    fields,
  };

  applyMenuEditorStateToForm();
  setMenuEditorOpen(true);
  menuEditorNombre?.focus();
}

function renderMenusCompuestosList() {
  if (!(menusCompuestosContainer instanceof HTMLElement)) return;
  menusCompuestosContainer.innerHTML = "";

  if (!menusFeatureAvailable) {
    menusCompuestosContainer.innerHTML = `
      <div class="empty-state empty-state--panel">
        ${escapeHtml(
          menusFeatureUnavailableReason ||
            "Menus no esta disponible en esta instalacion porque faltan las tablas necesarias.",
        )}
      </div>
    `;
    return;
  }

  if (!ALL_MENUS_COMPUESTOS.length) {
    menusCompuestosContainer.innerHTML =
      '<div class="empty-state">Todavia no hay menus compuestos. Pulsa "Nuevo menu".</div>';
    return;
  }

  ALL_MENUS_COMPUESTOS.forEach((menu) => {
    const isActive = menu?.activo == null || Boolean(menu?.activo);
    const isPublished = menu?.publicado == null || Boolean(menu?.publicado);
    const weekdays = getMenuProgramacionWeekdays(menu?.id);
    const scheduleText = weekdays.length
      ? `Dias: ${formatMenuProgramacionSummary(menu?.id)}`
      : "";

    const div = document.createElement("article");
    div.className = "menu-compuesto-item" + (isActive ? "" : " inactiva");
    div.dataset.id = safeText(menu?.id);
    div.innerHTML = `
      <div class="menu-row-head">
        <div>
          <div class="menu-row-title">${escapeHtml(safeText(menu?.nombre) || "Menu sin nombre")}</div>
          <div class="menu-row-desc">${escapeHtml(safeText(menu?.descripcion || ""))}</div>
        </div>
      </div>
      <div class="menu-row-meta">
        <span class="menu-chip ${isActive ? "is-positive" : ""}">${isActive ? "Activo" : "Inactivo"}</span>
        <span class="menu-chip ${isPublished ? "is-positive" : ""}">${isPublished ? "Publicado" : "Oculto"}</span>
        ${scheduleText ? `<span class="menu-chip is-warning">${escapeHtml(scheduleText)}</span>` : ""}
      </div>
      <div class="card-actions menu-row-actions">
        <button class="btn-editar" type="button" data-action="edit" data-id="${escapeHtml(menu?.id)}">Editar</button>
        <button
          class="btn-toggle toggle-switch ${isActive ? "is-on" : ""}"
          type="button"
          data-action="toggle-active"
          data-id="${escapeHtml(menu?.id)}"
          aria-label="${isActive ? "Ocultar menu" : "Mostrar menu"}"
        >
          <span class="toggle-switch__track"><span class="toggle-switch__thumb"></span></span>
          <span class="toggle-switch__label">Activo</span>
        </button>
        <button class="btn-eliminar" type="button" data-action="delete" data-id="${escapeHtml(menu?.id)}">Eliminar</button>
      </div>
    `;
    menusCompuestosContainer.appendChild(div);
  });
}

async function persistMenuProgramacion(menuId, weekdays) {
  const menuIdText = safeText(menuId).trim();
  const { error: deleteError } = await db
    .from("Menus_programacion")
    .delete()
    .eq("menu_id", menuIdText);
  if (deleteError) throw deleteError;

  const normalizedWeekdays = Array.from(
    new Set(
      (weekdays || [])
        .map((day) => normalizeWeekday(day))
        .filter((day) => day != null),
    ),
  ).sort((a, b) => a - b);

  if (!normalizedWeekdays.length) return;

  const payload = normalizedWeekdays.map((weekday, index) => ({
    menu_id: menuIdText,
    weekday,
    activa: true,
    orden: index,
  }));

  const { error } = await db.from("Menus_programacion").insert(payload);
  if (error) throw error;
}

function parseMenuEditorPrice(rawValue, dishName) {
  const raw = safeText(rawValue).trim();
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`El precio de "${dishName}" no es valido.`);
  }
  return Number(amount.toFixed(2));
}

function buildMenuEditorSaveModel() {
  const nombre = safeText(menuEditorNombre?.value).trim();
  if (!nombre) {
    throw new Error("Escribe un nombre para el menu.");
  }

  if (!menuEditorState || !Array.isArray(menuEditorState.fields)) {
    throw new Error("No se pudo leer los campos del menu.");
  }

  const normalizedFields = menuEditorState.fields.map((field, index) => {
    const fieldName = safeText(field?.nombre).trim();
    if (!fieldName) {
      throw new Error(`Escribe el nombre del campo ${index + 1}.`);
    }

    const uniqueDishes = new Map();
    (field?.dishes || []).forEach((entry) => {
      const dishId = safeText(entry?.plato_id).trim();
      if (!dishId) return;
      uniqueDishes.set(dishId, entry);
    });

    const dishes = Array.from(uniqueDishes.values()).map((entry) => {
      const dish = getPlatoById(entry.plato_id);
      const dishLabel =
        safeText(dish?.plato).trim() || `Plato #${safeText(entry?.plato_id)}`;
      return {
        plato_id: safeText(entry?.plato_id).trim(),
        precio_override: parseMenuEditorPrice(entry?.precio_override, dishLabel),
        notas: null,
      };
    });

    if (!dishes.length) {
      throw new Error(`Selecciona al menos un plato en "${fieldName}".`);
    }

    return {
      nombre: fieldName,
      descripcion: toNullableInputValue(field?.descripcion),
      dishes,
    };
  });

  if (!normalizedFields.length) {
    throw new Error("Anade al menos un campo al menu.");
  }

  return {
    id: safeText(menuEditorId?.value).trim(),
    nombre,
    descripcion: toNullableInputValue(menuEditorDescripcion?.value),
    activo: Boolean(menuEditorActivo?.checked),
    weekdays: getMenuEditorWeekdays(),
    fields: normalizedFields,
  };
}

async function persistMenuFieldsAndDishes(menuId, fields) {
  const menuIdText = safeText(menuId).trim();
  const existingFieldIds = getMenuCamposByMenuId(menuIdText)
    .map((field) => field.id)
    .filter(Boolean);

  if (existingFieldIds.length) {
    const { error: deleteDishError } = await db
      .from("Menus_campos_platos")
      .delete()
      .in("menu_campo_id", existingFieldIds);
    if (deleteDishError) throw deleteDishError;
  }

  const { error: deleteError } = await db
    .from("Menus_campos")
    .delete()
    .eq("menu_id", menuIdText);
  if (deleteError) throw deleteError;

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
    const field = fields[fieldIndex];
    const { data: insertedField, error: fieldError } = await db
      .from("Menus_campos")
      .insert({
        menu_id: menuIdText,
        nombre: field.nombre,
        descripcion: field.descripcion,
        orden: fieldIndex,
        activo: true,
        permite_multiples: true,
      })
      .select("id")
      .maybeSingle();

    if (fieldError) throw fieldError;

    const fieldId = safeText(insertedField?.id).trim();
    if (!fieldId) {
      throw new Error("No se pudo crear un campo del menu.");
    }

    const dishPayload = field.dishes.map((dish, dishIndex) => ({
      menu_campo_id: fieldId,
      plato_id: dish.plato_id,
      precio_override: dish.precio_override,
      notas: dish.notas,
      activo: true,
      orden: dishIndex,
    }));

    if (dishPayload.length) {
      const { error: dishError } = await db.from("Menus_campos_platos").insert(dishPayload);
      if (dishError) throw dishError;
    }
  }
}

async function guardarMenuCompuesto() {
  if (!ensureMenusFeatureAvailable()) return;
  if (!menuEditorState) return;

  try {
    const currentUser = await requireUser();
    const model = buildMenuEditorSaveModel();
    const isEditing = Boolean(model.id);
    let menuId = model.id;

    const menuPayload = {
      nombre: model.nombre,
      descripcion: model.descripcion,
      activo: model.activo,
      publicado: true,
      auto_publicacion: model.weekdays.length > 0,
    };

    if (isEditing) {
      const { error } = await db.from("Menus").update(menuPayload).eq("id", menuId);
      if (error) throw error;
    } else {
      const nextOrden = (ALL_MENUS_COMPUESTOS || []).length;
      const { data, error } = await db
        .from("Menus")
        .insert({
          ...menuPayload,
          user_id: currentUser.id,
          orden: nextOrden,
        })
        .select("id")
        .maybeSingle();
      if (error) throw error;
      menuId = safeText(data?.id).trim();
    }

    if (!menuId) {
      throw new Error("No se pudo resolver el id del menu guardado.");
    }

    await persistMenuProgramacion(menuId, model.weekdays);
    await persistMenuFieldsAndDishes(menuId, model.fields);
    await cargarMenusCompuestos();
    closeMenuEditor();
    alert(isEditing ? "Menu actualizado." : "Menu creado.");
  } catch (error) {
    alert(error?.message || "No se pudo guardar el menu.");
  }
}

async function toggleMenuCompuestoActivo(menuId) {
  if (!ensureMenusFeatureAvailable()) return;
  const menu = getMenuCompuestoById(menuId);
  if (!menu) return;
  const activo = !Boolean(menu?.activo);
  const { error } = await db
    .from("Menus")
    .update({ activo })
    .eq("id", safeText(menuId).trim());

  if (error) {
    alert(error?.message || "No se pudo actualizar el menu.");
    return;
  }

  await cargarMenusCompuestos();
}

async function eliminarMenuCompuesto(menuId) {
  if (!ensureMenusFeatureAvailable()) return;
  const menu = getMenuCompuestoById(menuId);
  if (!menu) return;
  if (!confirm(`Eliminar menu "${safeText(menu.nombre)}"?`)) return;

  const menuIdText = safeText(menuId).trim();
  const fieldIds = getMenuCamposByMenuId(menuIdText)
    .map((field) => field.id)
    .filter(Boolean);

  if (fieldIds.length) {
    const { error: dishDeleteError } = await db
      .from("Menus_campos_platos")
      .delete()
      .in("menu_campo_id", fieldIds);
    if (dishDeleteError) {
      alert(dishDeleteError?.message || "No se pudo limpiar los platos del menu.");
      return;
    }
  }

  const { error: fieldsError } = await db
    .from("Menus_campos")
    .delete()
    .eq("menu_id", menuIdText);
  if (fieldsError) {
    alert(fieldsError?.message || "No se pudo eliminar los campos del menu.");
    return;
  }

  const { error: programacionError } = await db
    .from("Menus_programacion")
    .delete()
    .eq("menu_id", menuIdText);
  if (programacionError) {
    alert(programacionError?.message || "No se pudo eliminar la programacion.");
    return;
  }

  const { error } = await db.from("Menus").delete().eq("id", menuIdText);
  if (error) {
    alert(error?.message || "No se pudo eliminar el menu.");
    return;
  }

  if (menuEditorState && idsEqual(menuEditorState.id, menuId)) {
    closeMenuEditor();
  }

  await cargarMenusCompuestos();
  alert("Menu eliminado.");
}

async function cargarMenusCompuestos() {
  try {
    const { data: menus, error: menusError } = await db
      .from("Menus")
      .select("*")
      .eq("user_id", user.id)
      .order("orden", { ascending: true })
      .order("id", { ascending: true });
    if (menusError) throw menusError;
    ALL_MENUS_COMPUESTOS = menus || [];

    const menuIds = ALL_MENUS_COMPUESTOS.map((entry) => entry.id).filter(Boolean);

    if (menuIds.length) {
      const { data: programacion, error: programacionError } = await db
        .from("Menus_programacion")
        .select("*")
        .in("menu_id", menuIds);
      if (programacionError) throw programacionError;
      ALL_MENUS_PROGRAMACION = programacion || [];

      const { data: campos, error: camposError } = await db
        .from("Menus_campos")
        .select("*")
        .in("menu_id", menuIds);
      if (camposError) throw camposError;
      ALL_MENUS_CAMPOS = campos || [];

      const campoIds = ALL_MENUS_CAMPOS.map((entry) => entry.id).filter(Boolean);
      if (campoIds.length) {
        const { data: campoPlatos, error: campoPlatosError } = await db
          .from("Menus_campos_platos")
          .select("*")
          .in("menu_campo_id", campoIds);
        if (campoPlatosError) throw campoPlatosError;
        ALL_MENUS_CAMPOS_PLATOS = campoPlatos || [];
      } else {
        ALL_MENUS_CAMPOS_PLATOS = [];
      }
    } else {
      ALL_MENUS_PROGRAMACION = [];
      ALL_MENUS_CAMPOS = [];
      ALL_MENUS_CAMPOS_PLATOS = [];
    }

    setMenusFeatureAvailability(true);
  } catch (error) {
    const detail = safeText(error?.message || error);
    if (isMissingMenusFeatureError(error)) {
      setMenusFeatureAvailability(
        false,
        "Menus no esta disponible porque esta base de datos no incluye las tablas de menus compuestos.",
      );
    } else {
      setMenusFeatureAvailability(false, detail || "No se pudo cargar Menus compuestos.");
      console.warn("Menus compuestos:", detail);
    }

    ALL_MENUS_COMPUESTOS = [];
    ALL_MENUS_PROGRAMACION = [];
    ALL_MENUS_CAMPOS = [];
    ALL_MENUS_CAMPOS_PLATOS = [];
  }

  renderMenusCompuestosList();
}

function bindMenusCompuestosListActions() {
  if (!(menusCompuestosContainer instanceof HTMLElement)) return;
  if (menusCompuestosContainer.dataset.boundActions === "1") return;
  menusCompuestosContainer.dataset.boundActions = "1";

  menusCompuestosContainer.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-action]");
    if (!(button instanceof HTMLButtonElement)) return;

    const action = safeText(button.dataset.action).trim();
    const targetId = safeText(button.dataset.id).trim();
    if (!targetId) return;

    if (action === "edit") {
      openMenuEditorForEdit(targetId);
      return;
    }

    if (action === "toggle-active") {
      await toggleMenuCompuestoActivo(targetId);
      return;
    }

    if (action === "delete") {
      await eliminarMenuCompuesto(targetId);
    }
  });
}

function bindMenuEditorActions() {
  openMenuEditorBtn?.addEventListener("click", openMenuEditorForCreate);
  menuEditorAddCampoBtn?.addEventListener("click", () => {
    if (!menuEditorState) return;
    menuEditorState.fields.push(createMenuEditorField({ nombre: "Nuevo campo" }));
    renderMenuEditorFields();
  });
  menuEditorSaveBtn?.addEventListener("click", guardarMenuCompuesto);
  menuEditorDeleteBtn?.addEventListener("click", async () => {
    const menuId = safeText(menuEditorState?.id || menuEditorId?.value).trim();
    if (!menuId) return;
    await eliminarMenuCompuesto(menuId);
  });
  menuEditorNombre?.addEventListener("input", () => {
    if (menuEditorState) menuEditorState.nombre = menuEditorNombre.value;
  });
  menuEditorDescripcion?.addEventListener("input", () => {
    if (menuEditorState) menuEditorState.descripcion = menuEditorDescripcion.value;
  });
  menuEditorActivo?.addEventListener("change", () => {
    if (menuEditorState) menuEditorState.activo = Boolean(menuEditorActivo.checked);
  });
  menuDishPickerCategoria?.addEventListener("change", () => {
    if (!menuDishPickerState) return;
    menuDishPickerState.categoryId = getDishPickerSelectedCategoryId();
    menuDishPickerState.subcategoria = "";
    fillMenuDishPickerSubcategoriaOptions();
    renderMenuDishPickerList();
  });
  menuDishPickerSubcategoria?.addEventListener("change", () => {
    if (!menuDishPickerState) return;
    menuDishPickerState.subcategoria = getDishPickerSelectedSubcategoria();
    renderMenuDishPickerList();
  });
  menuDishPickerDoneBtn?.addEventListener("click", closeMenuDishPicker);
  document.querySelectorAll("[data-menu-editor-close]").forEach((element) => {
    element.addEventListener("click", closeMenuEditor);
  });
  document.querySelectorAll("[data-menu-dish-picker-close]").forEach((element) => {
    element.addEventListener("click", closeMenuDishPicker);
  });
}

bindMenusCompuestosListActions();
bindMenuEditorActions();

// Toolbar listeners
platosCategoriaFilter?.addEventListener("change", renderPlatosFiltrados);
platosSearch?.addEventListener("input", renderPlatosFiltrados);

// ========== INIT ==========
async function cargarTodo() {
  cargarAlergenosGrid();
  if (perfilUid) perfilUid.value = safeText(user?.id);
  await cargarPerfil();
  await cargarCategorias();
  await cargarPlatos();
  await cargarMenusCompuestos();
}

// Si ya hay sesion, auto login
(async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) {
    user = data.session.user;
    loginForm.style.display = "none";
    adminPanel.style.display = "block";
    await cargarTodo();
  }
})();

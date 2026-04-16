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

let alergenosSeleccionados = [];

// Cache para UI (filtro/buscador/badges)
let ALL_CATEGORIAS = [];
let ALL_PLATOS = [];

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

function pickFirst(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value != null && value !== "") return value;
  }
  return null;
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
  const multiRaw = pickFirst(plato, MENU_MULTI_CATEGORY_KEYS);
  const multi = parseCategoryIds(multiRaw);
  if (multi.length) return multi;
  const single = Number(plato?.categoria_id);
  return Number.isFinite(single) ? [single] : [];
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

function getAppBaseHref() {
  const envBase =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.BASE_URL
      : null;
  if (envBase && envBase !== "/")
    return envBase.endsWith("/") ? envBase : `${envBase}/`;
  const baseTag = document.querySelector("base");
  const href = baseTag?.getAttribute("href");
  if (href && href !== "/") return href.endsWith("/") ? href : `${href}/`;
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return "/";
  const last = parts[parts.length - 1];
  if (last.includes(".")) parts.pop();
  return parts.length ? `/${parts.join("/")}/` : "/";
}

const BASE_HREF = getAppBaseHref();

function assetUrl(path) {
  const clean = String(path || "").replace(/^\//, "");
  return new URL(clean, window.location.origin + BASE_HREF).toString();
}

function menuUrlFromSlug(slug) {
  const clean = safeText(slug).trim().replace(/^\//, "");
  if (!clean) return "";
  const baseUrl = new URL(BASE_HREF, window.location.origin);
  baseUrl.searchParams.set("cliente", clean);
  return baseUrl.toString();
}

function showPreview(el, url) {
  if (!el) return;
  if (!url) {
    el.style.display = "none";
    el.innerHTML = "";
    return;
  }
  el.style.display = "";
  el.innerHTML = `<img src="${url}" alt="preview" style="max-width:100%;border-radius:12px;display:block" onerror="this.style.display='none';this.parentElement.style.background='transparent'"/>`;
}

function syncModalBodyLock() {
  const hasOpenModal =
    placeIdModal?.getAttribute("aria-hidden") === "false" ||
    platoImagenGalleryModal?.getAttribute("aria-hidden") === "false" ||
    profileImageGalleryModal?.getAttribute("aria-hidden") === "false";
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

function getCategorySubcategories(categoryId) {
  const bucket = new Map();

  ALL_PLATOS.forEach((plato) => {
    if (!getPlatoCategoryIds(plato).includes(Number(categoryId))) return;
    const name = safeText(plato.subcategoria).trim();
    if (!name) return;

    const current = bucket.get(name) || {
      name,
      total: 0,
      active: 0,
    };
    current.total += 1;
    if (plato.activo) current.active += 1;
    bucket.set(name, current);
  });

  return [...bucket.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
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
    const activeSubcategories = subcategorias.filter((item) => item.active > 0).length;
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
                    <div class="category-card__subitem-meta">${item.active}/${item.total} platos activos</div>
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
          <div class="category-card__empty">Todavia no hay subcategorias detectadas en esta categoria.</div>
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
                <span class="meta-pill">${activeSubcategories}/${subcategorias.length || 0} subcategorias activas</span>
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
  const prevSelected = new Set(
    Array.from(platoCategoria?.selectedOptions || []).map((o) => String(o.value)),
  );
  platoCategoria.innerHTML = "";
  if (!categorias || !categorias.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Crea una categoría primero";
    platoCategoria.appendChild(opt);
    return;
  }
  categorias.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    opt.selected = prevSelected.has(String(c.id));
    platoCategoria.appendChild(opt);
  });
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

function editarCategoria(id) {
  const cat = ALL_CATEGORIAS.find((c) => String(c.id) === String(id));
  editCategoriaId.value = id;
  categoriaNombre.value = cat?.nombre || "";
  categoriaFormTitle.textContent = "Editar categoria";
  cancelCategoriaBtn.style.display = "";
}

cancelCategoriaBtn.onclick = () => {
  editCategoriaId.value = "";
  categoriaNombre.value = "";
  categoriaFormTitle.textContent = "Nueva categoria";
  cancelCategoriaBtn.style.display = "none";
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
  await db.from("Categorias").delete().eq("id", id);
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
  platoSubcategoria.value = "";
  Array.from(platoCategoria?.options || []).forEach((opt) => {
    opt.selected = false;
  });
  setPlatoImageFromUrl("", { status: "Sin imagen seleccionada." });
  platoFormTitle.textContent = "Nuevo plato";
  cancelPlatoBtn.style.display = "none";
  alergenosSeleccionados = [];
  cargarAlergenosGrid();
  if (platoEditAside) platoEditAside.style.display = "none";
  if (platoEditAsideBody) platoEditAsideBody.innerHTML = "";
}

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

    const img = p.imagen_url
      ? `
        <div class="plato-thumb">
          <img src="${p.imagen_url}" alt="" onerror="this.style.display='none';this.parentElement.classList.add('plato-thumb--empty')"/>
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
  platoSubcategoria.value = p.subcategoria || "";
  const selectedCatIds = new Set(getPlatoCategoryIds(p).map((id) => String(id)));
  Array.from(platoCategoria?.options || []).forEach((opt) => {
    opt.selected = selectedCatIds.has(String(opt.value));
  });
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
    const thumb = p.imagen_url
      ? `<img class="edit-aside-thumb" src="${p.imagen_url}" alt="" onerror="this.style.display='none';this.parentElement.style.background='transparent'">`
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

  const selectedCatIds = Array.from(platoCategoria?.selectedOptions || [])
    .map((opt) => Number(opt.value))
    .filter((n) => Number.isFinite(n));
  const primaryCatId = selectedCatIds[0] || null;
  if (!primaryCatId) return alert("Selecciona al menos una categoría");

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
      subcategoria: platoSubcategoria.value.trim() || null,
      imagen_url: imgFinal || null,
      alergenos: alergenosSeleccionados,
      user_id: currentUser.id,
    };

    const id = editPlatoId.value;
    const upsertMenu = (writePayload) =>
      id
        ? db.from("Menu").update(writePayload).eq("id", id)
        : db
            .from("Menu")
            .insert({ ...writePayload, activo: true, orden: 0 });

    const isOptionalMenuCategoriesError = (err) => {
      const msg = safeText(err?.message).toLowerCase();
      const mentionsCategory =
        msg.includes("categ") ||
        msg.includes("category") ||
        msg.includes("categories");
      const isMissingCol =
        msg.includes("column") ||
        msg.includes("does not exist") ||
        msg.includes("schema cache") ||
        msg.includes("unknown");
      const isTypeIssue =
        msg.includes("invalid input syntax") ||
        msg.includes("malformed array") ||
        msg.includes("is of type") ||
        msg.includes("cannot cast");
      return mentionsCategory && (isMissingCol || isTypeIssue);
    };

    const buildMenuCategoryCandidates = (basePayload) => {
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

      for (const key of MENU_MULTI_CATEGORY_KEYS) {
        addCandidate({
          ...basePayload,
          [key]: selectedCatIds,
        });
      }
      for (const key of MENU_MULTI_CATEGORY_KEYS) {
        addCandidate({
          ...basePayload,
          [key]: selectedCatIds.join(","),
        });
      }
      for (const key of MENU_MULTI_CATEGORY_KEYS) {
        addCandidate({
          ...basePayload,
          [key]: JSON.stringify(selectedCatIds),
        });
      }
      return candidates;
    };

    let error = null;
    let categorySaved = false;
    for (const categoryPayload of buildMenuCategoryCandidates(payload)) {
      const { error: categoryErr } = await upsertMenu(categoryPayload);
      if (!categoryErr) {
        categorySaved = true;
        error = null;
        break;
      }
      if (!isOptionalMenuCategoriesError(categoryErr)) {
        error = categoryErr;
        break;
      }
      error = categoryErr;
    }

    if (!categorySaved && !error) {
      const { error: fallbackErr } = await upsertMenu(payload);
      error = fallbackErr || null;
    } else if (!categorySaved && isOptionalMenuCategoriesError(error)) {
      console.warn(
        "Menu sin columna compatible para múltiples categorías. Guardando con categoría principal.",
        error.message,
      );
      const { error: fallbackErr } = await upsertMenu(payload);
      error = fallbackErr || null;
    }
    if (error) throw error;

    resetPlatoForm();
    await cargarPlatos();
  } catch (e) {
    alert(e.message);
  }
};

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

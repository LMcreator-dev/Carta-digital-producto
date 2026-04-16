import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://qozzxdrjwjskmwmxscqj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvenp4ZHJqd2pza213bXhzY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODkyNjgsImV4cCI6MjA4MTU2NTI2OH0.3C_4cTXacx0Gf8eRtBYp2uaNZ61OE4SEEOUTDSW4P98";
const supabase = createClient(supabaseUrl, supabaseKey);

const db = supabase.schema("iMenu");
const dbIcalendar = supabase.schema("iCalendar");
const dbCore = supabase.schema("core");
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
const PROFILE_MENU_THEME_OBJECT_KEYS = [
  "personalizacion_menu",
  "theme_menu",
  "imenu_theme",
];
const PROFILE_THEME_SOURCE_KEYS = [
  "menu_theme_source",
  "theme_source",
  "color_source",
];
const PROFILE_THEME_MODE_KEYS = [
  "menu_theme_mode",
  "theme_mode",
  "mode",
];
const MENU_SUBCATEGORIA_CATALOG_KEYS = [
  "subcategorias_catalogo",
  "subcategorias",
  "subcategories",
];
const MENU_SUBCATEGORIA_BY_CATEGORY_KEYS = [
  "subcategorias_por_categoria",
  "subcategorias_by_category",
  "subcategories_by_category",
];
const MENU_SUBCATEGORIA_STATUS_BY_CATEGORY_KEYS = [
  "subcategorias_estado_por_categoria",
  "subcategorias_status_por_categoria",
  "subcategorias_state_by_category",
  "subcategorias_status_by_category",
];
const MENU_THEME_SOURCE_CUSTOM = "custom";
const MENU_THEME_MODE_DARK = "dark";
const MENU_THEME_MODE_LIGHT = "light";
const MENU_MULTI_CATEGORY_KEYS = [
  "categorias_ids",
  "categoria_ids",
  "category_ids",
  "categories_ids",
  "categorias",
];
const MENU_MULTI_SUBCATEGORY_KEYS = [
  "subcategorias_ids",
  "subcategoria_ids",
  "subcategories_ids",
  "subcategorias",
  "subcategories",
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
let ALL_SUBCATEGORIAS = [];
let SUBCATEGORIAS_POR_CATEGORIA = {};
let SUBCATEGORIAS_STATUS_POR_CATEGORIA = {};
let ALL_MENUS_COMPUESTOS = [];
let ALL_MENUS_PROGRAMACION = [];
let ALL_MENUS_CAMPOS = [];
let ALL_MENUS_CAMPOS_PLATOS = [];
let profileMenuMetadataCache = {};
let menuEditorState = null;
let menuEditorFieldSeq = 0;
let menuDishPickerState = null;
let subcategoriaInlineEdit = null;
let categoriaInlineEdit = null;
let menusFeatureAvailable = true;
let menusFeatureUnavailableReason = "";

// Sortable instances (para destruir/recrear al re-render)
let sortableCategorias = null;
let sortablePlatos = null;

// ========== DOM (LOGIN) ==========
const loginForm = document.getElementById("login-form");
const adminPanel = document.getElementById("admin-panel");
const loginError = document.getElementById("loginError");

// PERFIL
const perfilSlug = document.getElementById("perfilSlug");
const perfilSlugUrl = document.getElementById("perfilSlugUrl");
const copiarPerfilSlugUrlBtn = document.getElementById("copiarPerfilSlugUrlBtn");
const abrirPerfilSlugUrlBtn = document.getElementById("abrirPerfilSlugUrlBtn");
const perfilTelefono = document.getElementById("perfilTelefono");
const perfilDireccion = document.getElementById("perfilDireccion");
const perfilReviewsUrl = document.getElementById("perfilReviewsUrl");
const perfilGooglePlaceId = document.getElementById("perfilGooglePlaceId");
const perfilLogoUrl = document.getElementById("perfilLogoUrl");
const perfilLogoPreview = document.getElementById("perfilLogoPreview");
const perfilWifiName = document.getElementById("perfilWifiName");
const perfilWifiPass = document.getElementById("perfilWifiPass");
const perfilWifiPin = document.getElementById("perfilWifiPin");
const perfilWifiPinPeek = document.getElementById("perfilWifiPinPeek");
const perfilWifiPinStatus = document.getElementById("perfilWifiPinStatus");
const perfilPortadaUrl = document.getElementById("perfilPortadaUrl");
const perfilPortadaPreview = document.getElementById("perfilPortadaPreview");
const perfilPlatoDefaultUrl = document.getElementById("perfilPlatoDefaultUrl");
const perfilPlatoDefaultPreview = document.getElementById(
  "perfilPlatoDefaultPreview",
);
const perfilColorPrincipal = document.getElementById("perfilColorPrincipal");
const perfilColorPrincipalLabel = document.getElementById(
  "perfilColorPrincipalLabel",
);
const menuThemeSourceInputs = Array.from(
  document.querySelectorAll('input[name="menu_theme_source"]'),
);
const menuThemeModeInputs = Array.from(
  document.querySelectorAll('input[name="menu_theme_mode"]'),
);
const menuThemeCustomSection = document.querySelector("[data-menu-theme-custom]");
const colorSwatches = Array.from(
  document.querySelectorAll(".color-swatch[data-color]"),
);

// CATEGORIAS
const editCategoriaId = document.getElementById("editCategoriaId");
const categoriaNombre = document.getElementById("categoriaNombre");
const guardarCategoriaBtn = document.getElementById("guardarCategoriaBtn");
const cancelCategoriaBtn = document.getElementById("cancelCategoriaBtn");
const categoriaFormTitle = document.getElementById("categoria-form-title");

// MENUS COMPUESTOS
const openMenuEditorBtn = document.getElementById("openMenuEditorBtn");
const menusCompuestosContainer = document.getElementById("menusCompuestosContainer");
const menuEditorModal = document.getElementById("menuEditorModal");
const menuEditorTitle = document.getElementById("menuEditorTitle");
const menuEditorId = document.getElementById("menuEditorId");
const menuEditorNombre = document.getElementById("menuEditorNombre");
const menuEditorDescripcion = document.getElementById("menuEditorDescripcion");
const menuEditorActivo = document.getElementById("menuEditorActivo");
const menuEditorWeekdays = document.getElementById("menuEditorWeekdays");
const menuEditorCamposContainer = document.getElementById("menuEditorCamposContainer");
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

// PLATOS (form)
const editPlatoId = document.getElementById("editPlatoId");
const platoNombre = document.getElementById("platoNombre");
const platoDescripcion = document.getElementById("platoDescripcion");
const platoPrecio = document.getElementById("platoPrecio");
const platoCategoriaChecklist = document.getElementById("platoCategoriaChecklist");
const platoSubcategoriaChecklist = document.getElementById(
  "platoSubcategoriaChecklist",
);
const platoSubcategoriaHint = document.getElementById("platoSubcategoriaHint");
const platoFormDock = document.getElementById("platoFormDock");
const platoEditorFormBox = document.getElementById("platoEditorFormBox");
const platoEditorModal = document.getElementById("platoEditorModal");
const platoEditorModalMount = document.getElementById("platoEditorModalMount");
const platoImagenUrl = document.getElementById("platoImagenUrl");
const platoImagenPreview = document.getElementById("platoImagenPreview");
const guardarPlatoBtn = document.getElementById("guardarPlatoBtn");
const cancelPlatoBtn = document.getElementById("cancelPlatoBtn");
const platoFormTitle = document.getElementById("plato-form-title");
const platoEditAside = document.getElementById("platoEditAside");
const platoEditAsideBody = document.getElementById("platoEditAsideBody");

// GALERIA DE IMAGENES
const assetGalleryModal = document.getElementById("assetGalleryModal");
const assetGalleryCloseBtn = document.getElementById("assetGalleryCloseBtn");
const assetGalleryCloseBackdrop = assetGalleryModal?.querySelector(
  "[data-asset-gallery-close]",
);
const assetGalleryTitle = document.getElementById("assetGalleryTitle");
const assetGallerySubtitle = document.getElementById("assetGallerySubtitle");
const assetGalleryStatus = document.getElementById("assetGalleryStatus");
const assetGalleryGrid = document.getElementById("assetGalleryGrid");
const assetGalleryUploadInput = document.getElementById("assetGalleryUploadInput");
const assetGalleryUploadBtn = document.getElementById("assetGalleryUploadBtn");
const assetGalleryRefreshBtn = document.getElementById("assetGalleryRefreshBtn");

// PLATOS (toolbar)
const platosCategoriaFilter = document.getElementById("platosCategoriaFilter");
const platosSearch = document.getElementById("platosSearch");
const adminInlineNotice = document.getElementById("adminInlineNotice");
const NOTICE_AUTO_HIDE_MS = 4600;
const NOTICE_ICONS = {
  success:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7L9 18l-5-5"></path></svg>',
  error:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5"></path><path d="M12 16h.01"></path><path d="M10.29 3.86l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3.14l-8-14a2 2 0 0 0-3.42 0z"></path></svg>',
  info:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16v-4"></path><path d="M12 8h.01"></path><circle cx="12" cy="12" r="9"></circle></svg>',
};
const EDIT_PENCIL_ICON = `
  <svg class="btn-inline-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1025 1023" aria-hidden="true">
    <path fill="currentColor" d="M896.428 1023h-768q-53 0-90.5-37.5T.428 895V127q0-53 37.5-90t90.5-37h576l-128 127h-384q-27 0-45.5 19t-18.5 45v640q0 27 19 45.5t45 18.5h640q27 0 45.5-18.5t18.5-45.5V447l128-128v576q0 53-37.5 90.5t-90.5 37.5m-576-464l144 144l-208 64zm208 96l-160-159l479-480q17-16 40.5-16t40.5 16l79 80q16 16 16.5 39.5t-16.5 40.5z"/>
  </svg>
`;
let inlineNoticeTimer = null;

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

function hideInlineNotice() {
  if (!(adminInlineNotice instanceof HTMLElement)) {
    return;
  }
  if (inlineNoticeTimer) {
    window.clearTimeout(inlineNoticeTimer);
    inlineNoticeTimer = null;
  }
  adminInlineNotice.classList.remove("is-visible");
  adminInlineNotice.innerHTML = "";
  adminInlineNotice.removeAttribute("data-variant");
}

function showInlineNotice(
  message,
  variant = "info",
  { autoHideMs = NOTICE_AUTO_HIDE_MS, scrollToTop = false } = {},
) {
  if (scrollToTop) {
    const adminMain = document.querySelector("[data-admin-main-scroll]");
    if (adminMain instanceof HTMLElement) {
      adminMain.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!(adminInlineNotice instanceof HTMLElement)) {
    return;
  }

  const resolvedVariant =
    variant === "success" || variant === "error" ? variant : "info";
  const safeMessage = escapeHtml(message).trim() || "Operacion completada.";
  const icon = NOTICE_ICONS[resolvedVariant] || NOTICE_ICONS.info;

  if (inlineNoticeTimer) {
    window.clearTimeout(inlineNoticeTimer);
    inlineNoticeTimer = null;
  }

  adminInlineNotice.dataset.variant = resolvedVariant;
  adminInlineNotice.innerHTML = `
    <span class="admin-inline-notice-icon">${icon}</span>
    <p class="admin-inline-notice-message">${safeMessage}</p>
    <button type="button" class="admin-inline-notice-close" aria-label="Cerrar notificacion">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
  `;
  adminInlineNotice.classList.add("is-visible");

  const closeBtn = adminInlineNotice.querySelector(".admin-inline-notice-close");
  closeBtn?.addEventListener("click", hideInlineNotice);

  const timeout = Number(autoHideMs) || 0;
  if (timeout > 0) {
    inlineNoticeTimer = window.setTimeout(() => {
      hideInlineNotice();
    }, timeout);
  }
}

function showInlineError(error, fallbackMessage) {
  const detail = safeText(error?.message).trim();
  showInlineNotice(detail || fallbackMessage, "error");
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

function normalizeMenuThemeSource(value) {
  return MENU_THEME_SOURCE_CUSTOM;
}

function normalizeMenuThemeMode(value) {
  return value === MENU_THEME_MODE_LIGHT
    ? MENU_THEME_MODE_LIGHT
    : MENU_THEME_MODE_DARK;
}

function getSelectedMenuThemeSource() {
  const selected = menuThemeSourceInputs.find((input) => input.checked);
  return normalizeMenuThemeSource(selected?.value);
}

function getSelectedMenuThemeMode() {
  const selected = menuThemeModeInputs.find((input) => input.checked);
  return normalizeMenuThemeMode(selected?.value);
}

function setMenuThemeSource(value) {
  const normalized = normalizeMenuThemeSource(value);
  menuThemeSourceInputs.forEach((input) => {
    input.checked = input.value === normalized;
  });
  menuThemeSourceState = normalized;
  syncMenuThemeCustomVisibility();
  return normalized;
}

function setMenuThemeMode(value) {
  const normalized = normalizeMenuThemeMode(value);
  menuThemeModeInputs.forEach((input) => {
    input.checked = input.value === normalized;
  });
  return normalized;
}

function syncMenuThemeCustomVisibility() {
  if (!menuThemeCustomSection) return;
  menuThemeCustomSection.classList.remove("is-hidden");
}

const BASE_HREF = (() => {
  const envBase =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.BASE_URL
      : null;
  if (envBase && envBase !== "/") {
    return envBase.endsWith("/") ? envBase : `${envBase}/`;
  }
  const baseTag = document.querySelector("base");
  const href = baseTag?.getAttribute("href");
  if (href && href !== "/") return href.endsWith("/") ? href : `${href}/`;
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return "/";
  const last = parts[parts.length - 1];
  if (last.includes(".")) parts.pop();
  return parts.length ? `/${parts.join("/")}/` : "/";
})();

function assetUrl(path) {
  const clean = String(path || "").replace(/^\//, "");
  return new URL(clean, window.location.origin + BASE_HREF).toString();
}

function menuUrlFromSlug(slug) {
  const clean = safeText(slug).trim().replace(/^\//, "");
  if (!clean) return "";
  const url = new URL(BASE_HREF, window.location.origin);
  url.searchParams.set("cliente", clean);
  return url.toString();
}

function normalizeSlug(value) {
  const cleaned = safeText(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "";
}

function applySlugFields(slugValue) {
  const normalized = normalizeSlug(slugValue);
  if (perfilSlug) perfilSlug.value = normalized || "-";
  const url = normalized ? menuUrlFromSlug(normalized) : "";
  if (perfilSlugUrl) perfilSlugUrl.value = url;
  if (abrirPerfilSlugUrlBtn) {
    abrirPerfilSlugUrlBtn.href = url || "#";
    abrirPerfilSlugUrlBtn.classList.toggle("is-disabled", !url);
    if (!url) {
      abrirPerfilSlugUrlBtn.setAttribute("aria-disabled", "true");
      abrirPerfilSlugUrlBtn.setAttribute("tabindex", "-1");
    } else {
      abrirPerfilSlugUrlBtn.removeAttribute("aria-disabled");
      abrirPerfilSlugUrlBtn.removeAttribute("tabindex");
    }
  }
  return normalized;
}

let sharedGlobalSlugCache = "";
let sharedCuentaIdCache = "";
let sharedAdminAccentCache = "";
let sharedAdminModeCache = MENU_THEME_MODE_DARK;
let menuThemeSourceState = MENU_THEME_SOURCE_CUSTOM;
let menuThemeCustomAccentState = DEFAULT_PRIMARY_COLOR;
let menuThemeCustomModeState = MENU_THEME_MODE_DARK;

function toNullableInputValue(value) {
  const text = safeText(value).trim();
  return text || null;
}

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
  showInlineNotice(
    menusFeatureUnavailableReason ||
      "La funcionalidad Menus no esta disponible en esta base de datos.",
    "error",
  );
  return false;
}

function pickBusinessValue(coreData, profileData, key) {
  const fromCore = safeText(coreData?.[key]).trim();
  if (fromCore) return fromCore;
  return safeText(profileData?.[key]).trim();
}

function applyBusinessFields(coreData, profileData) {
  if (perfilTelefono) {
    perfilTelefono.value = pickBusinessValue(coreData, profileData, "telefono");
  }
  if (perfilDireccion) {
    perfilDireccion.value = pickBusinessValue(coreData, profileData, "direccion");
  }
  if (perfilReviewsUrl) {
    perfilReviewsUrl.value = pickBusinessValue(coreData, profileData, "reviews_url");
  }
  if (perfilGooglePlaceId) {
    perfilGooglePlaceId.value = pickBusinessValue(
      coreData,
      profileData,
      "google_place_id",
    );
  }
  setImagePickerValue("perfilLogo", pickBusinessValue(coreData, profileData, "logo_url"));
  if (perfilWifiName) {
    perfilWifiName.value = pickBusinessValue(coreData, profileData, "wifi_name");
  }
  if (perfilWifiPass) {
    perfilWifiPass.value = pickBusinessValue(coreData, profileData, "wifi_pass");
  }
}

function hasConfiguredWifiPin(coreData, profileData) {
  const fromCore = safeText(coreData?.wifi_pin).trim();
  const fromProfile = safeText(profileData?.wifi_pin).trim();
  return Boolean(fromCore || fromProfile);
}

function setWifiPinStatus(hasPinConfigured) {
  if (!perfilWifiPinStatus) return;
  perfilWifiPinStatus.textContent = hasPinConfigured
    ? "PIN configurado. Escribe uno nuevo para reemplazarlo."
    : "Sin PIN configurado. Introduce uno para proteger la clave WiFi.";
}

async function resolveAdminAccentColor(userId, { force = false } = {}) {
  const uid = safeText(userId).trim();
  if (!uid) return DEFAULT_PRIMARY_COLOR;
  if (!force && sharedAdminAccentCache) return sharedAdminAccentCache;

  try {
    const { data } = await dbIcalendar
      .from("Perfil")
      .select("*")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();

    const adminTheme = parseJsonObjectValue(data?.personalizacion_admin);
    const fromAdminTheme = normalizeHexColor(adminTheme?.accent);
    const fromPerfilColor = normalizeHexColor(data?.color_principal);
    const resolved = fromAdminTheme || fromPerfilColor || DEFAULT_PRIMARY_COLOR;
    sharedAdminModeCache = normalizeMenuThemeMode(adminTheme?.mode);
    sharedAdminAccentCache = resolved;
    return resolved;
  } catch {
    sharedAdminAccentCache = DEFAULT_PRIMARY_COLOR;
    sharedAdminModeCache = MENU_THEME_MODE_DARK;
    return DEFAULT_PRIMARY_COLOR;
  }
}

function getMenuThemeFromProfile(profileData, adminAccent) {
  const themeObject = parseJsonObjectValue(
    pickFirst(profileData, PROFILE_MENU_THEME_OBJECT_KEYS),
  );
  const accentFromThemeObject = normalizeHexColor(themeObject?.accent);
  const accentFromProfile = normalizeHexColor(
    pickFirst(profileData, PROFILE_PRIMARY_COLOR_KEYS),
  );
  const customAccent =
    accentFromThemeObject ||
    accentFromProfile ||
    normalizeHexColor(adminAccent) ||
    DEFAULT_PRIMARY_COLOR;
  const modeFromObject = normalizeMenuThemeMode(themeObject?.mode);
  const modeFromFlat = normalizeMenuThemeMode(
    safeText(pickFirst(profileData, PROFILE_THEME_MODE_KEYS)).trim().toLowerCase(),
  );
  const hasModeFromObject =
    typeof themeObject?.mode === "string" &&
    (themeObject.mode === MENU_THEME_MODE_DARK ||
      themeObject.mode === MENU_THEME_MODE_LIGHT);
  const hasModeFromFlat = (() => {
    const raw = safeText(pickFirst(profileData, PROFILE_THEME_MODE_KEYS))
      .trim()
      .toLowerCase();
    return raw === MENU_THEME_MODE_DARK || raw === MENU_THEME_MODE_LIGHT;
  })();
  const customMode = hasModeFromObject
    ? modeFromObject
    : hasModeFromFlat
      ? modeFromFlat
      : MENU_THEME_MODE_DARK;

  return {
    source: MENU_THEME_SOURCE_CUSTOM,
    customAccent,
    customMode,
    effectiveMode: customMode,
    effectiveAccent: customAccent,
  };
}

async function resolveSharedCuentaId(userId, profileData = null, { force = false } = {}) {
  const uid = safeText(userId).trim();
  if (!uid) return "";
  if (!force && sharedCuentaIdCache) return sharedCuentaIdCache;

  const fromProfileData = safeText(profileData?.cuenta_id).trim();
  if (fromProfileData) {
    sharedCuentaIdCache = fromProfileData;
    return fromProfileData;
  }

  try {
    const { data } = await db
      .from("Perfil")
      .select("cuenta_id")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();
    const fromProfile = safeText(data?.cuenta_id).trim();
    if (fromProfile) {
      sharedCuentaIdCache = fromProfile;
      return fromProfile;
    }
  } catch {}

  try {
    const { data: membership } = await dbCore
      .from("usuarios_cuenta")
      .select("cuenta_id, estado")
      .eq("user_id", uid)
      .eq("estado", "activo")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const fromMembership = safeText(membership?.cuenta_id).trim();
    if (fromMembership) {
      sharedCuentaIdCache = fromMembership;
      return fromMembership;
    }
  } catch {}

  sharedCuentaIdCache = "";
  return "";
}

async function loadCoreBusinessData(cuentaId) {
  const id = safeText(cuentaId).trim();
  if (!id) return null;
  try {
    const { data, error } = await dbCore
      .from("cuentas")
      .select("telefono, direccion, logo_url")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("core.cuentas:", error.message);
      return null;
    }
    return data || null;
  } catch (error) {
    console.warn("core.cuentas:", error?.message || error);
    return null;
  }
}

async function resolveSharedGlobalSlug(userId, { force = false } = {}) {
  const uid = safeText(userId).trim();
  if (!uid) return "";
  if (!force && sharedGlobalSlugCache) return sharedGlobalSlugCache;

  // 1) Fuente principal: iCalendar.Perfil.slug (slug global de la cuenta).
  try {
    const { data } = await dbIcalendar
      .from("Perfil")
      .select("slug")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();
    const slug = normalizeSlug(data?.slug);
    if (slug) {
      sharedGlobalSlugCache = slug;
      return slug;
    }
  } catch {}

  // 2) Fallback: slug de cuenta global (core.cuentas.slug) via membresia activa.
  try {
    const { data: membership } = await dbCore
      .from("usuarios_cuenta")
      .select("cuenta_id, estado")
      .eq("user_id", uid)
      .eq("estado", "activo")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const cuentaId = membership?.cuenta_id;
    if (cuentaId) {
      const { data: cuenta } = await dbCore
        .from("cuentas")
      .select("slug")
      .eq("id", cuentaId)
      .limit(1)
      .maybeSingle();
      const slug = normalizeSlug(cuenta?.slug);
      if (slug) {
        sharedGlobalSlugCache = slug;
        return slug;
      }
    }
  } catch {}

  // 3) Ultimo fallback: slug ya persistido en iMenu.Perfil.
  try {
    const { data } = await db
      .from("Perfil")
      .select("slug")
      .eq("user_id", uid)
      .limit(1)
      .maybeSingle();
    const slug = normalizeSlug(data?.slug);
    if (slug) {
      sharedGlobalSlugCache = slug;
      return slug;
    }
  } catch {}

  sharedGlobalSlugCache = "";
  return "";
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

const IMAGE_PICKERS = {
  perfilPortada: {
    label: "Portada del local",
    folder: "portadas",
    input: perfilPortadaUrl,
    preview: perfilPortadaPreview,
  },
  perfilLogo: {
    label: "Logo del local",
    folder: "logos",
    input: perfilLogoUrl,
    preview: perfilLogoPreview,
  },
  perfilPlatoDefault: {
    label: "Imagen por defecto de platos",
    folder: "platos-default",
    input: perfilPlatoDefaultUrl,
    preview: perfilPlatoDefaultPreview,
  },
  platoImagen: {
    label: "Imagen del plato",
    folder: "platos",
    input: platoImagenUrl,
    preview: platoImagenPreview,
  },
};

let activeImagePickerKey = "";
let activeImagePickerItems = [];

function getImagePickerConfig(key) {
  return IMAGE_PICKERS[key] || null;
}

function setImagePickerValue(key, url) {
  const config = getImagePickerConfig(key);
  if (!config?.input) return;
  const value = safeText(url).trim();
  config.input.value = value;
  showPreview(config.preview, value || null);
}

function getImagePickerValue(key) {
  const config = getImagePickerConfig(key);
  if (!config?.input) return "";
  return safeText(config.input.value).trim();
}

function isImagePath(name) {
  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(safeText(name).trim());
}

function isImageStorageEntry(entry) {
  const mime = safeText(entry?.metadata?.mimetype).trim().toLowerCase();
  if (mime.startsWith("image/")) return true;
  return isImagePath(entry?.name);
}

function isStorageFolderEntry(entry) {
  const hasMeta = entry?.metadata && typeof entry.metadata === "object";
  if (hasMeta) return false;
  if (entry?.id) return false;
  return !isImagePath(entry?.name);
}

async function listImagesFromStorageFolder(folder) {
  const currentUser = await requireUser();
  const storage = supabase.storage.from(STORAGE_BUCKET);
  const basePath = `${currentUser.id}/${folder}`;
  const pendingPaths = [basePath];
  const files = [];

  while (pendingPaths.length) {
    const path = pendingPaths.shift();
    const { data, error } = await storage.list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      throw new Error(`No se pudo listar imagenes (${folder}): ${error.message}`);
    }

    for (const entry of data || []) {
      const name = safeText(entry?.name).trim();
      if (!name) continue;
      const fullPath = `${path}/${name}`;
      if (isStorageFolderEntry(entry)) {
        pendingPaths.push(fullPath);
        continue;
      }
      if (!isImageStorageEntry(entry)) {
        continue;
      }

      const { data: publicData } = storage.getPublicUrl(fullPath);
      files.push({
        path: fullPath,
        name,
        url: safeText(publicData?.publicUrl).trim(),
        updatedAt: safeText(entry?.updated_at || entry?.created_at).trim(),
      });
    }
  }

  files.sort((a, b) => {
    const ta = Date.parse(a.updatedAt) || 0;
    const tb = Date.parse(b.updatedAt) || 0;
    return tb - ta;
  });
  return files;
}

function closeImageGalleryModal() {
  if (!(assetGalleryModal instanceof HTMLElement)) return;
  assetGalleryModal.setAttribute("aria-hidden", "true");
  activeImagePickerKey = "";
  activeImagePickerItems = [];
}

async function refreshImageGallery({ preserveStatus = false } = {}) {
  const config = getImagePickerConfig(activeImagePickerKey);
  if (!config) return;
  if (!(assetGalleryGrid instanceof HTMLElement)) return;

  if (!preserveStatus && assetGalleryStatus) {
    assetGalleryStatus.textContent = "Cargando imagenes...";
  }

  try {
    const items = await listImagesFromStorageFolder(config.folder);
    activeImagePickerItems = items;
    renderImageGalleryItems();
    if (assetGalleryStatus) {
      assetGalleryStatus.textContent = items.length
        ? `${items.length} imagen(es) disponibles.`
        : "No hay imagenes aun. Sube la primera.";
    }
  } catch (error) {
    if (assetGalleryStatus) {
      assetGalleryStatus.textContent =
        safeText(error?.message).trim() || "No se pudo cargar la galeria.";
    }
    assetGalleryGrid.innerHTML =
      '<div class="empty-state">No se pudo cargar la galeria de imagenes.</div>';
  }
}

function renderImageGalleryItems() {
  if (!(assetGalleryGrid instanceof HTMLElement)) return;
  const selectedUrl = getImagePickerValue(activeImagePickerKey);

  assetGalleryGrid.innerHTML = "";
  if (!activeImagePickerItems.length) {
    assetGalleryGrid.innerHTML =
      '<div class="empty-state">No hay imagenes en esta carpeta.</div>';
    return;
  }

  activeImagePickerItems.forEach((item) => {
    const card = document.createElement("article");
    const isSelected = selectedUrl && selectedUrl === item.url;
    card.className = `asset-gallery-item${isSelected ? " is-selected" : ""}`;
    card.innerHTML = `
      <div class="asset-gallery-thumb-wrap">
        <img src="${item.url}" alt="${escapeHtml(item.name)}" class="asset-gallery-thumb" loading="lazy" />
      </div>
      <p class="asset-gallery-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
      <div class="asset-gallery-item-actions">
        <button type="button" class="secondaryBtn" data-action="select">Seleccionar</button>
        <button type="button" class="btn-eliminar" data-action="delete">Eliminar</button>
      </div>
    `;

    card.querySelector('[data-action="select"]')?.addEventListener("click", () => {
      setImagePickerValue(activeImagePickerKey, item.url);
      renderImageGalleryItems();
      showInlineNotice("Imagen seleccionada.", "success");
    });

    card.querySelector('[data-action="delete"]')?.addEventListener("click", async () => {
      const confirmed = confirm(`Eliminar imagen "${item.name}"?`);
      if (!confirmed) return;

      try {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([item.path]);
        if (error) throw error;

        if (getImagePickerValue(activeImagePickerKey) === item.url) {
          setImagePickerValue(activeImagePickerKey, "");
        }
        await refreshImageGallery({ preserveStatus: true });
        showInlineNotice("Imagen eliminada.", "success");
      } catch (error) {
        showInlineError(error, "No se pudo eliminar la imagen.");
      }
    });

    assetGalleryGrid.appendChild(card);
  });
}

async function openImageGalleryModal(pickerKey) {
  const config = getImagePickerConfig(pickerKey);
  if (!config) return;
  await requireUser();

  activeImagePickerKey = pickerKey;
  if (assetGalleryTitle) {
    assetGalleryTitle.textContent = `Galeria: ${config.label}`;
  }
  if (assetGallerySubtitle) {
    assetGallerySubtitle.textContent = `Carpeta: ${config.folder}`;
  }
  if (assetGalleryUploadInput instanceof HTMLInputElement) {
    assetGalleryUploadInput.value = "";
  }

  if (assetGalleryModal instanceof HTMLElement) {
    assetGalleryModal.setAttribute("aria-hidden", "false");
  }
  await refreshImageGallery();
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

function parseSubcategoriaValues(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeSubcategoriaCatalogValue(item))
      .filter(Boolean);
  }

  const raw = safeText(value).trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => normalizeSubcategoriaCatalogValue(item))
          .filter(Boolean);
      }
    } catch {}
  }

  const normalizedRaw =
    raw.startsWith("{") && raw.endsWith("}")
      ? raw.slice(1, -1)
      : raw;

  return normalizedRaw
    .split(",")
    .map((item) => normalizeSubcategoriaCatalogValue(item))
    .filter(Boolean);
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

function getProfileMenuMetadata(profileData) {
  const metadata = parseJsonObjectValue(
    pickFirst(profileData, PROFILE_MENU_THEME_OBJECT_KEYS),
  );
  return metadata && typeof metadata === "object" ? { ...metadata } : {};
}

function extractSubcategoriasCatalog(profileData) {
  const menuMetadata = getProfileMenuMetadata(profileData);
  const rawCatalog = pickFirst(menuMetadata, MENU_SUBCATEGORIA_CATALOG_KEYS);
  return dedupeSubcategoriasCatalog(Array.isArray(rawCatalog) ? rawCatalog : []);
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

function extractSubcategoriasByCategoria(profileData) {
  const menuMetadata = getProfileMenuMetadata(profileData);
  const rawByCategory = pickFirst(menuMetadata, MENU_SUBCATEGORIA_BY_CATEGORY_KEYS);
  return normalizeSubcategoriasByCategoria(rawByCategory);
}

function normalizeSubcategoriasStatusByCategoria(value) {
  const normalizedMap = {};
  const source = parseJsonObjectValue(value);
  if (!source) return normalizedMap;

  Object.entries(source).forEach(([rawCategoryKey, rawStatus]) => {
    const categoryKey = normalizeSubcategoriaCategoryKey(rawCategoryKey);
    if (!categoryKey) return;
    const statusObject = parseJsonObjectValue(rawStatus);
    if (!statusObject) return;

    const nextStatus = {};
    Object.entries(statusObject).forEach(([rawSubcat, rawActive]) => {
      const normalizedSubcat = normalizeSubcategoriaLabel(rawSubcat);
      if (!normalizedSubcat) return;
      nextStatus[normalizedSubcat] = Boolean(rawActive);
    });

    if (Object.keys(nextStatus).length) {
      normalizedMap[categoryKey] = nextStatus;
    }
  });

  return normalizedMap;
}

function extractSubcategoriasStatusByCategoria(profileData) {
  const menuMetadata = getProfileMenuMetadata(profileData);
  const rawStatus = pickFirst(
    menuMetadata,
    MENU_SUBCATEGORIA_STATUS_BY_CATEGORY_KEYS,
  );
  return normalizeSubcategoriasStatusByCategoria(rawStatus);
}

function normalizeCategoryId(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return numeric;
}

function parseCategoryIdsValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeCategoryId(item))
      .filter((item) => item != null);
  }

  if (typeof value === "number") {
    const normalized = normalizeCategoryId(value);
    return normalized != null ? [normalized] : [];
  }

  const raw = safeText(value).trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => normalizeCategoryId(item))
          .filter((item) => item != null);
      }
    } catch {}
  }

  // Compatibilidad con formato array de PostgreSQL: {1,2,3}
  const normalizedRaw =
    raw.startsWith("{") && raw.endsWith("}")
      ? raw.slice(1, -1)
      : raw;

  return normalizedRaw
    .split(",")
    .map((item) => normalizeCategoryId(item))
    .filter((item) => item != null);
}

function toUniqueCategoryIds(values) {
  return Array.from(
    new Set(
      (values || [])
        .map((item) => normalizeCategoryId(item))
        .filter((item) => item != null),
    ),
  );
}

function getDishPrimaryCategoryId(plato) {
  const primary = normalizeCategoryId(plato?.categoria_id);
  if (primary != null) return primary;
  const all = getDishCategoryIds(plato);
  return all[0] ?? null;
}

function getDishCategoryIds(plato) {
  const fromPrimary = normalizeCategoryId(plato?.categoria_id);
  const ids = fromPrimary != null ? [fromPrimary] : [];

  for (const key of MENU_MULTI_CATEGORY_KEYS) {
    const parsed = parseCategoryIdsValue(plato?.[key]);
    ids.push(...parsed);
  }

  return toUniqueCategoryIds(ids);
}

function platoInCategory(plato, categoryId) {
  const normalized = normalizeCategoryId(categoryId);
  if (normalized == null) return false;
  return getDishCategoryIds(plato).includes(normalized);
}

function getDishCategoryNames(plato) {
  return getDishCategoryIds(plato)
    .map((id) => categoriaNombreById(id))
    .filter(Boolean);
}

function getDishSubcategorias(plato) {
  const values = [];
  const primary = normalizeSubcategoriaCatalogValue(plato?.subcategoria);
  if (primary) values.push(primary);

  MENU_MULTI_SUBCATEGORY_KEYS.forEach((key) => {
    values.push(...parseSubcategoriaValues(plato?.[key]));
  });

  return dedupeSubcategoriasCatalog(values);
}

function getDishPrimarySubcategoria(plato) {
  return getDishSubcategorias(plato)[0] || null;
}

function getSelectedPlatoCategoryIds() {
  if (!(platoCategoriaChecklist instanceof HTMLElement)) return [];
  const checked = Array.from(
    platoCategoriaChecklist.querySelectorAll("input[type='checkbox']:checked"),
  );
  return toUniqueCategoryIds(
    checked.map((input) => normalizeCategoryId(input.value)),
  );
}

function setSelectedPlatoCategoryIds(categoryIds) {
  if (!(platoCategoriaChecklist instanceof HTMLElement)) return;
  const selected = new Set(toUniqueCategoryIds(categoryIds));
  platoCategoriaChecklist
    .querySelectorAll("input[type='checkbox']")
    .forEach((input) => {
      const id = normalizeCategoryId(input.value);
      input.checked = id != null && selected.has(id);
    });
  syncPlatoCategoryChecklistUI();
}

function syncPlatoCategoryChecklistUI() {
  if (!(platoCategoriaChecklist instanceof HTMLElement)) return;
  platoCategoriaChecklist
    .querySelectorAll(".multi-category-option")
    .forEach((option) => {
      const checkbox = option.querySelector("input[type='checkbox']");
      const checked = Boolean(checkbox?.checked);
      option.classList.toggle("is-selected", checked);
      option.setAttribute("aria-checked", checked ? "true" : "false");
    });
}

function getSelectedPlatoSubcategorias() {
  if (!(platoSubcategoriaChecklist instanceof HTMLElement)) return [];
  const checked = Array.from(
    platoSubcategoriaChecklist.querySelectorAll(
      "input[type='checkbox'][data-subcat]:checked",
    ),
  );
  return dedupeSubcategoriasCatalog(
    checked.map((input) => normalizeSubcategoriaCatalogValue(input.value)),
  );
}

function setSelectedPlatoSubcategorias(values) {
  if (!(platoSubcategoriaChecklist instanceof HTMLElement)) return;
  const selected = new Set(
    dedupeSubcategoriasCatalog(values).map((entry) => normalizeSubcategoriaLabel(entry)),
  );
  platoSubcategoriaChecklist
    .querySelectorAll("input[type='checkbox'][data-subcat]")
    .forEach((input) => {
      const normalized = normalizeSubcategoriaLabel(input.value);
      input.checked = normalized ? selected.has(normalized) : false;
    });
  syncPlatoSubcategoriaChecklistUI();
}

function syncPlatoSubcategoriaChecklistUI() {
  if (!(platoSubcategoriaChecklist instanceof HTMLElement)) return;
  platoSubcategoriaChecklist
    .querySelectorAll(".multi-category-option")
    .forEach((option) => {
      const checkbox = option.querySelector("input[type='checkbox']");
      const checked = Boolean(checkbox?.checked);
      option.classList.toggle("is-selected", checked);
      option.setAttribute("aria-checked", checked ? "true" : "false");
    });
}

function onPlatoSubcategoriaCheckboxChange(targetInput) {
  if (!(platoSubcategoriaChecklist instanceof HTMLElement)) return;
  if (!(targetInput instanceof HTMLInputElement)) return;
  const key = safeText(targetInput.dataset.subcat).trim();
  if (!key) {
    syncPlatoSubcategoriaChecklistUI();
    return;
  }

  platoSubcategoriaChecklist
    .querySelectorAll(`input[type='checkbox'][data-subcat='${key}']`)
    .forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      input.checked = targetInput.checked;
    });

  syncPlatoSubcategoriaChecklistUI();
}

function collectSelectableSubcategorias() {
  const selectedCategoryIds = getSelectedPlatoCategoryIds();
  return selectedCategoryIds.map((categoryId) => ({
    id: categoryId,
    nombre: categoriaNombreById(categoryId) || `Categoria ${categoryId}`,
    subcategorias: getSubcategoriasByCategoria(categoryId, {
      includeInactive: false,
    }),
  }));
}

function fillPlatoSubcategoriaOptions({ keepValue, keepValues } = {}) {
  if (!(platoSubcategoriaChecklist instanceof HTMLElement)) return;
  const previousSelection = dedupeSubcategoriasCatalog(
    Array.isArray(keepValues)
      ? keepValues
      : keepValue != null
        ? [keepValue]
        : getSelectedPlatoSubcategorias(),
  );
  const selectedNormalized = new Set(
    previousSelection
      .map((entry) => normalizeSubcategoriaLabel(entry))
      .filter(Boolean),
  );
  const selectedCategoryIds = getSelectedPlatoCategoryIds();
  const hasCategoriesSelected = selectedCategoryIds.length > 0;
  const groupedOptions = collectSelectableSubcategorias();

  platoSubcategoriaChecklist.innerHTML = "";

  if (!hasCategoriesSelected) {
    platoSubcategoriaChecklist.innerHTML =
      '<div class="empty-state">Selecciona una categoria primero.</div>';
    if (platoSubcategoriaHint instanceof HTMLElement) {
      platoSubcategoriaHint.textContent =
        "Primero selecciona al menos una categoria para habilitar subcategorias.";
    }
    return;
  }

  groupedOptions.forEach((group) => {
    const block = document.createElement("div");
    block.className = "subcat-checklist-group";

    const title = document.createElement("div");
    title.className = "subcat-checklist-group-title";
    title.textContent = group.nombre;
    block.appendChild(title);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "multi-category-checklist";

    if (!group.subcategorias.length) {
      const emptyLabel = document.createElement("label");
      emptyLabel.className = "multi-category-option is-selected is-disabled";
      emptyLabel.setAttribute("aria-checked", "true");

      const emptyInput = document.createElement("input");
      emptyInput.type = "checkbox";
      emptyInput.checked = true;
      emptyInput.disabled = true;

      const emptyText = document.createElement("span");
      emptyText.textContent = "Sin subcategorias";

      emptyLabel.appendChild(emptyInput);
      emptyLabel.appendChild(emptyText);
      optionsWrap.appendChild(emptyLabel);
    } else {
      group.subcategorias.forEach((entry) => {
        const normalized = normalizeSubcategoriaLabel(entry);
        if (!normalized) return;
        const label = document.createElement("label");
        label.className = "multi-category-option";
        label.dataset.subcat = normalized;

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = entry;
        input.dataset.subcat = normalized;
        input.checked = selectedNormalized.has(normalized);
        input.addEventListener("change", () =>
          onPlatoSubcategoriaCheckboxChange(input),
        );

        const text = document.createElement("span");
        text.textContent = entry;

        label.appendChild(input);
        label.appendChild(text);
        optionsWrap.appendChild(label);
      });
    }

    block.appendChild(optionsWrap);
    platoSubcategoriaChecklist.appendChild(block);
  });

  syncPlatoSubcategoriaChecklistUI();
  if (platoSubcategoriaHint instanceof HTMLElement) {
    platoSubcategoriaHint.textContent =
      "Puedes seleccionar una o varias subcategorias dentro de las categorias elegidas.";
  }
}

function buildDishPayloadCandidates(basePayload, categoryIds, subcategorias) {
  const ids = toUniqueCategoryIds(categoryIds);
  const subcats = dedupeSubcategoriasCatalog(subcategorias);
  const primaryCategoryId = ids[0] ?? null;
  const primarySubcategoria = subcats[0] ?? null;
  const base = {
    ...basePayload,
    categoria_id: primaryCategoryId,
    subcategoria: primarySubcategoria,
  };

  const candidates = [];
  const signatures = new Set();
  const addCandidate = ({
    payload,
    isBase = false,
    usesMultiCategory = false,
    usesMultiSubcategory = false,
  }) => {
    const signature = JSON.stringify(
      Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)),
    );
    if (signatures.has(signature)) return;
    signatures.add(signature);
    candidates.push({
      payload,
      isBase,
      usesMultiCategory,
      usesMultiSubcategory,
    });
  };

  const categoryVariants = [{ payload: {}, usesMultiCategory: false }];
  const categoryMultiValues = [ids, JSON.stringify(ids), ids.join(",")];
  for (const key of MENU_MULTI_CATEGORY_KEYS) {
    for (const value of categoryMultiValues) {
      categoryVariants.push({
        payload: { [key]: value },
        usesMultiCategory: true,
      });
    }
  }

  const subcategoryVariants = [{ payload: {}, usesMultiSubcategory: false }];
  const subcategoryMultiValues = subcats.length
    ? [subcats, JSON.stringify(subcats), subcats.join(",")]
    : [[], "[]", null];
  for (const key of MENU_MULTI_SUBCATEGORY_KEYS) {
    for (const value of subcategoryMultiValues) {
      subcategoryVariants.push({
        payload: { [key]: value },
        usesMultiSubcategory: true,
      });
    }
  }

  categoryVariants.forEach((categoryVariant) => {
    subcategoryVariants.forEach((subcategoryVariant) => {
      const isBase =
        !categoryVariant.usesMultiCategory && !subcategoryVariant.usesMultiSubcategory;
      addCandidate({
        payload: {
          ...base,
          ...categoryVariant.payload,
          ...subcategoryVariant.payload,
        },
        isBase,
        usesMultiCategory: categoryVariant.usesMultiCategory,
        usesMultiSubcategory: subcategoryVariant.usesMultiSubcategory,
      });
    });
  });

  if (!candidates.some((candidate) => candidate.isBase)) {
    addCandidate({
      payload: base,
      isBase: true,
      usesMultiCategory: false,
      usesMultiSubcategory: false,
    });
  }

  return candidates;
}

function isLikelySchemaMismatch(error) {
  const detail = safeText(error?.message).toLowerCase();
  return (
    detail.includes("column") ||
    detail.includes("does not exist") ||
    detail.includes("schema cache") ||
    detail.includes("unknown")
  );
}

async function writeDishWithPayloadCandidates({
  dishId = null,
  payloadBase,
  categoryIds,
  subcategorias,
  allowPrimaryCategoryFallback = true,
  allowPrimarySubcategoriaFallback = true,
}) {
  const ids = toUniqueCategoryIds(categoryIds);
  const subcats = dedupeSubcategoriasCatalog(subcategorias);
  const requireMultiCategory = ids.length > 1 && !allowPrimaryCategoryFallback;
  const requireMultiSubcategory =
    subcats.length > 1 && !allowPrimarySubcategoriaFallback;

  const candidates = buildDishPayloadCandidates(payloadBase, ids, subcats);
  let lastMultiCategoryError = null;
  let lastMultiSubcategoryError = null;

  for (const candidate of candidates) {
    if (requireMultiCategory && !candidate.usesMultiCategory) {
      continue;
    }
    if (requireMultiSubcategory && !candidate.usesMultiSubcategory) {
      continue;
    }
    if (
      candidate.isBase &&
      (!allowPrimaryCategoryFallback || !allowPrimarySubcategoriaFallback)
    ) {
      continue;
    }

    const writer = dishId
      ? db.from("Menu").update(candidate.payload).eq("id", dishId)
      : db.from("Menu").insert(candidate.payload);
    const { error } = await writer;
    if (!error) {
      return {
        error: null,
        multiCategorySaved: candidate.usesMultiCategory,
        multiSubcategorySaved: candidate.usesMultiSubcategory,
        fallbackToPrimaryOnly: candidate.isBase,
        lastMultiCategoryError,
        lastMultiSubcategoryError,
      };
    }

    const schemaMismatch = isLikelySchemaMismatch(error);
    if (candidate.usesMultiCategory && schemaMismatch) {
      lastMultiCategoryError = error;
      continue;
    }
    if (candidate.usesMultiSubcategory && schemaMismatch) {
      lastMultiSubcategoryError = error;
      continue;
    }
    if (candidate.isBase || (!candidate.usesMultiCategory && !candidate.usesMultiSubcategory)) {
      return {
        error,
        multiCategorySaved: false,
        multiSubcategorySaved: false,
        fallbackToPrimaryOnly: true,
        lastMultiCategoryError,
        lastMultiSubcategoryError,
      };
    }
  }

  const finalError =
    lastMultiSubcategoryError ||
    lastMultiCategoryError ||
    new Error("No se pudo guardar el plato.");

  return {
    error: finalError,
    multiCategorySaved: false,
    multiSubcategorySaved: false,
    fallbackToPrimaryOnly: false,
    lastMultiCategoryError,
    lastMultiSubcategoryError,
  };
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
    setMenuThemeSource(MENU_THEME_SOURCE_CUSTOM);
    const applied = applyAdminTheme(swatch.dataset.color);
    menuThemeCustomAccentState = applied;
  });
});

perfilColorPrincipal?.addEventListener("input", (event) => {
  setMenuThemeSource(MENU_THEME_SOURCE_CUSTOM);
  const applied = applyAdminTheme(event.target?.value);
  menuThemeCustomAccentState = applied;
});

menuThemeSourceInputs.forEach((input) => {
  input.addEventListener("change", async () => {
    const source = getSelectedMenuThemeSource();
    menuThemeSourceState = source;
    syncMenuThemeCustomVisibility();

    applyAdminTheme(menuThemeCustomAccentState || getCurrentPrimaryColor(), {
      persist: false,
    });
  });
});

menuThemeModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    menuThemeCustomModeState = getSelectedMenuThemeMode();
  });
});

applyAdminTheme(activePrimaryColor, { persist: false });
syncMenuThemeCustomVisibility();

copiarPerfilSlugUrlBtn?.addEventListener("click", async () => {
  const targetUrl = safeText(perfilSlugUrl?.value).trim();
  if (!targetUrl) return;
  try {
    await navigator.clipboard.writeText(targetUrl);
    copiarPerfilSlugUrlBtn.textContent = "Copiado";
    window.setTimeout(() => {
      copiarPerfilSlugUrlBtn.textContent = "Copiar";
    }, 1000);
  } catch {
    showInlineNotice("No se pudo copiar la URL.", "error");
  }
});

abrirPerfilSlugUrlBtn?.addEventListener("click", (event) => {
  const href = safeText(abrirPerfilSlugUrlBtn.getAttribute("href")).trim();
  if (!href || href === "#") {
    event.preventDefault();
  }
});

// ========== LOGIN ==========
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (loginError) loginError.textContent = error.message;
      return;
    }
    if (data?.session) {
      await supabase.auth.setSession(data.session);
    }
    user = data.user;
    if (loginForm) loginForm.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
    await cargarTodo();
  };
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    logoutBtn.disabled = true;

    try {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Logout:", e?.message || e);
    } finally {
      window.location.href = "/logout";
    }
  };
}
// ========== TABS ==========
document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    if (safeText(tab.dataset.tab).trim() !== "catalogo" && isPlatoEditorModalOpen()) {
      closePlatoEditorModal({ reset: true });
    }
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    const tabContentId = "tab-" + (tab.dataset.tab || "");
    const content = document.getElementById(tabContentId);
    if (content) {
      content.classList.add("active");
    }
  };
});

// ========== PERFIL ==========
async function cargarPerfil() {
  const sharedSlug = await resolveSharedGlobalSlug(user?.id);
  const adminAccent = await resolveAdminAccentColor(user?.id, { force: false });

  const { data, error } = await db
    .from("Perfil")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Perfil:", error.message);
    return;
  }

  const cuentaId = await resolveSharedCuentaId(user?.id, data || null, {
    force: true,
  });
  const coreBusinessData = await loadCoreBusinessData(cuentaId);
  applyBusinessFields(coreBusinessData, data);
  profileMenuMetadataCache = getProfileMenuMetadata(data);
  ALL_SUBCATEGORIAS = extractSubcategoriasCatalog(data);
  SUBCATEGORIAS_POR_CATEGORIA = extractSubcategoriasByCategoria(data);
  SUBCATEGORIAS_STATUS_POR_CATEGORIA = extractSubcategoriasStatusByCategoria(data);
  fillPlatoSubcategoriaOptions();
  setWifiPinStatus(hasConfiguredWifiPin(coreBusinessData, data));
  if (perfilWifiPin) {
    perfilWifiPin.value = safeText(data?.wifi_pin).trim();
  }

  if (data) {
    applySlugFields(data.slug || sharedSlug);
    setImagePickerValue("perfilPortada", safeText(data.portada_url));
    setImagePickerValue(
      "perfilLogo",
      safeText(pickBusinessValue(coreBusinessData, data, "logo_url")),
    );
    const platoDefaultUrl = safeText(
      pickFirst(data, PROFILE_DISH_PLACEHOLDER_KEYS),
    );
    setImagePickerValue("perfilPlatoDefault", platoDefaultUrl);

    const menuThemeValues = getMenuThemeFromProfile(data, adminAccent);
    menuThemeSourceState = setMenuThemeSource(MENU_THEME_SOURCE_CUSTOM);
    menuThemeCustomAccentState =
      normalizeHexColor(menuThemeValues.customAccent) || DEFAULT_PRIMARY_COLOR;
    menuThemeCustomModeState = setMenuThemeMode(menuThemeValues.customMode);

    if (perfilColorPrincipal) {
      perfilColorPrincipal.value = menuThemeCustomAccentState.toLowerCase();
    }
    if (perfilColorPrincipalLabel) {
      perfilColorPrincipalLabel.textContent = menuThemeCustomAccentState.toUpperCase();
    }

    applyAdminTheme(menuThemeCustomAccentState, { persist: true });
  } else {
    applySlugFields(sharedSlug);
    setImagePickerValue("perfilLogo", safeText(perfilLogoUrl?.value));
    if (perfilWifiPin) perfilWifiPin.value = "";
    setWifiPinStatus(false);
    menuThemeSourceState = setMenuThemeSource(MENU_THEME_SOURCE_CUSTOM);
    menuThemeCustomModeState = setMenuThemeMode(MENU_THEME_MODE_DARK);
    menuThemeCustomAccentState = getCurrentPrimaryColor();
    applyAdminTheme(menuThemeCustomAccentState, { persist: false });
  }
}

perfilWifiPin?.addEventListener("input", () => {
  perfilWifiPin.value = safeText(perfilWifiPin.value).replace(/\D+/g, "").slice(0, 12);
});

function setWifiPinVisible(isVisible) {
  if (!(perfilWifiPin instanceof HTMLInputElement)) return;
  perfilWifiPin.type = isVisible ? "text" : "password";
}

if (perfilWifiPinPeek instanceof HTMLButtonElement) {
  const showPin = (event) => {
    event.preventDefault();
    setWifiPinVisible(true);
  };
  const hidePin = () => {
    setWifiPinVisible(false);
  };

  perfilWifiPinPeek.addEventListener("pointerdown", showPin);
  perfilWifiPinPeek.addEventListener("pointerup", hidePin);
  perfilWifiPinPeek.addEventListener("pointerleave", hidePin);
  perfilWifiPinPeek.addEventListener("pointercancel", hidePin);

  perfilWifiPinPeek.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      showPin(event);
    }
  });
  perfilWifiPinPeek.addEventListener("keyup", hidePin);
  perfilWifiPinPeek.addEventListener("blur", hidePin);
}

document.querySelectorAll("[data-asset-picker-open]").forEach((button) => {
  button.addEventListener("click", async () => {
    const pickerKey = safeText(button.dataset.assetPickerOpen).trim();
    if (!pickerKey) return;
    try {
      await openImageGalleryModal(pickerKey);
    } catch (error) {
      showInlineError(error, "No se pudo abrir la galeria.");
    }
  });
});

assetGalleryCloseBtn?.addEventListener("click", closeImageGalleryModal);
assetGalleryCloseBackdrop?.addEventListener("click", closeImageGalleryModal);
document.querySelectorAll("[data-plato-editor-close]").forEach((element) => {
  element.addEventListener("click", () => closePlatoEditorModal({ reset: true }));
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (assetGalleryModal?.getAttribute("aria-hidden") === "false") {
    closeImageGalleryModal();
    return;
  }
  if (isPlatoEditorModalOpen()) {
    closePlatoEditorModal({ reset: true });
  }
});

assetGalleryRefreshBtn?.addEventListener("click", async () => {
  await refreshImageGallery();
});

assetGalleryUploadBtn?.addEventListener("click", async () => {
  const config = getImagePickerConfig(activeImagePickerKey);
  if (!config) return;
  if (!(assetGalleryUploadInput instanceof HTMLInputElement)) return;

  const file = assetGalleryUploadInput.files?.[0];
  if (!file) {
    if (assetGalleryStatus) {
      assetGalleryStatus.textContent = "Selecciona una imagen para subir.";
    }
    return;
  }

  try {
    if (assetGalleryStatus) {
      assetGalleryStatus.textContent = "Subiendo imagen...";
    }
    const uploadedUrl = await uploadToStorage(file, config.folder);
    setImagePickerValue(activeImagePickerKey, uploadedUrl || "");
    assetGalleryUploadInput.value = "";
    await refreshImageGallery({ preserveStatus: true });
    showInlineNotice("Imagen subida y seleccionada.", "success");
  } catch (error) {
    showInlineError(error, "No se pudo subir la imagen.");
  }
});

document.getElementById("guardarPerfilBtn").onclick = async () => {
  try {
    const currentUser = await requireUser();
    const sharedSlug = await resolveSharedGlobalSlug(currentUser.id, {
      force: true,
    });
    const slugToPersist = normalizeSlug(perfilSlug?.value || sharedSlug);
    applySlugFields(slugToPersist);
    const cuentaId = await resolveSharedCuentaId(currentUser.id, null, {
      force: true,
    });
    const selectedMenuThemeMode = getSelectedMenuThemeMode();
    const primaryColor = getCurrentPrimaryColor();
    const wifiPinValue = safeText(perfilWifiPin?.value).replace(/\s+/g, "");
    if (wifiPinValue && !/^\d{4,12}$/.test(wifiPinValue)) {
      throw new Error("El PIN WiFi debe contener solo numeros (4 a 12 digitos).");
    }
    menuThemeSourceState = MENU_THEME_SOURCE_CUSTOM;
    menuThemeCustomAccentState = primaryColor;
    menuThemeCustomModeState = selectedMenuThemeMode;

    const portadaFinal = getImagePickerValue("perfilPortada");
    const logoFinal = getImagePickerValue("perfilLogo");
    const platoDefaultFinal = getImagePickerValue("perfilPlatoDefault");

    const businessPayload = {
      telefono: toNullableInputValue(perfilTelefono?.value),
      direccion: toNullableInputValue(perfilDireccion?.value),
      reviews_url: toNullableInputValue(perfilReviewsUrl?.value),
      google_place_id: toNullableInputValue(perfilGooglePlaceId?.value),
      logo_url: toNullableInputValue(logoFinal),
      wifi_name: toNullableInputValue(perfilWifiName?.value),
      wifi_pass: toNullableInputValue(perfilWifiPass?.value),
    };

    const payloadBase = {
      user_id: currentUser.id,
      slug: slugToPersist || null,
      portada_url: portadaFinal || null,
      ...businessPayload,
    };
    if (cuentaId) payloadBase.cuenta_id = cuentaId;
    const payload = payloadBase;

    const { data: existing, error: existsErr } = await db
      .from("Perfil")
      .select("user_id, cuenta_id")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (existsErr) throw existsErr;

    const upsertPerfil = (writePayload) =>
      existing
        ? db.from("Perfil").update(writePayload).eq("user_id", currentUser.id)
        : db.from("Perfil").insert(writePayload);

    const platoDefaultValue = platoDefaultFinal || null;
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
        msg.includes("personalizacion_menu") ||
        msg.includes("menu_theme") ||
        msg.includes("theme_source") ||
        msg.includes("theme_mode") ||
        msg.includes("color_source") ||
        msg.includes("plato") ||
        msg.includes("dish") ||
        msg.includes("imagen") ||
        msg.includes("image") ||
        msg.includes("foto") ||
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
      const { error: fallbackErr } = await upsertPerfil(payloadBase);
      error = fallbackErr || null;
    } else if (!optionalSaved && isOptionalProfileColumnError(error)) {
      console.warn(
        "Perfil sin columnas opcionales compatibles (branding / imagen por defecto de platos). Guardando perfil base.",
        error.message,
      );
      const { error: fallbackErr } = await upsertPerfil(payloadBase);
      error = fallbackErr || null;
    }
    if (error) throw error;

    const cuentaIdForCore = await resolveSharedCuentaId(
      currentUser.id,
      { cuenta_id: existing?.cuenta_id || payloadBase.cuenta_id || null },
      { force: true },
    );
    if (cuentaIdForCore) {
      const { error: coreError } = await dbCore
        .from("cuentas")
        .update({
          telefono: businessPayload.telefono,
          direccion: businessPayload.direccion,
          logo_url: businessPayload.logo_url,
        })
        .eq("id", cuentaIdForCore);
      if (coreError) {
        console.warn("core.cuentas update:", coreError.message);
      }
    }

    const menuThemeMetadata = {
      ...profileMenuMetadataCache,
      accent: primaryColor,
      mode: selectedMenuThemeMode,
      subcategorias_catalogo: dedupeSubcategoriasCatalog(ALL_SUBCATEGORIAS),
    };
    const menuThemeCandidates = [
      { personalizacion_menu: menuThemeMetadata },
      { menu_theme_mode: selectedMenuThemeMode },
      { theme_mode: selectedMenuThemeMode },
    ];

    let menuMetadataSaved = false;
    for (let i = 0; i < menuThemeCandidates.length; i++) {
      const candidate = menuThemeCandidates[i];
      const { error: themeError } = await db
        .from("Perfil")
        .update(candidate)
        .eq("user_id", currentUser.id);
      if (!themeError) {
        menuMetadataSaved = i === 0;
        break;
      }
      if (!isOptionalProfileColumnError(themeError)) {
        console.warn("menu theme source:", themeError.message);
        break;
      }
    }
    if (menuMetadataSaved) {
      profileMenuMetadataCache = { ...menuThemeMetadata };
    }

    let wifiPinUpdateError = null;
    if (wifiPinValue) {
      const { error: pinError } = await supabase.rpc("imenu_set_wifi_pin", {
        p_pin: wifiPinValue,
      });
      if (pinError) {
        wifiPinUpdateError = pinError;
      } else {
        setWifiPinStatus(true);
      }
    }

    await cargarPerfil();
    if (wifiPinUpdateError) {
      const detail = safeText(wifiPinUpdateError.message).trim();
      showInlineNotice(
        detail
          ? `Perfil guardado, pero no se pudo actualizar el PIN WiFi: ${detail}`
          : "Perfil guardado, pero no se pudo actualizar el PIN WiFi.",
        "error",
        {
          scrollToTop: true,
        },
      );
      return;
    }
    showInlineNotice("Perfil guardado correctamente.", "success", {
      scrollToTop: true,
    });
  } catch (e) {
    const detail = safeText(e?.message).trim();
    showInlineNotice(detail || "No se pudo guardar el perfil.", "error", {
      scrollToTop: true,
    });
  }
};

// ========== ALERGENOS ==========
function cargarAlergenosGrid() {
  const grid = document.getElementById("alergenosGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const allergenLabels = {
    gluten: "Gluten",
    crustaceos: "Crustaceos",
    huevos: "Huevos",
    pescado: "Pescado",
    cacahuetes: "Cacahuetes",
    soja: "Soja",
    lacteos: "Lacteos",
    frutos_secos: "Frutos secos",
    apio: "Apio",
    mostaza: "Mostaza",
    sesamo: "Sesamo",
    sulfitos: "Sulfitos",
    altramuces: "Altramuces",
    moluscos: "Moluscos",
  };

  ALERGENOS.forEach((a) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "alergeno-item";
    button.dataset.alergeno = a;
    if (alergenosSeleccionados.includes(a)) button.classList.add("selected");

    const imgSrc = assetUrl(`alergenos/${a}.svg`);
    button.innerHTML = `
      <img src="${imgSrc}" alt="${a}" onerror="this.style.display='none'">
      <span>${allergenLabels[a] || a.replace(/_/g, " ")}</span>
    `;

    button.onclick = () => {
      const idx = alergenosSeleccionados.indexOf(a);
      if (idx > -1) {
        alergenosSeleccionados.splice(idx, 1);
        button.classList.remove("selected");
      } else {
        alergenosSeleccionados.push(a);
        button.classList.add("selected");
      }
    };

    grid.appendChild(button);
  });
}

// ========== CATEGORIAS ==========
function pruneSubcategoriasByCategoriaMap() {
  const validCategoryKeys = new Set(
    (ALL_CATEGORIAS || [])
      .map((category) => normalizeSubcategoriaCategoryKey(category?.id))
      .filter(Boolean),
  );
  const normalized = normalizeSubcategoriasByCategoria(SUBCATEGORIAS_POR_CATEGORIA);
  const normalizedStatus = normalizeSubcategoriasStatusByCategoria(
    SUBCATEGORIAS_STATUS_POR_CATEGORIA,
  );
  const next = {};
  const nextStatus = {};

  Object.entries(normalized).forEach(([key, values]) => {
    const normalizedKey = normalizeSubcategoriaCategoryKey(key);
    if (!normalizedKey || !validCategoryKeys.has(normalizedKey)) return;
    if (!values.length) return;
    next[normalizedKey] = values;

    const statusForCategory = normalizedStatus?.[normalizedKey] || {};
    const syncedStatus = {};
    values.forEach((entry) => {
      const normalizedEntry = normalizeSubcategoriaLabel(entry);
      if (!normalizedEntry) return;
      syncedStatus[normalizedEntry] =
        statusForCategory[normalizedEntry] !== false;
    });
    if (Object.keys(syncedStatus).length) {
      nextStatus[normalizedKey] = syncedStatus;
    }
  });

  SUBCATEGORIAS_POR_CATEGORIA = next;
  SUBCATEGORIAS_STATUS_POR_CATEGORIA = nextStatus;
}

function getSubcategoriasStatusMapByCategoria(categoryId) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  if (!key) return {};
  return SUBCATEGORIAS_STATUS_POR_CATEGORIA?.[key] || {};
}

function isSubcategoriaActiva(categoryId, subcategoriaName) {
  const normalized = normalizeSubcategoriaLabel(subcategoriaName);
  if (!normalized) return true;
  const statusMap = getSubcategoriasStatusMapByCategoria(categoryId);
  return statusMap[normalized] !== false;
}

function syncSubcategoriasStatusByCategoria(categoryId, values) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  if (!key) return;
  const deduped = dedupeSubcategoriasCatalog(values);
  if (!deduped.length) {
    delete SUBCATEGORIAS_STATUS_POR_CATEGORIA[key];
    return;
  }

  const prevStatus = normalizeSubcategoriasStatusByCategoria(
    SUBCATEGORIAS_STATUS_POR_CATEGORIA,
  )[key] || {};
  const nextStatus = {};
  deduped.forEach((entry) => {
    const normalizedEntry = normalizeSubcategoriaLabel(entry);
    if (!normalizedEntry) return;
    nextStatus[normalizedEntry] = prevStatus[normalizedEntry] !== false;
  });

  SUBCATEGORIAS_STATUS_POR_CATEGORIA[key] = nextStatus;
}

function setSubcategoriaActiva(categoryId, subcategoriaName, activa) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  const normalized = normalizeSubcategoriaLabel(subcategoriaName);
  if (!key || !normalized) return;
  const base = getSubcategoriasStatusMapByCategoria(key);
  SUBCATEGORIAS_STATUS_POR_CATEGORIA[key] = {
    ...base,
    [normalized]: Boolean(activa),
  };
}

function getSubcategoriasByCategoria(categoryId, { includeInactive = true } = {}) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  const fromMap = (SUBCATEGORIAS_POR_CATEGORIA?.[key] || []).filter(Boolean);
  const fromDishes = (ALL_PLATOS || [])
    .filter((dish) => platoInCategory(dish, categoryId))
    .flatMap((dish) => getDishSubcategorias(dish))
    .filter(Boolean);
  const all = dedupeSubcategoriasCatalog([...fromMap, ...fromDishes]);
  if (includeInactive) return all;
  return all.filter((entry) => isSubcategoriaActiva(categoryId, entry));
}

function setSubcategoriasByCategoria(categoryId, values) {
  const key = normalizeSubcategoriaCategoryKey(categoryId);
  if (!key) return;
  const deduped = dedupeSubcategoriasCatalog(values);
  if (!deduped.length) {
    delete SUBCATEGORIAS_POR_CATEGORIA[key];
    delete SUBCATEGORIAS_STATUS_POR_CATEGORIA[key];
    return;
  }
  SUBCATEGORIAS_POR_CATEGORIA[key] = deduped;
  syncSubcategoriasStatusByCategoria(key, deduped);
}

function isCategoriaBeingEdited(categoryId) {
  return (
    categoriaInlineEdit &&
    idsEqual(categoriaInlineEdit.categoryId, categoryId)
  );
}

function openCategoriaInlineEdit(categoryId) {
  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) return;
  categoriaInlineEdit = {
    categoryId: safeText(categoryId).trim(),
    draft: safeText(category?.nombre).trim(),
  };
  closeSubcategoriaInlineEdit();

  const container = document.getElementById("categoriasContainer");
  if (!(container instanceof HTMLElement)) return;
  renderCategoriasWithSubcategorias(container);
  makeSortableCategorias(container);

  window.requestAnimationFrame(() => {
    const input = container.querySelector(
      `[data-role="categoria-rename-input"][data-cat-id="${safeText(categoryId).trim()}"]`,
    );
    if (input instanceof HTMLInputElement) {
      input.focus();
      input.select();
    }
  });
}

function closeCategoriaInlineEdit() {
  categoriaInlineEdit = null;
}

function isSubcategoriaBeingEdited(categoryId, name) {
  if (!subcategoriaInlineEdit) return false;
  return (
    idsEqual(subcategoriaInlineEdit.categoryId, categoryId) &&
    normalizeSubcategoriaLabel(subcategoriaInlineEdit.originalName) ===
      normalizeSubcategoriaLabel(name)
  );
}

function openSubcategoriaInlineEdit(categoryId, subcategoriaName) {
  const normalizedName = normalizeSubcategoriaCatalogValue(subcategoriaName);
  if (!normalizedName) return;
  closeCategoriaInlineEdit();
  subcategoriaInlineEdit = {
    categoryId: safeText(categoryId).trim(),
    originalName: normalizedName,
    draft: normalizedName,
  };

  const container = document.getElementById("categoriasContainer");
  if (!(container instanceof HTMLElement)) return;
  renderCategoriasWithSubcategorias(container);
  makeSortableCategorias(container);

  window.requestAnimationFrame(() => {
    const catKey = safeText(categoryId).trim();
    const normalizedOriginal = normalizeSubcategoriaLabel(normalizedName);
    const editInput = Array.from(
      container.querySelectorAll('[data-role="subcat-rename-input"]'),
    ).find((input) => {
      if (!(input instanceof HTMLInputElement)) return false;
      return (
        safeText(input.dataset.catId).trim() === catKey &&
        normalizeSubcategoriaLabel(input.dataset.subcat) === normalizedOriginal
      );
    });
    if (editInput instanceof HTMLInputElement) {
      editInput.focus();
      editInput.select();
    }
  });
}

function closeSubcategoriaInlineEdit() {
  subcategoriaInlineEdit = null;
}

function renderCategoriasWithSubcategorias(container) {
  container.innerHTML = "";

  ALL_CATEGORIAS.forEach((cat) => {
    const categoryId = safeText(cat?.id).trim();
    const isCategoryEditing = isCategoriaBeingEdited(categoryId);
    const categoryDraft = isCategoryEditing
      ? safeText(categoriaInlineEdit?.draft).trim()
      : safeText(cat?.nombre || "");
    const subcategorias = getSubcategoriasByCategoria(categoryId, {
      includeInactive: true,
    });
    const activeSubcategoriasCount = subcategorias.filter((entry) =>
      isSubcategoriaActiva(categoryId, entry),
    ).length;
    const subcategoriasHtml = subcategorias.length
      ? subcategorias
          .map(
            (name) => {
              const isEditing = isSubcategoriaBeingEdited(categoryId, name);
              const isSubcatActive = isSubcategoriaActiva(categoryId, name);
              const draftValue = isEditing
                ? normalizeSubcategoriaCatalogValue(subcategoriaInlineEdit?.draft) || name
                : name;
              return `
              <div class="subcategoria-item${isSubcatActive ? "" : " inactiva"}">
                <div class="subcategoria-main">
                  ${
                    isEditing
                      ? `<input
                           type="text"
                           class="subcategoria-rename-input"
                           data-role="subcat-rename-input"
                           data-cat-id="${escapeHtml(categoryId)}"
                           data-subcat="${escapeHtml(name)}"
                           value="${escapeHtml(draftValue)}"
                           placeholder="Nuevo nombre"
                         />`
                      : `<div class="subcategoria-nombre">${escapeHtml(name)}</div>`
                  }
                </div>
                <div class="subcategoria-actions">
                  ${
                    isEditing
                      ? `
                        <button class="secondaryBtn" type="button" data-action="save-rename-subcat" data-cat-id="${escapeHtml(categoryId)}" data-subcat="${escapeHtml(name)}">Guardar</button>
                        <button class="secondaryBtn" type="button" data-action="cancel-rename-subcat">Cancelar</button>
                      `
                      : `
                        <button
                          class="btn-editar btn-icon-only"
                          type="button"
                          data-action="start-rename-subcat"
                          data-cat-id="${escapeHtml(categoryId)}"
                          data-subcat="${escapeHtml(name)}"
                          aria-label="Editar subcategoria"
                          title="Editar subcategoria"
                        >
                          ${EDIT_PENCIL_ICON}
                        </button>
                      `
                  }
                  <label class="active-switch" title="Activo">
                    <input
                      type="checkbox"
                      data-action="toggle-subcat-active"
                      data-cat-id="${escapeHtml(categoryId)}"
                      data-subcat="${escapeHtml(name)}"
                      ${isSubcatActive ? "checked" : ""}
                    />
                    <span class="active-switch-slider" aria-hidden="true"></span>
                    <span class="active-switch-text">Activo</span>
                  </label>
                  <button class="btn-eliminar" type="button" data-action="delete-subcat" data-cat-id="${escapeHtml(categoryId)}" data-subcat="${escapeHtml(name)}">Eliminar</button>
                </div>
              </div>
            `;
            },
          )
          .join("")
      : '<div class="empty-state">Sin subcategorias en esta categoria.</div>';

    const div = document.createElement("div");
    div.className =
      "categoria-item categoria-item-with-subcats" + (cat?.activa ? "" : " inactiva");
    div.dataset.id = categoryId;
    div.innerHTML = `
      <div class="categoria-item-top">
        <span class="drag-handle material-symbols-outlined" aria-hidden="true">drag_indicator</span>
        <div class="categoria-main">
          ${
            isCategoryEditing
              ? `<input
                   type="text"
                   class="categoria-rename-input"
                   data-role="categoria-rename-input"
                   data-cat-id="${escapeHtml(categoryId)}"
                   value="${escapeHtml(categoryDraft)}"
                   placeholder="Nombre de categoria"
                 />`
              : `<div class="categoria-nombre">${escapeHtml(safeText(cat?.nombre || ""))}</div>`
          }
          <div class="categoria-meta">
            <span class="menu-chip ${cat?.activa ? "is-positive" : ""}">${cat?.activa ? "Visible" : "Oculta"}</span>
            <span class="menu-chip">${activeSubcategoriasCount}/${subcategorias.length} subcategorias activas</span>
          </div>
        </div>
        <div class="categoria-actions">
          ${
            isCategoryEditing
              ? `
                <button
                  class="secondaryBtn"
                  data-action="save-edit-category"
                  data-id="${escapeHtml(categoryId)}"
                  type="button"
                >
                  Guardar
                </button>
                <button
                  class="secondaryBtn"
                  data-action="cancel-edit-category"
                  type="button"
                >
                  Cancelar
                </button>
              `
              : `
                <button
                  class="btn-editar btn-icon-only"
                  data-action="start-edit-category"
                  data-id="${escapeHtml(categoryId)}"
                  type="button"
                  aria-label="Editar categoria"
                  title="Editar categoria"
                >
                  ${EDIT_PENCIL_ICON}
                </button>
              `
          }
          <label class="active-switch" title="Activo">
            <input
              type="checkbox"
              data-action="toggle-category-active"
              data-id="${escapeHtml(categoryId)}"
              ${cat?.activa ? "checked" : ""}
            />
            <span class="active-switch-slider" aria-hidden="true"></span>
            <span class="active-switch-text">Activo</span>
          </label>
          <button class="btn-eliminar" data-action="delete-category" data-id="${escapeHtml(categoryId)}" type="button">Eliminar</button>
        </div>
      </div>
      <div class="categoria-subcats-wrap">
        <div class="categoria-subcats-header">
          <h4>Subcategorias</h4>
        </div>
        <div class="categoria-subcats-list">${subcategoriasHtml}</div>
        <div class="categoria-subcats-create">
          <input
            type="text"
            placeholder="Nueva subcategoria"
            data-role="subcat-input"
            data-cat-id="${escapeHtml(categoryId)}"
          />
          <button type="button" class="secondaryBtn" data-action="add-subcat" data-cat-id="${escapeHtml(categoryId)}">
            + Anadir
          </button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll("[data-action='start-edit-category']").forEach((btn) => {
    btn.addEventListener("click", () => openCategoriaInlineEdit(btn.dataset.id));
  });
  container.querySelectorAll("[data-action='cancel-edit-category']").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeCategoriaInlineEdit();
      renderCategoriasWithSubcategorias(container);
      makeSortableCategorias(container);
    });
  });
  container.querySelectorAll("[data-action='save-edit-category']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = safeText(btn.dataset.id).trim();
      const input = container.querySelector(
        `[data-role="categoria-rename-input"][data-cat-id="${categoryId}"]`,
      );
      guardarNombreCategoriaInline(categoryId, input?.value);
    });
  });
  container.querySelectorAll("[data-action='toggle-category-active']").forEach((input) => {
    input.addEventListener("change", () =>
      toggleCategoria(input.dataset.id, Boolean(input.checked)),
    );
  });
  container.querySelectorAll("[data-action='delete-category']").forEach((btn) => {
    btn.addEventListener("click", () => eliminarCategoria(btn.dataset.id));
  });
  container.querySelectorAll("[data-action='start-rename-subcat']").forEach((btn) => {
    btn.addEventListener("click", () =>
      openSubcategoriaInlineEdit(btn.dataset.catId, btn.dataset.subcat),
    );
  });
  container.querySelectorAll("[data-action='cancel-rename-subcat']").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeSubcategoriaInlineEdit();
      renderCategoriasWithSubcategorias(container);
      makeSortableCategorias(container);
    });
  });
  container.querySelectorAll("[data-action='save-rename-subcat']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const catId = safeText(btn.dataset.catId).trim();
      const original = safeText(btn.dataset.subcat).trim();
      const input = Array.from(
        container.querySelectorAll("[data-role='subcat-rename-input']"),
      ).find((entry) => {
        if (!(entry instanceof HTMLInputElement)) return false;
        return (
          safeText(entry.dataset.catId).trim() === catId &&
          normalizeSubcategoriaLabel(entry.dataset.subcat) ===
            normalizeSubcategoriaLabel(original)
        );
      });
      renombrarSubcategoriaEnCategoria(catId, original, input?.value);
    });
  });
  container.querySelectorAll("[data-action='delete-subcat']").forEach((btn) => {
    btn.addEventListener("click", () =>
      eliminarSubcategoriaEnCategoria(btn.dataset.catId, btn.dataset.subcat),
    );
  });
  container.querySelectorAll("[data-action='toggle-subcat-active']").forEach((input) => {
    input.addEventListener("change", () =>
      toggleSubcategoriaActiva(
        input.dataset.catId,
        input.dataset.subcat,
        Boolean(input.checked),
      ),
    );
  });
  container.querySelectorAll("[data-action='add-subcat']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = safeText(btn.dataset.catId).trim();
      const input = container.querySelector(
        `[data-role="subcat-input"][data-cat-id="${categoryId}"]`,
      );
      guardarSubcategoriaEnCategoria(categoryId, input);
    });
  });
  container.querySelectorAll("[data-role='subcat-input']").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      guardarSubcategoriaEnCategoria(input.dataset.catId, input);
    });
  });
  container.querySelectorAll("[data-role='subcat-rename-input']").forEach((input) => {
    input.addEventListener("input", () => {
      if (!subcategoriaInlineEdit) return;
      subcategoriaInlineEdit.draft = input.value;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        renombrarSubcategoriaEnCategoria(
          input.dataset.catId,
          input.dataset.subcat,
          input.value,
        );
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSubcategoriaInlineEdit();
        renderCategoriasWithSubcategorias(container);
        makeSortableCategorias(container);
      }
    });
  });
  container.querySelectorAll("[data-role='categoria-rename-input']").forEach((input) => {
    input.addEventListener("input", () => {
      if (!categoriaInlineEdit) return;
      categoriaInlineEdit.draft = input.value;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        guardarNombreCategoriaInline(input.dataset.catId, input.value);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeCategoriaInlineEdit();
        renderCategoriasWithSubcategorias(container);
        makeSortableCategorias(container);
      }
    });
  });
}

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
  closeCategoriaInlineEdit();
  closeSubcategoriaInlineEdit();
  pruneSubcategoriasByCategoriaMap();

  const container = document.getElementById("categoriasContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!ALL_CATEGORIAS.length) {
    container.innerHTML =
      '<div class="empty-state">No hay categorias todavia. Crea la primera.</div>';
    actualizarSelectCategorias([]);
    fillPlatosCategoriaFilter([]);
    renderSubcategoriasFiltradas();
    return;
  }

  renderCategoriasWithSubcategorias(container);

  actualizarSelectCategorias(ALL_CATEGORIAS);
  fillPlatosCategoriaFilter(ALL_CATEGORIAS);
  renderSubcategoriasFiltradas();

  makeSortableCategorias(container);
}
function actualizarSelectCategorias(categorias) {
  if (!(platoCategoriaChecklist instanceof HTMLElement)) return;
  const selected = new Set(getSelectedPlatoCategoryIds());
  platoCategoriaChecklist.innerHTML = "";

  if (!categorias || !categorias.length) {
    platoCategoriaChecklist.innerHTML =
      '<div class="empty-state">Crea una categoria primero.</div>';
    fillPlatoSubcategoriaOptions();
    return;
  }

  categorias.forEach((categoria) => {
    const id = normalizeCategoryId(categoria?.id);
    if (id == null) return;

    const label = document.createElement("label");
    label.className = "multi-category-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(id);
    input.checked = selected.has(id);
    input.addEventListener("change", () => {
      syncPlatoCategoryChecklistUI();
      fillPlatoSubcategoriaOptions();
    });

    const text = document.createElement("span");
    text.textContent = safeText(categoria?.nombre) || `Categoria ${id}`;

    label.appendChild(input);
    label.appendChild(text);
    platoCategoriaChecklist.appendChild(label);
  });

  syncPlatoCategoryChecklistUI();
  fillPlatoSubcategoriaOptions();
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
  openCategoriaInlineEdit(id);
}

cancelCategoriaBtn.onclick = () => {
  editCategoriaId.value = "";
  categoriaNombre.value = "";
  categoriaFormTitle.textContent = "Nueva categoria";
  cancelCategoriaBtn.style.display = "none";
};

guardarCategoriaBtn.onclick = async () => {
  const nombre = categoriaNombre.value.trim();
  if (!nombre) {
    showInlineNotice("Escribe un nombre de categoria.", "error");
    categoriaNombre?.focus();
    return;
  }

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
  showInlineNotice(id ? "Categoria actualizada." : "Categoria creada.", "success");
};

async function toggleCategoria(id, nextActive = null) {
  const cat = ALL_CATEGORIAS.find((c) => String(c.id) === String(id));
  if (!cat) return;
  const activa = typeof nextActive === "boolean" ? nextActive : !Boolean(cat.activa);
  const { error } = await db.from("Categorias").update({ activa }).eq("id", id);
  if (error) {
    showInlineError(error, "No se pudo actualizar la categoria.");
    return;
  }
  await cargarCategorias();
}

async function guardarNombreCategoriaInline(categoryId, nextNameRaw) {
  const nextName = safeText(nextNameRaw).trim();
  if (!nextName) {
    showInlineNotice("Escribe un nombre de categoria.", "error");
    return;
  }

  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) return;
  if (safeText(category?.nombre).trim() === nextName) {
    closeCategoriaInlineEdit();
    const container = document.getElementById("categoriasContainer");
    if (container instanceof HTMLElement) {
      renderCategoriasWithSubcategorias(container);
      makeSortableCategorias(container);
    }
    showInlineNotice("No hay cambios para guardar.", "info");
    return;
  }

  const { error } = await db
    .from("Categorias")
    .update({ nombre: nextName })
    .eq("id", categoryId);
  if (error) {
    showInlineError(error, "No se pudo renombrar la categoria.");
    return;
  }

  closeCategoriaInlineEdit();
  await cargarCategorias();
  await cargarPlatos();
  showInlineNotice("Categoria actualizada.", "success");
}

async function toggleSubcategoriaActiva(categoryId, subcategoriaName, nextActive) {
  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) return;
  const subcategoria = normalizeSubcategoriaCatalogValue(subcategoriaName);
  if (!subcategoria) return;
  const snapshot = normalizeSubcategoriasStatusByCategoria(
    SUBCATEGORIAS_STATUS_POR_CATEGORIA,
  );
  setSubcategoriaActiva(categoryId, subcategoria, Boolean(nextActive));

  try {
    await persistSubcategoriasCatalog();
    const container = document.getElementById("categoriasContainer");
    if (container instanceof HTMLElement) {
      renderCategoriasWithSubcategorias(container);
      makeSortableCategorias(container);
    }
    renderSubcategoriasFiltradas();
    showInlineNotice("Subcategoria actualizada.", "success");
  } catch (error) {
    SUBCATEGORIAS_STATUS_POR_CATEGORIA = snapshot;
    showInlineError(error, "No se pudo actualizar la subcategoria.");
  }
}

async function eliminarCategoria(id) {
  if (!confirm("Eliminar categoria? Los platos podrian quedar sin categoria."))
    return;
  const key = normalizeSubcategoriaCategoryKey(id);
  await db.from("Categorias").delete().eq("id", id);
  if (key) {
    delete SUBCATEGORIAS_POR_CATEGORIA[key];
    delete SUBCATEGORIAS_STATUS_POR_CATEGORIA[key];
    await persistSubcategoriasCatalog();
  }
  await cargarCategorias();
  await cargarPlatos();
}

async function guardarSubcategoriaEnCategoria(categoryId, sourceInput) {
  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) {
    showInlineNotice("La categoria no existe o ya no esta disponible.", "error");
    return;
  }

  const rawValue =
    sourceInput instanceof HTMLInputElement ? sourceInput.value : sourceInput;
  const nuevoNombre = normalizeSubcategoriaCatalogValue(rawValue);
  if (!nuevoNombre) {
    showInlineNotice("Escribe un nombre de subcategoria.", "error");
    if (sourceInput instanceof HTMLInputElement) sourceInput.focus();
    return;
  }

  const current = getSubcategoriasByCategoria(categoryId);
  const normalized = normalizeSubcategoriaLabel(nuevoNombre);
  const alreadyExists = current.some(
    (entry) => normalizeSubcategoriaLabel(entry) === normalized,
  );
  if (alreadyExists) {
    showInlineNotice("Esa subcategoria ya existe en la categoria.", "info");
    return;
  }

  try {
    setSubcategoriasByCategoria(categoryId, [...current, nuevoNombre]);
    setSubcategoriaActiva(categoryId, nuevoNombre, true);
    await persistSubcategoriasCatalog();
    await cargarCategorias();
    fillPlatoSubcategoriaOptions({ keepValues: [nuevoNombre] });
    if (sourceInput instanceof HTMLInputElement) sourceInput.value = "";
    showInlineNotice("Subcategoria creada.", "success");
  } catch (error) {
    showInlineError(error, "No se pudo crear la subcategoria.");
  }
}

async function renombrarSubcategoriaEnCategoria(
  categoryId,
  nombreActual,
  nuevoNombrePropuesto = null,
) {
  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) return;

  const originalNombre = normalizeSubcategoriaCatalogValue(nombreActual);
  if (!originalNombre) return;

  const candidateValue =
    nuevoNombrePropuesto == null ? originalNombre : nuevoNombrePropuesto;
  const nuevoNombre = normalizeSubcategoriaCatalogValue(candidateValue);
  if (!nuevoNombre) {
    showInlineNotice("Escribe un nombre de subcategoria.", "error");
    return;
  }

  const originalNormalized = normalizeSubcategoriaLabel(originalNombre);
  const nuevoNormalized = normalizeSubcategoriaLabel(nuevoNombre);

  const current = getSubcategoriasByCategoria(categoryId);
  const existingTarget = current.find(
    (entry) => normalizeSubcategoriaLabel(entry) === nuevoNormalized,
  );
  const canonicalTarget =
    existingTarget && normalizeSubcategoriaLabel(existingTarget) !== originalNormalized
      ? existingTarget
      : nuevoNombre;
  const targetNormalized = normalizeSubcategoriaLabel(canonicalTarget);
  const wasActive = isSubcategoriaActiva(categoryId, originalNombre);

  if (targetNormalized === originalNormalized && canonicalTarget === originalNombre) {
    closeSubcategoriaInlineEdit();
    const container = document.getElementById("categoriasContainer");
    if (container instanceof HTMLElement) {
      renderCategoriasWithSubcategorias(container);
      makeSortableCategorias(container);
    }
    showInlineNotice("No hay cambios para guardar.", "info");
    return;
  }

  try {
    await requireUser();
    const replaceSubcategorias = (source) =>
      dedupeSubcategoriasCatalog(
        source.map((entry) =>
          normalizeSubcategoriaLabel(entry) === originalNormalized
            ? canonicalTarget
            : entry,
        ),
      );

    const platosObjetivo = (ALL_PLATOS || []).filter(
      (plato) =>
        platoInCategory(plato, categoryId) &&
        getDishSubcategorias(plato).some(
          (entry) => normalizeSubcategoriaLabel(entry) === originalNormalized,
        ),
    );

    if (platosObjetivo.length) {
      for (const plato of platosObjetivo) {
        const nextSubcats = replaceSubcategorias(getDishSubcategorias(plato));
        const result = await writeDishWithPayloadCandidates({
          dishId: plato?.id || null,
          payloadBase: {},
          categoryIds: getDishCategoryIds(plato),
          subcategorias: nextSubcats,
          allowPrimaryCategoryFallback: getDishCategoryIds(plato).length <= 1,
          allowPrimarySubcategoriaFallback: nextSubcats.length <= 1,
        });
        if (result.error) {
          throw result.error;
        }
      }
    }

    setSubcategoriasByCategoria(
      categoryId,
      current.map((entry) =>
        normalizeSubcategoriaLabel(entry) === originalNormalized
          ? canonicalTarget
          : entry,
      ),
    );
    setSubcategoriaActiva(categoryId, canonicalTarget, wasActive);

    await persistSubcategoriasCatalog();
    await cargarPlatos();
    closeSubcategoriaInlineEdit();
    await cargarCategorias();
    fillPlatoSubcategoriaOptions({ keepValues: [canonicalTarget] });
    showInlineNotice("Subcategoria renombrada.", "success");
  } catch (error) {
    showInlineError(error, "No se pudo renombrar la subcategoria.");
  }
}

async function eliminarSubcategoriaEnCategoria(categoryId, nombreActual) {
  const category = ALL_CATEGORIAS.find((entry) => idsEqual(entry?.id, categoryId));
  if (!category) return;

  const nombre = normalizeSubcategoriaCatalogValue(nombreActual);
  if (!nombre) return;

  if (
    !confirm(
      `Eliminar subcategoria "${nombre}" de ${safeText(category?.nombre)}?`,
    )
  ) {
    return;
  }

  const normalized = normalizeSubcategoriaLabel(nombre);

  try {
    await requireUser();
    const platosObjetivo = (ALL_PLATOS || []).filter(
      (plato) =>
        platoInCategory(plato, categoryId) &&
        getDishSubcategorias(plato).some(
          (entry) => normalizeSubcategoriaLabel(entry) === normalized,
        ),
    );

    if (platosObjetivo.length) {
      for (const plato of platosObjetivo) {
        const nextSubcats = getDishSubcategorias(plato).filter(
          (entry) => normalizeSubcategoriaLabel(entry) !== normalized,
        );
        const result = await writeDishWithPayloadCandidates({
          dishId: plato?.id || null,
          payloadBase: {},
          categoryIds: getDishCategoryIds(plato),
          subcategorias: nextSubcats,
          allowPrimaryCategoryFallback: getDishCategoryIds(plato).length <= 1,
          allowPrimarySubcategoriaFallback: nextSubcats.length <= 1,
        });
        if (result.error) {
          throw result.error;
        }
      }
    }

    setSubcategoriasByCategoria(
      categoryId,
      getSubcategoriasByCategoria(categoryId).filter(
        (entry) => normalizeSubcategoriaLabel(entry) !== normalized,
      ),
    );

    await persistSubcategoriasCatalog();
    await cargarPlatos();
    closeSubcategoriaInlineEdit();
    await cargarCategorias();
    fillPlatoSubcategoriaOptions({ keepValues: [] });
    showInlineNotice("Subcategoria eliminada.", "success");
  } catch (error) {
    showInlineError(error, "No se pudo eliminar la subcategoria.");
  }
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

// ========== MENUS COMPUESTOS ==========
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
    .sort((a, b) => {
      const av = Number(a?.weekday);
      const bv = Number(b?.weekday);
      return av - bv;
    });
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
    safeText(a?.plato).localeCompare(safeText(b?.plato), 'es', {
      sensitivity: 'base',
    }),
  );
}

function formatMenuProgramacionSummary(menuId) {
  const weekdays = getMenuProgramacionWeekdays(menuId);
  if (!weekdays.length) return 'Siempre';
  return weekdays.map((day) => getMenuWeekdayLabel(day)).join(', ');
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
      seed?.precio_override == null ? '' : safeText(seed?.precio_override).trim(),
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
    id: '',
    nombre: '',
    descripcion: '',
    activo: true,
    weekdays: [],
    fields: [],
  };
}

function isPlatoEditorModalOpen() {
  return platoEditorModal?.getAttribute("aria-hidden") === "false";
}

function isMenuEditorOpen() {
  return menuEditorModal?.getAttribute('aria-hidden') === 'false';
}

function isMenuDishPickerOpen() {
  return menuDishPickerModal?.getAttribute('aria-hidden') === 'false';
}

function syncMenuModalBodyOverflow() {
  document.body.style.overflow =
    isPlatoEditorModalOpen() || isMenuEditorOpen() || isMenuDishPickerOpen()
      ? "hidden"
      : "";
}

function movePlatoFormToModal() {
  if (!(platoEditorFormBox instanceof HTMLElement)) return;
  if (!(platoEditorModalMount instanceof HTMLElement)) return;
  if (platoEditorFormBox.parentElement === platoEditorModalMount) return;
  platoEditorModalMount.appendChild(platoEditorFormBox);
}

function movePlatoFormToDock() {
  if (!(platoEditorFormBox instanceof HTMLElement)) return;
  if (!(platoFormDock instanceof HTMLElement)) return;
  if (platoEditorFormBox.parentElement === platoFormDock) return;
  platoFormDock.prepend(platoEditorFormBox);
}

function setPlatoEditorModalOpen(isOpen) {
  if (!(platoEditorModal instanceof HTMLElement)) return;
  platoEditorModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  syncMenuModalBodyOverflow();
}

function openPlatoEditorModal() {
  if (!(platoEditorModal instanceof HTMLElement)) return;
  movePlatoFormToModal();
  setPlatoEditorModalOpen(true);
}

function closePlatoEditorModal({ reset = true } = {}) {
  if (!(platoEditorModal instanceof HTMLElement)) return;
  setPlatoEditorModalOpen(false);
  movePlatoFormToDock();
  if (reset) resetPlatoForm();
}

function setMenuEditorOpen(isOpen) {
  if (!(menuEditorModal instanceof HTMLElement)) return;
  menuEditorModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  syncMenuModalBodyOverflow();
}

function setMenuDishPickerOpen(isOpen) {
  if (!(menuDishPickerModal instanceof HTMLElement)) return;
  menuDishPickerModal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  syncMenuModalBodyOverflow();
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
  const selected = Array.from(
    menuEditorWeekdays.querySelectorAll("input[type='checkbox']:checked"),
  )
    .map((input) => normalizeWeekday(input.value))
    .filter((value) => value != null);
  return Array.from(new Set(selected)).sort((a, b) => a - b);
}

function getDishBasePriceLabel(dish) {
  if (dish?.precio == null || Number.isNaN(Number(dish.precio))) {
    return 'Sin precio base';
  }
  return `Base ${Number(dish.precio).toFixed(2)} EUR`;
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
  const categories = getDishCategoryNames(dish);
  const categoryText = categories.length ? categories.join(" / ") : "Sin categoria";
  const subcategorias = getDishSubcategorias(dish);
  return subcategorias.length
    ? `${categoryText} · ${subcategorias.join(" / ")}`
    : categoryText;
}

function getMenuDishPickerField() {
  return getMenuEditorFieldByKey(menuDishPickerState?.fieldKey);
}

function getDishPickerSelectedCategoryId() {
  if (!(menuDishPickerCategoria instanceof HTMLSelectElement)) return null;
  return normalizeCategoryId(menuDishPickerCategoria.value);
}

function getDishPickerSelectedSubcategoria() {
  if (!(menuDishPickerSubcategoria instanceof HTMLSelectElement)) return '';
  return safeText(menuDishPickerSubcategoria.value).trim();
}

function fillMenuDishPickerCategoryOptions() {
  if (!(menuDishPickerCategoria instanceof HTMLSelectElement)) return;
  const selectedCategoryId = normalizeCategoryId(menuDishPickerState?.categoryId);
  const options = [...(ALL_CATEGORIAS || [])]
    .filter((category) => normalizeCategoryId(category?.id) != null)
    .sort((a, b) =>
      safeText(a?.nombre).localeCompare(safeText(b?.nombre), 'es', {
        sensitivity: 'base',
      }),
    );

  menuDishPickerCategoria.innerHTML = '<option value="">Todas</option>';
  options.forEach((category) => {
    const id = normalizeCategoryId(category?.id);
    if (id == null) return;
    const option = document.createElement('option');
    option.value = safeText(id);
    option.textContent = safeText(category?.nombre).trim() || `Categoria ${id}`;
    menuDishPickerCategoria.appendChild(option);
  });

  if (
    selectedCategoryId != null &&
    [...menuDishPickerCategoria.options].some(
      (option) => normalizeCategoryId(option.value) === selectedCategoryId,
    )
  ) {
    menuDishPickerCategoria.value = safeText(selectedCategoryId);
  } else {
    menuDishPickerCategoria.value = '';
    if (menuDishPickerState) menuDishPickerState.categoryId = null;
  }
}

function fillMenuDishPickerSubcategoriaOptions() {
  if (!(menuDishPickerSubcategoria instanceof HTMLSelectElement)) return;
  const selectedCategoryId = getDishPickerSelectedCategoryId();
  const selectedSubcategoria = safeText(menuDishPickerState?.subcategoria).trim();
  const selectedSubcategoriaNormalized = normalizeSubcategoriaLabel(selectedSubcategoria);

  const targetCategoryIds =
    selectedCategoryId != null
      ? [selectedCategoryId]
      : (ALL_CATEGORIAS || [])
          .map((category) => normalizeCategoryId(category?.id))
          .filter((id) => id != null);

  const subcategorias = dedupeSubcategoriasCatalog(
    targetCategoryIds.flatMap((categoryId) =>
      getSubcategoriasByCategoria(categoryId, { includeInactive: false }),
    ),
  );

  menuDishPickerSubcategoria.innerHTML = '<option value="">Todas</option>';
  subcategorias.forEach((subcategoria) => {
    const option = document.createElement('option');
    option.value = subcategoria;
    option.textContent = subcategoria;
    menuDishPickerSubcategoria.appendChild(option);
  });

  const matchedOption = [...menuDishPickerSubcategoria.options].find(
    (option) => normalizeSubcategoriaLabel(option.value) === selectedSubcategoriaNormalized,
  );
  menuDishPickerSubcategoria.value = matchedOption ? matchedOption.value : '';
  if (menuDishPickerState) {
    menuDishPickerState.subcategoria = menuDishPickerSubcategoria.value;
  }
}

function getMenuDishPickerFilteredDishes() {
  const selectedCategoryId = getDishPickerSelectedCategoryId();
  const selectedSubcategoriaNormalized = normalizeSubcategoriaLabel(
    getDishPickerSelectedSubcategoria(),
  );

  return getSortedCatalogDishes().filter((dish) => {
    const matchesCategory =
      selectedCategoryId == null || platoInCategory(dish, selectedCategoryId);
    if (!matchesCategory) return false;

    if (!selectedSubcategoriaNormalized) return true;
    return getDishSubcategorias(dish).some(
      (entry) => normalizeSubcategoriaLabel(entry) === selectedSubcategoriaNormalized,
    );
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
        <label class="menu-dish-picker-item${checked ? ' is-selected' : ''}">
          <input
            type="checkbox"
            class="menu-check-input"
            data-role="picker-dish-toggle"
            data-field-key="${escapeHtml(field.key)}"
            data-dish-id="${escapeHtml(dishId)}"
            ${checked ? 'checked' : ''}
          />
          <span class="menu-dish-picker-main">
            <span class="menu-dish-picker-name">${escapeHtml(dishName)}</span>
            <span class="menu-dish-picker-meta">${escapeHtml(formatMenuEditorDishMeta(dish))}</span>
          </span>
          <span class="menu-dish-picker-price">${escapeHtml(getDishBasePriceLabel(dish))}</span>
        </label>
      `;
    })
    .join('');

  menuDishPickerList
    .querySelectorAll("[data-role='picker-dish-toggle']")
    .forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
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
    subcategoria: '',
  };

  if (menuDishPickerTitle) {
    const fieldName = safeText(field.nombre).trim() || 'Sin nombre';
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
    menuEditorCamposContainer.innerHTML = '';
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
      const fieldName = safeText(field?.nombre).trim();
      const fieldTitle = fieldName || 'Sin nombre';
      const selectedCount = field.dishes.length;
      const selectedDishRows = (field.dishes || [])
        .map((entry) => {
          const dishId = safeText(entry?.plato_id).trim();
          if (!dishId) return '';
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
        .join('');

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
                placeholder="Ej: Primer plato"
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
    .join('');

  menuEditorCamposContainer.querySelectorAll("[data-role='field-name']").forEach((input) => {
    input.addEventListener('input', () => {
      const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
      if (!field) return;
      field.nombre = input.value;
      const card = input.closest('.menu-editor-field');
      const titleNode = card?.querySelector("[data-role='field-title']");
      if (titleNode) {
        titleNode.textContent = safeText(input.value).trim() || 'Sin nombre';
      }
      if (
        isMenuDishPickerOpen() &&
        idsEqual(menuDishPickerState?.fieldKey, field.key) &&
        menuDishPickerTitle
      ) {
        const pickerFieldName = safeText(field.nombre).trim() || 'Sin nombre';
        menuDishPickerTitle.textContent = `Seleccionar platos · ${pickerFieldName}`;
      }
    });
  });

  menuEditorCamposContainer
    .querySelectorAll("[data-role='field-description']")
    .forEach((input) => {
      input.addEventListener('input', () => {
        const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
        if (!field) return;
        field.descripcion = input.value;
      });
    });

  menuEditorCamposContainer.querySelectorAll("[data-role='field-delete']").forEach((button) => {
    button.addEventListener('click', () => {
      if (!menuEditorState) return;
      const fieldKey = safeText(button.dataset.fieldKey).trim();
      if (!fieldKey) return;
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
      button.addEventListener('click', () => {
        const field = getMenuEditorFieldByKey(button.dataset.fieldKey);
        if (!field) return;
        openMenuDishPicker(field.key);
      });
    });

  menuEditorCamposContainer.querySelectorAll("[data-role='dish-remove']").forEach((button) => {
    button.addEventListener('click', () => {
      const field = getMenuEditorFieldByKey(button.dataset.fieldKey);
      if (!field) return;
      const dishId = safeText(button.dataset.dishId).trim();
      if (!dishId) return;

      field.dishes = field.dishes.filter((entry) => !idsEqual(entry?.plato_id, dishId));
      renderMenuEditorFields();
      if (isMenuDishPickerOpen() && idsEqual(menuDishPickerState?.fieldKey, field.key)) {
        renderMenuDishPickerList();
      }
    });
  });

  menuEditorCamposContainer.querySelectorAll("[data-role='dish-price']").forEach((input) => {
    input.addEventListener('input', () => {
      const field = getMenuEditorFieldByKey(input.dataset.fieldKey);
      if (!field) return;
      const dishId = safeText(input.dataset.dishId).trim();
      const entry = getMenuEditorFieldDish(field, dishId);
      if (!entry) return;
      entry.precio_override = safeText(input.value).trim();
    });
  });
}

function applyMenuEditorStateToForm() {
  if (!menuEditorState) return;

  if (menuEditorTitle) {
    menuEditorTitle.textContent = menuEditorState.id ? 'Editar menu' : 'Nuevo menu';
  }
  if (menuEditorId) menuEditorId.value = safeText(menuEditorState.id);
  if (menuEditorNombre) menuEditorNombre.value = safeText(menuEditorState.nombre);
  if (menuEditorDescripcion) {
    menuEditorDescripcion.value = safeText(menuEditorState.descripcion);
  }
  if (menuEditorActivo) menuEditorActivo.checked = Boolean(menuEditorState.activo);
  setMenuEditorWeekdays(menuEditorState.weekdays);

  if (menuEditorDeleteBtn) {
    menuEditorDeleteBtn.style.display = menuEditorState.id ? '' : 'none';
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
  menusCompuestosContainer.innerHTML = '';

  if (!menusFeatureAvailable) {
    menusCompuestosContainer.innerHTML =
      '<div class="empty-state empty-state--panel">Menus no esta disponible en esta instalacion porque faltan las tablas necesarias para menus compuestos.</div>';
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
      : 'Siempre activo';

    const div = document.createElement('article');
    div.className = 'menu-compuesto-item' + (isActive ? '' : ' inactiva');
    div.dataset.id = safeText(menu?.id);
    div.innerHTML = `
      <div class="menu-row-title">${escapeHtml(safeText(menu?.nombre))}</div>
      <div class="menu-row-desc">${escapeHtml(safeText(menu?.descripcion || ''))}</div>
      <div class="menu-row-meta">
        <span class="menu-chip ${isActive ? 'is-positive' : ''}">${isActive ? 'Activo' : 'Inactivo'}</span>
        <span class="menu-chip ${isPublished ? 'is-positive' : ''}">${isPublished ? 'Publicado' : 'Oculto'}</span>
        <span class="menu-chip ${weekdays.length ? 'is-warning' : ''}">${escapeHtml(scheduleText)}</span>
      </div>
      <div class="menu-row-actions">
        <button
          class="btn-editar btn-icon-only"
          type="button"
          data-action="edit"
          data-id="${escapeHtml(menu?.id)}"
          aria-label="Editar menu"
          title="Editar menu"
        >
          ${EDIT_PENCIL_ICON}
        </button>
        <label class="active-switch" title="Activo">
          <input
            type="checkbox"
            data-action="toggle-active"
            data-id="${escapeHtml(menu?.id)}"
            ${isActive ? "checked" : ""}
          />
          <span class="active-switch-slider" aria-hidden="true"></span>
          <span class="active-switch-text">Activo</span>
        </label>
        <button class="btn-eliminar" type="button" data-action="delete" data-id="${escapeHtml(menu?.id)}">Eliminar</button>
      </div>
    `;
    menusCompuestosContainer.appendChild(div);
  });
}

async function persistMenuProgramacion(menuId, weekdays) {
  const menuIdText = safeText(menuId).trim();
  await db.from('Menus_programacion').delete().eq('menu_id', menuIdText);

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

  const { error } = await db.from('Menus_programacion').insert(payload);
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
    throw new Error('Escribe un nombre para el menu.');
  }

  if (!menuEditorState || !Array.isArray(menuEditorState.fields)) {
    throw new Error('No se pudo leer los campos del menu.');
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
    throw new Error('Anade al menos un campo al menu.');
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
  const { error: deleteError } = await db
    .from('Menus_campos')
    .delete()
    .eq('menu_id', menuIdText);
  if (deleteError) throw deleteError;

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
    const field = fields[fieldIndex];
    const { data: insertedField, error: fieldError } = await db
      .from('Menus_campos')
      .insert({
        menu_id: menuIdText,
        nombre: field.nombre,
        descripcion: field.descripcion,
        orden: fieldIndex,
        activo: true,
        permite_multiples: true,
      })
      .select('id')
      .maybeSingle();

    if (fieldError) throw fieldError;

    const fieldId = safeText(insertedField?.id).trim();
    if (!fieldId) {
      throw new Error('No se pudo crear un campo del menu.');
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
      const { error: dishError } = await db.from('Menus_campos_platos').insert(dishPayload);
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
      const { error } = await db.from('Menus').update(menuPayload).eq('id', menuId);
      if (error) throw error;
    } else {
      const nextOrden = (ALL_MENUS_COMPUESTOS || []).length;
      const { data, error } = await db
        .from('Menus')
        .insert({
          ...menuPayload,
          user_id: currentUser.id,
          orden: nextOrden,
        })
        .select('id')
        .maybeSingle();
      if (error) throw error;
      menuId = safeText(data?.id).trim();
    }

    if (!menuId) {
      throw new Error('No se pudo resolver el id del menu guardado.');
    }

    await persistMenuProgramacion(menuId, model.weekdays);
    await persistMenuFieldsAndDishes(menuId, model.fields);
    await cargarMenusCompuestos();
    closeMenuEditor();
    showInlineNotice(isEditing ? 'Menu actualizado.' : 'Menu creado.', 'success');
  } catch (error) {
    showInlineError(error, 'No se pudo guardar el menu.');
  }
}

async function toggleMenuCompuestoActivo(menuId, nextActive = null) {
  if (!ensureMenusFeatureAvailable()) return;
  const menu = getMenuCompuestoById(menuId);
  if (!menu) return;
  const activo = typeof nextActive === "boolean" ? nextActive : !Boolean(menu?.activo);
  const { error } = await db
    .from('Menus')
    .update({ activo })
    .eq('id', safeText(menuId).trim());

  if (error) {
    showInlineError(error, 'No se pudo actualizar el menu.');
    return;
  }

  await cargarMenusCompuestos();
}

async function eliminarMenuCompuesto(menuId) {
  if (!ensureMenusFeatureAvailable()) return;
  const menu = getMenuCompuestoById(menuId);
  if (!menu) return;
  if (!confirm(`Eliminar menu "${safeText(menu.nombre)}"?`)) return;

  const { error } = await db.from('Menus').delete().eq('id', safeText(menuId).trim());
  if (error) {
    showInlineError(error, 'No se pudo eliminar el menu.');
    return;
  }

  if (menuEditorState && idsEqual(menuEditorState.id, menuId)) {
    closeMenuEditor();
  }

  await cargarMenusCompuestos();
  showInlineNotice('Menu eliminado.', 'success');
}

async function cargarMenusCompuestos() {
  try {
    const { data: menus, error: menusError } = await db
      .from('Menus')
      .select('*')
      .eq('user_id', user.id)
      .order('orden', { ascending: true })
      .order('id', { ascending: true });
    if (menusError) throw menusError;
    ALL_MENUS_COMPUESTOS = menus || [];

    const menuIds = ALL_MENUS_COMPUESTOS.map((entry) => entry.id).filter(Boolean);

    if (menuIds.length) {
      const { data: programacion, error: programacionError } = await db
        .from('Menus_programacion')
        .select('*')
        .in('menu_id', menuIds);
      if (programacionError) throw programacionError;
      ALL_MENUS_PROGRAMACION = programacion || [];

      const { data: campos, error: camposError } = await db
        .from('Menus_campos')
        .select('*')
        .in('menu_id', menuIds);
      if (camposError) throw camposError;
      ALL_MENUS_CAMPOS = campos || [];

      const campoIds = ALL_MENUS_CAMPOS.map((entry) => entry.id).filter(Boolean);
      if (campoIds.length) {
        const { data: campoPlatos, error: campoPlatosError } = await db
          .from('Menus_campos_platos')
          .select('*')
          .in('menu_campo_id', campoIds);
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
    if (isMissingMenusFeatureError(error)) {
      setMenusFeatureAvailability(
        false,
        "Menus no esta disponible porque esta base de datos no incluye las tablas de menus compuestos.",
      );
    } else {
      setMenusFeatureAvailability(true);
      console.warn('Menus compuestos:', safeText(error?.message || error));
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
  if (menusCompuestosContainer.dataset.boundActions === '1') return;
  menusCompuestosContainer.dataset.boundActions = '1';

  menusCompuestosContainer.addEventListener('change', async (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (safeText(event.target.dataset.action).trim() !== 'toggle-active') return;
    const targetId = safeText(event.target.dataset.id).trim();
    if (!targetId) return;
    await toggleMenuCompuestoActivo(targetId, Boolean(event.target.checked));
  });

  menusCompuestosContainer.addEventListener('click', async (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-action]');
    if (!(button instanceof HTMLButtonElement)) return;

    const action = safeText(button.dataset.action).trim();
    const targetId = safeText(button.dataset.id).trim();
    if (!targetId) return;

    if (action === 'edit') {
      openMenuEditorForEdit(targetId);
      return;
    }

    if (action === 'toggle-active') {
      await toggleMenuCompuestoActivo(targetId);
      return;
    }

    if (action === 'delete') {
      await eliminarMenuCompuesto(targetId);
    }
  });
}

function bindMenuEditorActions() {
  openMenuEditorBtn?.addEventListener('click', openMenuEditorForCreate);

  menuEditorAddCampoBtn?.addEventListener('click', () => {
    if (!menuEditorState) return;
    menuEditorState.fields.push(createMenuEditorField({ nombre: 'Nuevo campo' }));
    renderMenuEditorFields();
  });

  menuEditorSaveBtn?.addEventListener('click', guardarMenuCompuesto);

  menuEditorDeleteBtn?.addEventListener('click', async () => {
    const menuId = safeText(menuEditorState?.id || menuEditorId?.value).trim();
    if (!menuId) return;
    await eliminarMenuCompuesto(menuId);
  });

  menuEditorNombre?.addEventListener('input', () => {
    if (!menuEditorState) return;
    menuEditorState.nombre = menuEditorNombre.value;
  });

  menuEditorDescripcion?.addEventListener('input', () => {
    if (!menuEditorState) return;
    menuEditorState.descripcion = menuEditorDescripcion.value;
  });

  menuEditorActivo?.addEventListener('change', () => {
    if (!menuEditorState) return;
    menuEditorState.activo = Boolean(menuEditorActivo.checked);
  });

  menuDishPickerCategoria?.addEventListener('change', () => {
    if (!menuDishPickerState) return;
    menuDishPickerState.categoryId = getDishPickerSelectedCategoryId();
    menuDishPickerState.subcategoria = '';
    fillMenuDishPickerSubcategoriaOptions();
    renderMenuDishPickerList();
  });

  menuDishPickerSubcategoria?.addEventListener('change', () => {
    if (!menuDishPickerState) return;
    menuDishPickerState.subcategoria = getDishPickerSelectedSubcategoria();
    renderMenuDishPickerList();
  });

  menuDishPickerDoneBtn?.addEventListener('click', closeMenuDishPicker);

  document.querySelectorAll('[data-menu-editor-close]').forEach((element) => {
    element.addEventListener('click', closeMenuEditor);
  });

  document.querySelectorAll('[data-menu-dish-picker-close]').forEach((element) => {
    element.addEventListener('click', closeMenuDishPicker);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (isPlatoEditorModalOpen()) {
      closePlatoEditorModal({ reset: true });
      return;
    }
    if (isMenuDishPickerOpen()) {
      closeMenuDishPicker();
      return;
    }
    if (isMenuEditorOpen()) {
      closeMenuEditor();
    }
  });
}

bindMenusCompuestosListActions();
bindMenuEditorActions();

// ========== SUBCATEGORIAS ==========
function rebuildSubcategoriasCache() {
  const fromCategoryMap = Object.values(
    normalizeSubcategoriasByCategoria(SUBCATEGORIAS_POR_CATEGORIA),
  ).flat();
  const fromDishes = (ALL_PLATOS || [])
    .flatMap((plato) => getDishSubcategorias(plato))
    .filter(Boolean);

  ALL_SUBCATEGORIAS = dedupeSubcategoriasCatalog([
    ...(ALL_SUBCATEGORIAS || []),
    ...fromCategoryMap,
    ...fromDishes,
  ]);
}

async function persistSubcategoriasCatalog() {
  const currentUser = await requireUser();
  const catalog = dedupeSubcategoriasCatalog(ALL_SUBCATEGORIAS);
  const byCategory = normalizeSubcategoriasByCategoria(SUBCATEGORIAS_POR_CATEGORIA);
  const statusByCategory = normalizeSubcategoriasStatusByCategoria(
    SUBCATEGORIAS_STATUS_POR_CATEGORIA,
  );
  const personalizacionMenu = {
    ...profileMenuMetadataCache,
    subcategorias_catalogo: catalog,
    subcategorias_por_categoria: byCategory,
    subcategorias_estado_por_categoria: statusByCategory,
  };

  const { data: existing, error: existingError } = await db
    .from("Perfil")
    .select("user_id")
    .eq("user_id", currentUser.id)
    .maybeSingle();
  if (existingError) throw existingError;

  const writer = existing
    ? db.from("Perfil").update({ personalizacion_menu: personalizacionMenu }).eq(
        "user_id",
        currentUser.id,
      )
    : db
        .from("Perfil")
        .insert({ user_id: currentUser.id, personalizacion_menu: personalizacionMenu });
  const { error } = await writer;
  if (error) throw error;

  ALL_SUBCATEGORIAS = catalog;
  SUBCATEGORIAS_POR_CATEGORIA = byCategory;
  SUBCATEGORIAS_STATUS_POR_CATEGORIA = statusByCategory;
  profileMenuMetadataCache = { ...personalizacionMenu };
}

function renderSubcategoriasFiltradas() {
  rebuildSubcategoriasCache();
  fillPlatoSubcategoriaOptions();
}

// ========== PLATOS ==========
function resetPlatoForm() {
  editPlatoId.value = "";
  platoNombre.value = "";
  platoDescripcion.value = "";
  platoPrecio.value = "";
  setSelectedPlatoCategoryIds([]);
  fillPlatoSubcategoriaOptions({ keepValues: [] });
  setImagePickerValue("platoImagen", "");
  platoFormTitle.textContent = "Nuevo plato";
  cancelPlatoBtn.style.display = "none";
  alergenosSeleccionados = [];
  cargarAlergenosGrid();
  if (platoEditAside) platoEditAside.style.display = "none";
  if (platoEditAsideBody) platoEditAsideBody.innerHTML = "";
}

cancelPlatoBtn.onclick = () => {
  if (isPlatoEditorModalOpen()) {
    closePlatoEditorModal({ reset: true });
    return;
  }
  resetPlatoForm();
};

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
  renderPlatosFiltrados();
  renderSubcategoriasFiltradas();
  const categoriasContainer = document.getElementById("categoriasContainer");
  if (categoriasContainer instanceof HTMLElement && ALL_CATEGORIAS.length) {
    renderCategoriasWithSubcategorias(categoriasContainer);
    makeSortableCategorias(categoriasContainer);
  }
  if (isMenuEditorOpen()) {
    renderMenuEditorFields();
  }
  if (isMenuDishPickerOpen()) {
    fillMenuDishPickerCategoryOptions();
    fillMenuDishPickerSubcategoriaOptions();
    renderMenuDishPickerList();
  }
}

function renderPlatosFiltrados() {
  const catId = normalizeCategoryId(platosCategoriaFilter?.value);
  const q = (platosSearch?.value || "").trim().toLowerCase();

  const filtered = ALL_PLATOS.filter((p) => {
    const okCat = catId == null || platoInCategory(p, catId);
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
  if (!container) return;

  container.innerHTML = "";

  if (!platos || !platos.length) {
    container.innerHTML =
      '<div class="empty-state">No hay platos para este filtro.</div>';
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

    const categoryNames = getDishCategoryNames(p);
    const subcategorias = getDishSubcategorias(p);
    const thumbHtml = p.imagen_url
      ? `<img src="${p.imagen_url}" alt="" onerror="this.style.display='none'; this.parentElement.innerHTML='';">`
      : `<span class="material-symbols-outlined" aria-hidden="true">restaurant</span>`;
    const categoryBadges = categoryNames
      .map((name) => `<span class="badge-cat">${safeText(name)}</span>`)
      .join("");
    const subcategoriaBadges = subcategorias
      .map((name) => `<span class="chipmini">${safeText(name)}</span>`)
      .join("");

    div.innerHTML = `
      <span class="drag-handle material-symbols-outlined" aria-hidden="true">drag_indicator</span>
      <div class="plato-thumb">${thumbHtml}</div>
      <div class="plato-info">
        <div class="plato-nombre">${safeText(p.plato)} ${p.activo ? "" : "(Oculto)"}</div>
        <div class="plato-desc">${p.descripcion ? safeText(p.descripcion) : ""}</div>
        <div class="plato-meta">
          ${categoryBadges}
          ${subcategoriaBadges}
        </div>
      </div>
      <div class="plato-precio">${p.precio != null ? Number(p.precio).toFixed(2) + " EUR" : ""}</div>
      <div class="plato-actions">
        <button
          class="btn-editar btn-icon-only"
          data-id="${p.id}"
          type="button"
          aria-label="Editar plato"
          title="Editar plato"
        >
          ${EDIT_PENCIL_ICON}
        </button>
        <label class="active-switch" title="Activo">
          <input
            type="checkbox"
            data-action="toggle-plato-active"
            data-id="${p.id}"
            ${p.activo ? "checked" : ""}
          />
          <span class="active-switch-slider" aria-hidden="true"></span>
          <span class="active-switch-text">Activo</span>
        </label>
        <button class="btn-eliminar" data-id="${p.id}" type="button">Eliminar</button>
      </div>
    `;

    container.appendChild(div);
  });

  container
    .querySelectorAll(".btn-editar")
    .forEach((btn) => (btn.onclick = () => editarPlato(btn.dataset.id)));
  container
    .querySelectorAll("[data-action='toggle-plato-active']")
    .forEach((input) =>
      input.addEventListener("change", () =>
        togglePlato(input.dataset.id, Boolean(input.checked)),
      ),
    );
  container
    .querySelectorAll(".btn-eliminar")
    .forEach((btn) => (btn.onclick = () => eliminarPlato(btn.dataset.id)));

  makeSortablePlatos(container);
}
function editarPlato(id) {
  const p = ALL_PLATOS.find((x) => String(x.id) === String(id));
  if (!p) return;
  openPlatoEditorModal();

  editPlatoId.value = p.id;
  platoNombre.value = p.plato || "";
  platoDescripcion.value = p.descripcion || "";
  platoPrecio.value = p.precio ?? "";
  setSelectedPlatoCategoryIds(getDishCategoryIds(p));
  fillPlatoSubcategoriaOptions({ keepValues: getDishSubcategorias(p) });
  setImagePickerValue("platoImagen", p.imagen_url || "");

  const existing = Array.isArray(p.alergenos) ? p.alergenos : [];
  alergenosSeleccionados = existing
    .map(normalizeAllergenKey)
    .filter(Boolean)
    .filter((k) => ALERGENOS.includes(k));

  cargarAlergenosGrid();

  // Aside "Editando"
  if (platoEditAside && platoEditAsideBody) {
    const categoryNames = getDishCategoryNames(p);
    const thumb = p.imagen_url
      ? `<img class="edit-aside-thumb" src="${p.imagen_url}" alt="" onerror="this.style.display='none';this.parentElement.style.background='transparent'">`
      : `<div class="edit-aside-thumb"></div>`;

    const tags = [];
    categoryNames.forEach((name) =>
      tags.push(`<span class="edit-tag">${safeText(name)}</span>`),
    );
    getDishSubcategorias(p).forEach((entry) =>
      tags.push(`<span class="edit-tag">${safeText(entry)}</span>`),
    );
    if (p.precio != null)
      tags.push(
        `<span class="edit-tag">${Number(p.precio).toFixed(2)} EUR</span>`,
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

async function togglePlato(id, nextActive = null) {
  const p = ALL_PLATOS.find((x) => String(x.id) === String(id));
  if (!p) return;
  const activo = typeof nextActive === "boolean" ? nextActive : !Boolean(p.activo);
  const { error } = await db.from("Menu").update({ activo }).eq("id", id);
  if (error) {
    showInlineError(error, "No se pudo actualizar el plato.");
    return;
  }
  await cargarPlatos();
}

async function eliminarPlato(id) {
  if (!confirm("Eliminar plato?")) return;
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
      const catId = normalizeCategoryId(platosCategoriaFilter?.value);

      for (let i = 0; i < visibleIds.length; i++) {
        const id = visibleIds[i];
        const plato = ALL_PLATOS.find((p) => Number(p.id) === Number(id));
        if (!plato) continue;

        if (catId == null || platoInCategory(plato, catId)) {
          await db.from("Menu").update({ orden: i }).eq("id", id);
        }
      }

      await cargarPlatos();
    },
  });
}

guardarPlatoBtn.onclick = async () => {
  const nombre = platoNombre.value.trim();
  if (!nombre) {
    showInlineNotice("Escribe el nombre del plato.", "error");
    platoNombre?.focus();
    return;
  }

  const categoryIds = getSelectedPlatoCategoryIds();
  if (!categoryIds.length) {
    showInlineNotice("Selecciona al menos una categoria.", "error");
    if (platoCategoriaChecklist instanceof HTMLElement) {
      const firstCheckbox = platoCategoriaChecklist.querySelector(
        "input[type='checkbox']",
      );
      firstCheckbox?.focus();
    }
    return;
  }

  try {
    const currentUser = await requireUser();
    const imgFinal = getImagePickerValue("platoImagen");
    const selectedSubcategorias = getSelectedPlatoSubcategorias();

    const payloadBase = {
      plato: nombre,
      descripcion: platoDescripcion.value.trim() || null,
      precio: platoPrecio.value !== "" ? Number(platoPrecio.value) : null,
      subcategoria: selectedSubcategorias[0] || null,
      imagen_url: imgFinal || null,
      alergenos: alergenosSeleccionados,
      user_id: currentUser.id,
    };

    const id = editPlatoId.value;
    const wasEditing = Boolean(id);
    const result = await writeDishWithPayloadCandidates({
      dishId: id || null,
      payloadBase: id
        ? payloadBase
        : {
            ...payloadBase,
            activo: true,
            orden: 0,
          },
      categoryIds,
      subcategorias: selectedSubcategorias,
      allowPrimaryCategoryFallback: categoryIds.length <= 1,
      allowPrimarySubcategoriaFallback: selectedSubcategorias.length <= 1,
    });
    const { error } = result;

    if (error) throw error;

    if (wasEditing && isPlatoEditorModalOpen()) {
      closePlatoEditorModal({ reset: false });
    }
    resetPlatoForm();
    await cargarPlatos();
    showInlineNotice(id ? "Plato actualizado." : "Plato creado.", "success");
  } catch (e) {
    const triedMultiCategory = categoryIds.length > 1;
    const triedMultiSubcategoria = getSelectedPlatoSubcategorias().length > 1;
    const schemaMismatch = isLikelySchemaMismatch(e);

    if (triedMultiCategory && schemaMismatch) {
      showInlineNotice(
        "Tu base de datos aun no soporta categorias multiples en Menu. Hay que agregar una columna de categorias_ids/categoria_ids.",
        "error",
      );
      return;
    }
    if (triedMultiSubcategoria && schemaMismatch) {
      showInlineNotice(
        "Tu base de datos aun no soporta subcategorias multiples en Menu. Hay que agregar una columna de subcategorias_ids.",
        "error",
      );
      return;
    }
    showInlineError(e, "No se pudo guardar el plato.");
  }
};

// Toolbar listeners
platosCategoriaFilter?.addEventListener("change", renderPlatosFiltrados);
platosSearch?.addEventListener("input", renderPlatosFiltrados);

// ========== INIT ==========
async function cargarTodo() {
  cargarAlergenosGrid();
  await cargarPerfil();
  await cargarCategorias();
  await cargarPlatos();
  await cargarMenusCompuestos();
}

// Inicializa usando la sesion actual del proyecto.
(async () => {
  try {
    user = await requireUser();
    if (loginForm) loginForm.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
    await cargarTodo();
  } catch (error) {
    if (adminPanel) adminPanel.style.display = "none";
    if (loginForm) loginForm.style.display = "block";
    if (loginError) {
      loginError.textContent =
        "No se pudo cargar la sesion del navegador. Inicia sesion para continuar.";
    }
    console.warn("iMenu admin init:", error?.message || error);
  }
})();









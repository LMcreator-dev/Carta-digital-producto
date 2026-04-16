import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// =============================
// Supabase (usa tus credenciales actuales)
// =============================
const supabaseUrl = "https://tdeyzdaocphjopxrwykj.supabase.co";
const supabaseKey =
  "sb_publishable_LQrgEx8EeVDW2ExtHKgLsQ_OoOIwv-g";
const supabase = createClient(supabaseUrl, supabaseKey);
window.imenuPublic = { supabase };

const db = supabase.schema("CartaDigitalLM");
const params = new URLSearchParams(window.location.search);

function getPathClienteParam() {
  const parts = window.location.pathname
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === "menu") {
    return parts[parts.length - 2] || "";
  }
  return "";
}

// Compatibilidad:
// - /<slug>/menu
// - ?cliente=<uuid> (modo antiguo)
// - ?cliente=<slug> (nuevo: friendly)
// - ?bar=<slug>
const clienteParam =
  getPathClienteParam() || params.get("cliente") || params.get("bar");

function isUuid(v) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(v || ""),
  );
}

let clienteId = null; // siempre será UUID al final

// =============================
// DOM
// =============================
const viewHome = document.getElementById("viewHome");
const viewCategory = document.getElementById("viewCategory");

const cover = document.getElementById("cover");
const coverImg = document.getElementById("coverImg");
const coverLogoWrap = document.getElementById("coverLogoWrap");
const coverLogo = document.getElementById("coverLogo");
const placeTitle = document.getElementById("placeTitle");
const homeCategories = document.getElementById("homeCategories");
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");
const langMenu = document.getElementById("langMenu");
const langOptions = Array.from(
  document.querySelectorAll(".langOption[data-lang]"),
);

const ratingBtn = document.getElementById("ratingBtn");
const ratingPrimary = document.getElementById("ratingPrimary");
const ratingSecondary = document.getElementById("ratingSecondary");
const infoBtn = document.getElementById("infoBtn");
const infoSecondary = document.getElementById("infoSecondary");

const backBtn = document.getElementById("backBtn");
const categoryTitle = document.getElementById("categoryTitle");
const subcatChips = document.getElementById("subcatChips");
const dishList = document.getElementById("dishList");

const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const closeSearch = document.getElementById("closeSearch");
const searchBackdrop = document.getElementById("searchBackdrop");
const searchDropdown = document.getElementById("searchDropdown");

const homeSearchBtn = document.getElementById("homeSearchBtn");
const catSearchBtn = document.getElementById("catSearchBtn");

const ctaBtn = document.getElementById("ctaBtn");

const dishSheet = document.getElementById("dishSheet");
const sheetImageWrap = document.getElementById("sheetImageWrap");
const sheetImage = document.getElementById("sheetImage");
const sheetTitle = document.getElementById("sheetTitle");
const sheetPrice = document.getElementById("sheetPrice");
const sheetDesc = document.getElementById("sheetDesc");
const sheetAllergenSection = document.getElementById("sheetAllergenSection");
const sheetAllergens = document.getElementById("sheetAllergens");

const ratingsSheet = document.getElementById("ratingsSheet");
const ratingsValue = document.getElementById("ratingsValue");
const ratingsStars = document.getElementById("ratingsStars");
const ratingsCount = document.getElementById("ratingsCount");
const ratingsBars = document.getElementById("ratingsBars");
const openReviewsBtn = document.getElementById("openReviewsBtn");

const infoSheet = document.getElementById("infoSheet");
const infoTitle = document.getElementById("infoTitle");
const mapWrap = document.getElementById("mapWrap");
const mapFrame = document.getElementById("mapFrame");
const infoRows = document.getElementById("infoRows");
if (clearSearch) clearSearch.style.visibility = "hidden";

// =============================
// State
// =============================
let CATEGORIAS = [];
let PLATOS = [];

let ACTIVE_CAT_ID = null;
let ACTIVE_SUBCAT = "all";
let SEARCH_Q = "";
let SEARCH_ACTIVE_SUBCAT_KEY = null;
let historyLocked = false;
let CURRENT_LANG = "es";

// Perfil (opcional): si existe tabla "Perfiles" o "Perfil", la usamos.
let PROFILE = null;
const DEFAULT_PRIMARY_COLOR = "#FFE800";
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
const DISH_IMAGE_KEYS = ["imagen_url", "image_url", "foto_url", "img_url"];
const DISH_MULTI_CATEGORY_KEYS = [
  "categorias_ids",
  "categoria_ids",
  "categories_ids",
  "category_ids",
];

// =============================
// Utils
// =============================
const LANG_STORAGE_KEY = "imenu.lang";
const I18N = {
  es: {
    lang_label: "Español",
    lang_button: "Idioma",
    search: "Buscar",
    back: "Volver",
    categories: "Categorías",
    subcategories: "Subcategorías",
    loading: "Cargando...",
    search_no_results: "Sin resultados.",
    no_results: "No hay resultados.",
    no_dishes: "No hay platos en esta sección.",
    home_empty: "Esta carta aún no tiene categorías con platos.",
    category_default: "Categoría",
    subcat_all: "Todo",
    subcat_other: "Otros",
    home_title_default: "Carta",
    invalid_url: "URL inválida",
    error: "Error",
    missing_param_html:
      "Falta el parámetro <b>?cliente=</b> (UUID o slug) o <b>?bar=</b>.",
    not_found: "No encontrado",
    not_found_msg: "No existe ninguna carta con ese identificador.",
    load_error: "No se pudo cargar la carta: {msg}",
    reviews: "Reseñas",
    view_reviews: "Ver reseñas",
    info: "Info",
    info_secondary_default: "Wi‑Fi, Teléfono y Dirección",
    ratings: "Valoraciones",
    stars: "Estrellas",
    dish_details: "Detalle",
    allergens: "Alérgenos",
    allergen: "Alérgeno",
    map: "Mapa",
    close: "Cerrar",
    clear: "Borrar",
    results: "Resultados",
    write_review_google: "Escribir reseña en Google",
    view_on_google: "Ver en Google",
    rating_aspect_food: "Comida",
    rating_aspect_ambience: "Ambiente",
    rating_aspect_service: "Servicio",
    rating_aspect_clean: "Limpieza",
    rating_aspect_price: "Precio",
    wifi_title: "Wi‑Fi",
    wifi_prompt: "Introduce el PIN",
    wifi_pin_placeholder: "PIN",
    wifi_show_key: "Ver clave",
    wifi_copy_key: "Copiar clave",
    wifi_network_prefix: "Red: ",
    wifi_error_enter_pin: "Introduce el PIN.",
    wifi_error_no_local: "No se pudo identificar el local.",
    wifi_error_verify: "No se pudo verificar el PIN. Inténtalo de nuevo.",
    wifi_error_wrong: "PIN incorrecto.",
    wifi_result_prefix: "Clave: ",
    phone: "Teléfono",
    address: "Dirección",
    open: "Abrir",
    call: "Llamar",
  },
  en: {
    lang_label: "English",
    lang_button: "Language",
    search: "Search",
    back: "Back",
    categories: "Categories",
    subcategories: "Subcategories",
    loading: "Loading...",
    search_no_results: "No results.",
    no_results: "No results.",
    no_dishes: "No dishes in this section.",
    home_empty: "This menu has no categories with dishes yet.",
    category_default: "Category",
    subcat_all: "All",
    subcat_other: "Others",
    home_title_default: "Menu",
    invalid_url: "Invalid URL",
    error: "Error",
    missing_param_html:
      "Missing parameter <b>?cliente=</b> (UUID or slug) or <b>?bar=</b>.",
    not_found: "Not found",
    not_found_msg: "No menu found with that identifier.",
    load_error: "Couldn't load the menu: {msg}",
    reviews: "Reviews",
    view_reviews: "View reviews",
    info: "Info",
    info_secondary_default: "Wi‑Fi, Phone and Address",
    ratings: "Ratings",
    stars: "Stars",
    dish_details: "Details",
    allergens: "Allergens",
    allergen: "Allergen",
    map: "Map",
    close: "Close",
    clear: "Clear",
    results: "Results",
    write_review_google: "Write a Google review",
    view_on_google: "View on Google",
    rating_aspect_food: "Food",
    rating_aspect_ambience: "Ambience",
    rating_aspect_service: "Service",
    rating_aspect_clean: "Cleanliness",
    rating_aspect_price: "Price",
    wifi_title: "Wi‑Fi",
    wifi_prompt: "Enter PIN",
    wifi_pin_placeholder: "PIN",
    wifi_show_key: "Show password",
    wifi_copy_key: "Copy password",
    wifi_network_prefix: "Network: ",
    wifi_error_enter_pin: "Enter the PIN.",
    wifi_error_no_local: "Could not identify the venue.",
    wifi_error_verify: "Couldn't verify the PIN. Try again.",
    wifi_error_wrong: "Incorrect PIN.",
    wifi_result_prefix: "Password: ",
    phone: "Phone",
    address: "Address",
    open: "Open",
    call: "Call",
  },
};

function normalize(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatPrice(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return `${n.toFixed(2)} \u20AC`;
}

const APP_BASE_URL = new URL("../", import.meta.url);

function baseUrl(path) {
  const clean = String(path || "").replace(/^\//, "");
  return new URL(clean, APP_BASE_URL).toString();
}

function normalizeAllergenKey(v) {
  const raw = (v || "").toString().trim().toLowerCase();
  if (!raw) return "";

  // si viene como 'gluten.svg' o 'alergenos/gluten.svg'
  const clean = raw.replace(/^alergenos\//, "").replace(/\.svg$/, "");
  const n = clean
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  // Mapeo tolerante: si en BD guardaste textos tipo "cereales con gluten",
  // los convertimos a las keys que tienes como SVG.
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
  if (
    includes("frutos") &&
    (includes("cascara") || includes("carcara") || includes("secos"))
  )
    return "frutos_secos";

  // fallback: convierte espacios a _ para intentar cargar un SVG con ese nombre
  return n.replace(/\s+/g, "_");
}

function allergenKeyToUrl(v) {
  const key = normalizeAllergenKey(v);
  if (!key) return null;
  return baseUrl(`alergenos/${key}.svg`);
}

function renderStars(container, value) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  container.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const span = document.createElement("span");
    span.className = "star";
    if (i < full) span.textContent = "★";
    else if (i == full && half) span.textContent = "★";
    else span.textContent = "☆";
    container.appendChild(span);
  }
}

function openGenericSheet(sheetEl) {
  sheetEl.classList.add("is-open");
  sheetEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGenericSheet(sheetEl) {
  sheetEl.classList.remove("is-open");
  sheetEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function safeText(v) {
  return (v ?? "").toString();
}

function normalizeOptionalUrl(value) {
  const url = safeText(value).trim();
  if (!url) return "";
  const raw = url.toLowerCase();
  if (raw === "null" || raw === "undefined" || raw === "nan") return "";
  if (/^(?:[a-z]+:)?\/\//i.test(url)) return url;
  if (/^(data|blob|mailto|tel):/i.test(url)) return url;
  return baseUrl(url);
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

function getDishCategoryIds(plato) {
  const multiRaw = pick(plato, DISH_MULTI_CATEGORY_KEYS);
  const multi = parseCategoryIds(multiRaw);
  if (multi.length) return multi;
  const single = Number(plato?.categoria_id);
  return Number.isFinite(single) ? [single] : [];
}

function getDishPrimaryCategoryId(plato) {
  const ids = getDishCategoryIds(plato);
  return ids.length ? ids[0] : null;
}

function platoInCategory(plato, catId) {
  const target = Number(catId);
  if (!Number.isFinite(target)) return false;
  return getDishCategoryIds(plato).includes(target);
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return null;
}

function getProfileDishPlaceholderUrl() {
  return normalizeOptionalUrl(pick(PROFILE, PROFILE_DISH_PLACEHOLDER_KEYS));
}

function getProfileLogoUrl() {
  return normalizeOptionalUrl(pick(PROFILE, PROFILE_LOGO_KEYS));
}

function getDishImageInfo(plato) {
  const primary = normalizeOptionalUrl(pick(plato, DISH_IMAGE_KEYS));
  const fallback = getProfileDishPlaceholderUrl();
  return {
    primary,
    fallback,
    preferred: primary || fallback,
  };
}

function setCoverLogo(url, altText = "") {
  if (!coverLogoWrap || !coverLogo) return;
  const normalized = normalizeOptionalUrl(url);
  if (!normalized) {
    coverLogoWrap.style.display = "none";
    coverLogo.removeAttribute("src");
    return;
  }
  coverLogoWrap.style.display = "";
  coverLogo.src = normalized;
  coverLogo.alt = altText;
  coverLogo.onerror = () => {
    coverLogoWrap.style.display = "none";
    coverLogo.removeAttribute("src");
  };
}

function applyDishImageWithFallback(
  img,
  { primary = "", fallback = "", onFinalFail = null } = {},
) {
  if (!img) return;
  const main = normalizeOptionalUrl(primary);
  const alt = normalizeOptionalUrl(fallback);
  const initial = main || alt;
  if (!initial) {
    if (typeof onFinalFail === "function") onFinalFail();
    return;
  }

  const hasDistinctFallback = !!main && !!alt && main !== alt;
  let switchedToFallback = !hasDistinctFallback;
  img.src = initial;
  img.onerror = () => {
    if (!switchedToFallback && alt) {
      switchedToFallback = true;
      img.src = alt;
      return;
    }
    img.removeAttribute("src");
    if (typeof onFinalFail === "function") onFinalFail();
  };
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

function ensureContrast(colorHex, againstHex, minRatio = 4.5) {
  const base = normalizeHexColor(colorHex) || DEFAULT_PRIMARY_COLOR;
  const against = normalizeHexColor(againstHex) || "#FFFFFF";
  if (contrastRatio(base, against) >= minRatio) return base;

  const againstLum = relativeLuminance(
    hexToRgb(against) || { r: 255, g: 255, b: 255 },
  );
  const target = againstLum < 0.5 ? "#FFFFFF" : "#000000";
  for (let i = 1; i <= 20; i++) {
    const candidate = mixHex(base, target, i / 20);
    if (contrastRatio(candidate, against) >= minRatio) return candidate;
  }
  return target;
}

function bestTextColor(backgroundHex) {
  const darkContrast = contrastRatio(backgroundHex, "#121212");
  const lightContrast = contrastRatio(backgroundHex, "#FFFFFF");
  return darkContrast >= lightContrast ? "#121212" : "#FFFFFF";
}

function applyPublicTheme(primaryColor) {
  const accent = normalizeHexColor(primaryColor) || DEFAULT_PRIMARY_COLOR;
  const accentOnLight = ensureContrast(accent, "#FFFFFF", 2.2);
  const accentOnDark = ensureContrast(accent, "#1F1F1F", 3.2);
  const accentInk = bestTextColor(accentOnLight);
  const cfg = {
    frameWidth: "2px",
    frameAlpha: 0.34,
    frameShadow: 0.12,
    frameRingWidth: "2px",
    frameRingAlpha: 0.08,
    iconBg: 0.14,
    iconBorder: 0.24,
  };
  const theme = {
    "--bg": "#efeff2",
    "--bg-soft-1": "rgba(31,31,31,.05)",
    "--bg-soft-2": "rgba(31,31,31,.03)",
    "--card": "#ffffff",
    "--surface": "#ffffff",
    "--surface-soft": "#fafafb",
    "--surface-press": "#f2f2f5",
    "--line": "#e6e6e9",
    "--chip": "#f3f3f5",
    "--chipActive": accentOnLight,
    "--chipActiveText": bestTextColor(accentOnLight),
    "--accent": accentOnLight,
    "--accent-strong": mixHex(accentOnLight, "#FFFFFF", 0.18),
    "--accent-ink": accentInk,
    "--accent-on-light": accentOnLight,
    "--accent-on-dark": accentOnDark,
    "--accent-soft": toRgba(accentOnLight, cfg.iconBg),
    "--accent-shadow": toRgba(accentOnDark, 0.24),
    "--frame-width": cfg.frameWidth,
    "--frame-border": toRgba(accentOnLight, cfg.frameAlpha),
    "--frame-shadow": toRgba(accentOnLight, cfg.frameShadow),
    "--frame-ring-width": cfg.frameRingWidth,
    "--frame-ring": toRgba(accentOnLight, cfg.frameRingAlpha),
    "--home-icon-bg": toRgba(accentOnLight, cfg.iconBg),
    "--home-icon-color": accentOnLight,
    "--home-icon-border": toRgba(accentOnLight, cfg.iconBorder),
    "--cover-gradient": "linear-gradient(135deg,#d7d7dd,#f5f5f7)",
  };
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }
}

function t(key, vars) {
  const dict = I18N[CURRENT_LANG] || I18N.es;
  let str = dict?.[key] ?? I18N.es?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

function applyI18nToDom() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr;
    const value = t(key);
    if (attr) el.setAttribute(attr, value);
    else el.textContent = value;
  });
}

function localizeField(obj, baseKey, fallbackKeys = []) {
  if (!obj) return "";
  if (CURRENT_LANG === "en") {
    const enKey = `${baseKey}_en`;
    const enVal = obj[enKey];
    if (enVal != null && enVal !== "") return enVal;
  }
  const value = pick(obj, [baseKey, ...fallbackKeys]);
  return value != null ? value : "";
}

function getCategoryName(cat) {
  return safeText(localizeField(cat, "nombre"));
}

function getDishName(plato) {
  return safeText(localizeField(plato, "plato"));
}

function getDishDesc(plato) {
  return safeText(localizeField(plato, "descripcion"));
}

function getDishSubcat(plato) {
  return safeText(
    localizeField(plato, "subcategoria", ["sub_category", "subcat"]),
  );
}

function updateReviewsButtonText() {
  if (!openReviewsBtn) return;
  const writeReviewUrl = PROFILE ? getWriteReviewUrl(PROFILE) : null;
  const fallbackReviewsUrl = PROFILE
    ? pick(PROFILE, ["reviews_url", "valoraciones_url"])
    : null;
  const finalReviewsUrl = writeReviewUrl || fallbackReviewsUrl;
  if (!finalReviewsUrl) return;
  openReviewsBtn.textContent = writeReviewUrl
    ? t("write_review_google")
    : t("view_on_google");
}

function applyI18n({ rerender = true } = {}) {
  if (langMenu?.classList.contains("is-open")) closeLangMenu();
  if (langBtn) langBtn.setAttribute("aria-expanded", "false");
  if (langLabel) langLabel.textContent = t("lang_label");
  document.documentElement.lang = CURRENT_LANG;
  applyI18nToDom();

  langOptions.forEach((opt) => {
    const active = opt.dataset.lang === CURRENT_LANG;
    opt.classList.toggle("is-active", active);
    opt.setAttribute("aria-selected", active ? "true" : "false");
  });

  if (!ACTIVE_CAT_ID && categoryTitle) {
    categoryTitle.textContent = t("category_default");
  }
  if (!PROFILE && placeTitle) {
    placeTitle.textContent = t("home_title_default");
  }
  updateReviewsButtonText();
  if (infoSheet?.classList.contains("is-open")) {
    const name = pick(PROFILE, [
      "nombre",
      "name",
      "restaurant_name",
      "local_name",
      "titulo",
    ]);
    infoTitle.textContent = name ? name : t("info");
  }

  if (rerender) {
    applyProfileToHome();
    renderHome();
    renderSearchDropdown();
    if (ACTIVE_CAT_ID) {
      ACTIVE_SUBCAT = "all";
      renderSubcatChips(ACTIVE_CAT_ID);
      renderDishList(ACTIVE_CAT_ID);
    }
  }
}

function setLang(lang, { persist = true, rerender = true } = {}) {
  if (!I18N[lang]) return;
  CURRENT_LANG = lang;
  if (persist) localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyI18n({ rerender });
}

function initLang() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && I18N[stored]) CURRENT_LANG = stored;
  applyI18n({ rerender: false });
}

function getWriteReviewUrl(profile) {
  const placeId = pick(profile, [
    "google_place_id",
    "place_id",
    "googlePlaceId",
  ]);
  if (!placeId) return null;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

function getGoogleReviewsSearchUrl(profile) {
  const placeId = pick(profile, [
    "google_place_id",
    "place_id",
    "googlePlaceId",
  ]);
  if (!placeId) return null;

  // Usa el nombre del local como query; si no existe, al menos ponemos "restaurante"
  const q =
    pick(profile, [
      "nombre",
      "name",
      "restaurant_name",
      "local_name",
      "titulo",
    ]) || "restaurante";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&query_place_id=${encodeURIComponent(placeId)}`;
}

function setView(which) {
  const home = which === "home";
  viewHome.classList.toggle("is-hidden", !home);
  viewCategory.classList.toggle("is-active", !home);
  viewHome.setAttribute("aria-hidden", home ? "false" : "true");
  viewCategory.setAttribute("aria-hidden", home ? "true" : "false");
}

function openSearch() {
  if (!searchOverlay.classList.contains("is-open")) {
    pushHistoryState({ modal: "search" });
  }
  if (clearSearch) clearSearch.style.visibility = SEARCH_Q ? "visible" : "hidden";
  searchOverlay.classList.add("is-open");
  searchOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderSearchDropdown();
  setTimeout(() => searchInput.focus(), 50);
}

function closeSearchOverlay() {
  searchOverlay.classList.remove("is-open");
  searchOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function pushHistoryState(state) {
  if (historyLocked) return;
  history.pushState(state, "");
}

function handleBackNavigation() {
  historyLocked = true;

  if (searchOverlay?.classList.contains("is-open")) {
    closeSearchOverlay();
  } else if (wifiPinModal?.classList.contains("is-open")) {
    closeWifiPinModal();
  } else if (allergenZoom?.classList.contains("is-open")) {
    closeAllergenZoom();
  } else if (dishSheet?.classList.contains("is-open")) {
    closeSheet();
  } else if (ratingsSheet?.classList.contains("is-open")) {
    closeGenericSheet(ratingsSheet);
  } else if (infoSheet?.classList.contains("is-open")) {
    closeGenericSheet(infoSheet);
  } else if (viewCategory?.classList.contains("is-active")) {
    goHome();
  }

  setTimeout(() => {
    historyLocked = false;
  }, 0);
}

window.addEventListener("popstate", handleBackNavigation);

function openSheet(plato) {
  pushHistoryState({ modal: "dish" });
  dishSheetDrag?.reset();
  const imgInfo = getDishImageInfo(plato);
  if (imgInfo.preferred) {
    sheetImageWrap.style.display = "";
    const dishName = getDishName(plato);
    sheetImage.alt = dishName ? `${dishName}` : "";
    applyDishImageWithFallback(sheetImage, {
      ...imgInfo,
      onFinalFail: () => {
        sheetImageWrap.style.display = "none";
      },
    });
  } else {
    sheetImageWrap.style.display = "none";
    sheetImage.removeAttribute("src");
  }

  sheetTitle.textContent = getDishName(plato);
  sheetPrice.textContent =
    plato.precio != null ? formatPrice(plato.precio) : "";
  sheetDesc.textContent = getDishDesc(plato);

  // alergenos: usamos tus SVG de /alergenos (sin texto). Click => ampliar.
  const alergs = Array.isArray(plato.alergenos) ? plato.alergenos : [];
  sheetAllergens.innerHTML = "";
  if (alergs.length) {
    sheetAllergenSection.style.display = "";
    alergs.forEach((aRaw) => {
      const key = normalizeAllergenKey(aRaw);
      if (!key) return;
      const img = document.createElement("img");
      img.className = "sheetAllergenIcon";
      img.alt = key.replace(/_/g, " ");
      img.title = img.alt;
      img.src = allergenKeyToUrl(key);
      img.loading = "lazy";
      img.addEventListener("click", (ev) => {
        ev.stopPropagation();
        openAllergenZoom(img.src, img.alt);
      });
      // si falla, simplemente lo ocultamos (no mostramos texto)
      img.onerror = () => img.remove();
      sheetAllergens.appendChild(img);
    });
  } else {
    sheetAllergenSection.style.display = "none";
  }

  dishSheet.classList.add("is-open");
  dishSheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// =============================
// Sheet drag-to-close
// =============================
function setupSheetDrag(sheetEl, closeFn, extraDragZone) {
  if (!sheetEl) return null;
  const card = sheetEl.querySelector(".sheetCard");
  const handle = sheetEl.querySelector(".sheetHandle");
  if (!card || !handle) return null;

  let startY = 0;
  let offsetY = 0;
  let dragging = false;

  function setDrag(y) {
    card.style.transform = `translateX(-50%) translateY(${y}px)`;
  }

  function reset() {
    card.style.transform = "";
    card.classList.remove("is-dragging");
  }

  function onDown(e) {
    if (!sheetEl.classList.contains("is-open")) return;
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    startY = e.clientY;
    offsetY = 0;
    card.classList.add("is-dragging");
    card.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    if (!dragging) return;
    const dy = Math.max(0, e.clientY - startY);
    offsetY = dy;
    setDrag(dy);
  }

  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    card.releasePointerCapture?.(e.pointerId);
    card.classList.remove("is-dragging");
    if (offsetY > 120) {
      closeFn();
    } else {
      reset();
    }
  }

  handle.addEventListener("pointerdown", onDown);
  extraDragZone?.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  return { reset };
}

const dishSheetDrag = setupSheetDrag(dishSheet, closeSheet, sheetImageWrap);
const ratingsSheetDrag = setupSheetDrag(ratingsSheet, () =>
  closeGenericSheet(ratingsSheet),
);
const infoSheetDrag = setupSheetDrag(infoSheet, () =>
  closeGenericSheet(infoSheet),
);

// =============================
// Allergen zoom (lightbox)
// =============================
const allergenZoom = document.getElementById("allergenZoom");
const allergenZoomImg = document.getElementById("allergenZoomImg");
const allergenZoomTitle = document.getElementById("allergenZoomTitle");
const allergenZoomClose = document.getElementById("allergenZoomClose");
const allergenZoomBackdrop = document.getElementById("allergenZoomBackdrop");

function openAllergenZoom(src, title) {
  if (!allergenZoom) return;
  pushHistoryState({ modal: "allergen" });
  allergenZoomImg.src = src;
  allergenZoomTitle.textContent = title || t("allergen");
  allergenZoom.classList.add("is-open");
  allergenZoom.setAttribute("aria-hidden", "false");
}

function closeAllergenZoom() {
  if (!allergenZoom) return;
  allergenZoom.classList.remove("is-open");
  allergenZoom.setAttribute("aria-hidden", "true");
  allergenZoomImg.removeAttribute("src");
}

allergenZoomClose?.addEventListener("click", closeAllergenZoom);
allergenZoomBackdrop?.addEventListener("click", closeAllergenZoom);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && allergenZoom?.classList.contains("is-open"))
    closeAllergenZoom();
});

function closeSheet() {
  dishSheet.classList.remove("is-open");
  dishSheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// =============================
// Render
// =============================
function renderHome() {
  homeCategories.innerHTML = "";

  const catsWithItems = CATEGORIAS.filter((c) =>
    PLATOS.some((p) => platoInCategory(p, c.id)),
  );
  if (!catsWithItems.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = t("home_empty");
    homeCategories.appendChild(p);
    return;
  }

  catsWithItems.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "catBtn";
    btn.textContent = getCategoryName(cat);
    btn.addEventListener("click", () => {
      goCategory(String(cat.id));
    });
    homeCategories.appendChild(btn);
  });
}

function buildChip(label, active) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `chip${active ? " is-active" : ""}`;
  btn.textContent = label;
  return btn;
}

function renderSubcatChips(catId) {
  subcatChips.innerHTML = "";
  ACTIVE_SUBCAT = ACTIVE_SUBCAT || "all";

  const platosCat = PLATOS.filter((p) => platoInCategory(p, catId));
  const subcats = Array.from(
    new Set(
      platosCat
        .map((p) => getDishSubcat(p))
        .filter(Boolean)
        .map((s) => safeText(s).trim())
        .filter(Boolean),
    ),
  );

  // Siempre "Todo"
  const allChip = buildChip(t("subcat_all"), ACTIVE_SUBCAT === "all");
  allChip.addEventListener("click", () => {
    ACTIVE_SUBCAT = "all";
    renderSubcatChips(catId);
    renderDishList(catId);
  });
  subcatChips.appendChild(allChip);

  subcats.forEach((sc) => {
    const chip = buildChip(sc, ACTIVE_SUBCAT === sc);
    chip.addEventListener("click", () => {
      ACTIVE_SUBCAT = sc;
      renderSubcatChips(catId);
      renderDishList(catId);
    });
    subcatChips.appendChild(chip);
  });
}

function getSubcatLabel(plato) {
  return (
    safeText(getDishSubcat(plato)).trim() || t("subcat_other")
  );
}

function matchesSearch(plato, q) {
  if (!q) return true;
  const name = normalize(getDishName(plato));
  const desc = normalize(getDishDesc(plato));
  return name.includes(q) || desc.includes(q);
}

function renderSearchDropdown() {
  if (!searchDropdown) return;
  searchDropdown.innerHTML = "";

  if (!PLATOS.length || !CATEGORIAS.length) {
    const empty = document.createElement("div");
    empty.className = "searchEmpty";
    empty.textContent = t("loading");
    searchDropdown.appendChild(empty);
    return;
  }

  const q = normalize(SEARCH_Q);
  const filtered = PLATOS.filter((p) => matchesSearch(p, q));

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "searchEmpty";
    empty.textContent = t("search_no_results");
    searchDropdown.appendChild(empty);
    return;
  }

  const hasQuery = q.length > 0;
  if (hasQuery) {
    SEARCH_ACTIVE_SUBCAT_KEY = null;
    const list = document.createElement("div");
    list.className = "searchResults";
    filtered.forEach((plato) => {
      const row = buildSearchItemRow(plato);
      list.appendChild(row);
    });
    searchDropdown.appendChild(list);
    return;
  }

  const bySub = new Map();
  filtered.forEach((p) => {
    const sc = getSubcatLabel(p);
    if (!bySub.has(sc)) bySub.set(sc, []);
    bySub.get(sc).push(p);
  });

  const subcats = Array.from(bySub.keys());
  if (SEARCH_ACTIVE_SUBCAT_KEY && !bySub.has(SEARCH_ACTIVE_SUBCAT_KEY)) {
    SEARCH_ACTIVE_SUBCAT_KEY = null;
  }

  subcats.forEach((sc) => {
    const subOpen = SEARCH_ACTIVE_SUBCAT_KEY === sc;
    const subWrap = document.createElement("div");
    subWrap.className = "searchSubGroup";

    const subToggle = document.createElement("button");
    subToggle.type = "button";
    subToggle.className = "searchSubToggle";
    subToggle.setAttribute("aria-expanded", subOpen ? "true" : "false");
    subToggle.addEventListener("click", () => {
      SEARCH_ACTIVE_SUBCAT_KEY =
        SEARCH_ACTIVE_SUBCAT_KEY === sc ? null : sc;
      renderSearchDropdown();
    });

    const subTitle = document.createElement("h1");
    subTitle.className = "searchSubTitle";
    subTitle.textContent = sc;

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("viewBox", "0 0 24 24");
    arrow.classList.add("dropdownArrow");
    const arrowPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    arrowPath.setAttribute("d", "M8 5l8 7-8 7");
    arrow.appendChild(arrowPath);

    subToggle.appendChild(subTitle);
    subToggle.appendChild(arrow);
    subWrap.appendChild(subToggle);

    const list = document.createElement("div");
    list.className = `searchItems${subOpen ? " is-open" : ""}`;

    const items = bySub.get(sc) || [];
    items.forEach((plato) => {
      const row = buildSearchItemRow(plato);
      list.appendChild(row);
    });

    subWrap.appendChild(list);
    searchDropdown.appendChild(subWrap);
  });
}

function goToItemFromSearch(plato) {
  const catId = String(getDishPrimaryCategoryId(plato) || "");
  const subcatRaw = safeText(getDishSubcat(plato)).trim();
  if (!catId) return;

  ACTIVE_CAT_ID = catId;
  ACTIVE_SUBCAT = subcatRaw || "all";
  SEARCH_Q = "";
  if (searchInput) searchInput.value = "";
  if (clearSearch) clearSearch.style.visibility = "hidden";

  closeSearchOverlay();
  pushHistoryState({ view: "category", catId });
  setView("category");
  renderSubcatChips(catId);
  renderDishList(catId);
  openSheet(plato);
}

function passesSearch(plato) {
  const q = normalize(SEARCH_Q);
  if (!q) return true;
  const name = normalize(getDishName(plato));
  const desc = normalize(getDishDesc(plato));
  return name.includes(q) || desc.includes(q);
}

function renderDishList(catId) {
  const cat = CATEGORIAS.find((c) => String(c.id) === String(catId));
  categoryTitle.textContent = cat ? getCategoryName(cat) : t("category_default");

  dishList.innerHTML = "";

  const platosCat = PLATOS.filter(
    (p) => platoInCategory(p, catId),
  )
    .filter((p) => {
      if (ACTIVE_SUBCAT === "all") return true;
      const sc = getDishSubcat(p);
      return safeText(sc).trim() === ACTIVE_SUBCAT;
    })
    .filter(passesSearch);

  if (!platosCat.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = SEARCH_Q
      ? t("no_results")
      : t("no_dishes");
    dishList.appendChild(empty);
    return;
  }

  // Si existen subcategorías, pintamos separadores por grupo (como NordQR)
  const hasSubcats = PLATOS.some(
    (p) => platoInCategory(p, catId) && getDishSubcat(p),
  );
  if (hasSubcats && ACTIVE_SUBCAT === "all") {
    const groups = new Map();
    platosCat.forEach((p) => {
      const sc = safeText(getDishSubcat(p) || t("subcat_other")).trim() ||
        t("subcat_other");
      if (!groups.has(sc)) groups.set(sc, []);
      groups.get(sc).push(p);
    });

    for (const [sc, items] of groups.entries()) {
      const h = document.createElement("h2");
      h.className = "groupTitle";
      h.textContent = sc;
      dishList.appendChild(h);
      items.forEach((p) => dishList.appendChild(buildDishRow(p)));
    }
  } else {
    if (hasSubcats && ACTIVE_SUBCAT !== "all") {
      const h = document.createElement("h2");
      h.className = "groupTitle";
      h.textContent = ACTIVE_SUBCAT;
      dishList.appendChild(h);
    }
    platosCat.forEach((p) => dishList.appendChild(buildDishRow(p)));
  }
}

function buildDishRow(plato) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dishRow";
  btn.addEventListener("click", () => openSheet(plato));

  const left = document.createElement("div");
  left.className = "dishLeft";

  const name = document.createElement("div");
  name.className = "dishName";
  name.textContent = getDishName(plato);

  const desc = document.createElement("div");
  desc.className = "dishDesc";
  desc.textContent = getDishDesc(plato);

  const price = document.createElement("div");
  price.className = "dishPrice";
  price.textContent = plato.precio != null ? formatPrice(plato.precio) : "";

  // iconitos alérgenos (tipo NordQR: justo al lado del nombre)
  const alergs = Array.isArray(plato.alergenos) ? plato.alergenos : [];
  if (alergs.length) {
    const badgeWrap = document.createElement("span");
    badgeWrap.className = "miniBadges";
    alergs.slice(0, 3).forEach((a) => {
      const s = document.createElement("span");
      s.className = "miniBadge";
      const img = document.createElement("img");
      img.className = "allergenIcon miniBadgeImg";
      const key = normalizeAllergenKey(a);
      if (!key) return;
      img.alt = key.replace(/_/g, " ");
      img.title = img.alt;
      const url = allergenKeyToUrl(key);
      if (url) img.src = url;
      img.onerror = () => {
        s.textContent = "•";
      };
      s.appendChild(img);
      badgeWrap.appendChild(s);
    });
    const titleLine = document.createElement("div");
    titleLine.className = "dishTitleLine";
    titleLine.appendChild(name);
    titleLine.appendChild(badgeWrap);
    left.appendChild(titleLine);
  } else {
    left.appendChild(name);
  }

  if (desc.textContent) left.appendChild(desc);
  if (plato.precio != null) left.appendChild(price);

  const right = document.createElement("div");
  right.className = "dishRight";

  const imgInfo = getDishImageInfo(plato);
  if (imgInfo.preferred) {
    const img = document.createElement("img");
    img.alt = getDishName(plato);
    img.loading = "lazy";
    applyDishImageWithFallback(img, {
      ...imgInfo,
      onFinalFail: () => {
        right.style.display = "none";
      },
    });
    right.appendChild(img);
  } else {
    // si no hay imagen, oculta el hueco
    right.style.display = "none";
  }

  btn.appendChild(left);
  btn.appendChild(right);
  return btn;
}

function buildSearchItemRow(plato) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dishRow";
  btn.addEventListener("click", () => goToItemFromSearch(plato));

  const left = document.createElement("div");
  left.className = "dishLeft";

  const name = document.createElement("div");
  name.className = "dishName";
  name.textContent = getDishName(plato);

  const desc = document.createElement("div");
  desc.className = "dishDesc";
  desc.textContent = getDishDesc(plato);

  const price = document.createElement("div");
  price.className = "dishPrice";
  price.textContent = plato.precio != null ? formatPrice(plato.precio) : "";

  const alergs = Array.isArray(plato.alergenos) ? plato.alergenos : [];
  if (alergs.length) {
    const badgeWrap = document.createElement("span");
    badgeWrap.className = "miniBadges";
    alergs.slice(0, 3).forEach((a) => {
      const s = document.createElement("span");
      s.className = "miniBadge";
      const img = document.createElement("img");
      img.className = "allergenIcon miniBadgeImg";
      const key = normalizeAllergenKey(a);
      if (!key) return;
      img.alt = key.replace(/_/g, " ");
      img.title = img.alt;
      const url = allergenKeyToUrl(key);
      if (url) img.src = url;
      img.onerror = () => {
        s.textContent = "•";
      };
      s.appendChild(img);
      badgeWrap.appendChild(s);
    });
    const titleLine = document.createElement("div");
    titleLine.className = "dishTitleLine";
    titleLine.appendChild(name);
    titleLine.appendChild(badgeWrap);
    left.appendChild(titleLine);
  } else {
    left.appendChild(name);
  }

  if (desc.textContent) left.appendChild(desc);
  if (plato.precio != null) left.appendChild(price);

  const right = document.createElement("div");
  right.className = "dishRight";

  const imgInfo = getDishImageInfo(plato);
  if (imgInfo.preferred) {
    const img = document.createElement("img");
    img.alt = getDishName(plato);
    img.loading = "lazy";
    applyDishImageWithFallback(img, {
      ...imgInfo,
      onFinalFail: () => {
        right.style.display = "none";
      },
    });
    right.appendChild(img);
  } else {
    right.style.display = "none";
  }

  btn.appendChild(left);
  btn.appendChild(right);
  return btn;
}

// =============================
// Navigation
// =============================
function goCategory(catId, options = {}) {
  const { push = true } = options;
  ACTIVE_CAT_ID = catId;
  ACTIVE_SUBCAT = "all";
  SEARCH_Q = "";
  searchInput.value = "";
  clearSearch.style.visibility = "hidden";

  setView("category");
  renderSubcatChips(catId);
  renderDishList(catId);
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (push) pushHistoryState({ view: "category", catId });
}

function goHome() {
  ACTIVE_CAT_ID = null;
  ACTIVE_SUBCAT = "all";
  SEARCH_Q = "";
  searchInput.value = "";
  clearSearch.style.visibility = "hidden";
  setView("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =============================
// Load
// =============================
async function loadProfileIfExists() {
  // Intentamos dos nombres para no romperte si ya has creado uno.
  const candidates = ["Perfil_publico"]; // 👈 fuente pública (sin wifi_pass)
  for (const table of candidates) {
    try {
      const { data, error } = await db
        .from(table)
        .select("*")
        .eq("user_id", clienteId)
        .limit(1)
        .maybeSingle();
      if (error) continue;
      if (data) {
        PROFILE = { table, ...data };
        return;
      }
    } catch {
      // ignore
    }
  }
}

function applyProfileToHome() {
  if (!PROFILE) {
    applyPublicTheme(DEFAULT_PRIMARY_COLOR);
    // Fallback: si no hay portada, ponemos un degradado para no quedar feo
    coverImg.style.display = "none";
    cover.style.background = "var(--cover-gradient)";
    setCoverLogo("");
    placeTitle.textContent = t("home_title_default");
    return;
  }

  applyPublicTheme(
    pick(PROFILE, PROFILE_PRIMARY_COLOR_KEYS) || DEFAULT_PRIMARY_COLOR,
  );

  const name = pick(PROFILE, [
    "nombre",
    "name",
    "restaurant_name",
    "local_name",
    "titulo",
  ]);
  if (name) placeTitle.textContent = name;
  setCoverLogo(getProfileLogoUrl(), name ? `${name} logo` : "");

  const portada = pick(PROFILE, [
    "portada_url",
    "cover_url",
    "imagen_portada",
    "hero_url",
    "banner_url",
  ]);
  if (portada) {
    coverImg.src = portada;
    coverImg.style.display = "";
  } else {
    coverImg.style.display = "none";
    cover.style.background = "var(--cover-gradient)";
  }

  // Reseñas / Rating (opcional)
  // Mostramos el "botón de reseñas" si hay rating o si existe google_place_id (para abrir Google Maps).
  const rating = pick(PROFILE, ["rating", "valoracion", "stars"]);
  const googleReviewsUrl = getGoogleReviewsSearchUrl(PROFILE);

  if (rating != null || googleReviewsUrl) {
    ratingBtn.style.display = "";

    // Texto del botón (home)
    ratingPrimary.textContent = t("reviews");
    ratingSecondary.textContent = t("view_reviews");
  }

  // Info (opcional)
  const info = [];
  if (pick(PROFILE, ["wifi", "wifi_name"])) info.push(t("wifi_title"));
  if (pick(PROFILE, ["telefono", "phone"])) info.push(t("phone"));
  if (pick(PROFILE, ["direccion", "address"])) info.push(t("address"));
  if (info.length) {
    infoBtn.style.display = "";
    infoSecondary.textContent = info.join(", ");
  }

  // CTA valoraciones (opcional)
  const reviewsUrl = pick(PROFILE, [
    "reviews_url",
    "google_reviews_url",
    "valoraciones_url",
  ]);
  if (reviewsUrl && ctaBtn) {
    ctaBtn.style.display = "";
    ctaBtn.addEventListener("click", () =>
      window.open(reviewsUrl, "_blank", "noopener"),
    );
  }

  updateReviewsButtonText();
}

async function loadMenu() {
  dishList.innerHTML = `<div class="loading">${t("loading")}</div>`;

  if (!clienteParam) {
    placeTitle.textContent = t("invalid_url");
    homeCategories.innerHTML = `<p class="muted">${t("missing_param_html")}</p>`;
    return;
  }

  // Resolver UUID final
  if (isUuid(clienteParam)) {
    clienteId = clienteParam;
  } else {
    // Nuevo modo: slug en Perfil.slug
    const slug = String(clienteParam).trim();
    const { data: perfilBySlug, error: slugErr } = await db
      .from("Perfil_publico")
      .select("user_id")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (slugErr || !perfilBySlug?.user_id) {
      placeTitle.textContent = t("not_found");
      homeCategories.innerHTML = `<p class="muted">${t("not_found_msg")}</p>`;
      return;
    }
    clienteId = perfilBySlug.user_id;
    // (WiFi PIN) guardamos también en el contexto si ya existe
    if (_wifiCtx) _wifiCtx.clienteId = clienteId;
  }

  // Perfil opcional
  await loadProfileIfExists();
  applyProfileToHome();

  try {
    const { data: categorias, error: catError } = await db
      .from("Categorias")
      .select("*")
      .eq("user_id", clienteId)
      .eq("activa", true)
      .order("orden", { ascending: true });

    if (catError) throw catError;

    const { data: platos, error: platosError } = await db
      .from("Menu")
      .select("*")
      .eq("user_id", clienteId)
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (platosError) throw platosError;

    CATEGORIAS = Array.isArray(categorias) ? categorias : [];
    PLATOS = Array.isArray(platos) ? platos : [];

    renderHome();
    renderSearchDropdown();
    setView("home");
  } catch (e) {
    console.error(e);
    placeTitle.textContent = t("error");
    homeCategories.innerHTML = `<p class="muted">${t("load_error", {
      msg: safeText(e.message),
    })}</p>`;
  }
}

function openRatingsSheet() {
  if (!PROFILE) return;
  pushHistoryState({ modal: "ratings" });
  ratingsSheetDrag?.reset();
  const rating = pick(PROFILE, ["rating", "valoracion", "stars"]);
  ratingsValue.textContent = rating != null ? Number(rating).toFixed(1) : "-";
  renderStars(ratingsStars, rating || 0);
  ratingsCount.textContent = "";
  ratingsCount.style.display = "none";

  // Barras (UI): si no hay desglose real, aproximamos con el rating
  const aspects = [
    t("rating_aspect_food"),
    t("rating_aspect_ambience"),
    t("rating_aspect_service"),
    t("rating_aspect_clean"),
    t("rating_aspect_price"),
  ];
  ratingsBars.innerHTML = "";
  const base = Number(rating) || 4.5;
  aspects.forEach((label, i) => {
    const row = document.createElement("div");
    row.className = "barRow";
    const left = document.createElement("div");
    left.className = "barLabel";
    left.textContent = label;

    const track = document.createElement("div");
    track.className = "barTrack";
    const fill = document.createElement("div");
    fill.className = "barFill";
    const v = Math.max(0, Math.min(5, base + (i % 2 === 0 ? 0.1 : 0)));
    fill.style.width = `${(v / 5) * 100}%`;
    track.appendChild(fill);

    const val = document.createElement("div");
    val.className = "barValue";
    val.textContent = v.toFixed(1);

    row.appendChild(left);
    row.appendChild(track);
    row.appendChild(val);
    ratingsBars.appendChild(row);
  });

  const writeReviewUrl = getWriteReviewUrl(PROFILE);
  const fallbackReviewsUrl = pick(PROFILE, ["reviews_url", "valoraciones_url"]);
  const finalReviewsUrl = writeReviewUrl || fallbackReviewsUrl;
  if (finalReviewsUrl) {
    openReviewsBtn.style.display = "";
    openReviewsBtn.textContent = writeReviewUrl
      ? t("write_review_google")
      : t("view_on_google");
    openReviewsBtn.onclick = () =>
      window.open(finalReviewsUrl, "_blank", "noopener");
  } else {
    openReviewsBtn.style.display = "none";
  }

  openGenericSheet(ratingsSheet);
}

function openInfoSheet() {
  if (!PROFILE) return;
  pushHistoryState({ modal: "info" });
  infoSheetDrag?.reset();
  const name = pick(PROFILE, [
    "nombre",
    "name",
    "restaurant_name",
    "local_name",
    "titulo",
  ]);
  infoTitle.textContent = name ? name : t("info");

  const direccion = pick(PROFILE, ["direccion", "address"]);
  if (direccion) {
    mapWrap.style.display = "";
    mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
  } else {
    mapWrap.style.display = "none";
    mapFrame.removeAttribute("src");
  }

  const wifiName = pick(PROFILE, ["wifi_name", "wifi", "wifi_ssid"]);
  const wifiPass = pick(PROFILE, ["wifi_pass", "wifi_password", "wifiPass"]);
  const telefono = pick(PROFILE, ["telefono", "phone"]);

  infoRows.innerHTML = "";

  function row(icon, title, sub, actionLabel, onAction) {
    const wrap = document.createElement("div");
    wrap.className = "infoRow";
    const ic = document.createElement("div");
    ic.className = "infoRowIcon";
    ic.textContent = icon;
    const main = document.createElement("div");
    main.className = "infoRowMain";
    const t = document.createElement("div");
    t.className = "infoRowTitle";
    t.textContent = title;
    const s = document.createElement("div");
    s.className = "infoRowSub";
    s.textContent = sub;
    main.appendChild(t);
    main.appendChild(s);

    wrap.appendChild(ic);
    wrap.appendChild(main);

    if (actionLabel && onAction) {
      const btn = document.createElement("button");
      btn.className = "infoRowBtn";
      btn.type = "button";
      btn.textContent = actionLabel;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        onAction();
      });
      wrap.appendChild(btn);
    }

    return wrap;
  }

  if (wifiName) {
    const sub = wifiPass ? `${wifiName}` : `${wifiName}`;
    infoRows.appendChild(
      row("\uD83D\uDCF6", t("wifi_title"), sub, t("wifi_show_key"), () => {
        openWifiPinModal({ wifiName, clienteId });
      }),
    );
  }

  if (telefono) {
    infoRows.appendChild(
      row("\uD83D\uDCDE", t("phone"), telefono, t("call"), () => {
        window.location.href = `tel:${String(telefono).replace(/\s+/g, "")}`;
      }),
    );
  }

  if (direccion) {
    infoRows.appendChild(
      row("\uD83D\uDCCD", t("address"), direccion, t("open"), () => {
        window.open(
          `https://www.google.com/maps?q=${encodeURIComponent(direccion)}`,
          "_blank",
          "noopener",
        );
      }),
    );
  }

  openGenericSheet(infoSheet);
}

// =============================
// Events
// =============================
function openLangMenu() {
  if (!langMenu || !langBtn) return;
  langMenu.classList.add("is-open");
  langMenu.setAttribute("aria-hidden", "false");
  langBtn.setAttribute("aria-expanded", "true");
}

function closeLangMenu() {
  if (!langMenu || !langBtn) return;
  langMenu.classList.remove("is-open");
  langMenu.setAttribute("aria-hidden", "true");
  langBtn.setAttribute("aria-expanded", "false");
}

function toggleLangMenu() {
  if (!langMenu) return;
  if (langMenu.classList.contains("is-open")) closeLangMenu();
  else openLangMenu();
}

langBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleLangMenu();
});

langMenu?.addEventListener("click", (e) => {
  const btn = e.target?.closest?.(".langOption");
  if (!btn) return;
  const lang = btn.dataset.lang;
  if (lang) setLang(lang);
  closeLangMenu();
});

document.addEventListener("click", (e) => {
  if (!langMenu?.classList.contains("is-open")) return;
  const target = e.target;
  if (langMenu.contains(target) || langBtn?.contains(target)) return;
  closeLangMenu();
});

backBtn.addEventListener("click", goHome);

ratingBtn.addEventListener("click", () => {
  const url = PROFILE ? getGoogleReviewsSearchUrl(PROFILE) : null;
  if (url) return window.open(url, "_blank", "noopener");
  // Fallback: si no hay Place ID, abrimos la hoja de rating local
  openRatingsSheet();
});
infoBtn.addEventListener("click", openInfoSheet);

homeSearchBtn.addEventListener("click", () => {
  // Mantener en home: el buscador ahora es un dropdown global
  openSearch();
});

catSearchBtn.addEventListener("click", openSearch);

clearSearch.addEventListener("click", () => {
  SEARCH_Q = "";
  searchInput.value = "";
  clearSearch.style.visibility = "hidden";
  SEARCH_ACTIVE_SUBCAT_KEY = null;
  renderSearchDropdown();
  if (ACTIVE_CAT_ID) renderDishList(ACTIVE_CAT_ID);
});

searchInput.addEventListener("input", () => {
  SEARCH_Q = searchInput.value;
  clearSearch.style.visibility = SEARCH_Q ? "visible" : "hidden";
  if (!SEARCH_Q) SEARCH_ACTIVE_SUBCAT_KEY = null;
  renderSearchDropdown();
  if (ACTIVE_CAT_ID) renderDishList(ACTIVE_CAT_ID);
});

closeSearch.addEventListener("click", closeSearchOverlay);
searchBackdrop.addEventListener("click", closeSearchOverlay);

dishSheet.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "true") closeSheet();
});


ratingsSheet.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "true") closeGenericSheet(ratingsSheet);
});

infoSheet.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "true") closeGenericSheet(infoSheet);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (langMenu?.classList.contains("is-open")) closeLangMenu();
    if (dishSheet.classList.contains("is-open")) closeSheet();
    if (ratingsSheet.classList.contains("is-open"))
      closeGenericSheet(ratingsSheet);
    if (infoSheet.classList.contains("is-open")) closeGenericSheet(infoSheet);
    if (searchOverlay.classList.contains("is-open")) closeSearchOverlay();
  }
});

// =============================
// Init
// =============================
applyPublicTheme(DEFAULT_PRIMARY_COLOR);
initLang();
loadMenu();

// =============================
// Wi‑Fi PIN modal (revelar clave)
// =============================
const wifiPinModal = document.getElementById("wifiPinModal");
const wifiPinBackdrop = document.getElementById("wifiPinBackdrop");
const wifiPinClose = document.getElementById("wifiPinClose");
const wifiPinInput = document.getElementById("wifiPinInput");
const wifiPinSubmit = document.getElementById("wifiPinSubmit");
const wifiPinCopy = document.getElementById("wifiPinCopy");
const wifiPinError = document.getElementById("wifiPinError");
const wifiPinResult = document.getElementById("wifiPinResult");
const wifiPinSsid = document.getElementById("wifiPinSsid");

let _wifiCtx = null; // {wifiName, clienteId, slug, wifiPass}

function showWifiError(msg) {
  if (!wifiPinError) return;
  wifiPinError.textContent = msg;
  wifiPinError.style.display = msg ? "block" : "none";
}

function showWifiResult(msg) {
  if (!wifiPinResult) return;
  wifiPinResult.textContent = msg;
  wifiPinResult.style.display = msg ? "block" : "none";
}

function openWifiPinModal(ctx) {
  pushHistoryState({ modal: "wifi" });
  _wifiCtx = { ...ctx, wifiPass: null };
  window.imenuPublic.wifiCtx = _wifiCtx;
  if (wifiPinSsid)
    wifiPinSsid.textContent = ctx.wifiName
      ? `${t("wifi_network_prefix")}${ctx.wifiName}`
      : "";
  showWifiError("");
  showWifiResult("");
  if (wifiPinInput) wifiPinInput.value = "";
  if (wifiPinCopy) {
    wifiPinCopy.disabled = true;
    wifiPinCopy.textContent = t("wifi_copy_key");
  }
  if (wifiPinModal) {
    wifiPinModal.setAttribute("aria-hidden", "false");
    wifiPinModal.classList.add("is-open");
  }
  setTimeout(() => wifiPinInput?.focus?.(), 50);
}

function closeWifiPinModal() {
  if (wifiPinModal) {
    wifiPinModal.setAttribute("aria-hidden", "true");
    wifiPinModal.classList.remove("is-open");
  }
  _wifiCtx = null;
}

async function fetchWifiPass() {
  if (!_wifiCtx) return null;

  const pin = wifiPinInput?.value?.trim();
  if (!pin) {
    showWifiError(t("wifi_error_enter_pin"));
    return null;
  }

  if (!_wifiCtx.clienteId) {
    showWifiError(t("wifi_error_no_local"));
    return null;
  }

  showWifiError("");

  const { data, error } = await supabase.rpc("imenu_get_wifi_by_user", {
    p_user_id: _wifiCtx.clienteId,
    p_pin: pin,
  });

  console.log("[wifi-pin] rpc result", { data, error, ctx: _wifiCtx });

  if (error) {
    showWifiError(t("wifi_error_verify"));
    return null;
  }

  // data puede ser array (table function)
  const row = Array.isArray(data) ? data[0] : data;
  const pass = row?.wifi_pass;

  if (!pass) {
    showWifiError(t("wifi_error_wrong"));
    return null;
  }

  _wifiCtx.wifiPass = String(pass);
  showWifiResult(`${t("wifi_result_prefix")}${_wifiCtx.wifiPass}`);
  if (wifiPinCopy) wifiPinCopy.disabled = false;
  return _wifiCtx.wifiPass;
}

wifiPinBackdrop?.addEventListener("click", closeWifiPinModal);
wifiPinClose?.addEventListener("click", closeWifiPinModal);

wifiPinSubmit?.addEventListener("click", async () => {
  await fetchWifiPass();
});

wifiPinCopy?.addEventListener("click", async () => {
  const pass = _wifiCtx?.wifiPass || (await fetchWifiPass());
  if (!pass) return;
  try {
    await navigator.clipboard.writeText(String(pass));
  } catch {}
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWifiPinModal();
});




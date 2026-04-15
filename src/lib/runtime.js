import { Capacitor } from "@capacitor/core";

const normalizeString = (value) => String(value || "").trim().toLowerCase();

export const isNativeRuntime = () => {
  if (Capacitor?.isNativePlatform?.()) {
    return true;
  }

  if (typeof window === "undefined") return false;

  const protocol = normalizeString(window.location.protocol);
  if (protocol === "capacitor:" || protocol === "ionic:") {
    return true;
  }

  const capacitorPlatform = normalizeString(window.__CAPACITOR_PLATFORM__);
  if (capacitorPlatform && capacitorPlatform !== "web") {
    return true;
  }

  const hostname = normalizeString(window.location.hostname);
  const userAgent = String(window.navigator?.userAgent || "");
  if (hostname === "localhost") {
    return /;\s*wv\)/i.test(userAgent) || /capacitor/i.test(userAgent) || /ionic/i.test(userAgent);
  }

  return false;
};

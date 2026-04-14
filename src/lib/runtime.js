import { Capacitor } from "@capacitor/core";

export const isNativeRuntime = () => {
  if (Capacitor?.isNativePlatform?.()) {
    return true;
  }

  if (typeof window === "undefined") return false;

  const protocol = String(window.location.protocol || "").toLowerCase();
  if (protocol === "capacitor:" || protocol === "ionic:") {
    return true;
  }

  const capacitorPlatform = String(window.__CAPACITOR_PLATFORM__ || "").toLowerCase();
  if (capacitorPlatform && capacitorPlatform !== "web") {
    return true;
  }

  const hostname = String(window.location.hostname || "").toLowerCase();
  const userAgent = String(window.navigator?.userAgent || "");
  return hostname === "localhost" && /;\s*wv\)/i.test(userAgent);
};

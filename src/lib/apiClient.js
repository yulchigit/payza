import axios from "axios";
import { isNativeRuntime } from "lib/runtime";

const DEFAULT_PUBLIC_API_BASE_URL = "https://payza.up.railway.app/api";

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const isLikelyPlaceholderUrl = (value) => {
  const lower = String(value || "").trim().toLowerCase();
  if (!lower) return false;
  return (
    lower.includes("your-domain.com") ||
    lower.includes("example.com") ||
    lower.includes("replace-me") ||
    lower.includes("placeholder")
  );
};

const tryParseUrl = (value) => {
  try {
    return new URL(value);
  } catch (error) {
    return null;
  }
};

const isAbsoluteHttpUrl = (value) => {
  const parsed = tryParseUrl(value);
  return Boolean(parsed && (parsed.protocol === "https:" || parsed.protocol === "http:"));
};

const isLocalhostUrl = (value) => {
  const parsed = tryParseUrl(value);
  return Boolean(parsed && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"));
};

const isSameOriginAsCurrentPage = (value) => {
  if (typeof window === "undefined") return false;

  const parsed = tryParseUrl(value);
  if (!parsed) return false;

  const currentProtocol = String(window.location.protocol || "").toLowerCase();
  const currentHost = String(window.location.host || "").toLowerCase();
  if (!currentProtocol || !currentHost) return false;

  return parsed.protocol.toLowerCase() === currentProtocol && parsed.host.toLowerCase() === currentHost;
};

const isUnsafeHostedFrontendApiUrl = (value) => {
  if (!isAbsoluteHttpUrl(value)) {
    return true;
  }

  if (isLikelyPlaceholderUrl(value)) {
    return true;
  }

  if (isSameOriginAsCurrentPage(value) && !isLocalhostUrl(value)) {
    return true;
  }

  return false;
};

const readConfiguredBaseUrl = (...candidates) => {
  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (!normalized) continue;
    if (isUnsafeHostedFrontendApiUrl(normalized)) continue;
    return normalized;
  }
  return "";
};

const resolveApiBaseUrl = () => {
  const mobileBaseUrl = readConfiguredBaseUrl(import.meta.env.VITE_MOBILE_API_BASE_URL);
  const webBaseUrl = readConfiguredBaseUrl(import.meta.env.VITE_API_BASE_URL);

  const isNative = isNativeRuntime();
  const resolved = (() => {
    if (isNative) {
      if (mobileBaseUrl) {
        return mobileBaseUrl;
      }

      if (webBaseUrl && !isLocalhostUrl(webBaseUrl)) {
        return webBaseUrl;
      }

      return DEFAULT_PUBLIC_API_BASE_URL;
    }

    if (webBaseUrl) {
      return webBaseUrl;
    }

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

      if (isLocalHost) {
        return "http://localhost:5000/api";
      }
    }

    return DEFAULT_PUBLIC_API_BASE_URL;
  })();

  if (import.meta.env.DEV) {
    console.debug("[apiClient] resolved API base URL", { resolved, isNative, mobileBaseUrl, webBaseUrl });
  }

  return resolved;
};

const apiBaseUrl = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export default apiClient;

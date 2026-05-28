const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");

export const resolveAssetUrl = (value) => {
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${apiBaseUrl}${parsed.pathname}`;
      }
    } catch {
      return value;
    }
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${apiBaseUrl}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${apiBaseUrl}/${value}`;
  }

  if (!value.startsWith("/") && /\.[a-zA-Z0-9]{2,5}$/.test(value)) {
    return `${apiBaseUrl}/uploads/${value}`;
  }

  return `${apiBaseUrl}/${value.replace(/^\/+/, "")}`;
};

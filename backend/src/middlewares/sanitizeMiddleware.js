import xss from "xss";

const clean = (value) => {
  if (typeof value === "string") {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map(clean);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = clean(value[key]);
    }
    return out;
  }
  return value;
};

export const sanitizeBody = (req, _res, next) => {
  req.body = clean(req.body);
  next();
};

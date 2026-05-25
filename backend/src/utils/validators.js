const blockedEmailDomains = new Set([
  "example.com",
  "test.com",
  "fake.com",
  "mailinator.com",
  "tempmail.com",
  "yopmail.com",
  "guerrillamail.com"
]);

export const isRealisticEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  const basicEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  if (!basicEmailRegex.test(normalized)) {
    return false;
  }

  const domain = normalized.split("@")[1];
  return !blockedEmailDomains.has(domain);
};

export const isValidLocation = (location) => {
  if (!location || typeof location !== "string") {
    return false;
  }

  const normalized = location.trim();
  const locationRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.,\-\s]{3,100}$/;
  return locationRegex.test(normalized);
};
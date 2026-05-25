export const getUserId = (user) => {
  if (!user) return null;
  return user.id_usuario ?? user.sub ?? user.id ?? null;
};

export const normalizeAuthUser = (decoded) => ({
  ...decoded,
  id_usuario: getUserId(decoded),
  id: getUserId(decoded)
});

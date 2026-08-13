import bcrypt from "bcrypt";

export const SALT_ROUNDS = 12;

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const isStrongPassword = (password) => passwordRegex.test(password);

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

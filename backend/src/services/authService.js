import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/index.js";
import { isStrongPassword } from "../utils/password.js";
import { isRealisticEmail, isValidLocation } from "../utils/validators.js";

const SALT_ROUNDS = 12;

export const registerUser = async (payload) => {
  const { nombre, apellido, email, password, telefono, ubicacion, rol } = payload;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedLocation = ubicacion.trim();

  if (!isRealisticEmail(normalizedEmail)) {
    const error = new Error("Ingresa un correo electronico real y valido");
    error.status = 400;
    throw error;
  }

  if (!isValidLocation(normalizedLocation)) {
    const error = new Error("Ingresa una ubicacion valida");
    error.status = 400;
    throw error;
  }

  if (!isStrongPassword(password)) {
    const error = new Error("La contrasena debe tener minimo 8 caracteres, mayuscula, minuscula, numero y simbolo");
    error.status = 400;
    throw error;
  }

  const emailExists = await User.findOne({ where: { email: normalizedEmail } });
  if (emailExists) {
    const error = new Error("El correo ya esta registrado");
    error.status = 409;
    throw error;
  }

  if (telefono) {
    const phoneExists = await User.findOne({ where: { telefono } });
    if (phoneExists) {
      const error = new Error("El telefono ya esta registrado");
      error.status = 409;
      throw error;
    }
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    nombre,
    apellido,
    email: normalizedEmail,
    telefono,
    ubicacion: normalizedLocation,
    password_hash,
    rol: rol || "usuario"
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: user.id_usuario,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return { user, token };
};

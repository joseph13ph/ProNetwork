import { registerUser, loginUser } from "../services/authService.js";
import { User } from "../models/index.js";
import { getUserId } from "../utils/auth.js";
import { isStrongPassword } from "../utils/password.js";
import {
  consumePasswordResetToken,
  createPasswordResetRequest,
  createPremiumPayment,
  getPasswordResetStatus,
  getPremiumPaymentStatus,
  isPremiumUser
} from "../services/emulationService.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        ubicacion: user.ubicacion,
        foto_perfil: user.foto_perfil,
        telefono: user.telefono
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    return res.status(200).json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        ubicacion: user.ubicacion,
        foto_perfil: user.foto_perfil,
        telefono: user.telefono
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = getUserId(req.user);
    const user = await User.findByPk(userId, {
      attributes: ["id_usuario", "nombre", "apellido", "email", "rol", "ubicacion", "foto_perfil", "telefono"]
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const userId = getUserId(req.user);
    const allowedFields = ["nombre", "apellido", "ubicacion", "foto_perfil", "telefono"];
    const payload = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    await User.update(payload, { where: { id_usuario: userId } });

    const user = await User.findByPk(userId, {
      attributes: ["id_usuario", "nombre", "apellido", "email", "rol", "ubicacion", "foto_perfil", "telefono"]
    });

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Correo es requerido" });

    const user = await User.findOne({ where: { email }, attributes: ["id_usuario", "email"] });
    const request = createPasswordResetRequest({ email, userId: user?.id_usuario ?? null });

    return res.status(200).json({
      message: "Hemos procesado tu solicitud. Revisa tu correo en unos segundos.",
      data: {
        requestId: request.requestId,
        email,
        status: request.status,
        etaSeconds: 3,
        resetLink: `/reset-password?token=${request.token}`
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPasswordStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const status = getPasswordResetStatus(requestId);
    if (!status) return res.status(404).json({ message: "Solicitud no encontrada" });
    return res.status(200).json({ data: status });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: "La contraseña debe tener mayúscula, minúscula, número, símbolo y mínimo 8 caracteres"
      });
    }

    const result = consumePasswordResetToken({ token });
    if (!result.ok) {
      const map = {
        TOKEN_INVALID: "Token inválido",
        TOKEN_EXPIRED: "Token expirado",
        TOKEN_USED: "Token ya utilizado"
      };
      return res.status(400).json({ message: map[result.reason] || "No se pudo restablecer la contraseña" });
    }

    if (!result.userId) {
      return res.status(200).json({ message: "Contraseña actualizada" });
    }

    await User.update({ password: newPassword }, { where: { id_usuario: result.userId } });
    return res.status(200).json({ message: "Contraseña actualizada" });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Invalida la sesión
    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    return next(error);
  }
};

export const premiumSubscription = async (req, res, next) => {
  try {
    const userId = getUserId(req.user);
    const plan = req.body?.plan || "premium_monthly";
    const payment = createPremiumPayment({ userId, plan });

    return res.status(202).json({
      message: "Pago recibido. Estamos confirmando la transacción.",
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        plan: payment.plan,
        etaSeconds: 5
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const premiumStatus = async (req, res, next) => {
  try {
    const userId = getUserId(req.user);
    const { paymentId } = req.params;
    const payment = getPremiumPaymentStatus({ paymentId, userId });
    if (!payment) return res.status(404).json({ message: "Transacción no encontrada" });

    return res.status(200).json({
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        transactionId: payment.transactionId,
        processedAt: payment.processedAt,
        isPremium: isPremiumUser(userId)
      }
    });
  } catch (error) {
    return next(error);
  }
};

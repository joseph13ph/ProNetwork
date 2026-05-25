import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  me,
  register,
  forgotPassword,
  forgotPasswordStatus,
  resetPassword,
  logout,
  premiumSubscription,
  premiumStatus,
  updateMe
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import { isRealisticEmail, isValidLocation } from "../utils/validators.js";

const router = Router();

router.post(
  "/register",
  [
    body("nombre").trim().notEmpty(),
    body("apellido").trim().notEmpty(),
    body("email")
      .trim()
      .custom((value) => isRealisticEmail(value))
      .withMessage("Ingresa un correo electronico real y valido"),
    body("ubicacion")
      .trim()
      .custom((value) => isValidLocation(value))
      .withMessage("Ingresa una ubicacion valida (solo letras y signos permitidos)"),
    body("password").isLength({ min: 8 })
  ],
  validateRequest,
  register
);

router.post("/login", [body("email").isEmail(), body("password").notEmpty()], validateRequest, login);
router.get("/me", protect, me);
router.put("/me", protect, updateMe);
router.post("/forgot-password", forgotPassword);
router.get("/forgot-password/:requestId/status", forgotPasswordStatus);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logout);
router.post("/premium", protect, premiumSubscription);
router.get("/premium/:paymentId/status", protect, premiumStatus);

export default router;

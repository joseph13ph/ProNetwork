import { createSimpleController } from "./moduleControllerFactory.js";

export const postsController = createSimpleController("publicacion");
export const commentsController = createSimpleController("comentario");
export const connectionsController = createSimpleController("conexion");
export const messagesController = createSimpleController("mensaje");
export const jobsController = createSimpleController("empleo");
export const applicationsController = createSimpleController("aplicacion");
export const notificationsController = createSimpleController("notificacion");
export const adminController = createSimpleController("administracion");

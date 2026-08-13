import { sequelize } from "../config/db.js";
import { User } from "./User.js";
import { Profile } from "./Profile.js";
import { Post } from "./Post.js";
import { Comment } from "./Comment.js";
import { Like } from "./Like.js";
import { Notification } from "./Notification.js";
import { Job } from "./Job.js";
import { Application } from "./Application.js";
import { Message } from "./Message.js";
import { Connection } from "./Connection.js";
import { SavedPost } from "./SavedPost.js";

// Perfil (definido en Profile.js con id_usuario)
// Relaciones de Feed y Comentarios
User.hasMany(Post, { foreignKey: "userId", sourceKey: "id_usuario" });
Post.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario" });

Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "postId" });

User.hasMany(Comment, { foreignKey: "userId", sourceKey: "id_usuario" });
Comment.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario" });

User.hasMany(Like, { foreignKey: "userId", sourceKey: "id_usuario", constraints: false });
Like.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario", constraints: false });

Post.hasMany(Like, { foreignKey: "postId", onDelete: "CASCADE", constraints: false });
Like.belongsTo(Post, { foreignKey: "postId", constraints: false });

User.hasMany(Notification, { foreignKey: "userId", sourceKey: "id_usuario", constraints: false });
Notification.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario", constraints: false });

User.hasMany(Application, { foreignKey: "userId", sourceKey: "id_usuario" });
Job.hasMany(Application, { foreignKey: "jobId" });
Application.belongsTo(Job, { foreignKey: "jobId" });
Application.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario" });

User.hasMany(SavedPost, { foreignKey: "userId", sourceKey: "id_usuario", constraints: false });
SavedPost.belongsTo(User, { foreignKey: "userId", targetKey: "id_usuario", constraints: false });

Post.hasMany(SavedPost, { foreignKey: "postId", onDelete: "CASCADE", constraints: false });
SavedPost.belongsTo(Post, { foreignKey: "postId", constraints: false });

export {
  sequelize,
  User,
  Profile,
  Post,
  Comment,
  Like,
  Notification,
  Job,
  Application,
  Message,
  Connection,
  SavedPost
};

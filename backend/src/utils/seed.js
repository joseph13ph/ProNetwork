import bcrypt from "bcrypt";
import { sequelize, User, Post, Comment, Job } from "../models/index.js";
import { initDatabase } from "../config/initDatabase.js";

const users = [
  { nombre: "Ana", apellido: "Quintero", email: "ana@proconnect.dev", telefono: "584120000001", ubicacion: "Caracas", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", password: "Password#2026" },
  { nombre: "Carlos", apellido: "Mendez", email: "carlos@proconnect.dev", telefono: "584120000002", ubicacion: "Bogota", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", password: "Password#2026" },
  { nombre: "Laura", apellido: "Torres", email: "laura@proconnect.dev", telefono: "584120000003", ubicacion: "Medellin", rol: "reclutador", foto_perfil: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", password: "Password#2026" },
  { nombre: "Diego", apellido: "Perez", email: "diego@proconnect.dev", telefono: "584120000004", ubicacion: "Quito", rol: "administrador", foto_perfil: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", password: "Password#2026" },
  { nombre: "Elena", apellido: "Gomez", email: "elena@proconnect.dev", telefono: "584120000005", ubicacion: "Lima", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80", password: "Password#2026" },
  { nombre: "Fernando", apellido: "Rios", email: "fernando@proconnect.dev", telefono: "584120000006", ubicacion: "Santiago", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", password: "Password#2026" },
  { nombre: "Gabriela", apellido: "Soto", email: "gabriela@proconnect.dev", telefono: "584120000007", ubicacion: "Buenos Aires", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", password: "Password#2026" },
  { nombre: "Hector", apellido: "Navarro", email: "hector@proconnect.dev", telefono: "584120000008", ubicacion: "Madrid", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&q=80", password: "Password#2026" },
  { nombre: "Isabella", apellido: "Ruiz", email: "isabella@proconnect.dev", telefono: "584120000009", ubicacion: "Mexico DF", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80", password: "Password#2026" },
  { nombre: "Javier", apellido: "Castro", email: "javier@proconnect.dev", telefono: "584120000010", ubicacion: "Miami", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80", password: "Password#2026" },
  { nombre: "Joseph", apellido: "Perez", email: "joseph@proconnect.dev", telefono: "584120000011", ubicacion: "Colombia", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", password: "Password#2026" },
  { nombre: "Mariana", apellido: "Luna", email: "mariana@proconnect.dev", telefono: "584120000012", ubicacion: "Montevideo", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", password: "Password#2026" },
  { nombre: "Nicolas", apellido: "Ortega", email: "nicolas@proconnect.dev", telefono: "584120000013", ubicacion: "Valencia", rol: "reclutador", foto_perfil: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80", password: "Password#2026" },
  { nombre: "Paula", apellido: "Vega", email: "paula@proconnect.dev", telefono: "584120000014", ubicacion: "Madrid", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=400&q=80", password: "Password#2026" }
];

const postsData = [
  { email: "ana@proconnect.dev", content: "¡Lanzamos una nueva funcionalidad de networking con mejor rendimiento y UX! Feliz de liderar este equipo de Frontend.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
  { email: "carlos@proconnect.dev", content: "Analizando nuevas arquitecturas de microservicios con Node.js y Docker. El ecosistema evoluciona muy rápido. ¿Qué opinan de Kubernetes para proyectos medianos?", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80" },
  { email: "laura@proconnect.dev", content: "Estamos contratando Desarrolladores React Senior. Trabajo 100% remoto, beneficios internacionales. Interesados enviar mensaje directo. #HiringNow #React", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" },
  { email: "diego@proconnect.dev", content: "La ciberseguridad ya no es opcional. Hoy implementamos nuevas políticas Zero Trust en la infraestructura principal.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" },
  { email: "elena@proconnect.dev", content: "Mi nuevo setup de trabajo. La iluminación adecuada cambia por completo tu estado de ánimo y productividad.", image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80" },
  { email: "fernando@proconnect.dev", content: "Increíble charla sobre Inteligencia Artificial generativa hoy en la mañana. El futuro es ahora. #AI #Tech", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
  { email: "gabriela@proconnect.dev", content: "Diseñando la nueva UI para nuestra aplicación móvil. Enfocándonos en glassmorphism y micro-interacciones fluidas ✨.", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
  { email: "hector@proconnect.dev", content: "Migrando bases de datos de 10TB sin downtime. El estrés es real pero el aprendizaje es brutal.", image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80" },
  { email: "isabella@proconnect.dev", content: "¡Por fin conseguí mi certificación AWS Solutions Architect! Un paso más en mi carrera cloud ☁️.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" },
  { email: "javier@proconnect.dev", content: "El análisis de datos nos está mostrando patrones de consumo que no esperábamos. SQL + Python FTW.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { email: "mariana@proconnect.dev", content: "Hoy subimos nuestro primer prototipo de producto y ya hay feedback real de usuarios. Eso le da vida a todo el proyecto.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" },
  { email: "nicolas@proconnect.dev", content: "Estoy revisando perfiles para un equipo de data y cloud. Se buscan personas curiosas, con ganas de construir y aprender.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" },
  { email: "paula@proconnect.dev", content: "Una buena interfaz no solo se ve bien: guía, inspira y simplifica. Hoy afinamos ese detalle final.", image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80" }
];

const commentsData = [
  { postIndex: 0, email: "carlos@proconnect.dev", content: "¡Excelente trabajo Ana! Se nota mucho la mejora de rendimiento." },
  { postIndex: 0, email: "elena@proconnect.dev", content: "La nueva interfaz está increíble. ¡Gran UX!" },
  { postIndex: 1, email: "diego@proconnect.dev", content: "Docker es excelente, pero para Kubernetes te recomiendo esperar a tener más de 10 microservicios." },
  { postIndex: 1, email: "hector@proconnect.dev", content: "Coincido con Diego. La complejidad operativa de K8s no vale la pena al inicio." },
  { postIndex: 2, email: "ana@proconnect.dev", content: "¡Compartido con mi red! Éxitos en la búsqueda." },
  { postIndex: 2, email: "fernando@proconnect.dev", content: "Te envié mi CV Laura." },
  { postIndex: 4, email: "gabriela@proconnect.dev", content: "Ese teclado mecánico se ve espectacular, ¿qué switches usas?" },
  { postIndex: 5, email: "isabella@proconnect.dev", content: "La IA generativa está cambiando hasta cómo escribimos código, es fascinante." },
  { postIndex: 8, email: "carlos@proconnect.dev", content: "¡Felicitaciones Isabella! Un gran logro." },
  { postIndex: 8, email: "ana@proconnect.dev", content: "Felicidades! AWS es el futuro." },
  { postIndex: 10, email: "javier@proconnect.dev", content: "Ese feedback real es oro puro para mejorar producto." },
  { postIndex: 11, email: "mariana@proconnect.dev", content: "Los datos del prototipo seguro nos van a dar decisiones claras." },
  { postIndex: 12, email: "paula@proconnect.dev", content: "Me gusta mucho que se esté cuidando la parte visual y el tono de marca." }
];

const run = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const createdUsers = {};

    for (const item of users) {
      const password_hash = await bcrypt.hash(item.password, 12);
      let user = await User.findOne({ where: { email: item.email } });
      if (!user) {
        user = await User.create({ ...item, password_hash });
      } else {
        await user.update({ password_hash, foto_perfil: item.foto_perfil });
      }
      createdUsers[item.email] = user;
    }

    // Limpiar posts y comentarios antiguos para poblar limpio si se corre varias veces (opcional, pero mejor lo dejamos así)
    
    // Seed Posts
    const createdPosts = [];
    for (const postItem of postsData) {
      const user = createdUsers[postItem.email];
      if (user) {
        const userId = user.id_usuario;
        // Chequear si ya existe para no duplicar
        let post = await Post.findOne({ where: { content: postItem.content, userId } });
        if (!post) {
          post = await Post.create({ content: postItem.content, image: postItem.image, userId });
        }
        createdPosts.push(post);
      }
    }

    // Seed Comments
    for (const commentItem of commentsData) {
      const user = createdUsers[commentItem.email];
      const post = createdPosts[commentItem.postIndex];
      if (user && post) {
        const userId = user.id_usuario;
        let comment = await Comment.findOne({ where: { content: commentItem.content, postId: post.id } });
        if (!comment) {
          await Comment.create({ content: commentItem.content, userId, postId: post.id });
        }
      }
    }

    const jobsData = [
      { titulo: "Frontend React Senior", empresa: "NovaTech", modalidad: "remoto", ubicacion: "Latam", descripcion: "Desarrollo de interfaces con React y TypeScript para producto B2B.", habilidades: "React,TypeScript,UI" },
      { titulo: "Backend Node.js", empresa: "CloudLabs", modalidad: "hibrido", ubicacion: "Bogota", descripcion: "APIs escalables con Node, MySQL y buenas practicas de seguridad.", habilidades: "Node,MySQL,API" },
      { titulo: "Diseñador UX/UI", empresa: "CreativeHub", modalidad: "remoto", ubicacion: "Mexico DF", descripcion: "Diseño de experiencias para red social profesional.", habilidades: "Figma,UX,UI" },
      { titulo: "DevOps Engineer", empresa: "InfraCloud", modalidad: "presencial", ubicacion: "Caracas", descripcion: "Automatizacion CI/CD y despliegues en la nube.", habilidades: "Docker,Kubernetes,AWS" }
    ];

    for (const jobItem of jobsData) {
      const exists = await Job.findOne({ where: { titulo: jobItem.titulo, empresa: jobItem.empresa } });
      if (!exists) {
        await Job.create(jobItem);
      }
    }

    // eslint-disable-next-line no-console
    console.log("Usuarios, publicaciones, empleos e imagenes sembradas correctamente!");
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creando semillas", error);
    process.exit(1);
  }
};

run();

import bcrypt from "bcrypt";
import { sequelize, User, Profile, Post, Comment, Like, Notification, Job } from "../models/index.js";
import { initDatabase } from "../config/initDatabase.js";

const users = [
  { nombre: "Ana", apellido: "Quintero", email: "ana@proconnect.dev", telefono: "584120000001", ubicacion: "Caracas", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", password: "AnaPro#2026" },
  { nombre: "Carlos", apellido: "Mendez", email: "carlos@proconnect.dev", telefono: "584120000002", ubicacion: "Bogota", rol: "usuario", foto_perfil: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", password: "CarlosDev#2026" },
  { nombre: "Laura", apellido: "Torres", email: "laura@proconnect.dev", telefono: "584120000003", ubicacion: "Medellin", rol: "reclutador", foto_perfil: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", password: "LauraHR#2026" },
  { nombre: "Diego", apellido: "Perez", email: "diego@proconnect.dev", telefono: "584120000004", ubicacion: "Quito", rol: "administrador", foto_perfil: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", password: "DiegoAdmin#2026" },
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
  { email: "ana@proconnect.dev", content: "Hoy afinamos el diseño responsive y el flujo de navegación. Los pequeños detalles hacen la diferencia.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" },
  { email: "carlos@proconnect.dev", content: "Analizando nuevas arquitecturas de microservicios con Node.js y Docker. ¿Qué opinan de Kubernetes para proyectos medianos?", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80" },
  { email: "carlos@proconnect.dev", content: "Optimicé una consulta pesada y bajó de 2.1s a 180ms. SQL bien pensado sigue siendo magia.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { email: "laura@proconnect.dev", content: "Estamos contratando Desarrolladores React Senior. Trabajo 100% remoto y beneficios internacionales.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" },
  { email: "laura@proconnect.dev", content: "Abrimos vacantes para perfiles Full Stack y DevOps. Si conoces a alguien, compártelo.", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" },
  { email: "diego@proconnect.dev", content: "La ciberseguridad ya no es opcional. Hoy implementamos nuevas políticas Zero Trust en la infraestructura principal.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" },
  { email: "diego@proconnect.dev", content: "Automatizar despliegues reduce errores y libera tiempo para mejorar producto.", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80" },
  { email: "elena@proconnect.dev", content: "Mi nuevo setup de trabajo. La iluminación adecuada cambia por completo tu estado de ánimo y productividad.", image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80" },
  { email: "elena@proconnect.dev", content: "Un buen layout también mejora cómo pensamos el producto. Diseño con intención siempre.", image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80" },
  { email: "fernando@proconnect.dev", content: "Increíble charla sobre Inteligencia Artificial generativa hoy en la mañana. El futuro es ahora.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
  { email: "fernando@proconnect.dev", content: "Estoy probando un flujo de automatización con Python y me está ahorrando horas de trabajo.", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80" },
  { email: "gabriela@proconnect.dev", content: "Diseñando la nueva UI para nuestra aplicación móvil. Enfocados en micro-interacciones fluidas ✨.", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
  { email: "gabriela@proconnect.dev", content: "Revisando componentes y tokens de diseño para que todo se vea consistente en cada pantalla.", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80" },
  { email: "hector@proconnect.dev", content: "Migrando bases de datos sin downtime. El estrés es real pero el aprendizaje es brutal.", image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80" },
  { email: "hector@proconnect.dev", content: "Monitoreo y alertas bien afinadas evitan incendios en producción.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80" },
  { email: "isabella@proconnect.dev", content: "¡Por fin conseguí mi certificación AWS Solutions Architect! Un paso más en mi carrera cloud ☁️.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" },
  { email: "isabella@proconnect.dev", content: "Preparando una guía de buenas prácticas para despliegues en la nube compartida con el equipo.", image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80" },
  { email: "javier@proconnect.dev", content: "El análisis de datos nos está mostrando patrones de consumo que no esperábamos. SQL + Python FTW.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
  { email: "javier@proconnect.dev", content: "Limpiar datos sigue siendo la mitad del trabajo en cualquier proyecto serio de analítica.", image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80" },
  { email: "joseph@proconnect.dev", content: "Hoy probé una nueva integración y reduje fricción en el flujo de onboarding. Pequeñas mejoras, gran impacto.", image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800&q=80" },
  { email: "joseph@proconnect.dev", content: "Documentar mejor el proyecto me está ayudando a entregar más rápido y con menos errores.", image: "https://images.unsplash.com/photo-1516321310764-8d9b2b7e2d0c?w=800&q=80" },
  { email: "mariana@proconnect.dev", content: "Hoy subimos nuestro primer prototipo y ya hay feedback real de usuarios.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" },
  { email: "mariana@proconnect.dev", content: "Iterar con usuarios reales cambia por completo la forma en que pensamos el producto.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" },
  { email: "nicolas@proconnect.dev", content: "Estoy revisando perfiles para un equipo de data y cloud. Se buscan personas curiosas y con ganas de aprender.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" },
  { email: "nicolas@proconnect.dev", content: "Una buena entrevista técnica debería parecer una conversación, no un examen.", image: "https://images.unsplash.com/photo-1526930282677-e5e7f0c67d2a?w=800&q=80" },
  { email: "paula@proconnect.dev", content: "Una buena interfaz no solo se ve bien: guía, inspira y simplifica.", image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80" },
  { email: "paula@proconnect.dev", content: "Hoy cerramos la revisión visual final y el producto ya se siente mucho más sólido.", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80" }
];

const commentsData = [
  { postEmail: "ana@proconnect.dev", postIndex: 0, email: "carlos@proconnect.dev", content: "¡Excelente trabajo Ana! Se nota mucho la mejora de rendimiento." },
  { postEmail: "ana@proconnect.dev", postIndex: 1, email: "elena@proconnect.dev", content: "Ese detalle visual quedó muy fino." },
  { postEmail: "carlos@proconnect.dev", postIndex: 0, email: "diego@proconnect.dev", content: "Docker es excelente, pero para Kubernetes te recomiendo esperar a tener más servicios." },
  { postEmail: "carlos@proconnect.dev", postIndex: 1, email: "hector@proconnect.dev", content: "Ese salto de performance está brutal." },
  { postEmail: "laura@proconnect.dev", postIndex: 0, email: "ana@proconnect.dev", content: "¡Compartido con mi red! Éxitos en la búsqueda." },
  { postEmail: "laura@proconnect.dev", postIndex: 1, email: "fernando@proconnect.dev", content: "Te envié mi CV Laura." },
  { postEmail: "gabriela@proconnect.dev", postIndex: 0, email: "paula@proconnect.dev", content: "Me encanta ese enfoque de micro-interacciones." },
  { postEmail: "isabella@proconnect.dev", postIndex: 0, email: "carlos@proconnect.dev", content: "¡Felicitaciones Isabella! Un gran logro." },
  { postEmail: "mariana@proconnect.dev", postIndex: 0, email: "javier@proconnect.dev", content: "Ese feedback real es oro puro para mejorar producto." },
  { postEmail: "nicolas@proconnect.dev", postIndex: 0, email: "ana@proconnect.dev", content: "Excelente enfoque para entrevistas más humanas." },
  { postEmail: "paula@proconnect.dev", postIndex: 0, email: "gabriela@proconnect.dev", content: "La dirección visual va muy bien." }
];

const likesData = [
  { postEmail: "ana@proconnect.dev", postIndex: 0, email: "carlos@proconnect.dev" },
  { postEmail: "ana@proconnect.dev", postIndex: 0, email: "elena@proconnect.dev" },
  { postEmail: "carlos@proconnect.dev", postIndex: 1, email: "ana@proconnect.dev" },
  { postEmail: "laura@proconnect.dev", postIndex: 0, email: "fernando@proconnect.dev" },
  { postEmail: "diego@proconnect.dev", postIndex: 0, email: "hector@proconnect.dev" },
  { postEmail: "isabella@proconnect.dev", postIndex: 0, email: "paula@proconnect.dev" },
  { postEmail: "mariana@proconnect.dev", postIndex: 0, email: "joseph@proconnect.dev" },
  { postEmail: "paula@proconnect.dev", postIndex: 0, email: "gabriela@proconnect.dev" }
];

const notificationsData = [
  { email: "ana@proconnect.dev", actorEmail: "carlos@proconnect.dev", type: "like", message: "Carlos le dio like a tu publicación." },
  { email: "laura@proconnect.dev", actorEmail: "fernando@proconnect.dev", type: "comentario", message: "Fernando comentó tu publicación." },
  { email: "isabella@proconnect.dev", actorEmail: "paula@proconnect.dev", type: "like", message: "Paula reaccionó a tu post de AWS." },
  { email: "mariana@proconnect.dev", actorEmail: "javier@proconnect.dev", type: "comentario", message: "Javier comentó tu prototipo." }
];

const run = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const createdUsers = {};
    const createdPostsByEmail = {};

    for (const item of users) {
      const password_hash = await bcrypt.hash(item.password, 12);
      let user = await User.findOne({ where: { email: item.email } });
      if (!user) {
        user = await User.create({ ...item, password_hash });
      } else {
        await user.update({ ...item, password_hash });
      }
      createdUsers[item.email] = user;

      // crear/actualizar perfil si existe seed
      const profileSeed = typeof profileData !== 'undefined' ? profileData[item.email] : null;
      if (profileSeed) {
        const existingProfile = await Profile.findOne({ where: { id_usuario: user.id_usuario } });
        const profilePayload = { id_usuario: user.id_usuario, ...profileSeed };
        if (!existingProfile) {
          await Profile.create(profilePayload);
        } else {
          await existingProfile.update(profilePayload);
        }
      }

      createdPostsByEmail[item.email] = [];
    }

    // Seed Posts
    for (const postItem of postsData) {
      const user = createdUsers[postItem.email];
      if (user) {
        const userId = user.id_usuario;
        let post = await Post.findOne({ where: { content: postItem.content, userId } });
        if (!post) {
          post = await Post.create({ content: postItem.content, image: postItem.image, userId });
        }
        createdPostsByEmail[postItem.email].push(post);
      }
    }

    // Seed Comments
    for (const commentItem of commentsData) {
      const user = createdUsers[commentItem.email];
      const post = createdPostsByEmail[commentItem.postEmail]?.[commentItem.postIndex];
      if (user && post) {
        const userId = user.id_usuario;
        let comment = await Comment.findOne({ where: { content: commentItem.content, postId: post.id } });
        if (!comment) {
          await Comment.create({ content: commentItem.content, userId, postId: post.id });
        }
      }
    }

    // Seed Likes
    for (const likeItem of likesData) {
      const user = createdUsers[likeItem.email];
      const post = createdPostsByEmail[likeItem.postEmail]?.[likeItem.postIndex];
      if (user && post) {
        const userId = user.id_usuario;
        let like = await Like.findOne({ where: { postId: post.id, userId } });
        if (!like) {
          await Like.create({ postId: post.id, userId });
        }
      }
    }

    // Seed Notifications
    for (const notificationItem of notificationsData) {
      const user = createdUsers[notificationItem.email];
      const actor = createdUsers[notificationItem.actorEmail];
      if (user) {
        const userId = user.id_usuario;
        const actorId = actor ? actor.id_usuario : null;
        let notification = await Notification.findOne({ where: { userId, type: notificationItem.type, message: notificationItem.message } });
        if (!notification) {
          await Notification.create({ userId, actorId, type: notificationItem.type, message: notificationItem.message });
        }
      }
    }

    // Jobs
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

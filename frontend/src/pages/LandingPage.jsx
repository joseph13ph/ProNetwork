import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white/80 p-8 shadow-soft">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="rounded-full bg-lightPurple px-3 py-1 text-xs font-medium text-darkGray">Networking profesional de nueva generacion</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            Conecta talento, empleo y oportunidades en <span className="text-primary">ProNetwork</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-mediumGray">
            Plataforma inspirada en LinkedIn para publicaciones, conexiones, mensajeria en tiempo real y empleos con enfoque profesional.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">Crear cuenta</Link>
            <Link to="/login" className="rounded-xl2 border border-slate-300 px-4 py-2 text-sm font-medium">Iniciar sesion</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;

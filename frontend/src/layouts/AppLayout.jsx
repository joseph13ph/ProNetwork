import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const links = [
  { to: "/app/feed", label: "Feed" },
  { to: "/app/connections", label: "Conexiones" },
  { to: "/app/jobs", label: "Empleos" },
  { to: "/app/messages", label: "Mensajes" },
  { to: "/app/saved", label: "Guardados" },
  { to: "/app/settings", label: "Config" }
];

const AppLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-300">
      <Navbar />
      <div className="mx-auto mt-3 grid max-w-6xl gap-4 md:grid-cols-[220px_1fr]">
        <aside className="sidebar-panel rounded-xl2 p-4 shadow-soft">
          <div className="mb-8">
            <h1 className="text-2xl font-bold accent">ProConnect</h1>
            <p className="text-xs text-mediumGray">Red profesional</p>
          </div>
          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-xl2 px-3 py-2 text-sm transition-colors duration-200 ${isActive ? "accent-bg text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="btn-secondary mt-8 w-full text-sm">
            Cerrar sesión
          </button>
        </aside>

        <main className="space-y-4">
          <header className="glass flex flex-col gap-3 rounded-xl2 p-4 shadow-soft">
            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Panel</span>
              <h2 className="mt-2 text-2xl font-bold">Bienvenido, {user?.nombre || "Profesional"}</h2>
              <p className="text-sm text-mediumGray">Interfaz más limpia y enfocada en publicar, responder y chatear.</p>
            </div>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

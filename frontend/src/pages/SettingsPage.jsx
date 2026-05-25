import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const {
    themeName,
    backgroundName,
    fontName,
    surfaceRadiusName,
    borderStyleName,
    applyTheme,
    applyCustomColors,
    applyBackground,
    applyFont,
    applySurfaceRadius,
    applyBorderStyle,
    presets,
    backgrounds,
    fonts,
    surfaceRadii,
    borderStyles,
    customPalette,
    isDarkMode,
    toggleDarkMode
  } = useTheme();

  const activePalette = themeName === "custom" && customPalette ? customPalette : presets[themeName] || presets.classic;
  const [primaryColor, setPrimaryColor] = useState(activePalette.primary);
  const [secondaryColor, setSecondaryColor] = useState(activePalette.secondary);
  const [premiumPlan, setPremiumPlan] = useState("premium_monthly");
  const [premiumProcessing, setPremiumProcessing] = useState(false);
  const [premiumStatusText, setPremiumStatusText] = useState("");

  useEffect(() => {
    setPrimaryColor(activePalette.primary);
    setSecondaryColor(activePalette.secondary);
  }, [activePalette.primary, activePalette.secondary]);

  const handlePremiumActivation = async () => {
    setPremiumProcessing(true);
    setPremiumStatusText("Procesando pago...");

    try {
      const { data } = await api.post("/auth/premium", { plan: premiumPlan });
      const paymentId = data?.data?.paymentId;

      if (!paymentId) {
        throw new Error("No se recibió identificador de pago");
      }

      let attempts = 0;
      const maxAttempts = 8;
      const poll = async () => {
        attempts += 1;
        const response = await api.get(`/auth/premium/${paymentId}/status`);
        const status = response.data?.data?.status;

        if (status === "succeeded") {
          setPremiumStatusText("Pago confirmado. Tu cuenta ahora es premium.");
          if (user) {
            updateUser({ ...user, isPremium: true });
          }
          addToast("Suscripción premium activada", "success");
          setPremiumProcessing(false);
          return;
        }

        if (attempts >= maxAttempts) {
          setPremiumStatusText("Seguimos confirmando tu pago. Revisa en unos segundos.");
          setPremiumProcessing(false);
          return;
        }

        setPremiumStatusText("Pago en validación...");
        setTimeout(poll, 1400);
      };

      setTimeout(poll, 1200);
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo activar premium", "error");
      setPremiumStatusText("No se pudo confirmar el pago.");
      setPremiumProcessing(false);
    }
  };

  return (
    <section className="space-y-4">
      <article className="hero-panel glass rounded-xl2 p-5 shadow-soft">
        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          Configuración visual
        </span>
        <h2 className="mt-3 text-3xl font-bold text-white">Haz la web a tu gusto</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          Cambia colores, fondo, bordes, fuente y modo de lectura sin perder legibilidad.
        </p>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Modo de pantalla</h3>
            <p className="mt-1 text-sm text-mediumGray">Alterna entre claro y oscuro cuando quieras.</p>
          </div>
          <button onClick={toggleDarkMode} className="btn-secondary flex items-center gap-2 px-4 py-2">
            <span>{isDarkMode ? "☀️" : "🌙"}</span>
            <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
          </button>
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-xl font-semibold">Tema rápido</h3>
        <p className="mt-1 text-sm text-mediumGray">Elige una base de color para toda la interfaz.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {Object.entries(presets).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => applyTheme(name)}
              className={`rounded-2xl border p-4 text-left transition-all ${themeName === name ? "border-primary shadow-soft" : "border-slate-200/70 dark:border-slate-700"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold capitalize">{preset.label}</p>
                {themeName === name ? <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase text-white">Activo</span> : null}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="h-5 flex-1 rounded-full" style={{ background: preset.primary }} />
                <span className="h-5 flex-1 rounded-full" style={{ background: preset.secondary }} />
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-xl font-semibold">Colores personalizados</h3>
        <p className="mt-1 text-sm text-mediumGray">Crea una combinación propia para la marca y la interfaz.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="space-y-2 text-sm font-medium">
            <span>Color principal</span>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="input h-14 cursor-pointer p-1" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Color secundario</span>
            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="input h-14 cursor-pointer p-1" />
          </label>
          <button className="btn-primary h-14 px-6" onClick={() => applyCustomColors(primaryColor, secondaryColor)}>
            Guardar colores
          </button>
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-xl font-semibold">Fondo</h3>
        <p className="mt-1 text-sm text-mediumGray">Cambia la atmósfera visual de la página.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {Object.entries(backgrounds).map(([name, background]) => (
            <button
              key={name}
              onClick={() => applyBackground(name)}
              className={`rounded-2xl border p-4 text-left transition-all ${backgroundName === name ? "border-primary shadow-soft" : "border-slate-200/70 dark:border-slate-700"}`}
            >
              <p className="text-sm font-semibold capitalize">{background.label}</p>
              <div
                className="mt-3 h-14 rounded-xl"
                style={{ backgroundImage: `linear-gradient(135deg, ${background.accent1}, ${background.accent2}, ${background.accent3})` }}
              />
            </button>
          ))}
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <h3 className="text-xl font-semibold">Fuente, bordes y forma</h3>
        <p className="mt-1 text-sm text-mediumGray">Ajusta la lectura y el estilo general.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            <span>Fuente</span>
            <select className="input" value={fontName} onChange={(e) => applyFont(e.target.value)}>
              {Object.entries(fonts).map(([name, font]) => (
                <option key={name} value={name}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Bordes</span>
            <select className="input" value={borderStyleName} onChange={(e) => applyBorderStyle(e.target.value)}>
              {Object.entries(borderStyles).map(([name, border]) => (
                <option key={name} value={name}>
                  {border.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Redondez</span>
            <select className="input" value={surfaceRadiusName} onChange={(e) => applySurfaceRadius(e.target.value)}>
              {Object.entries(surfaceRadii).map(([name, radius]) => (
                <option key={name} value={name}>
                  {radius.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article className="glass rounded-xl2 p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Versión premium</h3>
            <p className="mt-1 text-sm text-mediumGray">Activa una experiencia más completa y elegante.</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <select className="input min-w-44" value={premiumPlan} onChange={(e) => setPremiumPlan(e.target.value)} disabled={premiumProcessing}>
              <option value="premium_monthly">Plan mensual - 9.99 USD</option>
              <option value="premium_yearly">Plan anual - 59.99 USD</option>
            </select>
            <button className="btn-primary" onClick={handlePremiumActivation} disabled={premiumProcessing}>
              {premiumProcessing ? "Procesando..." : "Activar Premium"}
            </button>
          </div>
        </div>
        {premiumStatusText ? <p className="mt-3 text-sm text-mediumGray">{premiumStatusText}</p> : null}
      </article>
    </section>
  );
};

export default SettingsPage;

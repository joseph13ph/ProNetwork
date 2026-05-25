import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const hasStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);
const isRealisticEmail = (value) => {
  const blockedDomains = ["example.com", "test.com", "fake.com", "mailinator.com", "tempmail.com", "yopmail.com", "guerrillamail.com"];
  const normalized = value.trim().toLowerCase();
  const validFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized);
  if (!validFormat) {
    return false;
  }
  const domain = normalized.split("@")[1];
  return !blockedDomains.includes(domain);
};
const isValidLocation = (value) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.,\-\s]{3,100}$/.test(value.trim());

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ubicacion: "",
    rol: "usuario",
    password: ""
  });
  const [error, setError] = useState("");

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isRealisticEmail(form.email)) {
      setError("Ingresa un correo real y valido. Evita dominios de prueba o temporales.");
      return;
    }

    if (!isValidLocation(form.ubicacion)) {
      setError("Ingresa una ubicacion valida (solo letras y signos permitidos).");
      return;
    }

    if (!hasStrongPassword(form.password)) {
      setError("La contrasena debe tener al menos 8 caracteres, mayuscula, minuscula, numero y simbolo.");
      return;
    }

    const result = await register(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
      <form autoComplete="on" onSubmit={handleSubmit} className="glass w-full max-w-2xl rounded-2xl p-6 shadow-soft md:p-8">
        <h1 className="text-3xl font-bold md:text-4xl">Crear cuenta</h1>
        <p className="mt-2 text-base text-mediumGray">Unete a ProConnect</p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <input name="given-name" autoComplete="given-name" className="input" placeholder="Nombre" value={form.nombre} onChange={(e) => updateField("nombre", e.target.value)} />
          <input name="family-name" autoComplete="family-name" className="input" placeholder="Apellido" value={form.apellido} onChange={(e) => updateField("apellido", e.target.value)} />
          <input name="email" autoComplete="email" className="input md:col-span-2" type="email" placeholder="Correo electronico" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          <input name="tel" autoComplete="tel" className="input" placeholder="Telefono" value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} />
          <input name="address-level1" autoComplete="address-level1" className="input" placeholder="Ubicacion (ej: Caracas, Venezuela)" value={form.ubicacion} onChange={(e) => updateField("ubicacion", e.target.value)} />
          <select name="role" className="input" value={form.rol} onChange={(e) => updateField("rol", e.target.value)}>
            <option value="usuario">Usuario</option>
            <option value="reclutador">Reclutador</option>
          </select>
          <input name="new-password" autoComplete="new-password" className="input" type="password" placeholder="Contrasena segura" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
        </div>

        {error ? <p className="mt-3 text-base text-danger">{error}</p> : null}

        <button disabled={loading} className="btn-primary mt-7 w-full">{loading ? "Creando..." : "Crear cuenta"}</button>
        <p className="mt-5 text-center text-base text-mediumGray">
          Ya tienes cuenta? <Link to="/login" className="font-medium text-primary">Inicia sesion</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;

import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const JobsPage = () => {
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ q: "", ubicacion: "", modalidad: "" });
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.ubicacion) params.set("ubicacion", filters.ubicacion);
      if (filters.modalidad) params.set("modalidad", filters.modalidad);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data?.data || []);
    } catch (error) {
      addToast("No se pudieron cargar las vacantes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, applied: true } : job)));
      addToast("Postulación registrada correctamente", "success");
    } catch (error) {
      addToast(error.response?.data?.message || "No se pudo postular", "error");
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass rounded-xl2 p-4 shadow-soft">
        <h2 className="text-2xl font-bold">Empleos</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            className="input"
            placeholder="Buscar por titulo"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Ubicacion"
            value={filters.ubicacion}
            onChange={(e) => setFilters((f) => ({ ...f, ubicacion: e.target.value }))}
          />
          <select
            className="input"
            value={filters.modalidad}
            onChange={(e) => setFilters((f) => ({ ...f, modalidad: e.target.value }))}
          >
            <option value="">Modalidad</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Hibrido</option>
            <option value="presencial">Presencial</option>
          </select>
          <button className="btn-primary" onClick={loadJobs}>
            Buscar
          </button>
        </div>
      </div>

      {loading ? <p className="text-center text-mediumGray">Cargando vacantes...</p> : null}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <article key={job.id} className="glass rounded-xl2 p-4 shadow-soft">
            <h3 className="text-lg font-semibold">{job.titulo}</h3>
            <p className="text-sm text-mediumGray">
              {job.empresa} • {job.modalidad} • {job.ubicacion}
            </p>
            <p className="mt-3 text-sm leading-6">{job.descripcion}</p>
            {job.habilidades ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {job.habilidades.split(",").map((skill) => (
                  <span key={skill} className="rounded-full bg-lightPurple px-2 py-1 text-xs font-medium text-darkGray">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            ) : null}
            <button
              className={`btn-primary mt-4 ${job.applied ? "opacity-70" : ""}`}
              disabled={job.applied}
              onClick={() => handleApply(job.id)}
            >
              {job.applied ? "Aplicado" : "Aplicar ahora"}
            </button>
          </article>
        ))}
      </div>

      {!loading && jobs.length === 0 ? (
        <p className="rounded-xl2 border border-dashed border-slate-300 bg-white/60 p-8 text-center text-mediumGray">
          No hay vacantes con esos filtros.
        </p>
      ) : null}
    </section>
  );
};

export default JobsPage;

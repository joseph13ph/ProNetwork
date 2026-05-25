import { Op } from "sequelize";
import { Job, Application } from "../models/index.js";
import { getUserId } from "../utils/auth.js";

export const listJobs = async (req, res) => {
  try {
    const { q, ubicacion, modalidad } = req.query;
    const where = {};

    if (q) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${q}%` } },
        { empresa: { [Op.like]: `%${q}%` } },
        { habilidades: { [Op.like]: `%${q}%` } }
      ];
    }
    if (ubicacion) where.ubicacion = { [Op.like]: `%${ubicacion}%` };
    if (modalidad) where.modalidad = modalidad;

    const jobs = await Job.findAll({ where, order: [["createdAt", "DESC"]] });
    const userId = getUserId(req.user);
    const applications = await Application.findAll({ where: { userId } });
    const appliedIds = new Set(applications.map((a) => a.jobId));

    const data = jobs.map((job) => ({
      ...job.toJSON(),
      applied: appliedIds.has(job.id)
    }));

    return res.json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Error al listar empleos" });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const userId = getUserId(req.user);
    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ message: "Vacante no encontrada" });
    }

    const [application, created] = await Application.findOrCreate({
      where: { jobId, userId },
      defaults: { jobId, userId, estado: "enviada" }
    });

    if (!created) {
      return res.status(409).json({ message: "Ya aplicaste a esta vacante" });
    }

    return res.status(201).json({ message: "Postulación registrada", data: application });
  } catch (error) {
    return res.status(500).json({ message: "Error al postular" });
  }
};

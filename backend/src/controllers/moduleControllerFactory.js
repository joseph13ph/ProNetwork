export const createSimpleController = (entityName) => {
  return {
    list: async (_req, res) => res.status(200).json({ data: [], entity: entityName }),
    getById: async (req, res) => res.status(200).json({ data: { id: req.params.id }, entity: entityName }),
    create: async (req, res) => res.status(201).json({ message: `${entityName} creado`, data: req.body }),
    update: async (req, res) => res.status(200).json({ message: `${entityName} actualizado`, id: req.params.id, data: req.body }),
    remove: async (req, res) => res.status(200).json({ message: `${entityName} eliminado`, id: req.params.id })
  };
};

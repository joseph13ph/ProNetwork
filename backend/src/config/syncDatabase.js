import { sequelize } from "../models/index.js";

const ensureColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();

  for (const model of Object.values(sequelize.models)) {
    const table = model.getTableName();
    const existing = await queryInterface.describeTable(table);

    for (const [attributeName, attribute] of Object.entries(model.rawAttributes)) {
      const columnName = attribute.field || attributeName;
      if (existing[columnName]) continue;
      await queryInterface.addColumn(table, columnName, {
        type: attribute.type,
        allowNull: true,
        defaultValue: attribute.defaultValue
      });
    }
  }
};

// Crea las tablas que falten y agrega columnas nuevas sin borrar datos existentes.
export const syncDatabase = async () => {
  await sequelize.sync();
  await ensureColumns();
};

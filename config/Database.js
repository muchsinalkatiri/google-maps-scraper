const Sequelize = require("sequelize");
const db = new Sequelize("shopee", "root", "", {
  host: "localhost",
  dialect: "mysql",
  define: {
    timestamps: true,
    freezeTableName: true,
    raw: true,
  },
  logging: false,
});

module.exports = db;

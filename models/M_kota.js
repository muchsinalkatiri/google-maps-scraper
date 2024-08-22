const { DataTypes } = require("sequelize");
const db = require("../config/Database.js");

const M_kota = db.define("m_kota", {
  kota: DataTypes.STRING,
  kota: DataTypes.STRING,
  provinsi: DataTypes.STRING,
});

module.exports = M_kota;

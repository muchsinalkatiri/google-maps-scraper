const { DataTypes } = require("sequelize");
const db = require("../config/Database.js");

const GoogleMaps = db.define("googleMaps", {
  name: DataTypes.TEXT,
  nomer: {
    type: DataTypes.STRING(64),
    unique: true,
  },
  address: DataTypes.STRING,
  keyword: DataTypes.STRING,
  kota: DataTypes.STRING,
  is_wa: DataTypes.BOOLEAN,
});

module.exports = GoogleMaps;

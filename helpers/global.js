const fs = require("fs");
const csv = require("csv-parser");

const getQueryParams = function (url) {
  const queryString = url.split("?")[1];
  const params = {};

  if (queryString) {
    const keyValuePairs = queryString.split("&");

    keyValuePairs.forEach((keyValuePair) => {
      const [key, encodedValue] = keyValuePair.split("=");
      const value = decodeURIComponent(encodedValue.replace(/\+/g, " ")); // Replace '+' with space
      params[key] = value;
    });
  }

  return params;
};

const CryptoJS = require("crypto-js");
const encrypt = function (text) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = function (data) {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

const phoneNumberFormatter = function (number) {
  formatted = number.replace(/\D/g, "");

  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  }

  if (!formatted.endsWith("@c.us")) {
    formatted += "@c.us";
  }

  return formatted;
};

function convertCookieJson(inputData) {
  let result = "";
  for (const cookie of inputData) {
    result += `${cookie.name}=${cookie.value}; `;
  }

  return result.trim();
}

function formatAngka(angka) {
  // Format angka menjadi string yang sesuai, tanpa mengubah tipe data aslinya.
  return Number(
    angka.toString().slice(0, -5) + "." + angka.toString().slice(-5)
  );
}

function formatRupiah(saldo) {
  // Gunakan saldo yang masih berupa angka dan format ke dalam rupiah.
  return saldo.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

function hapusKataSama(str) {
  // Memisahkan string menjadi array kata-kata
  var kata = str.split(" ");

  // Menggunakan Set untuk menyaring kata-kata unik
  var kataUnik = [...new Set(kata)];

  // Menggabungkan kembali array kata-kata menjadi string
  var hasil = kataUnik.join(" ");

  return hasil;
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Fungsi untuk mendapatkan string dengan format "hari, tanggal"
function getCurrentDate() {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const now = new Date();
  const dayName = days[now.getDay()];
  const date = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  return `${dayName}, ${date}-${month}-${year}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const csvToJson = async function (source) {
  // Create an array to store CSV data
  const linkArray = [];

  // Read the CSV file and parse its content
  await new Promise((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(csv())
      .on("data", (row) => {
        // Push each row (CSV entry) into the linkArray
        linkArray.push(row);
      })
      .on("end", () => {
        // Now, linkArray contains the parsed CSV data
        resolve();
      })
      .on("error", (error) => {
        // Handle any errors during the CSV processing
        reject(error);
      });
  });

  return linkArray;
};

function removeSpecialChars(str) {
  try {
    // Remove spaces and special characters using regular expressions
    return str.replace(/[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, "");
  } catch (e) {
    return "error";
  }
}

module.exports = {
  getQueryParams,
  encrypt,
  decrypt,
  phoneNumberFormatter,
  convertCookieJson,
  formatRupiah,
  hapusKataSama,
  getCurrentTime,
  getCurrentDate,
  sleep,
  csvToJson,
  removeSpecialChars,
  formatAngka,
};

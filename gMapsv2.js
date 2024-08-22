const { send } = require("./helpers/telegram");
const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");

(async () => {
  const path = "dagingKambing.csv";

  const keywords = [
    "warung kambing",
    "nasi kebuli",
    "nasi briyani",
    "nasi goreng kambing",
    "sate kambing",
    "masakan kambing",
    "masakan arab",
    "masakan india",
  ];
  const kotas = ["kota malang"];
  let total = 0;
  for (let z = 0; z < keywords.length; z++) {
    for (let i = 0; i < kotas.length; i++) {
      const dagingCsv = await csvToJson(path);
      const kota = kotas[i].toLowerCase();
      const keyword = keywords[z];
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"],
      });
      const page = await browser.newPage();

      await page.goto("https://www.google.com/maps", {
        waitUntil: ["load", "networkidle2"],
        timeout: 100000,
        devtools: true,
      });

      await page.type("#searchboxinput", `${keyword} ${kota}`, {
        delay: 100,
      });

      await page.click('button[id="searchbox-searchbutton"]'); //click filter

      await page.waitForTimeout(5000); //delay 2 detik

      let foundElement = false;
      let data = [];
      let name = null;

      do {
        let places = [];
        let placeLength = 0;
        do {
          places = await page.$$(
            'div[role="feed"] div[class="Nv2PK THOPZb CpccDe "]'
          );
          await autoScroll(page);

          if (places.length == placeLength) {
            console.log("habis");
            break;
          }
          placeLength = places.length;
        } while (true);
        await page.waitForTimeout(5000); //delay 2 detik

        for (place of places) {
          try {
            const names = await place.$$(".fontHeadlineSmall");
            name = await names[0].evaluate((div) => div.textContent);
          } catch {
            name = null;
          }
          let link = await place.$eval("a", (el) => el.href);
          const page2 = await browser.newPage(); // open new tab

          do {
            try {
              await page2.goto(link, {
                timeout: 30000,
                waitUntil: "load",
              });
              break;
            } catch (e) {
              console.error(e);
            }
          } while (true);
          await page2.waitForTimeout(2000); //delay 2 detik

          let address = null;
          try {
            address = await page2.$eval(
              'button[data-item-id="address"]',
              (el) => el.innerText
            );
          } catch {
            address = null;
          }

          let nomer = null;
          try {
            const div_nomer = await page2.$$(
              // 'button[data-tooltip="Copy phone number"] div div .fontBodyMedium'
              'button[data-tooltip="Salin nomor telepon"] div div .fontBodyMedium'
            );
            nomer = convertNomer(
              await div_nomer[0].evaluate((div) => div.innerText)
            );
          } catch {
            nomer = null;
          }

          data.push({
            name,
            nomer,
            address,
            kota: kota,
            keyword: keyword,
          });
          await page2.close();
        }

        try {
          if (await page.$eval("p.fontBodyMedium", (el) => el !== null)) {
            foundElement = true;
          }
        } catch (error) {}
      } while (!foundElement);
      console.log(data);

      const newData = data.filter(({ nomer }) => {
        return !dagingCsv.some((existingData) => existingData.nomer === nomer);
      });

      // Append the filtered data to dagingCsv
      dagingCsv.push(...newData);

      const csvWriter = createCsvWriter({
        path: path,
        header: [
          { id: "name", title: "name" },
          { id: "nomer", title: "nomer" },
          { id: "address", title: "address" },
          { id: "kota", title: "kota" },
          { id: "keyword", title: "keyword" },
        ],
        append: false, // Set to true if you want to append to an existing file
      });

      // Write the updated 'masterLink' array to the CSV file
      csvWriter
        .writeRecords(dagingCsv)
        .then(() => {
          console.log("CSV file has been updated successfully.");
        })
        .catch((error) => {
          console.error("Error writing CSV file:", error);
        });
      await page.close();
      await browser.close();
    }
  }

  return;
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 400;
      var timer = setInterval(() => {
        const element = document.querySelectorAll('div[role="feed"]')[0];
        var scrollHeight = element.scrollHeight;
        element.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

function convertNomer(nomer) {
  nomer = nomer.replace(/[-() ]/g, "");

  return nomer;
}

async function csvToJson(source) {
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
}

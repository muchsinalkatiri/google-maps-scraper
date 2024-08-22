const puppeteer = require("puppeteer");
const fs = require("fs");
const db = require("./config/Database.js");

const M_GogleMap = require("./models/GoogleMaps.js");
const M_Kota = require("./models/M_kota.js");

const { send } = require("./helpers/telegram");

const ip_proxy = "";
const username = "";
const password = "";

async function parceData(browser, element, kotaKeyword) {
  let data = [];
  let name = null;
  try {
    const names = await element.$$(".fontHeadlineSmall");
    name = await names[0].evaluate((div) => div.textContent);
  } catch {
    name = null;
  }

  const links = await element.$$("a");
  if (links && links.length) {
    const link = await links[0].evaluate((a) => a.href);
    const page2 = await browser.newPage(); // open new tab
    // await page2.goto(link);

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
      nomer = convertNomer(await div_nomer[0].evaluate((div) => div.innerText));
    } catch {
      nomer = null;
    }
    data.push({
      name,
      nomer,
      address,
      kota: kotaKeyword["kota"].toUpperCase(),
      keyword: kotaKeyword["keyword"],
    });
    await page2.close();
  }
  return data;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        const element = document.querySelectorAll('div[role="feed"]')[0];
        var scrollHeight = element.scrollHeight;
        element.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

function convertNomer(nomer) {
  nomer = nomer.replace(/[-() ]/g, "");

  return nomer;
}

(async () => {
  await db.sync({
    alter: true,
  });
  const kotas = await M_Kota.findAll({
    raw: true,
    attributes: ["kota"],
    where: {
      provinsi: "JAWA TIMUR",
    },
  });
  // const kota = ["blitar"];
  const keywords = [
    "stadion",
    "petcare",
    "pethouse",
    "cathouse",
    "kucing",
    "penitipan kucing",
  ];
  let total = 0;
  for (let z = 0; z < keywords.length; z++) {
    for (let i = 0; i < kotas.length; i++) {
      const kota = kotas[i]["kota"].toLowerCase();
      const keyword = keywords[z];
      const browser = await puppeteer.launch({
        headless: false,
        // args: ["--start-maximized"],
        args: [`--proxy-server=${ip_proxy}`],
      });
      const page = await browser.newPage();
      await page.authenticate({
        username,
        password,
      });
      const client = await page.target().createCDPSession();

      await client.send("Network.setCacheDisabled", {
        cacheDisabled: true,
      });

      do {
        let maxTimeout = 120000; // 60 detik
        let startTime = Date.now();
        let breaks = true;
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
        do {
          await autoScroll(page);
          await page.waitForTimeout(5000); //delay 2 detik

          try {
            if (await page.$eval("p.fontBodyMedium", (el) => el !== null)) {
              foundElement = true;
            }
          } catch (error) {}

          if (Date.now() - startTime >= maxTimeout) {
            break;
          }

          if (!foundElement) {
            breaks = true;
          }
        } while (!foundElement);

        if (breaks == true) break;
      } while (true);

      const elements = await page.$$('div[role="feed"] div[role="article"]');
      for (let j = 0; j < elements.length - 1; j++) {
        const element = elements[j];
        const kotaKeyword = { kota, keyword };
        let data = await parceData(browser, element, kotaKeyword);
        // console.log(data);
        try {
          await M_GogleMap.create(data[0]);
        } catch (error) {
          if (error.original && error.original.sqlMessage) {
            const errorMessage = error.original.sqlMessage;
            console.log(errorMessage);
            // Lakukan tindakan sesuai dengan pesan kesalahan yang diambil
          } else {
            console.log("Kesalahan tidak dikenal:", error);
          }
        }
        total++;
      }

      await browser.close();
      console.log(`total ${kota} = ${elements.length - 1}`);
    }
  }
  // console.log(places);
  // fs.writeFile("shopee/pet.json", places, "utf8", function (err) {
  //   if (err) {
  //     console.log("An error occured while writing JSON Object to File.");
  //     return console.log(err);
  //   }

  //   console.log("JSON file has been saved.");
  // });
  console.log("total semua =" + total);
  send(`selesai semua total = ${total}`);
})();

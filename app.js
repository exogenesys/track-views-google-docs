const puppeteer = require("puppeteer");
fs = require("fs");

let googleDocURL = "";
const args = process.argv.slice(2);
if (args[0] == undefined) {
  throw new Error("Expected Google Doc URL as argument");
} else {
  googleDocURL = args[0];
}

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 300,
      height: 400,
      deviceScaleFactor: 1
    });
    await page.goto(googleDocURL);

    let newViews = 0;
    let lastViews = 0;
    let uniqueViews = 0;

    console.log("RUNNING");

    async function update() {
      newViews =
        (await page.evaluate(() => {
          return document.querySelector(
            '[class="goog-inline-block goog-flat-menu-button-caption"]'
          ).textContent;
        })) || 0;

      if (newViews - lastViews > 0) {
        uniqueViews += newViews - lastViews;
        console.log("NEW VIEW, TOTAL VIEW COUNT: " + uniqueViews);

        lastViews = newViews;
      }
    }

    async function setupFile() {
      fs.writeFile(
        "VIEWS-" +
          new Date().getHours() +
          "-" +
          new Date().getDate() +
          "-" +
          (new Date().getMonth() + 1) +
          ".csv",
        "TIMESTAMP" + ", " + "CURRENT VIEWS" + ", " + "TOTAL VIEWS" + "\n",
        function(err) {
          if (err) throw err;
          console.log("VIEW FILE CREATED");
        }
      );
    }

    async function writeViewsToFile() {
      fs.appendFile(
        "VIEWS-" +
          new Date().getHours() +
          "-" +
          new Date().getDate() +
          "-" +
          (new Date().getMonth() + 1) +
          ".csv",
        new Date().toLocaleTimeString() +
          ", " +
          newViews +
          ", " +
          uniqueViews +
          "\n",
        function(err) {
          if (err) throw err;
          console.log("VIEW FILE UPDATED");
        }
      );
    }

    setInterval(function() {
      update();
    }, 1000);

    // setupFile();

    setInterval(function() {
      writeViewsToFile();
    }, 1000 * 60 * 5);
  } catch (e) {
    console.log(e);
    await browser.close();
  }
})();

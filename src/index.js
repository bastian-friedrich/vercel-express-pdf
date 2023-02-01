const express = require("express");
const edgeChromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const app = express();

//  Define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});

//  Test chrominum handler
const LOCAL_CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

app.get("/test", async (req, res) => {
    //  Open chrome
    const executablePath = await edgeChromium.executablePath || LOCAL_CHROME_EXECUTABLE
    
    const browser = await puppeteer.launch({
        executablePath,
        args: edgeChromium.args,
        headless: true,
    });

    const page = await browser.newPage();

    //  Go to test page
    await page.goto('https://www.google.com');
    const title = await page.title();
    
    await browser.close()

    res.send(title);
});

module.exports = app;
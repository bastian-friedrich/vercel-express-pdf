const express = require("express");
const edgeChromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const fs = require('fs');

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

//  Create pdf
app.get("/pdf", async (req, res) => {
    //  Read template
    const html = await fs.readFileSync('./src/template.html', { encoding:'utf8', flag:'r' });

    //  Open chrome
    const executablePath = await edgeChromium.executablePath || LOCAL_CHROME_EXECUTABLE
    
    const browser = await puppeteer.launch({
        executablePath,
        args: edgeChromium.args,
        headless: true,
    });

    const page = await browser.newPage();

    //  Add content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    //  Set screen instead of print css
    await page.emulateMediaType('screen');

    //  Create pdf
    const pdf = await page.pdf({
        margin: { top: '2.5cm', right: '2.54cm', bottom: '2.54cm', left: '2.54cm' },
        format: 'a4',
        printBackground: true
    })
    
    await browser.close()

    res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
    res.setHeader('Content-type', 'application/pdf')
    res.send(pdf);
});

module.exports = app;
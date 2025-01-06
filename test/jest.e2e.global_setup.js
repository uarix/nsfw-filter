const path = require('path');  
const fs = require('fs');  
const os = require('os');  
const mkdirp = require('mkdirp');  
const puppeteer = require('puppeteer');  

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');  
const extensionPath = path.join(__dirname, '../dist');  
const delay = ms => new Promise(res => setTimeout(res, ms));  

module.exports = async function () {  
  try {  
    const browserOptions = {  
      headless: process.env.HEADLESS === 'true' ? 'new' : false,
      product: 'chrome',  
      defaultViewport: null,  
      args: [  
        `--disable-extensions-except=${extensionPath}`,  
        `--load-extension=${extensionPath}`,  
        '--disable-dev-shm-usage',  
        '--no-sandbox',  
        '--disable-setuid-sandbox',
        '--disable-gpu',  
        '--window-size=1920,1080',
        '--disable-background-timer-throttling',  
        '--disable-backgrounding-occluded-windows',  
        '--disable-renderer-backgrounding'  
      ]  
    };  

    if (process.env.CI) {  
      if (process.env.CHROME_PATH) {  
        browserOptions.executablePath = process.env.CHROME_PATH;  
      } else if (process.env.PUPPETEER_EXEC_PATH) {  
        browserOptions.executablePath = process.env.PUPPETEER_EXEC_PATH;  
      }  
    }  

    console.log('Launching browser with options:', {  
      ...browserOptions,  
      executablePath: browserOptions.executablePath ? 'Custom path set' : 'Default'  
    });  

    const browser = await puppeteer.launch(browserOptions);  

    global.__BROWSER_GLOBAL__ = browser;  

    mkdirp.sync(DIR);  
    fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());  

    console.log('Waiting for extension to load...');  
    await delay(5000);  
    console.log('Extension loaded, continuing with tests...');  

    process.on('exit', async () => {  
      try {  
        if (browser && browser.isConnected()) {  
          await browser.close();  
        }  
      } catch (err) {  
        console.warn('Warning: Error while closing browser:', err.message);  
      }  
    });  
    
  } catch (error) {  
    console.error('Error during browser setup:', error);  

    console.log('Environment variables:', {  
      CI: process.env.CI,  
      CHROME_PATH: process.env.CHROME_PATH,  
      PUPPETEER_EXEC_PATH: process.env.PUPPETEER_EXEC_PATH,  
      HEADLESS: process.env.HEADLESS  
    });  

    throw error;  
  }  
};
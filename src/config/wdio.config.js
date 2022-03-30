const fs = require("fs");
const allure = require("@wdio/allure-reporter").default;
const assert = require("assert");
const chai = require("chai");
const rimraf = require("rimraf");
const getLogger = require("@wdio/logger").default;
const log = getLogger("hooks");
const path = require("path");
const reportportal = require("wdio-reportportal-reporter");

exports.config = {

    runner: 'local',

    specs: [
        './src/test/specs/*.ts'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],

    maxInstances: 10,

    capabilities: [{

        maxInstances: 1,
        browserName: 'firefox',
        //acceptInsecureCerts: true,
        //'goog:chromeOptions': { args: ['headless', 'disable-gpu'] }
        'moz:firefoxOptions': { args: ['-headless'] }

    }],

    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'info',

    bail: 0,

    baseUrl: 'http://localhost:3000',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,

    /**services:[
        ['chromedriver', {
            logFileName: 'wdio-chromedriver.log', // default
            outputDir: 'driver-logs', // overwrites the config.outputDir
            args: ['--silent']
        }]
    ],*/
    services:['selenium-standalone'],

    framework: 'mocha',

    reporters: [
        'spec',
        ['junit', {
            outputDir: './output/',
            outputFileFormat: function(opts) {
                return `wr-results.xml`;
            }
        }]
        ],
    /**reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'report/allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: true,
                disableMochaHooks: true,
                addConsoleLogs: true,
            },
        ],
    ],*/

    //
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        compilers: ['tsconfig-paths/register']
    },

    onPrepare: function () {
        console.log("<<<On Preparing >>>");
        console.log("allure results: " + fs.existsSync("./report/allure-results"));
        console.log("allure reports: " + fs.existsSync("./report/allure-reports"));
        setTimeout(() => {
            console.log("Wait before all workers gets launched");
        }, 5000);
        if (fs.existsSync("./report/allure-results")) {
            rimraf.sync("./report/allure-results");
        }
        if (fs.existsSync("./report/allure-reports")) {
            rimraf.sync("./report/allure-reports");
        }
    },

    before: async function (capabilities, specs) {
        global.wdioExpect = global.expect;
        global.expect = chai.expect;
        global.assert = assert;
        await browser.url(this.baseUrl);
        console.log("<<< BROWSER TESTS STARTED >>>" + this.baseUrl);
    },

    beforeSuite: async function (suite) {
        global.allure = allure;
        allure.addFeature(suite.name);
        allure.addDescription(
            "generating Allure reports " + suite.name,
            "allure reports"
        );
    },

    beforeTest: function (test, context) {
        log.debug(`Test "${test.title}" starts`);

        allure.addEnvironment("BROWSER", browser.capabilities.browserName);
        allure.addEnvironment("BROWSER_VERSION", browser.capabilities.version);
        allure.addEnvironment("PLATFORM", browser.capabilities.platform);
        allure.addEnvironment("DEVICE", browser.capabilities.deviceName);
        allure.addDescription(
            "generating Allure reports" + test.title,
            "allure reports"
        );
        allure.addTestId("TC-001" + test.title);
    },

    afterTest: async function (
        test,
        context,
        { error, result, duration, passed, retries }
    ) {
        log.debug(`Test "${test.title}" finished`);

        if (passed) {
            return;
        }
        var browserName = browser.capabilities.browserName;
        var timestamp = new Date().toJSON().replace(/:/g, '-');
        var filename = 'TESTFAIL_' + browserName + '_' + timestamp + '.png';
        var filePath = path.join(this.screenshotPath, filename);
        // save screenshot
        await browser.saveScreenshot();
        console.log('\tSaved screenshot: ', filePath);

        if (error) {
            await browser.takeScreenshot();
            console.log("Error capturing screenshot: ", error);
        } else {
            console.log("after the test ,test was passed");
        }
        //console.log(`error is:\n${error}`);
    },

    afterScenario: async function (scenario) {
        console.log("<<< Completed Scenario >>>" + scenario.name);
    },

    onComplete: function () {
        console.log("<<< TESTING FINISHED >>>");
    },
}

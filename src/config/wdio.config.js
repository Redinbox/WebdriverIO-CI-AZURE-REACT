const fs = require("fs");
const allure = require("@wdio/allure-reporter").default;
const assert = require("assert");
const chai = require("chai");
const rimraf = require("rimraf");
const getLogger = require("@wdio/logger").default;
const log = getLogger("hooks");
const path = require("path");
const reportportal = require("wdio-reportportal-reporter");
var builder = require('junit-report-builder');
const jbuilder = require('@wdio/junit-reporter');
//const customReport=require('../test/lib/reportManager')
const Suite = require("allure-js-commons");

//import {ReportAggregator, HtmlReporter} from 'wdio-html-nice-reporter';
//import {String, StringBuilder} from 'typescript-string-operations';
//import { ReportAggregator, HtmlReporter} from 'wdio-fefanf-html-reporter' ;

//let reportAggregator=ReportAggregator
//global.reportAggregator = reportAggregator;
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
    logLevel: 'debug',
    outputDir: "./logs",
    bail: 0,

    baseUrl: 'http://localhost:3000',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

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

    /**reporters: ['spec',
        ["html-nice", {
            outputDir: './reports/html-reports/',
            //removeOutput: false,
            filename: 'report.html',
            reportTitle: 'Test Report Title',
            linkScreenshots: true,
            //to show the report in a browser when done
            showInBrowser: true,
            collapseTests: false,
            //to turn on screenshots after every test
            useOnAfterCommandForScreenshot: true,

            //to initialize the logger
            //LOG: log4j.getLogger("default")
        }
        ]
    ],*/

    reporters: [
        'spec',
        ['junit', {
            outputDir: './output/',
            outputFileFormat: function(opts) {
                return `wr-results.xml`;
            },
            errorOptions: {
                error: 'message',
                failure: 'message',
                stacktrace: 'stack',
            },
            linkScreenshots: true,
            attachments: true,
            //stdout: true,
            //screenshotPath: "./screenshots",
            outputs: true
        }],

            /**['allure',
            {
                outputDir: 'report/allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: true,
                disableMochaHooks: true,
                addConsoleLogs: true,
            }
            ]*/
    ],

    //
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        compilers: ['tsconfig-paths/register'],
        //trace     : true,
        //fullTrace : true,
        //grep      : '@flaky',
        ///reporter  : 'spec',
        //invert    : true
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

         /**const reportAggregator = new ReportAggregator({
            outputDir: './reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Master Report',
            showInBrowser: true,
            collapseTests: true,
            //browserName : capabilities.browserName,

            // to use the template override option, can point to your own file in the test project:
            // templateFilename: path.resolve(__dirname, '../src/wdio-fefanf-html-reporter-alt-template.hbs')
        });
        reportAggregator.clean() ;

        global.reportAggregator = reportAggregator;*/

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
        //reportAggregator.browserName=browser.capabilities.browserName
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

        //driver.logScreenshot(String.Format("Test Ended in {0}", result.error.stack));

        var browserName = browser.capabilities.browserName;
        var timestamp = new Date().toJSON().replace(/:/g, '-');
        var filename = 'TESTFAIL.png'
        //var filename = 'TESTFAIL_' + browserName + '_' + timestamp + '.png';
        var filePath = path.join("/screenshots", filename);
        // save screenshot
        await browser.saveScreenshot(filePath);
        //browser.saveDocumentScreenshot(`${filepath}.png`);
        console.log('\tSaved screenshot: ', filePath);
        console.log('attaching screen shot file')
        //this.test.attachments=filePath
        test.attachments=filePath

        //customReport.onTestFail(test);
        //this.currentTest.ctx.attachments=filePath
        //this.test.ctx.attachments = filePath
        if (error) {
            await browser.takeScreenshot();
            console.log("Error capturing screenshot: ", error);
        } else {
            console.log("after the test ,test was passed");
        }

    },

    afterScenario: async function (scenario) {
        console.log("<<< Completed Scenario >>>" + scenario.name);
    },

    onComplete: function(exitCode, config, capabilities, results) {
        /**(async () => {
            await reportAggregator.createReport( {
                config: config,
                capabilities: capabilities,
                results : results
            });
        })();*/
    },
}

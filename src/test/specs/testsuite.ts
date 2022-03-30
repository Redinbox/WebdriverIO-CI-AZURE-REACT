import assert = require("assert");
import allureReporter, { Status } from "@wdio/allure-reporter";

describe('webdriver.io page', async()=> {

    beforeEach(async () => {
        console.log("Before Each Test");
        await browser.url("./");
        await browser.pause(5000);
    });

    it("Should have same number count", async () => {
        try{
        allureReporter.addDescription("Should have same number count", "Test Description")
        console.log("Test started")
        const title = await browser.getTitle()
        console.log("Title: " + title)
        allureReporter.addStep("Title of the page: " + title)
        const add = await $('[role=button]')
        const counter = await $('.counter')
        const isdisplayed = await add.isDisplayed()
        const expNumber: number = 1
        let actualCounter: number
        if (isdisplayed) {
            await add.click()
            await browser.pause(2000)
            const counterText = await counter.getText()
            actualCounter = parseInt(counterText);
            console.log("counter text: " + actualCounter)
            allureReporter.addStep(
                "Counter number , Before click on Add :" +
                expNumber +
                " , and After click on Add:" +
                actualCounter
            );
            assert.equal(
                expNumber,
                counterText,
                `${expNumber} and ${counterText} are equal`
            );
        }
    }catch (e) {
            console.log("Error while comparing add counter")
            allureReporter.addStep(
                "FaledStep",
                {
                    name: "fail",
                    type: "image/png",
                    content: Buffer.from(await browser.takeScreenshot(), "base64"),
                },
                "failed"
            );
            allureReporter.addStep(
            `Error while comparing add counter. ERR: ${e}`,
            "failed"
        );
        allureReporter.endStep("failed");
        throw e;
    }
    })
    it('should not have same number count', async() => {
        try {
            allureReporter.addDescription("Should not have same number count", "Test Description")
            console.log("Test started")
            const title = await browser.getTitle()
            console.log("Title: " + title)
            allureReporter.addStep("Title of the page: " + title)
            const BUTTON_ADD = "//button[contains(text(),'Add')]"
            const COUNTER = '.counter'
            const add = await $('[role=button]')
            const counter = $('.counter')
            const isdisplayed = await add.isDisplayed()
            const expNumber: number = 2
            let actualCounter: number
            if (isdisplayed) {
                await add.click()
                await browser.pause(2000)
                const counterText = await counter.getText()
                actualCounter = parseInt(counterText);
                console.log("counter text: " + actualCounter)
                allureReporter.addStep(
                    "Counter number , Before click on Add :" +
                    expNumber +
                    " , and After click on Add:" +
                    actualCounter
                );
                assert.equal(
                    expNumber,
                    counterText,
                    `${expNumber} and ${counterText} are not equal`
                );
            }
        }catch (e) {
            console.log("Error while comparing add counter")
             allureReporter.addStep(
                `Error while comparing add counter. ERR: ${e}`,
                "failed"
            );
             allureReporter.addStep(
                "FaledStep",
                {
                    name: "fail",
                    type: "image/png",
                    content: Buffer.from(await browser.takeScreenshot(), "base64"),
                },
                "failed"
            );
             allureReporter.endStep("failed");
            throw e;
        }
    })
})

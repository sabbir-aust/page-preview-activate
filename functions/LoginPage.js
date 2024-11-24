const { ExcelUtils } = require('../excelHelper'); // Assuming you have an ExcelUtils file to handle reading/writing Excel
const envUrls = require('../data/env.js');

class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.submitButtonSelector = '//button[@id="submit-button-ims"]';
        this.emailInputSelector = 'input[name="username"]';
        this.continueButtonSelector = 'button[data-id="EmailPage-ContinueButton"]';
        this.usernameSelector = '#username';
        this.passwordSelector = '#password';
        this.signOnButtonSelector = '#signOnButton';
        this.baseUrl = envUrls.production;
    }

    async navigate() {
        await this.page.goto(`${envUrls.production}/libs/granite/core/content/login.html?resource=%2F&$$login$$=%24%24login%24%24&j_reason=unknown&j_reason_code=unknown`);
    }

    async navigateToSites(fullContentPath) {
        const fullUrl = `${this.baseUrl}/ui#/aem/sites.html${fullContentPath}`;
        console.log(`Navigating to full URL: ${fullUrl}`);
        await this.page.goto(fullUrl);
    }

    async submit() {
        await this.page.locator(this.submitButtonSelector).click();
    }

    async enterEmail(email) {
        await this.page.locator(this.emailInputSelector).fill(email);
        await this.page.locator(this.continueButtonSelector).click();
    }

    async enterCredentials(username, password) {
        await this.page.locator(this.usernameSelector).fill(username);
        await this.page.locator(this.passwordSelector).fill(password);
        await this.page.locator(this.signOnButtonSelector).click();
    }

    async previewActivate(fullContentPath) {
        if (!fullContentPath) {
            console.error('fullContentPath is undefined or empty');
            return false;
        }

        const checkboxLocator = this.page.frameLocator('iframe[name="Main Content"]').locator(
            `//coral-columnview-item[@data-foundation-collection-item-id='${fullContentPath}']//span[@handle='checkbox']`
        );

        await checkboxLocator.click();

        const previewedByValue = await this.page.frameLocator('iframe[name="Main Content"]').locator("//coral-columnview-preview-value[last()]").innerText();
        const publishedBy = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Published By"]/following-sibling::coral-columnview-preview-value').first().innerText();
        const publishedDateStr = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Published"]/following-sibling::coral-columnview-preview-value').first().innerText();
        const modifiedDateStr = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Modified"]/following-sibling::coral-columnview-preview-value').first().innerText();

        console.log(`Value for 'Published By': ${publishedBy}`);
        console.log(`Value for 'publishedDateStr': ${publishedDateStr}`);
        console.log(`Value for 'modifiedDateStr': ${modifiedDateStr}`);

        if (publishedBy !== 'Not published') {
            const publishedDate = this.isRelativeDate(publishedDateStr)
                ? await this.parseRelativeDate(publishedDateStr)
                : await this.parseAbsoluteDate(publishedDateStr);
            const modifiedDate = await this.parseAbsoluteDate(modifiedDateStr);

            console.log("Activating preview...");

            await this.page.waitForTimeout(2000);
            await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Manage Publication' }).click();
            await this.page.waitForTimeout(2000);
            await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select Preview').click();
            await this.page.waitForTimeout(2000);
            await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Next' }).click();
            await this.page.waitForTimeout(2000);
            // await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select All').click();
            // await this.page.waitForTimeout(2000);
            await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Publish', exact: true }).click();
            await this.page.waitForTimeout(2000);
            await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Done' }).click();
            //await this.page.pause();
            await this.page.waitForTimeout(8000);
            await checkboxLocator.click();
            await this.page.waitForTimeout(2000);
            const previewedByValue = await this.page.frameLocator('iframe[name="Main Content"]').locator("//coral-columnview-preview-value[last()]").innerText()
            console.log(previewedByValue);
            if (previewedByValue.includes('Published') || previewedByValue.includes('Publication Pending') || previewedByValue.includes('workflow-process-service')) {
                return true;
            } else {
                console.log("Page is not Published or still in progress.");
                return false;
            }

            // if (modifiedDate <= publishedDate) {
            //     console.log("Activating preview...");

            //     await this.page.waitForTimeout(2000);
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Manage Publication' }).click();
            //     await this.page.waitForTimeout(2000);
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select Preview').click();
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Next' }).click();
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select All').click();
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Publish', exact: true }).click();
            //     await this.page.waitForTimeout(2000);
            //     await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Done' }).click();
            //     //await this.page.pause();
            //     await this.page.waitForTimeout(10000);
            //     await checkboxLocator.click();
            //     await this.page.waitForTimeout(2000);
            //     const previewedByValue = await this.page.frameLocator('iframe[name="Main Content"]').locator("//coral-columnview-preview-value[last()]").innerText()
            //     console.log(previewedByValue);
            //     if (previewedByValue.includes('Published') || previewedByValue.includes('Publication Pending') || previewedByValue.includes('workflow-process-service')) {
            //         return true;
            //     } else {
            //         console.log("Page is not Published or still in progress.");
            //         return false;
            //     }
            // } else {
            //     console.log("The modified date is after the published date. Not activating preview.");
            //     return false;
            // }
        } else {
            console.log("Preview is not activated as the content is 'Not published'.");
            return false;
        }
    }

    async performAbbvieProApproversAction1(fullContentPath) {
        console.log("Executing abbvie-pro-approvers action 1...");
        console.log(`Navigating to content path: ${fullContentPath}`);
        await this.navigateToSites(fullContentPath);
        await this.page.waitForTimeout(3000);
        const isPreviewActivated = await this.previewActivate(fullContentPath);
        return isPreviewActivated;
    }

    async parseRelativeDate(relativeDateStr) {
        const now = new Date();
        const [amount, unit] = relativeDateStr.split(' ');

        switch (unit) {
            case 'min':
            case 'mins':
                return new Date(now - amount * 60 * 1000);
            case 'hour':
            case 'hours':
                return new Date(now - amount * 60 * 60 * 1000);
            case 'day':
            case 'days':
                return new Date(now - amount * 24 * 60 * 60 * 1000);
            default:
                return now;
        }
    }

    async parseAbsoluteDate(absoluteDateStr) {
        return new Date(absoluteDateStr);
    }

    isRelativeDate(dateStr) {
        return dateStr.includes('ago');
    }
}

module.exports = { LoginPage };

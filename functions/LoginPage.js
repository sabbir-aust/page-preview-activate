
const { ExcelUtils } = require('../excelHelper'); // Assuming you have an ExcelUtils file to handle reading/writing Excel

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
        this.baseUrl = 'https://author-p50407-e1053252.adobeaemcloud.com/ui#/aem/sites.html';
    }

    async navigate() {
        await this.page.goto('https://author-p50407-e1053252.adobeaemcloud.com/libs/granite/core/content/login.html?resource=%2F&$$login$$=%24%24login%24%24&j_reason=unknown&j_reason_code=unknown');
    }

    async navigateToSites(fullContentPath) {
        const fullUrl = `${this.baseUrl}${fullContentPath}`; // Use fullContentPath
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

    // Update the previewActivate method to handle the fullContentPath
    async previewActivate(fullContentPath) {
        if (!fullContentPath) {
            console.error('fullContentPath is undefined or empty');
            return false; // or handle the error as needed
        }


        // Locate the checkbox for the item based on the full content path
        const checkboxLocator = this.page.frameLocator('iframe[name="Main Content"]').locator(
            `//coral-columnview-item[@data-foundation-collection-item-id='${fullContentPath}']//span[@handle='checkbox']`
        );

        // Click the checkbox to select the item
        await checkboxLocator.click();

        // Check the "Previewed By" label after interacting with the item
        // const previewValue = await this.page.frameLocator('iframe[name="Main Content"]').locator("//coral-columnview-preview-value[last()-1]").innerText();
        // console.log(`Preview value: ${previewValue}`);
        const previewedByValue = await this.page.frameLocator('iframe[name="Main Content"]').locator("//coral-columnview-preview-value[last()]").innerText();
        // console.log(`Previewed By value: ${previewedByValue}`);

        // Fetch the publishedBy, published date, and modified date values
        const publishedBy = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Published By"]/following-sibling::coral-columnview-preview-value').first().innerText();
        const publishedDateStr = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Published"]/following-sibling::coral-columnview-preview-value').first().innerText();
        const modifiedDateStr = await this.page.frameLocator('iframe[name="Main Content"]').locator('//coral-columnview-preview-label[text()="Modified"]/following-sibling::coral-columnview-preview-value').first().innerText();

        console.log(`Value for 'Published By': ${publishedBy}`);
        console.log(`Value for 'publishedDateStr': ${publishedDateStr}`);
        console.log(`Value for 'modifiedDateStr': ${modifiedDateStr}`);

        //await this.page.pause();

        // Handle the activation logic based on the preview status
        // Check if publishedBy is not 'Not published'
        if (publishedBy !== 'Not published') {

            // Convert the published and modified date strings into Date objects
            const publishedDate = new Date(publishedDateStr);
            const modifiedDate = new Date(modifiedDateStr);

            // Check if the modified date is not after the published date
            if (modifiedDate <= publishedDate) {
                console.log("Activating preview...");

                // Activate the preview following your original logic
                await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Manage Publication' }).click();
                await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select Preview').click();
                //await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Next' }).click();
                //await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByLabel('Select All').click();
                //await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Publish', exact: true }).click();
                await this.page.waitForTimeout(2000);
                await this.page.frameLocator('iframe[name="Main Content"]').getByRole('button', { name: 'Done' }).click();
                //await this.page.waitForTimeout(20000);

                // After publishing, confirm the status
                await checkboxLocator.click(); // Interact again if necessary
                await this.page.waitForTimeout(2000);
                //return previewedByValue === 'workflow-process-service';
                if (previewedByValue.includes('Published') || previewedByValue.includes('Publication Pending') || previewedByValue.includes('workflow-process-service')) {
                    return true; // Update the value
                } else {
                    console.log("Page is not Published or still in progress.");
                    return false; // Not published or other status
                }

            } else {
                console.log("The modified date is after the published date. Not activating preview.");
                return false;
            }

        } else {
            // Otherwise, preview is not activated
            console.log("Preview is not activated as the content is 'Not published'.");
            return false;
        }
    }

    async performAbbvieProApproversAction1(fullContentPath) {
        console.log("Executing abbvie-pro-approvers action 1...");
        console.log(`Navigating to content path: ${fullContentPath}`); // Debug log
        await this.navigateToSites(fullContentPath);
        await this.page.waitForTimeout(3000);
        const isPreviewActivated = await this.previewActivate(fullContentPath); // Pass the content path to the method
        return isPreviewActivated;
    }
}

module.exports = { LoginPage };

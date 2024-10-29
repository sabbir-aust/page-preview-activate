// @ts-check
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../functions/LoginPage');
const users = require('../users/users');
const { readExcel, writeExcel, updateStatus } = require('../excelHelper'); // Adjust the path as necessary

const excelFilePath = './contentPaths.xlsx'; // Excel file located in the project root folder

test.describe('Preview Page Activate', () => {
  const userGroup = 'abbvie-pro-approvers'; // Specify the user group you want to test

  // Read data from the Excel file once, outside the test block to avoid reloading for each test
  const data = readExcel(excelFilePath);
  const user = users.find(u => u.group === userGroup);

  if (!user) {
    throw new Error(`User group ${userGroup} not found in users file`);
  }

  // Iterate over content paths and run tests for each in parallel
  for (let i = 1; i < data.length; i++) { // Start from 1 to skip headers
    const contentPath = data[i][0]; // Get content path from the "Content Path" column

    test(`should login and check preview activation for path: ${contentPath}`, async ({ browser }) => {
      const page = await browser.newPage();
      const loginPage = new LoginPage(page);

      console.log(`Navigating to content path: ${contentPath}`);

      // Login to AEM
      await loginPage.navigate();
      await expect(page).toHaveTitle(/AEM/);
      await loginPage.submit();
      await page.waitForTimeout(5000);

      await loginPage.enterEmail(user.email);
      await loginPage.enterCredentials(user.userId, user.password);

      await page.waitForTimeout(15000);
      await expect(page).toHaveTitle(/AEM/);

      // Navigate to the specific content path
      await loginPage.navigateToSites(contentPath);
      console.log(`Navigating to full URL: ${contentPath}`);
      await page.waitForTimeout(3000);

      // Check for preview activation
      const isPreviewActivated = await loginPage.previewActivate(contentPath);
      console.log(`Preview activation status for '${contentPath}': ${isPreviewActivated}`);

      // Update only the status of the relevant content path in the Excel file
      const status = isPreviewActivated ? 'Preview activated' : 'Preview not activated';
      updateStatus(excelFilePath, contentPath, status); // Update status for the specific content path
      console.log(`Status for content path '${contentPath}' updated in Excel: ${status}`);

      await page.close();
    });
  }
});

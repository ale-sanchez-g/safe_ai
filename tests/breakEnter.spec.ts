import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('navigate and interact with crime tool', async ({ page }) => {
  await page.goto('https://crimetool.bocsar.nsw.gov.au/bocsar/');

  // Select year 2024
  await page.getByRole('button', { name: '2024' }).click();
  await page.locator('#num_years').getByText('2024').click();

  // Enter Suburb, Postcode or
  await page.locator('a').filter({ hasText: 'Enter Suburb, Postcode or' }).click();
  //search for 2077 and press enter
  await page.getByRole('searchbox').fill('2077');
  await page.keyboard.press('Enter');

  // Navigate to Theft and Break & enter dwelling
  await page.getByRole('link', { name: 'Theft ' }).click();
  await page.getByRole('link', { name: 'Break & enter dwelling' }).click();

  // Navigate to Offenders and Residential
  await page.getByRole('link', { name: 'Offenders ' }).click();
  await page.locator('.Offenders > .ul_minor > .premises > button:nth-child(2)').click();
  await page.getByRole('link', { name: 'Residential' }).click();

  // Show table
  await page.getByRole('link', { name: ' Table' }).click();
  const textContent = await page.getByText('Show 102550100 entries To').textContent();
  console.log(textContent);

  // Start waiting for download before clicking. Note no await.
const downloadPromise = page.waitForEvent('download');
await page.locator('#tableSaveButton i').click();
const download = await downloadPromise;

// Wait for the download process to complete and save the downloaded file somewhere.
await download.saveAs('./temp/' + download.suggestedFilename());

});
import {test, expect} from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({page}) => {
    await page.route('*/**/api/tags', async route => { // Intercept the API request
        // Fulfill the request with the mock data from tags.json
        await route.fulfill({
            body: JSON.stringify(tags),
        });
    });
    await page.goto('https://conduit.bondaracademy.com/');
})

test('has title', async ({page}) => {
    await expect(page.locator('.navbar-brand')).toHaveText('conduit');
})

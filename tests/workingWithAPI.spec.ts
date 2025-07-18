import {test, expect} from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({page}) => {
    await page.route('*/**/api/tags', async route => { // Intercept the API request
        // Fulfill the request with the mock data from tags.json
        await route.fulfill({
            body: JSON.stringify(tags),
        });
    });
    
    await page.route('*/**/api/articles*', async route => { // Intercept the API request
        const responce = await route.fetch();
        const responceBody = await responce.json();
        responceBody.articles[0].title = 'Mocked Article Title'; // Modify the response
        responceBody.articles[0].description = 'Mocked Article Description'; // Modify the response
        await route.fulfill({
            body: JSON.stringify(responceBody) // Return the modified response
        });
    });
    await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({page}) => {
    await expect(page.locator('.navbar-brand')).toHaveText('conduit');
    await expect(page.locator('.article-preview h1').first()).toContainText("Mocked Article Title");
    await expect(page.locator('.article-preview p').first()).toContainText("Mocked Article Description");
})
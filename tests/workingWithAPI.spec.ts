import {test, expect} from '@playwright/test';
import tags from '../test-data/tags.json';
import { request } from 'http';

test.beforeEach(async ({page}) => {
    await page.route('*/**/api/tags', async route => { // Intercept the API request
        // Fulfill the request with the mock data from tags.json
        await route.fulfill({
            body: JSON.stringify(tags),
        });
    });

    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign in').click();
    await page.getByRole('textbox', { name: "Email" }).fill('test@test22.com');
    await page.getByPlaceholder('Password').fill('qwerty21');
    await page.getByRole('button').click();
});

test('has title', async ({page}) => {
    await page.route('*/**/api/articles*', async route => { // Intercept the API request
        const responce = await route.fetch();
        const responceBody = await responce.json();
        responceBody.articles[0].title = 'Mocked Article Title'; // Modify the response
        responceBody.articles[0].description = 'Mocked Article Description'; // Modify the response
        await route.fulfill({
            body: JSON.stringify(responceBody) // Return the modified response
        });
    });
    await page.getByText('Global Feed').click();
    await expect(page.locator('.navbar-brand')).toHaveText('conduit');
    await expect(page.locator('.article-preview h1').first()).toContainText("Mocked Article Title");
    await expect(page.locator('.article-preview p').first()).toContainText("Mocked Article Description");
})

test('delete article', async ({page, request}) => {
    const responce = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {
                "email": "test@test22.com",
                "password": "qwerty21"
            }
        }
    })
    const responceBody = await responce.json();
    const accessToken = responceBody.user.token; // Extract the token from the response

    const articleResponce = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
            "article": {
                "title": "Article to be deleted",
                "description": "Description of the article",
                "body": "Body of the article",
                "tagList": []
            }
        },
        headers: {
            Authorization: `Token ${accessToken}` // Use the token in the request header
        }
    });
    expect(articleResponce.status()).toBe(201); // Check if the article was created successfully

    await page.getByText('Global Feed').click();
    await page.getByText('Article to be deleted').click();
    await page.getByRole('button', { name: 'Delete Article' }).first().click();
    await expect(page.getByText('Article to be deleted')).not.toBeVisible(); //
    await page.getByText('Global Feed').click();
});
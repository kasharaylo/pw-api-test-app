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
    // const responce = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    //     data: {
    //         "user": {
    //             "email": "test@test22.com",
    //             "password": "qwerty21"
    //         }
    //     }
    // })
    // const responceBody = await responce.json();
    // const accessToken = responceBody.user.token; // Extract the token from the response

    const articleResponce = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        data: {
            "article": {
                "title": "Article to be deleted",
                "description": "Description of the article",
                "body": "Body of the article",
                "tagList": []
            }
        },
        // headers: {
        //     Authorization: `Token ${accessToken}` // Use the token in the request header
        // }
    });
    expect(articleResponce.status()).toBe(201); // Check if the article was created successfully

    await page.getByText('Global Feed').click();
    await page.getByText('Article to be deleted').click();
    await page.getByRole('button', { name: 'Delete Article' }).first().click();
    await expect(page.getByText('Article to be deleted')).not.toBeVisible(); //
    await page.getByText('Global Feed').click();
});

test('create article', async ({page, request}) => {
    await page.getByText('New Article').click();
    await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright is awesome!');
    await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('About the Playwright');
    await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('This is a test article created using Playwright');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    const articleResponce = await page.waitForResponse('**/api/articles/');
    const articleResponceBody = await articleResponce.json()
    const slugId = articleResponceBody.article.slug;

    await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome!');

    await page.getByText('Home').click();
    await page.getByText('Global Feed').click();
    
    await expect(page.getByText('Playwright is awesome!')).toBeVisible();

    // const responce = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    //     data: {
    //         "user": {
    //             "email": "test@test22.com",
    //             "password": "qwerty21"
    //         }
    //     }
    // })
    // const responceBody = await responce.json();
    // const accessToken = responceBody.user.token;

    const deleteArticleResponce = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
        // headers: {
        //     Authorization: `Token ${accessToken}` // Use the token in the request header
        // }
    });
    expect(deleteArticleResponce.status()).toBe(204);
});
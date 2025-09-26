import { test as setup } from '@playwright/test';
import user from '../.auth/user.json'
import fs from 'fs'

const authFile = '.auth/user.json';

setup('authentification', async ({ page, request }) => {
    // await page.goto('https://conduit.bondaracademy.com/');
    // await page.getByText('Sign in').click();
    // await page.getByRole('textbox', { name: "Email" }).fill('test@test22.com');
    // await page.getByPlaceholder('Password').fill('qwerty21');
    // await page.getByRole('button').click();
    // await page.waitForResponse('**/api/tags');

    // await page.context().storageState({ path: authFile });

    const responce = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {
                "email": "test@test22.com",
                "password": "qwerty21"
            }
        }
    })
    const responceBody = await responce.json();
    const accessToken = responceBody.user.token;

    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))

    process.env['ACCESS_TOKEN'] = accessToken
});
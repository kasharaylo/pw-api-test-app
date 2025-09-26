import { test as setup } from '@playwright/test';

const authFile = '.auth/user.json';

setup('authentification', async ({ page }) => {
    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign in').click();
    await page.getByRole('textbox', { name: "Email" }).fill('test@test22.com');
    await page.getByPlaceholder('Password').fill('qwerty21');
    await page.getByRole('button').click();
    await page.waitForResponse('**/api/tags');

    await page.context().storageState({ path: authFile });
});
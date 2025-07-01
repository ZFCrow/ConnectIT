import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';
import fernet from 'fernet';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

test('unauthenticated user is redirected to login page', async ({ page }) => {

    // try to access a protected route 
    await page.goto('http://localhost:5173/')

    // assert redirection to login page 
    await expect(page).toHaveURL('http://localhost:5173/login')

});

test('logging in with the correct credentials redirects but wrong 2fa code', async ({ page }) => {


    // navigate to login page 
    await page.goto('http://localhost:5173/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();

    // assert redirection to 2fa page look for the text Verify 2FA 
    // Check for visible text "Verify 2FA" anywhere on the page
    await expect(page.locator('div[data-slot="card-title"]')).toHaveText('Verify 2FA', { timeout: 200000 })


    // fill in the 2fa code 
    await page.fill('input[id="token"]', '111111');

    // submit the 2fa form 
    await page.locator('button', { hasText: 'Verify 2FA' }).click();

    await expect(page.getByText('Verification failed')).toBeVisible({ timeout: 10000 }); // Check for welcome message
});






test('logging in with the correct credentials redirects to 2fa page', async ({ page }) => {


    // navigate to login page 
    await page.goto('http://localhost:5173/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();

    // assert redirection to 2fa page look for the text Verify 2FA 
    // Check for visible text "Verify 2FA" anywhere on the page
    await expect(page.locator('div[data-slot="card-title"]')).toHaveText('Verify 2FA', { timeout: 200000 })

    const encryptedToken = process.env.ENCRYPTED_TOTP_SECRET!;
    const fernetKey = new fernet.Secret(process.env.FERNET_KEY!);
    const token = new fernet.Token({
        secret: fernetKey, token: encryptedToken, ttl: 0
    });

    const decryptedSecret = token.decode();

    // Generate OTP using base32 secret
    const otp = authenticator.generate(decryptedSecret);

    console.log('Generated OTP:', otp);

    // fill in the 2fa code 
    await page.fill('input[id="token"]', otp);

    // submit the 2fa form 
    await page.locator('button', { hasText: 'Verify 2FA' }).click();




    // assert redirection to home page
    await expect(page).toHaveURL('http://localhost:5173', { timeout: 10000 });
});
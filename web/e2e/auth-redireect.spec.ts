import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';
import fernet from 'fernet';
import dotenv from 'dotenv';
import path   from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '../.env')
});

test('unauthenticated user is redirected to login page', async ({ page }) => {

    // try to access a protected route 
    await page.goto('/')
    


    // Inject a banner at the top showing the current URL
    await page.evaluate(() => {
        const banner = document.createElement('div');
        banner.textContent = window.location.href;
        Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        fontSize: '12px',
        zIndex: '9999',
        textAlign: 'center',
        });
        document.body.appendChild(banner);
    });

    // Give the browser a moment to render the banner
    await page.waitForTimeout(100);
    // 2) Take a screenshot of whatever is currently rendered
    await page.screenshot({
        path: 'test-results/screenshots/unauthenticated-home-before-redirect.png',
        fullPage: true
    });

    // assert redirection to login page 
    await expect(page).toHaveURL('http://localhost:3300/login')

});

test('entering bad 2FA code shows error under Verify2FAForm', async ({ page }) => {


    // navigate to login page 
    await page.goto('http://localhost:3300/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();


    // 2) Wait for your Verify2FAForm to mount
    await page.waitForSelector('[data-testid="verify-2fa-form"]', { timeout: 30_000 });

    // 3) Assert the header is correct
    const title = page.locator('[data-testid="verify-2fa-form"] div[data-slot="card-title"]');
    await expect(title).toHaveText('Verify 2FA');

    // fill in the 2fa code 
    await page.fill('input[id="token"]', '111111');

    // submit the 2fa form 
    const res = await Promise.all([
        page.waitForResponse(response =>
            response.url().endsWith('/api/2fa-verify') && [401, 429].includes(response.status())
        ),
        page.click('button:has-text("Verify 2FA")'),
    ]);
    // if 401, then we should see an error message else 429 it will be a toast box 

    if (res[0].status() === 401) {
        console.log('Verification failed, showing error message'); 
        // Check for visible text "Verification failed" anywhere on the page
        await expect(page.getByText('Verification failed')).toBeVisible({ timeout: 10000 });
    } else if (res[0].status() === 429) {
        console.log('Rate limit reached, showing toast message');
        // Locate the toastbox by role="status" (accessible toast)
        const toast = page.locator('div[role="status"]', { hasText: 'Rate limit exceeded' });
        await expect(toast).toBeVisible({ timeout: 10000 });
        // Optionally verify toast disappears (transient)
        await expect(toast).toBeHidden({ timeout: 15000 });
        console.log('Rate limit exceeded toast is visible and will disappear after a while'); 
    } 
    
    //await page.locator('button', { hasText: 'Verify 2FA' }).click();

    //await expect(page.getByText('Verification failed')).toBeVisible({ timeout: 10000 }); // Check for welcome message
});






test('logging in with the correct credentials redirects to 2fa page', async ({ page }) => {

    
    // 1) Sanity-check your env before you do anything else:
    const encryptedToken = process.env.ENCRYPTED_TOTP_SECRET;
    const fernetKeyRaw  = process.env.FERNET_KEY;
    expect(encryptedToken, 'ENCRYPTED_TOTP_SECRET must be defined').toBeTruthy();
    expect(fernetKeyRaw,  'FERNET_KEY must be defined').toBeTruthy();


    // navigate to login page 
    await page.goto('http://localhost:3300/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();

    // assert redirection to 2fa page look for the text Verify 2FA 
    // Check for visible text "Verify 2FA" anywhere on the page
    await expect(page.locator('div[data-slot="card-title"]')).toHaveText('Verify 2FA', { timeout: 500000 })

    

    const fernetKey = new fernet.Secret(process.env.FERNET_KEY!);
    const token = new fernet.Token({
        secret: fernetKey, token: encryptedToken, ttl: 0
    });

    const decryptedSecret = token.decode();

    // Generate OTP using base32 secret
    const otp = authenticator.generate(decryptedSecret);

   

    // fill in the 2fa code 
    await page.fill('input[id="token"]', otp);


    // 1) Click “Verify 2FA” and wait for the API to return 200
    const res = await Promise.all([
        page.waitForResponse(response =>
            response.url().endsWith('/api/2fa-verify') && [200, 429].includes(response.status())
        ),
        page.click('button:has-text("Verify 2FA")'),
    ]);

    // the ui depending on whether is it 200 or 429 
    if (res[0].status() === 200) {
        console.log('Verification successful, redirecting to home page'); 
        // Check for visible text "Welcome" anywhere on the page 
        const popularTagTitle = page.locator('div[data-slot="card-title"]', { hasText: 'Popular Tags' });
        await expect(popularTagTitle).toBeVisible({ timeout: 500000 });

    } else if (res[0].status() === 429) {
        console.log('Rate limit reached, showing toast message');
        // Locate the toastbox by role="status" (accessible toast)
        const toast = page.locator('div[role="status"]', { hasText: 'Rate limit exceeded' });
        await expect(toast).toBeVisible({ timeout: 10000 });
        // Optionally verify toast disappears (transient)
        await expect(toast).toBeHidden({ timeout: 15000 });
        console.log('Rate limit exceeded toast is visible and will disappear after a while'); 
    }
}
);
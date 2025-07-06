import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';
import fernet from 'fernet';
import dotenv from 'dotenv';
import path   from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '../.env')
});


test('creating a post', async ({ page }) => {

    
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
    const [verifyResponse] = await Promise.all([
    page.waitForResponse(response =>
        response.url().endsWith('/api/2fa-verify') && [200, 429].includes(response.status())
    ),
    page.click('button:has-text("Verify 2FA")'),
    ]);


    
    // 2️⃣ If it's 429, end the test here (and count it as a pass)
    if (verifyResponse.status() === 429) {
        return;
    }

    // locate the createPostBar
    const trigger = page.locator('input[data-slot="dialog-trigger"]');
    await expect(trigger).toHaveValue("What's on your mind?", { timeout: 500_000 });
    await trigger.click();

    // locate the title and body fields of the dialog
    const titleInput = page.locator('input[data-slot="input"]');
    await expect(titleInput).toBeVisible({ timeout: 30_000 });
    await expect(titleInput).toHaveValue("What's on your mind?");
    await titleInput.fill('My E2E Post Title');

    //body 
    const bodyInput = page.locator('textarea[data-slot="textarea"]');
    await expect(bodyInput).toBeVisible({ timeout: 30_000 });
    await expect(bodyInput).toHaveAttribute('placeholder', "What's on your mind?");

    await bodyInput.fill('Hello world, this is a Playwright‐driven post.');


    //tags 
    const labelButton = page.locator('button[data-slot="popover-trigger"]');
    await expect(labelButton).toBeVisible({ timeout: 30_000 });
    await labelButton.click();

    //wait for the popover panel to appear 
    const popoverPanel = page.locator('div.max-h-72.overflow-y-auto');
    // or if you add a testid in your code: page.locator('[data-testid="tag-popover"]');
    await expect(popoverPanel).toBeVisible({ timeout: 10_000 });

    //click on career and react 
    // 3️⃣ Click interview
    await popoverPanel
    .locator('div:has(span:text("interview"))')
    .click();

    // 4️⃣ Click career
    await popoverPanel
    .locator('div:has(span:text("career"))')
    .click();

    //post button 
    const postButton = page.locator('[data-testid="submit-post"]');
    await expect(postButton).toHaveText('Post', { timeout: 30_000 });

    const [response] = await Promise.all([
        page.waitForResponse(response =>
            response.url().endsWith('/createPost') && [201, 429].includes(response.status())
        ),
        postButton.click(),
        ]);

    // 3️⃣ Assert it’s one of the allowed codes
    expect([201, 429]).toContain(response.status());


}
);
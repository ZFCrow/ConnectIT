import {test, expect} from '@playwright/test'; 

import {authenticator, totp  } from 'otplib'; 

import { Buffer } from 'buffer';
import base32Encode from 'base32-encode';
import { createDecipheriv } from 'crypto';

test('unauthenticated user is redirected to login page', async ({page}) => { 

    // try to access a protected route 
    await page.goto('http://localhost:5173/')

    // assert redirection to login page 
    await expect(page).toHaveURL('http://localhost:5173/login') 

});

test('logging in with the correct credentials redirects but wrong 2fa code', async ({page}) => { 


    // navigate to login page 
    await page.goto('http://localhost:5173/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();

    // assert redirection to 2fa page look for the text Verify 2FA 
    // Check for visible text "Verify 2FA" anywhere on the page
    await expect(page.locator('div[data-slot="card-title"]')).toHaveText('Verify 2FA', {timeout: 10000})
    

    // fill in the 2fa code 
    await page.fill('input[id="token"]', '111111');
    
    // submit the 2fa form 
    await page.locator('button', { hasText: 'Verify 2FA' }).click();

    await expect(page.getByText('Verification failed')).toBeVisible({timeout: 10000}); // Check for welcome message
});






test('logging in with the correct credentials redirects to 2fa page', async ({page}) => { 


    // navigate to login page 
    await page.goto('http://localhost:5173/login')

    // fill in the login form 
    await page.fill('input[id="email"]', 'jake123@gmail.com')
    await page.fill('input[id="password"]', 'jake1234')

    // submit the form 
    await page.locator('button', { hasText: 'Log In' }).click();

    // assert redirection to 2fa page look for the text Verify 2FA 
    // Check for visible text "Verify 2FA" anywhere on the page
    await expect(page.locator('div[data-slot="card-title"]')).toHaveText('Verify 2FA', {timeout: 10000})
    
    // Your original Base64URL secret
    const rawBase64 =
    '';

    // Normalize to Base64
    const base64 = rawBase64.replace(/-/g, '+').replace(/_/g, '/');

    // Decode to raw binary
    const bytes = Buffer.from(base64, 'base64');

    // Encode to Base32
    const base32 = base32Encode(bytes, 'RFC4648', { padding: false });

    // Generate OTP using base32 secret
    const otp = authenticator.generate(base32);

    console.log('Generated OTP:', otp);

    // fill in the 2fa code 
    await page.fill('input[id="token"]', otp);
    
    // submit the 2fa form 
    await page.locator('button', { hasText: 'Verify 2FA' }).click();




    // assert redirection to home page
    await expect(page).toHaveURL('http://localhost:5173', {timeout: 10000}); 
});
import puppeteer from 'puppeteer';

async function testLoginFlow() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  try {
    console.log('Starting login flow test...');

    // Step 1: Navigate to sign-up page
    console.log('\nStep 1: Navigate to sign-up page');
    await page.goto('http://localhost:3847/sign-up', { waitUntil: 'networkidle2' });

    // Step 2: Fill sign-up form using locators
    console.log('Step 2: Fill out sign-up form');
    await page.locator('#name').fill(testName);
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);

    // Step 3: Submit sign-up form
    console.log('Step 3: Submit sign-up form');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.locator('button[type="submit"]').click()
    ]);

    const signupUrl = page.url();
    console.log(`Sign-up successful! Redirected to: ${signupUrl}`);

    // Step 4: Log out
    console.log('\nStep 4: Log out (set logged_in to false)');
    await page.evaluate(() => {
      document.cookie = 'logged_in=false; path=/; max-age=31536000';
    });

    // Step 5: Navigate to login page
    console.log('Step 5: Navigate to login page');
    await page.goto('http://localhost:3847/login', { waitUntil: 'networkidle2' });

    // Step 6: Test wrong password
    console.log('Step 6: Attempt login with wrong password');
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill('WrongPassword');
    await page.locator('button[type="submit"]').click();

    // Wait for error message
    await page.waitForSelector('.text-red-600', { visible: true, timeout: 5000 })
      .then(async (errorElement) => {
        const errorText = await errorElement?.evaluate(el => el.textContent);
        console.log(`Error shown for wrong password: "${errorText}"`);
      })
      .catch(() => {
        console.log('No error message shown for wrong password');
      });

    // Step 7: Clear and login with correct password
    console.log('\nStep 7: Clear form and login with correct password');
    await page.reload({ waitUntil: 'networkidle0' });

    // Wait for form to be ready and clear inputs
    await page.waitForSelector('#email', { visible: true });
    await page.locator('#email').fill('');
    await page.locator('#password').fill('');

    // Fill with correct credentials
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.locator('button[type="submit"]').click()
    ]);

    const finalUrl = page.url();
    console.log(`Login successful! Redirected to: ${finalUrl}`);

    // Step 8: Verify cookies
    console.log('\nStep 8: Verify user is logged in');
    const context = browser.defaultBrowserContext();
    const cookies = await context.cookies();
    const loggedInCookie = cookies.find(c => c.name === 'logged_in');
    const userNameCookie = cookies.find(c => c.name === 'user_name');
    const userEmailCookie = cookies.find(c => c.name === 'user_email');
    const userPasswordCookie = cookies.find(c => c.name === 'user_password');

    console.log('Cookie verification:');
    console.log(`  - logged_in: ${loggedInCookie?.value === 'true' ? 'PASS' : 'FAIL'}`);
    console.log(`  - user_name: ${userNameCookie?.value === testName ? 'PASS' : 'FAIL'} (${userNameCookie?.value})`);
    console.log(`  - user_email: ${userEmailCookie?.value === testEmail ? 'PASS' : 'FAIL'} (${userEmailCookie?.value})`);
    console.log(`  - user_password stored: ${userPasswordCookie ? 'PASS' : 'FAIL'}`);

    console.log('\nLogin flow test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testLoginFlow().catch(console.error);

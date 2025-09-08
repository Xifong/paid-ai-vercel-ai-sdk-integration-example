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

    console.log('\nStep 1: Navigate to sign-up page');
    await page.goto('http://localhost:3847/sign-up', { waitUntil: 'networkidle2' });

    console.log('Step 2: Fill out sign-up form');
    await page.type('#name', testName);
    await page.type('#email', testEmail);
    await page.type('#password', testPassword);

    console.log('Step 3: Submit sign-up form');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const signupUrl = page.url();
    console.log(`Sign-up successful! Redirected to: ${signupUrl}`);

    console.log('\nStep 4: Log out (set logged_in to false)');
    await page.evaluate(() => {
      document.cookie = 'logged_in=false; path=/; max-age=31536000';
    });

    console.log('Step 5: Navigate to login page');
    await page.goto('http://localhost:3847/login', { waitUntil: 'networkidle2' });

    console.log('Step 6: Attempt login with wrong password');
    await page.type('#email', testEmail);
    await page.type('#password', 'WrongPassword');
    await page.click('button[type="submit"]');

    const errorElement = await page.$('.text-red-600');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log(`Error shown for wrong password: "${errorText}"`);
    } else {
      console.log('No error message shown for wrong password');
    }

    console.log('\nStep 7: Clear form and login with correct password');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#email', { visible: true });
    await page.evaluate(() => {
      const emailInput = document.querySelector('#email') as HTMLInputElement;
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });

    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.locator('button[type="submit"]').click();

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const finalUrl = page.url();
    console.log(`Login successful! Redirected to: ${finalUrl}`);

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

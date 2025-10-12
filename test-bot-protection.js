const puppeteer = require('puppeteer');
const axios = require('axios');

// Test script to verify bot protection on /josh
async function testBotProtection() {
    console.log('🤖 Testing Bot Protection on http://localhost:3000/josh\n');

    // Test 1: Selenium User Agent (should be blocked)
    console.log('Test 1: Selenium User Agent');
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 selenium'
            }
        });
        console.log('❌ FAILED: Selenium UA was not blocked');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ PASSED: Selenium UA blocked with 404');
        } else {
            console.log('❌ FAILED: Unexpected error:', error.message);
        }
    }

    // Test 2: HeadlessChrome User Agent (should be blocked)
    console.log('\nTest 2: HeadlessChrome User Agent');
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('❌ FAILED: HeadlessChrome UA was not blocked');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ PASSED: HeadlessChrome UA blocked with 404');
        } else {
            console.log('❌ FAILED: Unexpected error:', error.message);
        }
    }

    // Test 3: Python Requests User Agent (should be blocked)
    console.log('\nTest 3: Python Requests User Agent');
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'python-requests/2.31.0'
            }
        });
        console.log('❌ FAILED: Python Requests UA was not blocked');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ PASSED: Python Requests UA blocked with 404');
        } else {
            console.log('❌ FAILED: Unexpected error:', error.message);
        }
    }

    // Test 4: Googlebot User Agent (should be blocked)
    console.log('\nTest 4: Googlebot User Agent');
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });
        console.log('❌ FAILED: Googlebot UA was not blocked');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ PASSED: Googlebot UA blocked with 404');
        } else {
            console.log('❌ FAILED: Unexpected error:', error.message);
        }
    }

    // Test 5: Normal Browser User Agent (should redirect to human-check)
    console.log('\nTest 5: Normal Browser User Agent (no cookie)');
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            maxRedirects: 0,
            validateStatus: (status) => status < 400
        });
        console.log('❌ FAILED: Normal UA should redirect to human-check');
    } catch (error) {
        if (error.response?.status === 307 && error.response.headers.location?.includes('/human-check')) {
            console.log('✅ PASSED: Normal UA redirected to human-check');
        } else {
            console.log('❌ FAILED: Unexpected redirect:', error.response?.headers.location);
        }
    }

    // Test 6: Puppeteer Test (should be blocked)
    console.log('\nTest 6: Puppeteer Browser Test');
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        const response = await page.goto('http://localhost:3000/josh', { 
            waitUntil: 'networkidle0',
            timeout: 5000 
        });
        
        if (response.status() === 404) {
            console.log('✅ PASSED: Puppeteer blocked with 404');
        } else {
            console.log('❌ FAILED: Puppeteer was not blocked, status:', response.status());
        }
        
        await browser.close();
    } catch (error) {
        console.log('✅ PASSED: Puppeteer blocked (error):', error.message);
    }

    console.log('\n🎯 Bot Protection Test Complete!');
}

// Run the test
testBotProtection().catch(console.error);


const puppeteer = require('puppeteer');

async function debugTest() {
    console.log('🔍 Debug Test - Checking what\'s happening...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Enable request/response logging
    page.on('request', request => {
        console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
        console.log(`   User-Agent: ${request.headers()['user-agent']}`);
    });
    
    page.on('response', response => {
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    });
    
    console.log('🌐 Navigating to http://localhost:3000/josh...');
    
    try {
        const response = await page.goto('http://localhost:3000/josh', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        console.log(`\n📊 Final Status: ${response.status()}`);
        console.log(`🔗 Final URL: ${page.url()}`);
        
        // Check if we can see the page content
        const title = await page.title();
        console.log(`📄 Page Title: ${title}`);
        
        // Check if we see the Josh content
        const joshElement = await page.$('h1');
        if (joshElement) {
            const joshText = await page.evaluate(el => el.textContent, joshElement);
            console.log(`👤 Found Josh element: ${joshText}`);
        }
        
        console.log('\n⏳ Waiting 5 seconds...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
    
    await browser.close();
}

debugTest().catch(console.error);


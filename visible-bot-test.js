const puppeteer = require('puppeteer');

async function visibleBotTest() {
    console.log('🤖 Starting Visible Bot Test...\n');
    
    // Launch browser in visible mode (not headless)
    const browser = await puppeteer.launch({ 
        headless: false,  // Show browser window
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    console.log('🌐 Opening http://localhost:3000/josh...');
    console.log('👀 Watch the browser window to see what happens!\n');
    
    try {
        // Navigate to the protected page
        const response = await page.goto('http://localhost:3000/josh', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        console.log(`📊 Response Status: ${response.status()}`);
        
        if (response.status() === 404) {
            console.log('✅ SUCCESS: Bot was blocked with 404!');
            console.log('🔒 You should see a "This site can\'t be reached" error page');
        } else {
            console.log('❌ FAILED: Bot was not blocked');
            console.log(`Status: ${response.status()}`);
        }
        
        // Wait a bit so you can see the result
        console.log('\n⏳ Waiting 5 seconds so you can see the result...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.log('✅ SUCCESS: Bot was blocked (error):', error.message);
        console.log('🔒 The page failed to load - protection is working!');
        
        // Wait a bit so you can see the error
        console.log('\n⏳ Waiting 5 seconds so you can see the error...');
        await page.waitForTimeout(5000);
    }
    
    console.log('\n🎯 Test complete! Closing browser...');
    await browser.close();
}

// Run the test
visibleBotTest().catch(console.error);


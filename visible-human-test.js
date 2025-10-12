const puppeteer = require('puppeteer');

async function visibleHumanTest() {
    console.log('👤 Starting Visible Human User Test...\n');
    
    // Launch browser in visible mode with normal user agent
    const browser = await puppeteer.launch({ 
        headless: false,  // Show browser window
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Set normal user agent (not bot-like)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('🌐 Opening http://localhost:3000/josh as normal user...');
    console.log('👀 Watch the browser window to see the human-check flow!\n');
    
    try {
        // Navigate to the protected page
        const response = await page.goto('http://localhost:3000/josh', { 
            waitUntil: 'networkidle0',
            timeout: 15000 
        });
        
        console.log(`📊 Response Status: ${response.status()}`);
        
        // Check if we got redirected to human-check
        const currentUrl = page.url();
        console.log(`🔗 Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/human-check')) {
            console.log('✅ SUCCESS: Normal user redirected to human-check!');
            console.log('🔄 You should see the human-check page briefly...');
            
            // Wait for redirect back to /josh
            console.log('⏳ Waiting for redirect back to /josh...');
            await page.waitForFunction(() => window.location.pathname === '/josh', { timeout: 10000 });
            
            console.log('✅ SUCCESS: Redirected back to /josh!');
            console.log('🎉 You should now see the actual Josh page!');
            
        } else if (currentUrl.includes('/josh')) {
            console.log('✅ SUCCESS: Normal user accessed /josh directly!');
            console.log('🎉 You should see the actual Josh page!');
        } else {
            console.log('❓ Unexpected URL:', currentUrl);
        }
        
        // Wait a bit so you can see the result
        console.log('\n⏳ Waiting 10 seconds so you can see the final result...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        
        // Wait a bit so you can see the error
        console.log('\n⏳ Waiting 5 seconds so you can see the error...');
        await page.waitForTimeout(5000);
    }
    
    console.log('\n🎯 Test complete! Closing browser...');
    await browser.close();
}

// Run the test
visibleHumanTest().catch(console.error);

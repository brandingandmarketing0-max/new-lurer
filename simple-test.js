// Simple test script - run this when your server is running on localhost:3000
const axios = require('axios');

async function quickTest() {
    console.log('🚀 Quick Bot Protection Test\n');
    
    // Test bot detection
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });
        console.log('❌ FAILED: Bot was not blocked');
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('✅ PASSED: Bot blocked with 404');
        } else {
            console.log('❌ FAILED: Unexpected error:', error.message);
        }
    }
    
    // Test normal user (should redirect)
    try {
        const response = await axios.get('http://localhost:3000/josh', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            maxRedirects: 0,
            validateStatus: (status) => status < 400
        });
        console.log('❌ FAILED: Normal user should redirect');
    } catch (error) {
        if (error.response?.status === 307 && error.response.headers.location?.includes('/human-check')) {
            console.log('✅ PASSED: Normal user redirected to human-check');
        } else {
            console.log('❌ FAILED: Unexpected redirect:', error.response?.headers.location);
        }
    }
    
    console.log('\n🎯 Test Complete!');
}

quickTest().catch(console.error);


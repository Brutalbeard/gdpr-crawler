/**
 * Basic test to verify the crawler functionality
 * This is a simple smoke test to ensure the main components work
 */

const SearchResultsCrawler = require('./crawler');

async function runTests() {
  console.log('Running basic tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Crawler instantiation
  try {
    const crawler = new SearchResultsCrawler({
      maxResults: 5,
      timeout: 5000
    });
    
    if (crawler && crawler.maxResults === 5 && crawler.timeout === 5000) {
      console.log('✓ Test 1 PASSED: Crawler instantiation with options');
      passed++;
    } else {
      console.log('✗ Test 1 FAILED: Crawler options not set correctly');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 1 FAILED:', error.message);
    failed++;
  }

  // Test 2: Sleep function
  try {
    const crawler = new SearchResultsCrawler();
    const start = Date.now();
    await crawler.sleep(100);
    const elapsed = Date.now() - start;
    
    if (elapsed >= 100 && elapsed < 200) {
      console.log('✓ Test 2 PASSED: Sleep function works correctly');
      passed++;
    } else {
      console.log('✗ Test 2 FAILED: Sleep function timing off');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 2 FAILED:', error.message);
    failed++;
  }

  // Test 3: Export to JSON
  try {
    const crawler = new SearchResultsCrawler();
    const fs = require('fs');
    const testData = [
      {
        title: 'Test Page',
        url: 'https://example.com',
        emails: ['test@example.com'],
        contactLinks: ['https://example.com/contact']
      }
    ];
    
    const testFile = '/tmp/test-output.json';
    crawler.exportToJSON(testData, testFile);
    
    if (fs.existsSync(testFile)) {
      const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
      if (content.length === 1 && content[0].title === 'Test Page') {
        console.log('✓ Test 3 PASSED: JSON export works correctly');
        passed++;
        fs.unlinkSync(testFile); // Clean up
      } else {
        console.log('✗ Test 3 FAILED: JSON content incorrect');
        failed++;
      }
    } else {
      console.log('✗ Test 3 FAILED: JSON file not created');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 3 FAILED:', error.message);
    failed++;
  }

  // Test 4: Export to CSV
  try {
    const crawler = new SearchResultsCrawler();
    const fs = require('fs');
    const testData = [
      {
        title: 'Test Page',
        url: 'https://example.com',
        emails: ['test@example.com'],
        contactLinks: ['https://example.com/contact']
      }
    ];
    
    const testFile = '/tmp/test-output.csv';
    crawler.exportToCSV(testData, testFile);
    
    if (fs.existsSync(testFile)) {
      const content = fs.readFileSync(testFile, 'utf8');
      if (content.includes('Test Page') && content.includes('test@example.com')) {
        console.log('✓ Test 4 PASSED: CSV export works correctly');
        passed++;
        fs.unlinkSync(testFile); // Clean up
      } else {
        console.log('✗ Test 4 FAILED: CSV content incorrect');
        failed++;
      }
    } else {
      console.log('✗ Test 4 FAILED: CSV file not created');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 4 FAILED:', error.message);
    failed++;
  }

  // Test 5: Default options
  try {
    const crawler = new SearchResultsCrawler();
    
    if (crawler.maxResults === 10 && crawler.timeout === 10000) {
      console.log('✓ Test 5 PASSED: Default options set correctly');
      passed++;
    } else {
      console.log('✗ Test 5 FAILED: Default options incorrect');
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 5 FAILED:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = runTests;

#!/usr/bin/env node

/**
 * Example usage of the SearchResultsCrawler
 * This demonstrates how to use the crawler programmatically
 */

const SearchResultsCrawler = require('./crawler');

async function runExample() {
  console.log('GDPR Crawler - Example Usage\n');
  
  // Create a crawler instance with custom options
  const crawler = new SearchResultsCrawler({
    maxResults: 5,  // Only process 5 results
    timeout: 10000,  // 10 second timeout
    searchEngine: 'duckduckgo'  // Use DuckDuckGo (default)
  });

  // Example query - you can replace this with any search query
  const query = 'github open source GDPR privacy';
  
  console.log(`Example 1: Searching for "${query}"\n`);
  
  try {
    // Perform the crawl
    const results = await crawler.crawl(query);
    
    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE RESULTS');
    console.log('='.repeat(60) + '\n');
    
    results.forEach((result, index) => {
      console.log(`Result #${index + 1}:`);
      console.log(`  Title: ${result.title}`);
      console.log(`  URL: ${result.url}`);
      
      if (result.emails.length > 0) {
        console.log(`  Emails: ${result.emails.join(', ')}`);
      } else {
        console.log(`  Emails: None found`);
      }
      
      if (result.contactLinks.length > 0) {
        console.log(`  Contact Links: ${result.contactLinks.length} found`);
        result.contactLinks.slice(0, 3).forEach(link => {
          console.log(`    - ${link}`);
        });
        if (result.contactLinks.length > 3) {
          console.log(`    ... and ${result.contactLinks.length - 3} more`);
        }
      } else {
        console.log(`  Contact Links: None found`);
      }
      
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      
      console.log('');
    });
    
    // Export to JSON
    crawler.exportToJSON(results, 'example-results.json');
    
    console.log('\nExample 1 completed!');
    console.log('Check example-results.json for the full output.\n');
    
  } catch (error) {
    console.error('Example 1 failed:', error.message);
  }

  // Example 2: Crawling specific URLs directly
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Crawling Specific URLs Directly');
  console.log('='.repeat(60) + '\n');

  try {
    const urlsToCrawl = [
      'https://www.example.com',
      'https://www.example.org'
    ];

    const directResults = await crawler.crawlUrls(urlsToCrawl);
    
    console.log('\n' + '='.repeat(60));
    console.log('DIRECT CRAWL RESULTS');
    console.log('='.repeat(60) + '\n');
    
    console.log(`Crawled ${directResults.length} URLs directly`);
    console.log('This method is useful when search engines are blocked.\n');
    
  } catch (error) {
    console.error('Example 2 failed:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

module.exports = runExample;

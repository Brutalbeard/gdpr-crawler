#!/usr/bin/env node

const { Command } = require('commander');
const SearchResultsCrawler = require('./crawler');

const program = new Command();

program
  .name('gdpr-crawler')
  .description('Search results web crawler for finding contact information')
  .version('1.0.0');

program
  .argument('<query>', 'Search query (e.g., Federal Case Number)')
  .option('-m, --max-results <number>', 'Maximum number of search results to process', '10')
  .option('-o, --output <file>', 'Output file name (without extension)')
  .option('-f, --format <type>', 'Output format: json or csv', 'json')
  .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '10000')
  .action(async (query, options) => {
    try {
      const crawler = new SearchResultsCrawler({
        maxResults: parseInt(options.maxResults),
        timeout: parseInt(options.timeout)
      });

      const results = await crawler.crawl(query);

      // Export results
      if (options.output) {
        const outputFile = options.format === 'csv' 
          ? `${options.output}.csv` 
          : `${options.output}.json`;
        
        if (options.format === 'csv') {
          crawler.exportToCSV(results, outputFile);
        } else {
          crawler.exportToJSON(results, outputFile);
        }
      } else {
        // Default output to console as JSON
        console.log('\n' + '='.repeat(60));
        console.log('RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(JSON.stringify(results, null, 2));
      }

      console.log(`\nTotal results processed: ${results.length}`);
      
      const totalEmails = results.reduce((sum, r) => sum + r.emails.length, 0);
      const totalLinks = results.reduce((sum, r) => sum + r.contactLinks.length, 0);
      
      console.log(`Total emails found: ${totalEmails}`);
      console.log(`Total contact links found: ${totalLinks}`);
      
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();

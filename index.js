#!/usr/bin/env node

const { Command } = require('commander');
const SearchResultsCrawler = require('./crawler');

const program = new Command();

program
  .name('gdpr-crawler')
  .description('Search results web crawler for finding contact information')
  .version('1.0.0');

program
  .argument('[query]', 'Search query (e.g., Federal Case Number). Optional if --urls is provided.')
  .option('-m, --max-results <number>', 'Maximum number of search results to process', '10')
  .option('-o, --output <file>', 'Output file name (without extension)')
  .option('-f, --format <type>', 'Output format: json or csv', 'json')
  .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '10000')
  .option('-s, --search-engine <engine>', 'Search engine to use: duckduckgo or google', 'duckduckgo')
  .option('-u, --urls <urls...>', 'Crawl specific URLs directly instead of searching')
  .action(async (query, options) => {
    try {
      // Validate inputs
      if (!query && !options.urls) {
        console.error('Error: You must provide either a search query or URLs using --urls option');
        process.exit(1);
      }

      const crawler = new SearchResultsCrawler({
        maxResults: parseInt(options.maxResults),
        timeout: parseInt(options.timeout),
        searchEngine: options.searchEngine
      });

      let results;

      if (options.urls) {
        // Crawl specific URLs directly
        results = await crawler.crawlUrls(options.urls);
      } else {
        // Perform search and crawl results
        results = await crawler.crawl(query);
      }

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

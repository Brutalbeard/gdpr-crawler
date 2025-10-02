#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class SearchResultsCrawler {
  constructor(options = {}) {
    this.maxResults = options.maxResults || 10;
    this.timeout = options.timeout || 10000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.searchEngine = options.searchEngine || 'duckduckgo'; // Changed default to DuckDuckGo
  }

  /**
   * Perform a web search for the given query
   */
  async search(query) {
    if (this.searchEngine === 'duckduckgo') {
      return await this.searchDuckDuckGo(query);
    } else if (this.searchEngine === 'google') {
      return await this.searchGoogle(query);
    } else {
      console.error(`Unsupported search engine: ${this.searchEngine}`);
      return [];
    }
  }

  /**
   * Perform a DuckDuckGo search for the given query
   */
  async searchDuckDuckGo(query) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: this.timeout
      });

      const $ = cheerio.load(response.data);
      const results = [];

      // Extract search results from DuckDuckGo HTML version
      $('.result__a').each((i, elem) => {
        if (results.length >= this.maxResults) return false;
        
        const title = $(elem).text().trim();
        const href = $(elem).attr('href');

        if (title && href) {
          try {
            // DuckDuckGo uses redirect URLs, extract the actual URL
            let cleanUrl = href;
            // Handle DuckDuckGo redirect links in all forms
            const duckDuckGoOrigin = 'https://duckduckgo.com';
            if (
              href.startsWith('/l/?') ||
              href.startsWith('https://duckduckgo.com/l/?') ||
              href.startsWith('//duckduckgo.com/l/?')
            ) {
              // Resolve relative and protocol-relative links
              let resolvedHref = href;
              if (href.startsWith('/l/?')) {
                resolvedHref = duckDuckGoOrigin + href;
              } else if (href.startsWith('//duckduckgo.com/l/?')) {
                resolvedHref = 'https:' + href;
              }
              const urlParams = new URLSearchParams(resolvedHref.split('?')[1]);
              cleanUrl = urlParams.get('uddg') || href;
            }
            
            // Validate URL
            new URL(cleanUrl);
            
            results.push({
              title: title,
              url: cleanUrl
            });
          } catch (error) {
            // Skip invalid URLs
          }
        }
      });

      return results;
    } catch (error) {
      console.error('Error performing DuckDuckGo search:', error.message);
      console.error('Tip: Try using --urls option to provide direct URLs instead of searching');
      return [];
    }
  }

  /**
   * Perform a Google search for the given query
   */
  async searchGoogle(query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${this.maxResults}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: this.timeout
      });

      const $ = cheerio.load(response.data);
      const results = [];

      // Extract search results from Google
      $('div.g').each((i, elem) => {
        const titleElem = $(elem).find('h3').first();
        const linkElem = $(elem).find('a').first();
        
        const title = titleElem.text().trim();
        const href = linkElem.attr('href');

        if (title && href) {
          try {
            // Clean up the URL (Google sometimes wraps URLs)
            let cleanUrl = href;
            if (href.startsWith('/url?q=')) {
              const urlParams = new URLSearchParams(href.substring(5));
              cleanUrl = urlParams.get('q') || href;
            }
            
            results.push({
              title: title,
              url: cleanUrl
            });
          } catch (error) {
            console.error(`Error parsing URL: ${href}`, error.message);
          }
        }
      });

      return results;
    } catch (error) {
      console.error('Error performing Google search:', error.message);
      console.error('Tip: Try using --search-engine duckduckgo or --urls option to provide direct URLs');
      return [];
    }
  }

  /**
   * Find contact links on a webpage
   */
  async findContactLinks(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: this.timeout,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);
      const baseUrl = new URL(url);
      const contactInfo = {
        emails: new Set(),
        contactLinks: new Set()
      };

      // Keywords to look for in links and text
      const contactKeywords = [
        'legal', 'contact', 'privacy', 'report', 'abuse', 
        'dmca', 'takedown', 'removal', 'complaint', 'support',
        'about', 'team', 'help'
      ];

      // Find all links on the page
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        const linkText = $(elem).text().toLowerCase().trim();
        
        if (!href) return;

        // Check if link text matches contact keywords
        const matchesKeyword = contactKeywords.some(keyword => 
          linkText.includes(keyword)
        );

        if (matchesKeyword) {
          try {
            // Convert relative URLs to absolute
            const absoluteUrl = new URL(href, baseUrl).toString();
            contactInfo.contactLinks.add(absoluteUrl);
          } catch (error) {
            // Invalid URL, skip it
          }
        }
      });

      // Find email addresses in the HTML
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const htmlText = $.html();
      const emailMatches = htmlText.match(emailRegex);
      
      if (emailMatches) {
        emailMatches.forEach(email => {
          // Filter out common false positives
          if (!email.includes('@example.') && 
              !email.includes('@domain.') &&
              !email.includes('@sentry.') &&
              !email.endsWith('.png') &&
              !email.endsWith('.jpg') &&
              !email.endsWith('.gif')) {
            contactInfo.emails.add(email);
          }
        });
      }

      // Also check for mailto links
      $('a[href^="mailto:"]').each((i, elem) => {
        const mailto = $(elem).attr('href');
        const email = mailto.replace('mailto:', '').split('?')[0];
        contactInfo.emails.add(email);
      });

      return {
        emails: Array.from(contactInfo.emails),
        contactLinks: Array.from(contactInfo.contactLinks)
      };
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
      return {
        emails: [],
        contactLinks: [],
        error: error.message
      };
    }
  }

  /**
   * Crawl search results for a given query
   */
  async crawl(query) {
    console.log(`Searching for: "${query}"`);
    console.log('=' .repeat(60));

    const searchResults = await this.search(query);
    
    if (searchResults.length === 0) {
      console.log('No search results found.');
      console.log('\nTip: You can also provide URLs directly using crawlUrls() method or the --urls CLI option.');
      return [];
    }

    console.log(`Found ${searchResults.length} search results\n`);

    const results = [];

    for (const result of searchResults) {
      console.log(`\nProcessing: ${result.title}`);
      console.log(`URL: ${result.url}`);

      const contactInfo = await this.findContactLinks(result.url);
      
      const resultData = {
        title: result.title,
        url: result.url,
        emails: contactInfo.emails || [],
        contactLinks: contactInfo.contactLinks || []
      };

      if (contactInfo.error) {
        resultData.error = contactInfo.error;
      }

      results.push(resultData);

      // Display found contact information
      if (contactInfo.emails && contactInfo.emails.length > 0) {
        console.log(`  Emails found: ${contactInfo.emails.join(', ')}`);
      }
      if (contactInfo.contactLinks && contactInfo.contactLinks.length > 0) {
        console.log(`  Contact links found: ${contactInfo.contactLinks.length}`);
      }
      if (contactInfo.error) {
        console.log(`  Error: ${contactInfo.error}`);
      }

      // Be respectful with delays between requests
      await this.sleep(1000);
    }

    return results;
  }

  /**
   * Crawl specific URLs directly without searching
   */
  async crawlUrls(urls) {
    console.log(`Crawling ${urls.length} URLs directly`);
    console.log('=' .repeat(60));

    const results = [];

    for (const url of urls) {
      console.log(`\nProcessing: ${url}`);

      const contactInfo = await this.findContactLinks(url);
      
      // Try to get page title
      let title = url;
      try {
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent },
          timeout: this.timeout,
          maxRedirects: 5
        });
        const $ = cheerio.load(response.data);
        const pageTitle = $('title').text().trim();
        if (pageTitle) {
          title = pageTitle;
        }
      } catch (error) {
        // Use URL as title if we can't fetch it
      }

      const resultData = {
        title: title,
        url: url,
        emails: contactInfo.emails || [],
        contactLinks: contactInfo.contactLinks || []
      };

      if (contactInfo.error) {
        resultData.error = contactInfo.error;
      }

      results.push(resultData);

      // Display found contact information
      if (contactInfo.emails && contactInfo.emails.length > 0) {
        console.log(`  Emails found: ${contactInfo.emails.join(', ')}`);
      }
      if (contactInfo.contactLinks && contactInfo.contactLinks.length > 0) {
        console.log(`  Contact links found: ${contactInfo.contactLinks.length}`);
      }
      if (contactInfo.error) {
        console.log(`  Error: ${contactInfo.error}`);
      }

      // Be respectful with delays between requests
      await this.sleep(1000);
    }

    return results;
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export results to JSON
   */
  exportToJSON(results, filename = 'results.json') {
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${filename}`);
  }

  /**
   * Export results to CSV
   */
  exportToCSV(results, filename = 'results.csv') {
    const fs = require('fs');
    const lines = ['Title,URL,Emails,Contact Links,Error'];
    
    results.forEach(result => {
      const title = `"${result.title.replace(/"/g, '""')}"`;
      const url = `"${result.url}"`;
      const emails = `"${result.emails.join('; ')}"`;
      const contactLinks = `"${result.contactLinks.join('; ')}"`;
      const error = result.error ? `"${result.error.replace(/"/g, '""')}"` : '""';
      
      lines.push(`${title},${url},${emails},${contactLinks},${error}`);
    });
    
    fs.writeFileSync(filename, lines.join('\n'));
    console.log(`Results saved to ${filename}`);
  }
}

module.exports = SearchResultsCrawler;

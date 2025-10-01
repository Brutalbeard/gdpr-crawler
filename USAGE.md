# GDPR Crawler - Usage Guide

## Overview

The GDPR Crawler is a command-line tool designed to help you find and document where your information appears online, along with the contact information needed to request content removal.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Basic Usage

### Command Line Interface

The simplest way to use the tool:

```bash
node index.js "your search query"
```

### Searching for a Federal Case Number

Example searching for a specific case number:

```bash
node index.js "Case No. 1:23-cv-12345-ABC"
```

This will:
1. Search for the case number online
2. Visit each result page
3. Extract contact information (emails and links)
4. Display results in the console

### Saving Results to a File

To save results to a JSON file:

```bash
node index.js "Case No. 1:23-cv-12345-ABC" --output my-results --format json
```

To save results to a CSV file:

```bash
node index.js "Case No. 1:23-cv-12345-ABC" --output my-results --format csv
```

### Limiting Search Results

To process only the first 5 search results:

```bash
node index.js "Case No. 1:23-cv-12345-ABC" --max-results 5
```

## Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-m, --max-results <number>` | Maximum number of search results to process | 10
| `-o, --output <file>` | Output file name (without extension) | Console output
| `-f, --format <type>` | Output format: `json` or `csv` | json
| `-t, --timeout <ms>` | Request timeout in milliseconds | 10000
| `-h, --help` | Display help information | -
| `-V, --version` | Display version number | -

## Programmatic Usage

You can also use the crawler in your own Node.js scripts:

```javascript
const SearchResultsCrawler = require('./crawler');

async function main() {
  const crawler = new SearchResultsCrawler({
    maxResults: 5,
    timeout: 10000
  });

  const results = await crawler.crawl('your search query');
  
  // Process results
  results.forEach(result => {
    console.log(`Title: ${result.title}`);
    console.log(`URL: ${result.url}`);
    console.log(`Emails: ${result.emails.join(', ')}`);
    console.log('---');
  });
  
  // Export to file
  crawler.exportToJSON(results, 'output.json');
}

main();
```

## Understanding the Output

### JSON Format

```json
[
  {
    "title": "Example Website - Case Information",
    "url": "https://example.com/case/12345",
    "emails": [
      "legal@example.com",
      "privacy@example.com"
    ],
    "contactLinks": [
      "https://example.com/contact",
      "https://example.com/privacy-policy",
      "https://example.com/legal/dmca"
    ]
  }
]
```

### CSV Format

The CSV output includes the following columns:
- **Title**: The page title
- **URL**: The full URL of the page
- **Emails**: Semicolon-separated list of email addresses found
- **Contact Links**: Semicolon-separated list of contact-related links found
- **Error**: Any error encountered while crawling the page

## What the Crawler Looks For

### Email Addresses

The crawler searches for:
- Email addresses in the HTML content
- `mailto:` links
- Common patterns like `contact@`, `legal@`, `privacy@`, etc.

### Contact Links

The crawler identifies links containing these keywords:
- Legal
- Contact / Contact Us
- Privacy / Privacy Policy
- Report Abuse
- DMCA
- Takedown
- Removal Request
- Complaint
- Support / Help

## Best Practices

### 1. Be Specific with Search Queries

Use specific search terms like:
- Full case numbers with formatting
- Exact names or phrases
- Date ranges if applicable

### 2. Review Results Carefully

Always review the results before reaching out to websites. Not all results may be relevant.

### 3. Rate Limiting

The crawler includes a 1-second delay between requests to be respectful to web servers. Don't modify this to be more aggressive.

### 4. Legal Compliance

- Ensure you have the legal right to request content removal
- Follow GDPR, CCPA, or other applicable privacy regulations
- Respect website Terms of Service
- Consider consulting with legal counsel for important cases

### 5. Using Contact Information

When using the contact information found:
- Be professional and clear in your requests
- Reference specific URLs where your information appears
- Provide necessary documentation to prove your identity
- Follow up if you don't receive a response within a reasonable timeframe

## Troubleshooting

### No Results Found

If the search returns no results:
- Try different search terms
- Check if the search query is too specific or too broad
- Verify internet connectivity

### Connection Errors

If you see connection errors:
- Check your internet connection
- Some websites may block automated requests
- Try increasing the timeout value

### Missing Contact Information

If no contact information is found on a page:
- The page may not have publicly listed contact information
- Try looking at the website's homepage or footer
- Use the WHOIS database to find domain owner information

## Configuration

You can customize the crawler by modifying `config.json`:

```json
{
  "searchEngine": "google",
  "maxResults": 10,
  "timeout": 10000,
  "contactKeywords": ["legal", "contact", "privacy", ...],
  "delayBetweenRequests": 1000
}
```

## Examples

### Example 1: Quick Search

```bash
node index.js "John Doe privacy violation"
```

### Example 2: Detailed Search with Export

```bash
node index.js "Case No. 1:23-cv-12345" \
  --max-results 20 \
  --output case-12345-contacts \
  --format csv \
  --timeout 15000
```

### Example 3: Programmatic Usage

See `example.js` for a complete programmatic example:

```bash
node example.js
```

## Support

For issues, questions, or contributions, please visit the GitHub repository.

## License

MIT License - See LICENSE file for details.

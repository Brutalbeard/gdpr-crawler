# gdpr-crawler

Need to get some nonsense removed about you from a website? This bad boy can help.

A web crawler that searches for specific queries (like Federal Case Numbers) and extracts contact information from search results to help you reach out to website administrators for content removal requests.

## Features

- 🔍 Searches for your specified query (e.g., Federal Case Number)
- 📄 Extracts page titles and URLs from search results
- 📧 Finds email addresses on result pages
- 🔗 Locates contact links related to:
  - Legal
  - Contact Us
  - Privacy
  - Report Abuse
  - DMCA Takedown
  - Support
- 💾 Exports results to JSON or CSV format

## Installation

```bash
npm install
```

## Usage

### Command Line

```bash
node index.js "<your search query>" [options]
```

### Examples

Search for a Federal Case Number:
```bash
node index.js "Case No. 1:23-cv-12345"
```

Search with custom options:
```bash
node index.js "Case No. 1:23-cv-12345" --max-results 20 --output results --format csv
```

### Options

- `-m, --max-results <number>` - Maximum number of search results to process (default: 10)
- `-o, --output <file>` - Output file name without extension (default: console output)
- `-f, --format <type>` - Output format: `json` or `csv` (default: json)
- `-t, --timeout <ms>` - Request timeout in milliseconds (default: 10000)

### Output Format

The crawler generates structured output containing:

**JSON Output:**
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
      "https://example.com/report-abuse"
    ]
  }
]
```

**CSV Output:**
```csv
Title,URL,Emails,Contact Links,Error
"Example Website","https://example.com","legal@example.com; privacy@example.com","https://example.com/contact; https://example.com/privacy","",
```

## How It Works

1. **Search Phase**: Performs a web search using your query
2. **Extraction Phase**: For each search result:
   - Extracts the page title and URL
   - Visits the page
   - Searches for email addresses in the HTML
   - Identifies links containing keywords like "contact", "legal", "privacy", etc.
3. **Export Phase**: Outputs results in your chosen format

## Important Notes

⚠️ **Rate Limiting**: The crawler includes a 1-second delay between requests to be respectful to web servers.

⚠️ **Search Engine**: Currently uses Google search. Search engines may block automated requests. Consider using search engine APIs for production use.

⚠️ **Legal Compliance**: Always ensure your use of this tool complies with applicable laws and website terms of service.

## Use Case

This tool is designed to help individuals exercise their privacy rights (e.g., GDPR, CCPA) by:
1. Finding where their information appears online
2. Identifying the appropriate contact points for removal requests
3. Streamlining the process of reaching out to website administrators

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


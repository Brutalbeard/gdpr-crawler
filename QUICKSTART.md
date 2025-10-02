# Quick Start Guide

## When Search Doesn't Work

If you tried searching for "DAT Solutions LLC v. Celoria" and it didn't work, it's likely because:
1. Search engines (Google, DuckDuckGo) are blocked on your network
2. The search engine requires CAPTCHA verification for automated requests

**Solution: Use Direct URL Crawling**

## Step 1: Find URLs Manually

Use your web browser to search for your case or information:
1. Open your browser and go to Google, Bing, or DuckDuckGo
2. Search for "DAT Solutions LLC v. Celoria" (or your case)
3. Copy the URLs of pages that contain the information you want removed
4. Save these URLs for the next step

## Step 2: Crawl URLs Directly

Use the `--urls` option to crawl those specific pages:

```bash
node index.js --urls "https://example1.com/case-page" "https://example2.com/records" --output results --format csv
```

**Example with multiple URLs:**
```bash
node index.js --urls \
  "https://courtlistener.com/opinion/12345/" \
  "https://justia.com/cases/federal/district-courts/case-12345" \
  "https://law.com/archives/case-info" \
  --output dat-solutions-contacts \
  --format csv
```

## Step 3: Review the Results

The crawler will:
- Visit each URL you provided
- Extract the page title
- Find email addresses on the page
- Identify contact links (legal, privacy, abuse reporting, etc.)
- Save everything to `dat-solutions-contacts.csv` (or `.json`)

## Alternative: Try Different Search Engine

If one search engine doesn't work, try another:

**Using DuckDuckGo (default):**
```bash
node index.js "DAT Solutions LLC v. Celoria" --output results
```

**Using Google:**
```bash
node index.js "DAT Solutions LLC v. Celoria" --search-engine google --output results
```

## Common Use Cases

### Case 1: You know exactly which sites have your information
```bash
node index.js --urls \
  "https://site1.com/your-info" \
  "https://site2.com/your-info" \
  --output removal-contacts \
  --format csv
```

### Case 2: Testing with a small number of results first
```bash
node index.js "your case number" --max-results 3 --output test-results
```

### Case 3: Need more time for slow websites
```bash
node index.js --urls "https://slow-site.com/page" --timeout 20000 --output results
```

## Understanding the Output

### CSV Output
The CSV file will have these columns:
- **Title**: The page title
- **URL**: The full URL
- **Emails**: Email addresses found (separated by semicolons)
- **Contact Links**: Links to contact pages (separated by semicolons)
- **Error**: Any errors encountered

### JSON Output
```json
[
  {
    "title": "Court Case Info - DAT Solutions",
    "url": "https://example.com/case",
    "emails": ["legal@example.com", "privacy@example.com"],
    "contactLinks": [
      "https://example.com/contact",
      "https://example.com/legal/dmca"
    ]
  }
]
```

## What to Do Next

Once you have the contact information:

1. **Review the results** - Check which sites have your information
2. **Draft a removal request** - Prepare a professional email requesting content removal
3. **Send requests** - Email the contacts found or use the contact forms
4. **Follow up** - If no response in 7-14 days, send a follow-up
5. **Document everything** - Keep records of all communications

## Troubleshooting

**Problem**: "Error: You must provide either a search query or URLs"
**Solution**: You need to provide either a search query OR use the `--urls` option

**Problem**: "No search results found"
**Solution**: Use the `--urls` option to crawl specific URLs directly

**Problem**: "getaddrinfo ENOTFOUND www.google.com"
**Solution**: Search engines are blocked. Use `--urls` to bypass search

**Problem**: "Error crawling [URL]"
**Solution**: 
- Check if the URL is correct
- Increase timeout: `--timeout 20000`
- The site may be blocking automated access

## Need Help?

Run `node index.js --help` to see all available options.

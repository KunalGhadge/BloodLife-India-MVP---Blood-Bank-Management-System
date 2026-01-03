const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const START_URL = 'http://localhost:3000'; // Change this to your local dev server or live site
const DOMAIN = new URL(START_URL).hostname;

async function scanSite() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const visited = new Set();
    const queue = [START_URL];
    const resourceMap = {
        site_name: "My Documentation",
        pages: []
    };

    while (queue.length > 0) {
        const url = queue.shift();
        if (visited.has(url)) continue;
        visited.add(url);

        console.log(`Scanning: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const title = await page.title();
            const metaDescription = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');

            const content = await page.evaluate(() => {
                const results = [];

                // 1. Try to find the main content area
                const mainArea = document.querySelector('main, article, #content, .content, .main') || document.body;

                // 2. Extract sections based on headings
                const headings = mainArea.querySelectorAll('h1, h2, h3, h4');
                if (headings.length > 0) {
                    headings.forEach(h => {
                        let text = '';
                        let next = h.nextElementSibling;
                        // Grab text until the next heading or end of parent
                        while (next && !['H1', 'H2', 'H3', 'H4'].includes(next.tagName)) {
                            text += next.innerText + '\n';
                            next = next.nextElementSibling;
                        }
                        if (text.trim().length > 20) {
                            results.push({
                                heading: h.innerText.trim(),
                                text: text.trim(),
                                link: window.location.pathname + '#' + (h.id || '')
                            });
                        }
                    });
                } else {
                    // 3. Fallback: Just grab large paragraphs if no headings exist
                    const paragraphs = mainArea.querySelectorAll('p');
                    paragraphs.forEach((p, i) => {
                        if (p.innerText.trim().length > 50) {
                            results.push({
                                heading: `Section ${i + 1}`,
                                text: p.innerText.trim(),
                                link: window.location.pathname
                            });
                        }
                    });
                }
                return results;
            });

            resourceMap.pages.push({
                url: new URL(url).pathname,
                title: title,
                description: metaDescription,
                content: content
            });

            // Find internal links
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => a.href)
                    .filter(href => href.startsWith(window.location.origin));
            });

            for (const link of links) {
                const cleanLink = link.split('#')[0];
                if (!visited.has(cleanLink)) {
                    queue.push(cleanLink);
                }
            }

        } catch (err) {
            console.error(`Failed to scan ${url}:`, err);
        }
    }

    fs.writeFileSync(path.join(__dirname, 'resourcemap.json'), JSON.stringify(resourceMap, null, 2));
    console.log(`Success! Saved ${resourceMap.pages.length} pages to resourcemap.json`);
    await browser.close();
}

scanSite();

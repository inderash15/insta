import fs from 'fs';

const html = fs.readFileSync('docs/research/rea/instagram_profile_dom.html', 'utf8');

// Title
const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
console.log('--- Profile Page Title ---');
console.log(title);

// Meta description
const metaDesc = (html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) || [])[1];
console.log('--- Meta Description ---');
console.log(metaDesc);

// Headings
const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('--- Headings ---');
console.log(headings);

// Sections & Navigation tabs
const links = [];
const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
while ((match = linkRegex.exec(html)) !== null) {
  const text = match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  if (text.length > 0 && text.length < 50) {
    links.push({ href: match[1], text });
  }
}
console.log('\n--- Relevant Profile Links/Tabs ---');
links.forEach((l) => console.log(`  "${l.text}" -> ${l.href}`));

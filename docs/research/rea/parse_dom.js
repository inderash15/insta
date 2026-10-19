import fs from 'fs';

const html = fs.readFileSync('docs/research/rea/instagram_landing_dom.html', 'utf8');

// Title
const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
console.log('--- Page Title ---');
console.log(title);

// Forms & Inputs
console.log('\n--- Inputs ---');
const inputs = [...html.matchAll(/<input[^>]+>/gi)].map(m => m[0]);
inputs.forEach((inp, i) => console.log(`Input ${i}:`, inp));

// Links
console.log('\n--- Links ---');
const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const links = [];
let match;
while ((match = linkRegex.exec(html)) !== null) {
  const text = match[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  links.push({ href: match[1], text });
}
console.log(`Found ${links.length} links:`);
links.slice(0, 35).forEach((l, i) => {
  if (l.text || l.href.startsWith('http') || l.href.startsWith('/')) {
    console.log(`  [${i}] "${l.text}" -> ${l.href}`);
  }
});

// Text elements / Headers
console.log('\n--- Text / Headings ---');
const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Headings:', headings);

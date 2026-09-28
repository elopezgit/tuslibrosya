import * as fs from 'fs';

const books: any[] = JSON.parse(fs.readFileSync('all_books_extracted.json', 'utf8'));

console.log(`Total books: ${books.length}`);
const uniqueTitles = new Set();
books.forEach(b => {
  uniqueTitles.add(b.name);
  console.log(`- Title: "${b.name}" | Author: "${b.author}" | Cat: "${b.category}"`);
});
console.log(`Unique titles: ${uniqueTitles.size}`);

const titles = ["Abraza tu destino", "Charlas de diván", "De Dios para mí", "Eterno", "Las claves del dinero", "Riqueza", "Todo lo que sea Rolón"];
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (const title of titles) {
  console.log("\n\n########## " + title + " ##########");
  // Google Books simple
  try {
    const g = await fetch("https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(title) + "&maxResults=5");
    const gj = await g.json();
    console.log("Google Books total:", gj.totalItems ?? "?");
    for (const it of (gj.items || []).slice(0, 5)) {
      const v = it.volumeInfo || {};
      const ids = (v.industryIdentifiers || []).map(x => x.identifier).join(", ");
      console.log(`  - ${v.title}${v.subtitle ? ": " + v.subtitle : ""} | ${(v.authors || []).join(" / ") || "-"} | ${v.publisher || "-"} | ${v.publishedDate || "-"} | ${v.pageCount || "-"} p | ${ids || "-"}`);
    }
  } catch (e) { console.log("Google ERROR:", e.message); }
  await sleep(300);

  // Open Library
  try {
    const o = await fetch("https://openlibrary.org/search.json?title=" + encodeURIComponent(title) + "&limit=8&fields=title,author_name,first_publish_year,publisher,isbn,number_of_pages_median,language");
    const oj = await o.json();
    console.log("Open Library numFound:", oj.numFound ?? "?");
    for (const d of (oj.docs || []).slice(0, 8)) {
      console.log(`  - ${d.title} | ${(d.author_name || []).join(" / ") || "-"} | ${(d.publisher || []).slice(0,2).join(" / ") || "-"} | ${d.first_publish_year || "-"} | ${d.number_of_pages_median || "-"} p | ${(d.isbn || []).slice(0,2).join(", ") || "-"}`);
    }
  } catch (e) { console.log("OpenLibrary ERROR:", e.message); }
  await sleep(300);
}

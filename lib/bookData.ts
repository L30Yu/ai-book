"use server";

import * as cheerio from "cheerio";

const formatBookData = (bookInfo: any) => {
  return {
    author: bookInfo["Author"] || "",
    title: bookInfo["Title"] || "",
    originalPublication: bookInfo["Original Publication"] || undefined,
    credits: bookInfo["Credits"] || undefined,
    language: bookInfo["Language"] || undefined,
    category: bookInfo["Category"] || undefined,
    eBookNo: bookInfo["EBook-No."] || undefined,
    releaseDate: bookInfo["Release Date"] || undefined,
    copyrightStatus: bookInfo["Copyright Status"] || undefined,
    downloads: bookInfo["Downloads"] || undefined,
    note: bookInfo["Note"] || undefined,
  };
};

const getDataFromHtml = (metadataHtml: string) => {
  const $ = cheerio.load(metadataHtml);
  const metadataValue = {} as any;
  $("table.bibrec tr").each((index, row) => {
    const $row = $(row);
    const $th = $row.find("th");
    const $td = $row.find("td");

    // If there's a header cell in the row
    if ($th.length > 0) {
      const field = $th.text().trim();

      // For the last row, which has a colspan of 2
      if ($td.attr("colspan") === "2") {
        metadataValue[field || "Note"] = $td.text().trim();
      } else if ($td.length > 0) {
        // Extract text, handling links
        let value = $td.text().trim();

        // For the author field, get the name without the years
        if (field === "Author") {
          const authorName = $td.find("a").text().trim();
          value = authorName;
        }

        metadataValue[field] = value;
      }
    }
  });
  return formatBookData(metadataValue);
};

export const fetchBookContent = async (bookId: string) => {
  const contentUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
  const metadataUrl = `https://www.gutenberg.org/ebooks/${bookId}`;

  const contentResponse = await fetch(contentUrl);
  if (contentResponse.status < 300) {
    const content = await contentResponse.text();

    const metadataResponse = await fetch(metadataUrl);
    const metadataHtml = await metadataResponse.text();
    const metadataValue = getDataFromHtml(metadataHtml);

    return { content, ...metadataValue };
  } else {
    return null;
  }
};

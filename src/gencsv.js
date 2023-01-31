const fs = require('fs');
const path = require('path');

const extractTitleAuthor = (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const titleRegex = /<div class="ct"><b>(.+?)<\/b><\/div>/;
  const authorRegex = /<div class="au"><b>(.+?)<\/b><\/div>/;
  const titleMatch = content.match(titleRegex);
  const authorMatch = content.match(authorRegex);

  let title = titleMatch ? titleMatch[1].trim() : '';
  let author = authorMatch ? authorMatch[1].trim() : '';

  // escape commas in the title and author
  title = title.replace(/,/g, '/,');
  author = author.replace(/,/g, '/,');

  return { title, author };
};

// Get the list of XHTML files in the current directory
const xhtmlFiles = fs.readdirSync(process.cwd()).filter((file) => path.extname(file) === '.xhtml');

// Create an array of objects that contain the title, newTitle, author, and newAuthor
const data = xhtmlFiles.map((file) => {
  const { title, author } = extractTitleAuthor(file);
  return {
    title,
    newTitle: title.toLowerCase().replace(/(^\w|[.!?]\s*\w)/g, (match) => match.toUpperCase()),
    author,
    newAuthor: author.toLowerCase().replace(/(^\w|-\s*\w)/g, (match) => match.toUpperCase()),
  };
});

// Write the data to a CSV file
const header = 'title,newTitle,author,newAuthor\n';
const csvData = data.map(({ title, newTitle, author, newAuthor }) => `${title},${newTitle},${author},${newAuthor}`).join('\n');
fs.writeFileSync('data.csv', header + csvData);

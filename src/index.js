const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { spawn } = require('child_process');

const extractTitleAuthor = (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const titleRegex = /<div class="ct"><b>(.+?)<\/b><\/div>/;
  const authorRegex = /<div class="au"><b>(.+?)<\/b><\/div>/;
  const titleMatch = content.match(titleRegex);
  const authorMatch = content.match(authorRegex);

  let title = titleMatch ? titleMatch[1].trim() : '';
  let author = authorMatch ? authorMatch[1].trim() : '';

  return { title, author };
};

// Get the list of XHTML files in the current directory
const xhtmlFiles = fs.readdirSync(process.cwd()).filter((file) => path.extname(file) === '.xhtml');

// Create an array of objects that contain the title, newTitle, author, and newAuthor
const data = {};

const alterXHTML = (file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const titleRegex = /<div class="ct"><b>.+?<\/b><\/div>/;
  const authorRegex = /<div class="au"><b>.+?<\/b><\/div>/;
  const alteredContent = content.replace(titleRegex, '').replace(authorRegex, '');
  const alteredFilename = file.replace('.xhtml', '.alt.xhtml');
  fs.writeFileSync(alteredFilename, alteredContent);
  return alteredFilename;
};

fs.createReadStream('data.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    data[row.title] = row;
  })
  .on('end', () => {
    xhtmlFiles.forEach((file) => {
      const { title, author } = extractTitleAuthor(file);
      const { newTitle, newAuthor } = data[title];
      
      console.log(`Converting "${file}" to "${newTitle} - ${newAuthor}.pdf"...`);
      const pandoc = spawn('pandoc', ['-s', alterXHTML(file), '-o', newTitle + ' - ' + newAuthor + '.pdf', '--metadata', `title=${newTitle}`, '--metadata', `author=${newAuthor}`]);

      pandoc.stderr.on('data', (data) => {
        console.error(`pandoc stderr: ${data}`);
      });

      pandoc.on('close', (code) => {
        console.log(`pandoc process exited with code ${code} for file ${file}`);
      });
    });
  });

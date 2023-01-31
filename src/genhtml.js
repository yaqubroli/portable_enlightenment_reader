const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { spawn } = require("child_process");

let tableRows = "";

fs.createReadStream("data.csv")
  .pipe(csv({ separator: ";" }))
  .on("data", (row) => {
    const { newAuthor, newTitle } = row;
    const pdfFile = `${newTitle} - ${newAuthor}.pdf`;
    tableRows += `<tr><td>${newAuthor}</td><td>${newTitle}</td><td><a href="${pdfFile}">Download</a></td></tr>`;
  })
  .on("end", () => {
    const html = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Author</th>
                <th>Title</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    fs.writeFileSync("table.html", html, "utf-8");
  });

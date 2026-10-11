const csv = require('csv-parser');
const { Readable } = require('stream');

function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

module.exports = { parseCSVBuffer };

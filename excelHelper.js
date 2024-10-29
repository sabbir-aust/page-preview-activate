const XLSX = require('xlsx');

function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Contents'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Read data as an array of arrays

  return data;
}

function writeExcel(filePath, data) {
  const newSheet = XLSX.utils.aoa_to_sheet(data); // Convert array of arrays back to sheet
  const workbook = XLSX.utils.book_new(); // Create a new workbook
  XLSX.utils.book_append_sheet(workbook, newSheet, 'Contents'); // Append the new sheet
  XLSX.writeFile(workbook, filePath); // Write to the file
}

// Update only the row that matches the content path
function updateStatus(filePath, contentPath, status) {
  const data = readExcel(filePath);

  // Find the row with the matching content path
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === contentPath) {
      // Update the status in the second column
      data[i][1] = status;
      break;
    }
  }

  // Write the updated data back to the Excel file
  writeExcel(filePath, data);
}

module.exports = { readExcel, writeExcel, updateStatus };

const { GoogleSpreadsheet } = require('google-spreadsheet');
const Week = require('../models/Week');

async function writeToSheet(sheet, data, headers, startIndex) {
  // Carga solo las celdas que vamos a actualizar
  const numRowsToLoad = data.length + 1; // +1 para los encabezados
  await sheet.loadCells({
    startRowIndex: startIndex,
    endRowIndex: startIndex + numRowsToLoad,
    startColumnIndex: 0,
    endColumnIndex: headers.length,
  });

  // Establece en undefined las celdas con datos existentes antes de escribir nuevos datos
  for (let rowIndex = 0; rowIndex < numRowsToLoad; rowIndex++) {
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const cell = sheet.getCell(startIndex + rowIndex, colIndex);
      cell.value = undefined;
    }
  }

  await sheet.saveUpdatedCells(); // Guarde las celdas que acabamos de vaciar.
  
  // Ahora, llenemos las celdas con los nuevos datos
  headers.forEach(async (header, index) => {
    const cell = sheet.getCell(startIndex, index);
    cell.value = header;
  });

  await sheet.saveUpdatedCells(); // Guarde las celdas que acabamos de llenar con los encabezados.

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    for (let colIndex = 0; colIndex < headers.length; colIndex++) {
      const cell = sheet.getCell(startIndex + rowIndex + 1, colIndex);
      cell.value = data[rowIndex][headers[colIndex]];
    }
  }

  await sheet.saveUpdatedCells(); // Guarde las celdas que acabamos de llenar con los datos.
}

async function backupDataToGoogleSheets(weekId, callsData, paymentsData) {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();

  const week = await Week.findByPk(weekId);
  if (!week) {
      throw new Error(`No se pudo encontrar ninguna semana con el id: ${weekId}`);
  }
  const sheetTitle = `${week.anio}${week.mes}[${week.semana}]`;

  let sheet;
  
  if(doc.sheetsByTitle[sheetTitle]) {
    sheet = doc.sheetsByTitle[sheetTitle]; 
  } else {
    sheet = await doc.addSheet({ title: sheetTitle }); 
  }

  const callsHeaders = Object.keys(callsData[0]);
  const paymentsHeaders = Object.keys(paymentsData[0]);

  const gap = 5; 

  await writeToSheet(sheet, callsData, callsHeaders, 1);

  await writeToSheet(sheet, paymentsData, paymentsHeaders, callsData.length + gap + 1);
}

module.exports = {
  backupDataToGoogleSheets
};

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const reviews = [];
  for (let i = 1; i < data.length; i++) {
    reviews.push({
      name: data[i][0],
      review: data[i][1],
      date: data[i][2],
    });
  }
  return ContentService.createTextOutput(JSON.stringify(reviews)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const params = JSON.parse(e.postData.contents);
  sheet.appendRow([params.name, params.review, params.date]);
  return ContentService.createTextOutput(
    JSON.stringify({ result: 'success' })
  ).setMimeType(ContentService.MimeType.JSON);
}

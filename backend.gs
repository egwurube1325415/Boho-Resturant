// ==========================================
// Google Apps Script Backend for BOHO Resturant
//
// This script provides all API endpoints for:
// - Items management
// - Posts management
// - Reviews management
//
// Database: Google Sheets (see SETUP.md for sheet structure)
// ==========================================

const SPREADSHEET_ID = '1oOMsQFUxHRlpKdvAEPqLqoCUYh8y6DOaSjMk6ggmVxU'; // Update this with your Sheet ID

// ==========================================
// Helper: Get Sheets by Name
// ==========================================
function getSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);

    // Auto-create Reservations sheet on first use
    if (!sheet && sheetName === 'Reservations') {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Phone',
        'Date',
        'Time',
        'Party Size',
      ]);
    }

    if (!sheet) {
      throw new Error(
        `Sheet "${sheetName}" not found. Make sure you have sheets named: Items, Posts, Reviews, Reservations`,
      );
    }
    return sheet;
  } catch (error) {
    Logger.log('Error getting sheet: ' + error.message);
    throw error;
  }
}

// ==========================================
// Helper: Convert Row to Object
// ==========================================
function rowToObject(headers, values) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = values[index] || '';
  });
  return obj;
}

// ==========================================
// Helper: Generate Unique ID
// ==========================================
function generateId() {
  return Utilities.getUuid();
}

// ==========================================
// Helper: Format Response
// ==========================================
function formatResponse(success, data, message = '') {
  return {
    success: success,
    data: data,
    message: message,
  };
}

// ==========================================
// Main Endpoint Handler
// ==========================================
function doPost(e) {
  try {
    let payload;
    let action;

    // Try JSON body first (for existing API calls),
    // fall back to form parameters (for reservation form submission).
    try {
      payload = JSON.parse(e.postData.contents);
      action = payload.action;
    } catch (err) {
      payload = e.parameter || {};
      action = payload.action;
    }

    Logger.log('Action: ' + action);
    Logger.log('Payload: ' + JSON.stringify(payload));

    let response;

    switch (action) {
      // Items endpoints
      case 'getItems':
        response = getItems();
        break;
      case 'createItem':
        response = createItem(payload);
        break;
      case 'updateItem':
        response = updateItem(payload);
        break;
      case 'deleteItem':
        response = deleteItem(payload);
        break;

      // Posts endpoints
      case 'getPosts':
        response = getPosts();
        break;
      case 'createPost':
        response = createPost(payload);
        break;
      case 'deletePost':
        response = deletePost(payload);
        break;

      // Reviews endpoints
      case 'getReviews':
        response = getReviews(payload);
        break;
      case 'createReview':
        response = createReview(payload);
        break;
      case 'deleteReview':
        response = deleteReview(payload);
        break;

      // Reservation endpoint
      case 'reservationRequest':
        response = handleReservationRequest(payload);
        break;
      default:
        response = formatResponse(false, null, 'Unknown action: ' + action);
    }

    Logger.log('Response: ' + JSON.stringify(response));
    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    const response = formatResponse(false, null, 'Error: ' + error.message);
    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// Reservation Email Handler
// ==========================================
function handleReservationRequest(reservation) {
  try {
    var email = 'marketing.bohorestaurant@gmail.com'; // Receiving email
    var subject = 'New Reservation Request – ' + (reservation.name || 'Guest');

    var textBody =
      'New reservation request received:\n' +
      'Name: ' +
      (reservation.name || '') +
      '\n' +
      'Phone: ' +
      (reservation.phone || '') +
      '\n' +
      'Date: ' +
      (reservation.date || '') +
      '\n' +
      'Time: ' +
      (reservation.time || '') +
      '\n' +
      'Party Size: ' +
      (reservation.party || '') +
      '\n' +
      '\nSent from BOHO Restaurant website.';

    var htmlBody =
      '<div style="font-family:Arial,Helvetica,sans-serif; padding:16px; background:#f6f6f6;">' +
      '  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.08);overflow:hidden;">' +
      '    <div style="background:#b48a4a;color:#ffffff;padding:16px 20px;font-size:18px;font-weight:bold;">' +
      '      BOHO Restaurant – New Reservation Request' +
      '    </div>' +
      '    <div style="padding:20px;font-size:14px;color:#333333;">' +
      '      <p style="margin:0 0 12px;">You have received a new reservation request from your website:</p>' +
      '      <table style="width:100%;border-collapse:collapse;font-size:14px;">' +
      '        <tr><td style="padding:6px 0;font-weight:bold;width:120px;">Name</td><td style="padding:6px 0;">' +
      (reservation.name || '') +
      '</td></tr>' +
      '        <tr><td style="padding:6px 0;font-weight:bold;">Phone</td><td style="padding:6px 0;">' +
      (reservation.phone || '') +
      '</td></tr>' +
      '        <tr><td style="padding:6px 0;font-weight:bold;">Date</td><td style="padding:6px 0;">' +
      (reservation.date || '') +
      '</td></tr>' +
      '        <tr><td style="padding:6px 0;font-weight:bold;">Time</td><td style="padding:6px 0;">' +
      (reservation.time || '') +
      '</td></tr>' +
      '        <tr><td style="padding:6px 0;font-weight:bold;">Party Size</td><td style="padding:6px 0;">' +
      (reservation.party || '') +
      '</td></tr>' +
      '      </table>' +
      '      <p style="margin:16px 0 0;font-size:12px;color:#777777;">Sent from BOHO Restaurant website.</p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    // Send nicely formatted email
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: 'BOHO Restaurant Reservations',
    });

    // Append to Reservations sheet
    var sheet = getSheet('Reservations');
    var newRow = [
      new Date(), // Timestamp
      reservation.name || '',
      reservation.phone || '',
      reservation.date || '',
      reservation.time || '',
      reservation.party || '',
    ];
    sheet.appendRow(newRow);

    return formatResponse(true, {}, 'Reservation email sent and recorded');
  } catch (error) {
    Logger.log('Reservation email error: ' + error.message);
    return formatResponse(
      false,
      null,
      'Failed to send reservation email: ' + error.message,
    );
  }
}

// ==========================================
// Items Functions
// ==========================================
function getItems() {
  const sheet = getSheet('Items');
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return formatResponse(true, []);
  }

  const headers = data[0];
  const items = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      // Check if ID exists
      items.push(rowToObject(headers, data[i]));
    }
  }

  Logger.log('Found ' + items.length + ' items');
  return formatResponse(true, items);
}

function createItem(payload) {
  const sheet = getSheet('Items');

  const newRow = [
    generateId(),
    payload.name || '',
    payload.category || 'others',
    payload.price || 0,
    payload.image || '',
    'draft',
    new Date().toISOString(),
    new Date().toISOString(),
  ];

  sheet.appendRow(newRow);

  return formatResponse(true, { id: newRow[0] }, 'Item created successfully');
}

function updateItem(payload) {
  const sheet = getSheet('Items');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      if (payload.name) data[i][1] = payload.name;
      if (payload.category) data[i][2] = payload.category;
      if (payload.price) data[i][3] = payload.price;
      if (payload.image) data[i][4] = payload.image;
      data[i][7] = new Date().toISOString();

      sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      return formatResponse(true, {}, 'Item updated successfully');
    }
  }

  return formatResponse(false, null, 'Item not found');
}

function deleteItem(payload) {
  const sheet = getSheet('Items');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      sheet.deleteRow(i + 1);

      // Also delete related reviews
      deleteReviewsByItemId(payload.id);

      return formatResponse(true, {}, 'Item deleted successfully');
    }
  }

  return formatResponse(false, null, 'Item not found');
}

// ==========================================
// Posts Functions
// ==========================================
function getPosts() {
  const sheet = getSheet('Posts');
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return formatResponse(true, []);
  }

  const headers = data[0];
  const posts = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      // Check if ID exists
      posts.push(rowToObject(headers, data[i]));
    }
  }

  Logger.log('Found ' + posts.length + ' posts');
  return formatResponse(true, posts);
}

function createPost(payload) {
  const sheet = getSheet('Posts');

  const newRow = [
    generateId(),
    payload.name || 'Anonymous',
    payload.body || '',
    payload.image || '',
    new Date().toISOString(),
    new Date().toISOString(),
  ];

  sheet.appendRow(newRow);

  return formatResponse(true, { id: newRow[0] }, 'Post created successfully');
}

function deletePost(payload) {
  const sheet = getSheet('Posts');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      sheet.deleteRow(i + 1);
      return formatResponse(true, {}, 'Post deleted successfully');
    }
  }

  return formatResponse(false, null, 'Post not found');
}

// ==========================================
// Reviews Functions
// ==========================================
function getReviews(payload) {
  const sheet = getSheet('Reviews');
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return formatResponse(true, []);
  }

  const headers = data[0];
  const reviews = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1] === payload.itemId) {
      reviews.push(rowToObject(headers, data[i]));
    }
  }

  Logger.log('Found ' + reviews.length + ' reviews for item ' + payload.itemId);
  return formatResponse(true, reviews);
}

function createReview(payload) {
  const sheet = getSheet('Reviews');

  const newRow = [
    generateId(),
    payload.itemId || '',
    payload.name || '',
    payload.body || '',
    payload.like_count || 0,
    new Date().toISOString(),
    new Date().toISOString(),
  ];

  sheet.appendRow(newRow);

  return formatResponse(true, { id: newRow[0] }, 'Review created successfully');
}

function deleteReview(payload) {
  const sheet = getSheet('Reviews');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      sheet.deleteRow(i + 1);
      return formatResponse(true, {}, 'Review deleted successfully');
    }
  }

  return formatResponse(false, null, 'Review not found');
}

function deleteReviewsByItemId(itemId) {
  const sheet = getSheet('Reviews');
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === itemId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ==========================================
// Test Function (for debugging)
// ==========================================
function testGetItems() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        action: 'getItems',
      }),
    },
  });
  Logger.log('Test result: ' + result.getContent());
}

// Allow GET requests for read-only actions to avoid CORS preflight from browsers.
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action;

    Logger.log('GET Action: ' + action);

    let response;

    switch (action) {
      case 'getItems':
        response = getItems();
        break;
      case 'getPosts':
        response = getPosts();
        break;
      case 'getReviews':
        // expect itemId param
        response = getReviews({ itemId: params.itemId });
        break;
      default:
        response = formatResponse(false, null, 'Unknown action: ' + action);
    }

    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error (GET): ' + error.message);
    const response = formatResponse(false, null, 'Error: ' + error.message);
    return ContentService.createTextOutput(
      JSON.stringify(response),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

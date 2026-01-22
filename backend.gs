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

    // Auto-create Reservations, Contacts, and GoogleReviews sheets on first use
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
    } else if (!sheet && sheetName === 'Contacts') {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Message']);
    } else if (!sheet && sheetName === 'GoogleReviews') {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Name', 'Review', 'Date', 'Rating']);
    } else if (sheet && sheetName === 'GoogleReviews') {
      // Ensure the sheet has the Rating column
      const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
      if (headers.length < 4 || headers[3] !== 'Rating') {
        sheet.insertColumnAfter(3);
        sheet.getRange(1, 4).setValue('Rating');
      }
    }

    if (!sheet) {
      throw new Error(
        `Sheet "${sheetName}" not found. Make sure you have sheets named: Items, Posts, Reviews, Reservations, Contacts, GoogleReviews`,
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

      // Contact endpoint
      case 'contactRequest':
        response = handleContactRequest(payload);
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
// Contact Email Handler
// ==========================================
function handleContactRequest(contact) {
  try {
    var email = 'marketing.bohorestaurant@gmail.com'; // Receiving email
    var subject = 'New Contact Message – ' + (contact.name || 'Guest');

    var textBody =
      'New contact message received:\n' +
      'Name: ' +
      (contact.name || '') +
      '\n' +
      'Email: ' +
      (contact.email || '') +
      '\n' +
      'Message:\n' +
      (contact.message || '') +
      '\n' +
      '\nSent from BOHO Restaurant website.';

    var htmlBody =
      '<div style="font-family:Arial,Helvetica,sans-serif; padding:16px; background:#f6f6f6;">' +
      '  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.08);overflow:hidden;">' +
      '    <div style="background:#b48a4a;color:#ffffff;padding:16px 20px;font-size:18px;font-weight:bold;">' +
      '      BOHO Restaurant – New Contact Message' +
      '    </div>' +
      '    <div style="padding:20px;font-size:14px;color:#333333;">' +
      '      <p style="margin:0 0 12px;">You have received a new message from your website contact form:</p>' +
      '      <table style="width:100%;border-collapse:collapse;font-size:14px;">' +
      '        <tr><td style="padding:6px 0;font-weight:bold;width:120px;">Name</td><td style="padding:6px 0;">' +
      (contact.name || '') +
      '</td></tr>' +
      '        <tr><td style="padding:6px 0;font-weight:bold;">Email</td><td style="padding:6px 0;">' +
      (contact.email || '') +
      '</td></tr>' +
      '      </table>' +
      '      <p style="margin:16px 0 4px;font-weight:bold;">Message</p>' +
      '      <p style="margin:0;white-space:pre-line;">' +
      (contact.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
      '</p>' +
      '      <p style="margin:16px 0 0;font-size:12px;color:#777777;">Sent from BOHO Restaurant website.</p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      body: textBody,
      name: 'BOHO Restaurant Contact',
    });

    // Append to Contacts sheet
    var sheet = getSheet('Contacts');
    var newRow = [
      new Date(),
      contact.name || '',
      contact.email || '',
      contact.message || '',
    ];
    sheet.appendRow(newRow);

    return formatResponse(true, {}, 'Contact message sent and recorded');
  } catch (error) {
    Logger.log('Contact email error: ' + error.message);
    return formatResponse(
      false,
      null,
      'Failed to send contact email: ' + error.message,
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
      case 'getGoogleReviews':
        response = getGoogleReviews();
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

// ==========================================
// Google Reviews (Sheet-backed)
// ==========================================
function getGoogleReviews() {
  // Try to sync latest reviews from Gmail before reading the sheet.
  try {
    syncGoogleReviewsFromEmail();
  } catch (syncError) {
    Logger.log('syncGoogleReviewsFromEmail error: ' + syncError.message);
  }

  const sheet = getSheet('GoogleReviews');
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return formatResponse(true, []);
  }

  const reviews = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; // skip empty rows
    reviews.push({
      name: data[i][0],
      review: data[i][1],
      date: data[i][2],
      rating: data[i][3] || '',
    });
  }

  return formatResponse(true, reviews);
}

// ==========================================
// Sync Google review notification emails -> GoogleReviews sheet
// ==========================================
function syncGoogleReviewsFromEmail() {
  // Adjusted query: match all review notification emails from Google Business Profile in the last 365 days.
  const query = 'from:businessprofile-noreply@google.com newer_than:365d';

  const threads = GmailApp.search(query, 0, 50); // Limit to latest 50 threads for safety
  Logger.log('syncGoogleReviewsFromEmail search query: ' + query);
  Logger.log(
    'syncGoogleReviewsFromEmail found threads: ' +
      (threads ? threads.length : 0),
  );
  if (!threads || threads.length === 0) return 0;

  const sheet = getSheet('GoogleReviews');
  const data = sheet.getDataRange().getValues();
  // Stronger normalization: remove accents, lowercase, trim, collapse whitespace
  function normalize(val) {
    if (!val) return '';
    return val
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }
  // Normalize any date string to ISO yyyy-mm-dd
  function normalizeDateToISO(val) {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
      return val.trim();
    }
    // Try to parse as Date
    let d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return normalize(val); // fallback
  }
  const existingKeys = new Set();
  for (let i = 1; i < data.length; i++) {
    const normName = normalize(data[i][0]);
    const normReview = normalize(data[i][1]);
    const normDate = normalizeDateToISO(data[i][2]);
    const key = [normName, normReview, normDate].join('||');
    existingKeys.add(key);
  }

  let added = 0;

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    if (!messages || messages.length === 0) return;

    const msg = messages[messages.length - 1]; // latest message in the thread
    const subject = msg.getSubject() || '';
    const body = msg.getPlainBody() || '';
    const date = msg.getDate();

    Logger.log('Processing review email with subject: ' + subject);

    // Extract reviewer name from subject: only allow simple person names
    let name = '';
    let reviewSubjectPatterns = [
      ' wrote a review for',
      ' wrote a review of',
      ' wrote a review',
      ' đã viết bài đánh giá về', // Vietnamese pattern
    ];
    for (let i = 0; i < reviewSubjectPatterns.length; i++) {
      const marker = reviewSubjectPatterns[i];
      const idx = subject.indexOf(marker);
      if (idx > 0) {
        name = subject.substring(0, idx).trim();
        break;
      }
    }
    // If not matched, fallback to empty (not a person)
    if (!name) {
      name = '';
    }

    // Filter out system notifications and photo updates
    // Exclude if subject starts with "BOHO Restaurant" or "Những ảnh mới" or "Bạn hiện là người quản lý" or "Kathy Nguyen đã mời bạn quản lý"
    const systemPatterns = [
      /^BOHO Restaurant/i,
      /^Những ảnh mới/i,
      /^Bạn hiện là người quản lý/i,
      /^Kathy Nguyen đã mời bạn quản lý/i,
    ];
    let isSystem = systemPatterns.some((pat) => pat.test(subject));
    if (isSystem || !name) {
      Logger.log('Skipping non-person review: ' + subject);
      return;
    }

    let reviewText = extractReviewTextFromBody(body);
    // Clean review text: remove URLs and system phrases
    function cleanReviewText(text) {
      if (!text) return '';
      // Remove URLs
      text = text.replace(/https?:\/\/[^\s]+/g, '');
      // Remove system phrases
      const systemPhrases = [
        'Đọc bài đánh giá',
        'Trả lời bài đánh giá',
        'Người dùng này chỉ để lại điểm xếp hạng',
        'Bạn đã nhận được 1 bài đánh giá 5 sao mới',
        'Thật tuyệt vời!',
        'View and reply',
        'See your reviews',
        'Manage your reviews',
      ];
      systemPhrases.forEach(function (phrase) {
        text = text.replace(new RegExp(phrase, 'gi'), '');
      });
      // Remove extra whitespace
      text = text.replace(/\s+/g, ' ').trim();
      return text;
    }
    reviewText = cleanReviewText(reviewText);
    const isoDate = date ? date.toISOString().slice(0, 10) : '';
    // Extract star rating
    const rating = extractStarRatingFromBody(body);
    // If review text is missing or too short, generate a friendly summary
    if (!reviewText || reviewText.length < 8) {
      if (name && rating) {
        reviewText = `${name} loves Boho and gives it a ${rating} star${rating === '1' ? '' : 's'}`;
      } else if (name) {
        reviewText = `${name} left a rating for Boho.`;
      } else {
        reviewText = `A guest left a rating for Boho.`;
      }
    }

    // Stronger normalization: remove accents, lowercase, trim, collapse whitespace
    function normalize(val) {
      if (!val) return '';
      return val
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
    }
    const normName = normalize(name);
    const normReviewText = normalize(reviewText);
    const normIsoDate = normalizeDateToISO(isoDate);
    const key = [normName, normReviewText, normIsoDate].join('||');
    Logger.log('Checking for duplicate: ' + key);
    Logger.log('Existing keys: ' + JSON.stringify(Array.from(existingKeys)));
    if (existingKeys.has(key)) {
      Logger.log('Skipping duplicate review: ' + key);
      return; // skip duplicates
    }

    // Double-check for duplicates in the sheet (in case of race conditions or manual edits)
    const allRows = sheet.getDataRange().getValues();
    let isDuplicate = false;
    for (let i = 1; i < allRows.length; i++) {
      const rowName = normalize(allRows[i][0]);
      const rowReview = normalize(allRows[i][1]);
      const rowDate = normalizeDateToISO(allRows[i][2]);
      const rowKey = [rowName, rowReview, rowDate].join('||');
      Logger.log('Comparing to rowKey: ' + rowKey);
      if (
        rowName === normName &&
        rowReview === normReviewText &&
        rowDate === normIsoDate
      ) {
        isDuplicate = true;
        break;
      }
    }
    if (isDuplicate) {
      Logger.log('Sheet already contains duplicate review: ' + key);
      existingKeys.add(key);
      return;
    }

    sheet.appendRow([
      name,
      reviewText,
      isoDate,
      rating !== undefined && rating !== null ? String(rating) : '',
    ]);
    existingKeys.add(key);
    added++;
  });

  // Helper: extract star rating from the email body
  function extractStarRatingFromBody(body) {
    if (!body) return '';
    // English patterns
    var match = body.match(/(\d)[-–]star rating/);
    if (match && match[1]) {
      return match[1];
    }
    var match2 = body.match(/(\d) stars/);
    if (match2 && match2[1]) {
      return match2[1];
    }
    // Vietnamese patterns
    var match3 = body.match(/(\d) sao/); // e.g., "5 sao"
    if (match3 && match3[1]) {
      return match3[1];
    }
    var match4 = body.match(/đánh giá (\d) sao/); // e.g., "đánh giá 5 sao"
    if (match4 && match4[1]) {
      return match4[1];
    }
    // Fallback: look for unicode stars (★)
    var starLine = body.split('\n').find(function (line) {
      return /★/.test(line);
    });
    if (starLine) {
      var count = (starLine.match(/★/g) || []).length;
      if (count > 0) return String(count);
    }
    return '';
  }

  Logger.log('syncGoogleReviewsFromEmail added ' + added + ' new reviews');
  return added;
}

// Helper: extract a readable review snippet from the email body
function extractReviewTextFromBody(body) {
  if (!body) return '';

  // 1) Vietnamese/translated emails: look for "(Translated by Google)" and take text after.
  var translatedMarker = '(Translated by Google)';
  var tIdx = body.indexOf(translatedMarker);
  if (tIdx !== -1) {
    var tSnippet = body.substring(tIdx + translatedMarker.length).trim();

    var tEndMarkers = [
      'Trả lời bài đánh giá',
      'Xem tất cả các bài đánh giá',
      'View and reply',
      'See your reviews',
      'Manage your reviews',
    ];
    var tEnd = tSnippet.length;
    tEndMarkers.forEach(function (m) {
      var p = tSnippet.indexOf(m);
      if (p !== -1 && p < tEnd) tEnd = p;
    });

    tSnippet = tSnippet.substring(0, tEnd).trim();
    if (tSnippet.length > 800) tSnippet = tSnippet.substring(0, 800) + '…';
    if (tSnippet) return tSnippet;
  }

  // Try to extract after a common phrase in Google review emails.
  var marker = "Here's what they wrote:";
  var idx = body.indexOf(marker);
  if (idx !== -1) {
    var snippet = body.substring(idx + marker.length).trim();

    // Stop at common footer phrases if present.
    var endMarkers = [
      'View and reply',
      'See your reviews',
      'Manage your reviews',
    ];
    var end = snippet.length;
    endMarkers.forEach(function (m) {
      var p = snippet.indexOf(m);
      if (p !== -1 && p < end) end = p;
    });

    snippet = snippet.substring(0, end).trim();
    // Limit length to keep it tidy.
    if (snippet.length > 800) {
      snippet = snippet.substring(0, 800) + '…';
    }
    return snippet;
  }

  // Fallback: use the first few non-empty lines.
  var lines = body
    .split('\n')
    .map(function (l) {
      return l.trim();
    })
    .filter(function (l) {
      return l;
    });
  if (lines.length === 0) return '';
  var fallback = lines.slice(0, 8).join(' ');
  if (fallback.length > 800) fallback = fallback.substring(0, 800) + '…';
  return fallback;
}

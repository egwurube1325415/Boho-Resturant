# BOHO Resturant - Simplified Version (Vanilla JS + Google Apps Script)

This is a simplified version of BOHO Resturant built with vanilla HTML, JavaScript, and CSS with a Google Apps Script backend.

## Overview

- **Frontend**: Pure HTML, CSS, and JavaScript (no build process needed)
- **Backend**: Google Apps Script (free, serverless)
- **Database**: Google Sheets (free storage)
- **No server maintenance required**

## Project Structure

```
simple/
├── index.html           # Main HTML file
├── style.css           # Styling
├── app.js              # Frontend JavaScript
├── backend.gs          # Google Apps Script backend code
└── SETUP.md            # This file
```

## Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "BOHO_Resturant"
3. Create 3 sheets with these exact names and column headers:

**Sheet 1: Items**

```
id | name | category | price | image | status | created_at | updated_at
```

**Sheet 2: Posts**

```
id | name | body | image | created_at | updated_at
```

**Sheet 3: Reviews**

```
id | item_id | name | body | like_count | created_at | updated_at
```

### Step 2: Add Sample Data (Optional)

In the **Items** sheet, add some sample data:

```
abc123 | Pasta Carbonara | pasta | 12.99 | https://example.com/pasta.jpg | published | 2025-01-01 | 2025-01-01
def456 | Caesar Salad | salads | 8.99 | https://example.com/salad.jpg | published | 2025-01-01 | 2025-01-01
ghi789 | Tiramisu | desserts | 6.99 | https://example.com/tiramisu.jpg | published | 2025-01-01 | 2025-01-01
```

### Step 3: Create Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code
3. Copy the entire contents of `backend.gs` and paste it into the Apps Script editor
4. Replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
   - You can find it in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### Step 4: Save and Deploy

1. Save the Apps Script project (Ctrl+S or Cmd+S)
2. Click **Deploy** (top right)
3. Click **Create new deployment**
4. Choose **Type: Web app**
5. Set **Execute as**: Your Google account
6. Set **Who has access**: Anyone
7. Click **Deploy**
8. Copy the deployment URL (it looks like: `https://script.google.com/macros/d/SCRIPT_ID/usercallable`)

### Step 5: Update Frontend

1. Open `app.js` in the simple folder
2. Find line 8: `const API_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallable'`
3. Replace with your deployment URL from Step 4
4. Save the file

### Step 6: Run the Frontend

You have two options:

**Option A: Using Python (Recommended)**

```bash
cd /Users/petertechbro/Desktop/BOHO_Resturant/simple
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

**Option B: Using Node.js**

```bash
cd /Users/petertechbro/Desktop/BOHO_Resturant/simple
npx http-server
```

**Option C: Direct File Opening**
Simply open `index.html` in your browser (works but may have CORS issues with some features)

## Features

✅ View menu items with images
✅ Filter items by category
✅ View posts from other users
✅ Create new posts
✅ View reviews for each item
✅ Add reviews to items
✅ Responsive design (mobile & desktop)
✅ No build process needed
✅ Free hosting & database

## Troubleshooting

### "API_URL is not configured"

- Make sure you updated `app.js` with your Google Apps Script deployment URL

### Reviews not loading

- Check that the `item_id` in the review matches the `id` in items
- Make sure all sheets are named exactly: Items, Posts, Reviews

### Images not showing

- Use valid image URLs (must be HTTPS)
- Or upload images to Cloudinary and use those URLs

### Sheets not connecting

- Verify spreadsheet ID is correct
- Make sure Apps Script has access to the spreadsheet
- Check that all column headers match exactly

## Deployment Options

### Free Hosting

**Netlify (Recommended)**

1. Push your `simple` folder to GitHub
2. Go to [Netlify](https://netlify.com)
3. Connect your GitHub repo
4. Deploy (it's automatic from git pushes)

**Vercel**

1. Push your `simple` folder to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import project from GitHub
4. Deploy

**Firebase Hosting**

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**GitHub Pages**

1. Push `simple` folder to GitHub
2. Go to repository Settings > Pages
3. Set source to main branch
4. Your site is live at `username.github.io/repo-name/simple`

## Making Changes to Database

### Add More Items

1. Open your Google Sheet
2. Add rows to the Items sheet with proper data
3. Refresh your website - new items appear automatically

### Change Layout/Styling

1. Edit `style.css` (all CSS is here)
2. Refresh your browser

### Change Functionality

1. Edit `app.js` for frontend logic
2. Edit `backend.gs` for server logic
3. If you edit `backend.gs`, redeploy (Extensions > Apps Script > Deploy > Update deployment)

## API Endpoints (Google Apps Script)

**Items:**

- `getItems()` - Get all items
- `createItem(name, category, price, image)` - Add item
- `updateItem(id, ...)` - Update item
- `deleteItem(id)` - Delete item

**Posts:**

- `getPosts()` - Get all posts
- `createPost(name, body, image)` - Add post
- `deletePost(id)` - Delete post

**Reviews:**

- `getReviews(itemId)` - Get reviews for item
- `createReview(itemId, name, body)` - Add review
- `deleteReview(id)` - Delete review

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE 11: ❌ Not supported (uses modern JavaScript)

## Performance Notes

- Google Apps Script has rate limits (30 requests/second)
- First load may take 2-3 seconds (Apps Script cold start)
- Subsequent requests are faster

## Security Notes

- Never put sensitive data in Google Sheets
- Your Google Apps Script URL is public (but secured by Google)
- Consider adding email verification for posts/reviews if needed

## Next Steps

1. Customize colors in `style.css` (change `#A89158` to your brand color)
2. Add admin panel to manage items in the UI instead of editing Sheet manually
3. Add image upload instead of image URLs
4. Add authentication with Google Sign-In
5. Add shopping cart functionality

## Support

For issues:

1. Check the browser console (F12 > Console tab)
2. Check the Apps Script logs (Extensions > Apps Script > Executions)
3. Verify all Google Sheet column names match exactly

Enjoy your simplified BOHO Resturant! 🍽️

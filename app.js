// ==========================================
// Configuration
// ==========================================
// IMPORTANT: Update this URL with your Google Apps Script deployment URL
// It MUST end with /usercallable (NOT /exec)
// Get it from: Google Apps Script > Deploy > Web app > Copy URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzjR2N6HnLgEQoJ9SzAQRllMz2mTwdqjwBldpKpAsJAgck7HVL7ZsNxEFVlkNLxXQ2vkQ/exec/usercallable';

// ==========================================
// Dummy Data (for frontend testing without backend)
// ==========================================
const dummyItems = [
  {
    id: 'item-1',
    name: 'Grilled Snapper',
    category: 'Seafood',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'item-2',
    name: 'Fresh Oysters',
    category: 'Seafood',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1551632786-ad43a14da515?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'item-3',
    name: 'Caesar Salad',
    category: 'Salads',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'item-4',
    name: 'Seafood Platter',
    category: 'Seafood',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'item-5',
    name: 'Tiramisu',
    category: 'Dessert',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'item-6',
    name: 'Pasta Carbonara',
    category: 'Pasta',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1612874742237-415c69b41a11?w=400&h=300&fit=crop',
    status: 'published',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  }
];

const dummyPosts = [
  {
    id: 'post-1',
    name: 'John',
    body: 'Amazing seafood! The grilled snapper was perfectly cooked.',
    image: '',
    created_at: '2025-12-20T10:30:00.000Z',
    updated_at: '2025-12-20T10:30:00.000Z'
  },
  {
    id: 'post-2',
    name: 'Sarah',
    body: 'Best restaurant in Vũng Tàu. Friendly staff and beautiful sea view!',
    image: '',
    created_at: '2025-12-19T15:45:00.000Z',
    updated_at: '2025-12-19T15:45:00.000Z'
  },
  {
    id: 'post-3',
    name: 'Anonymous',
    body: 'Love coming here with family. The fresh oysters are delicious!',
    image: '',
    created_at: '2025-12-18T18:00:00.000Z',
    updated_at: '2025-12-18T18:00:00.000Z'
  }
];

const dummyReviews = {
  'item-1': [
    {
      id: 'review-1',
      item_id: 'item-1',
      name: 'Mike',
      body: 'Perfect grilling and fresh fish. Highly recommend!',
      like_count: 3,
      created_at: '2025-12-18T12:00:00.000Z',
      updated_at: '2025-12-18T12:00:00.000Z'
    }
  ],
  'item-2': [
    {
      id: 'review-2',
      item_id: 'item-2',
      name: 'Lisa',
      body: 'Freshest oysters I\'ve had. Worth every penny!',
      like_count: 5,
      created_at: '2025-12-17T14:30:00.000Z',
      updated_at: '2025-12-17T14:30:00.000Z'
    }
  ]
};

// ==========================================
// State Management
// ==========================================
const state = {
  items: [],
  posts: [],
  reviews: [],
  currentItemId: null,
  selectedCategory: 'all',
  categories: []
};

// ==========================================
// Modal Functions
// ==========================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function setupModalListeners() {
  // Item Modal
  const itemModalClose = document.querySelector('#itemModal .close');
  if (itemModalClose) itemModalClose.addEventListener('click', () => closeModal('itemModal'));
  const newReviewBtn = document.getElementById('newReviewBtn');
  if (newReviewBtn) newReviewBtn.addEventListener('click', () => openModal('reviewModal'));

  // Post Modal
  const postModalClose = document.querySelector('#postModal .close');
  if (postModalClose) postModalClose.addEventListener('click', () => closeModal('postModal'));
  const newPostBtn = document.getElementById('newPostBtn');
  if (newPostBtn) newPostBtn.addEventListener('click', () => openModal('postModal'));

  // Review Modal
  const reviewModalClose = document.querySelector('#reviewModal .close');
  if (reviewModalClose) reviewModalClose.addEventListener('click', () => closeModal('reviewModal'));

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('show');
    }
  });
}

// ==========================================
// API Functions
// ==========================================
async function apiCall(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Unknown error');
    }
    return result.data;
  } catch (error) {
    console.error('API Error:', error);
    alert('Error: ' + error.message);
    throw error;
  }
}

// ==========================================
// API GET helper to avoid preflight for reads
async function apiGet(action, params = {}) {
  try {
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) url.searchParams.set(key, params[key]);
    });

    const response = await fetch(url.toString(), { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Unknown error');
    return result.data;
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
}

// ==========================================
// Items Functions
// ==========================================
async function loadItems() {
  try {
    // Use dummy data instead of API
    state.items = dummyItems;
    
    // Extract unique categories
    const uniqueCategories = [...new Set(state.items.map(item => item.category))];
    state.categories = uniqueCategories;
    
    renderCategories();
    filterAndRenderItems();
  } catch (error) {
    console.error('Failed to load items:', error);
    const container = document.getElementById('itemsContainer');
    if (container) container.innerHTML = '<div class="empty-state"><p>Failed to load items</p></div>';
  }
}

function filterAndRenderItems() {
  let filteredItems = state.items;
  
  if (state.selectedCategory !== 'all') {
    filteredItems = state.items.filter(item => item.category === state.selectedCategory);
  }

  renderItems(filteredItems);
}

function renderCategories() {
  const categoryList = document.getElementById('categoryList');
  
  let html = '<li class="active"><a href="#" data-category="all">All Items</a></li>';
  
  state.categories.forEach(category => {
    html += `<li><a href="#" data-category="${category}">${category}</a></li>`;
  });

  categoryList.innerHTML = html;

  // Add event listeners to category links
  categoryList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      
      // Update active state
      categoryList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      link.parentElement.classList.add('active');
      
      // Filter items
      state.selectedCategory = category;
      filterAndRenderItems();
    });
  });
}

function renderItems(items) {
  const container = document.getElementById('itemsContainer');
  
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No items found</p></div>';
    return;
  }

  let html = '';
  items.forEach(item => {
    const imageUrl = item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E';
    
    html += `
      <div class="item-card" onclick="showItemDetails('${item.id}')">
        <img src="${imageUrl}" alt="${item.name}" class="item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
        <div class="item-info">
          <p class="item-name">${escapeHtml(item.name)}</p>
          <p class="item-price">$${parseFloat(item.price).toFixed(2)}</p>
          <p class="item-category">${item.category}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function showItemDetails(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;

  state.currentItemId = itemId;

  document.getElementById('modalName').textContent = item.name;
  document.getElementById('modalPrice').textContent = `$${parseFloat(item.price).toFixed(2)}`;
  document.getElementById('modalCategory').textContent = `Category: ${item.category}`;
  
  const imageUrl = item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('modalImage').onerror = function() {
    this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E';
  };

  await loadReviews(itemId);
  openModal('itemModal');
}

// ==========================================
// Posts Functions
// ==========================================
async function loadPosts() {
  try {
    // Use dummy data instead of API
    state.posts = dummyPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderPosts();
  } catch (error) {
    console.error('Failed to load posts:', error);
    const container = document.getElementById('postsContainer');
    if (container) container.innerHTML = '<div class="empty-state"><p>Failed to load posts</p></div>';
  }
}

function renderPosts() {
  const container = document.getElementById('postsContainer');
  
  if (state.posts.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to post!</p></div>';
    return;
  }

  let html = '';
  state.posts.forEach(post => {
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const imageHtml = post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onerror="this.style.display='none'">` : '';

    html += `
      <div class="post-card">
        <div class="post-header">
          <span class="post-author">${escapeHtml(post.name || 'Anonymous')}</span>
          <span class="post-date">${date}</span>
        </div>
        <p class="post-body">${escapeHtml(post.body)}</p>
        ${imageHtml}
      </div>
    `;
  });

  container.innerHTML = html;
}

async function createPost(event) {
  event.preventDefault();

  const name = document.getElementById('postName').value || 'Anonymous';
  const body = document.getElementById('postBody').value;
  const image = document.getElementById('postImage').value;

  if (!body.trim()) {
    alert('Please write a message');
    return;
  }

  try {
    await apiCall('createPost', { name, body, image });
    
    // Reset form and close modal
    document.getElementById('postForm').reset();
    closeModal('postModal');
    
    // Reload posts
    await loadPosts();
    alert('Post created successfully!');
  } catch (error) {
    console.error('Failed to create post:', error);
  }
}

// ==========================================
// Reviews Functions
// ==========================================
async function loadReviews(itemId) {
  try {
    // Use dummy data instead of API
    state.reviews = (dummyReviews[itemId] || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderReviews();
  } catch (error) {
    console.error('Failed to load reviews:', error);
    const container = document.getElementById('reviewsContainer');
    if (container) container.innerHTML = '<div class="empty-state"><p>Failed to load reviews</p></div>';
  }
}

function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  
  if (state.reviews.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No reviews yet. Be the first to review!</p></div>';
    return;
  }

  let html = '';
  state.reviews.forEach(review => {
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    html += `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">${escapeHtml(review.name)}</span>
          <span class="review-date">${date}</span>
        </div>
        <p class="review-body">${escapeHtml(review.body)}</p>
        <div class="review-likes">👍 ${review.like_count || 0} likes</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function createReview(event) {
  event.preventDefault();

  if (!state.currentItemId) {
    alert('Please select an item first');
    return;
  }

  const name = document.getElementById('reviewName').value;
  const body = document.getElementById('reviewBody').value;

  if (!name.trim() || !body.trim()) {
    alert('Please fill in all fields');
    return;
  }

  try {
    await apiCall('createReview', {
      itemId: state.currentItemId,
      name,
      body,
      like_count: 0
    });

    // Reset form and close modal
    document.getElementById('reviewForm').reset();
    closeModal('reviewModal');

    // Reload reviews
    await loadReviews(state.currentItemId);
    alert('Review created successfully!');
  } catch (error) {
    console.error('Failed to create review:', error);
  }
}

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// Initialize App
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  setupModalListeners();
  const postForm = document.getElementById('postForm');
  if (postForm) postForm.addEventListener('submit', createPost);

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) reviewForm.addEventListener('submit', createReview);

  // Load initial data only for pages that have the containers
  if (document.getElementById('itemsContainer')) {
    await loadItems();
  }
  if (document.getElementById('postsContainer')) {
    await loadPosts();
  }
});

// Navigation toggle for small screens
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
      }
    });
  }
});

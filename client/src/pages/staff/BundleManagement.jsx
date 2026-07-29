// pages/staff/BundleManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import StaffLayout from '../../components/StaffLayout';
import { collectionAPI, bookAPI, API_BASE } from '../../services/api';
import '../../styles/BundleManagement.css';

// ===== BOOK CATEGORIES CONSTANT =====
const BOOK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Academic',
  'Children',
  'Comics',
  'Mixed'
];

// ===== CRAFT CATEGORIES CONSTANT =====
const CRAFT_CATEGORIES = [
  'Craft: Paper Crafts (Origami, Quilling)',
  'Craft: Woodwork (Carvings, Small Furniture)',
  'Craft: Textiles (Knitting, Crochet, Sewing)',
  'Craft: Upcycled Materials',
  'Craft: Mixed Media / Other'
];

function BundleManagement() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [bundleBooks, setBundleBooks] = useState({});
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [selectedBundleForBooks, setSelectedBundleForBooks] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [bundleType, setBundleType] = useState('book');
  const [showBookBundles, setShowBookBundles] = useState(true);
  const [showCraftBundles, setShowCraftBundles] = useState(true);
  const [highlightedCategory, setHighlightedCategory] = useState(null);
  const hasNavigatedRef = useRef(false);
  
  // ===== ADD TO MARKETPLACE STATES =====
  const [showAddToMarketplaceModal, setShowAddToMarketplaceModal] = useState(false);
  const [selectedBookToMarketplace, setSelectedBookToMarketplace] = useState(null);
  const [marketplaceBooksList, setMarketplaceBooksList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [marketplaceFormData, setMarketplaceFormData] = useState({
    title: '',
    price: '',
    image: null,
    imagePreview: null,
    qty: '1',
    maxQty: 0,
    existingBook: null,
    isExistingTitle: false,
    category: 'General',
    condition: 'Good',
    description: '',
    source: 'Donated Book'
  });
  
  // Bundle form data
  const [formData, setFormData] = useState({
    name: '',
    includes: '',
    items: '',
    value: '',
    status: 'DRAFT',
    category: 'General',
    type: 'book'
  });

  // Stats
  const [stats, setStats] = useState({
    totalBundles: 0,
    draftBundles: 0,
    publishedBundles: 0,
    totalBooks: 0,
    totalCrafts: 0
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'OPERATIONS_STAFF',
          id: user.id || user.userId || 'test-user-123'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        setCurrentUser({
          name: 'Test Staff',
          role: 'OPERATIONS_STAFF',
          id: 'test-user-123'
        });
      }
    } else {
      setCurrentUser({
        name: 'Test Staff',
        role: 'OPERATIONS_STAFF',
        id: 'test-user-123'
      });
    }
  }, []);

  // ===== CREATE DEFAULT BUNDLES FOR EACH CATEGORY =====
  const createDefaultBundles = async () => {
    try {
      const existingBundles = await collectionAPI.getAll();
      const existingCategories = existingBundles.map(b => b.category);
      
      for (const category of BOOK_CATEGORIES) {
        if (!existingCategories.includes(category)) {
          await collectionAPI.create({
            title: `${category} Collection`,
            description: `Collection of ${category} books`,
            category: category,
            type: 'book',
            stock: 0,
            pointsRequired: 0,
            cashPrice: 0,
            isRare: false,
            userId: currentUser.id
          });
          console.log(`Created default book bundle for ${category}`);
        }
      }
      
      for (const category of CRAFT_CATEGORIES) {
        if (!existingCategories.includes(category)) {
          await collectionAPI.create({
            title: category,
            description: `Collection of ${category} items`,
            category: category,
            type: 'craft',
            stock: 0,
            pointsRequired: 0,
            cashPrice: 0,
            isRare: false,
            userId: currentUser.id
          });
          console.log(`Created default craft bundle for ${category}`);
        }
      }
    } catch (error) {
      console.error('Error creating default bundles:', error);
    }
  };

  // ===== LOAD ALL DATA =====
  const loadAllData = async () => {
    setLoading(true);
    try {
      let bundlesData = await collectionAPI.getAll();
      console.log('Bundles loaded:', bundlesData);
      
      if (bundlesData.length === 0) {
        await createDefaultBundles();
        bundlesData = await collectionAPI.getAll();
      }
      
      const mappedBundles = bundlesData.map(item => ({
        id: item.id,
        bundleId: item.slug || `BND-${String(item.id).slice(0, 4).toUpperCase()}`,
        name: item.title,
        includes: item.description || 'No description',
        items: item.stock || 0,
        value: item.cashPrice || item.pointsRequired || 0,
        status: item.isRare ? 'PUBLISHED' : 'DRAFT',
        date: new Date(item.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        createdAt: item.createdAt,
        cashPrice: item.cashPrice || 0,
        stock: item.stock || 0,
        category: item.category || 'General',
        type: (item.type || '').toLowerCase() === 'craft' || 
              (item.category && item.category.startsWith('Craft:')) ? 'craft' : 'book'
      }));
      setBundles(mappedBundles);
      
      const bookCounts = {};
      let totalBooks = 0;
      let totalCrafts = 0;
      
      for (const col of bundlesData) {
        try {
          const booksRes = await fetch(`${API_BASE}/books/collection/${col.id}`);
          if (booksRes.ok) {
            const booksData = await booksRes.json();
            bookCounts[col.id] = {
              count: booksData.length,
              books: booksData,
            };
            const isCraft = col.category?.startsWith('Craft:') || 
                          (col.type || '').toLowerCase() === 'craft';
            if (isCraft) {
              totalCrafts += booksData.length;
            } else {
              totalBooks += booksData.length;
            }
          }
        } catch (err) {
          bookCounts[col.id] = { count: 0, books: [] };
        }
      }
      setBundleBooks(bookCounts);
      
      const totalBundles = mappedBundles.length;
      const draftBundles = mappedBundles.filter(b => b.status === 'DRAFT').length;
      const publishedBundles = mappedBundles.filter(b => b.status === 'PUBLISHED').length;
      
      setStats({
        totalBundles,
        draftBundles,
        publishedBundles,
        totalBooks,
        totalCrafts
      });
      
      processNavigation(mappedBundles);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== PROCESS NAVIGATION =====
  const processNavigation = (bundlesList) => {
    if (hasNavigatedRef.current) return;
    if (!bundlesList || bundlesList.length === 0) return;
    
    let targetCategory = null;
    
    if (location.state) {
      const { bundleId, category, type } = location.state;
      console.log('Location state received:', { bundleId, category, type });
      
      if (bundleId) {
        const bundle = bundlesList.find(b => b.id === bundleId);
        if (bundle) {
          targetCategory = bundle.category;
          console.log('Found bundle by ID:', { bundleId, category: targetCategory });
        }
      } else if (category) {
        const bundle = bundlesList.find(b => 
          b.category?.toLowerCase() === category.toLowerCase()
        );
        if (bundle) {
          targetCategory = bundle.category;
        } else {
          targetCategory = category;
        }
      }
    }
    
    if (!targetCategory) {
      const storedState = sessionStorage.getItem('bundleNavigationState');
      if (storedState) {
        try {
          const state = JSON.parse(storedState);
          if (Date.now() - state.timestamp < 60000) {
            console.log('SessionStorage state:', state);
            if (state.bundleId) {
              const bundle = bundlesList.find(b => b.id === state.bundleId);
              if (bundle) {
                targetCategory = bundle.category;
              }
            } else if (state.category) {
              const bundle = bundlesList.find(b => 
                b.category?.toLowerCase() === state.category.toLowerCase()
              );
              targetCategory = bundle ? bundle.category : state.category;
            }
          }
          sessionStorage.removeItem('bundleNavigationState');
        } catch (e) {
          console.warn('Could not parse stored navigation state');
        }
      }
    }
    
    if (targetCategory) {
      console.log('Navigating to category:', targetCategory);
      setHighlightedCategory(targetCategory);
      hasNavigatedRef.current = true;
      
      if (targetCategory.startsWith('Craft:')) {
        setShowCraftBundles(true);
      } else {
        setShowBookBundles(true);
      }
      
      setTimeout(() => {
        scrollToCategory(targetCategory);
      }, 800);
    }
    
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  };

  // ===== SCROLL TO CATEGORY =====
  const scrollToCategory = (categoryName) => {
    if (!categoryName) return;
    
    const elementId = `category-section-${categoryName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    let element = document.getElementById(elementId);
    
    if (!element) {
      const displayName = categoryName.replace('Craft: ', '');
      const altElementId = `category-section-${displayName.replace(/[^a-zA-Z0-9]/g, '-')}`;
      element = document.getElementById(altElementId);
    }
    
    if (element) {
      console.log('Scrolling to element:', elementId);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      element.classList.add('highlighted');
      setTimeout(() => {
        element.classList.remove('highlighted');
      }, 5000);
    } else {
      console.warn('Category element not found:', categoryName);
    }
  };

  useEffect(() => {
    loadAllData();
    return () => {
      hasNavigatedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && bundles.length > 0 && !hasNavigatedRef.current) {
      processNavigation(bundles);
    }
  }, [loading, bundles]);

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return currentUser.name[0].toUpperCase();
    }
    return 'SU';
  };

  // ===== VALIDATION FUNCTION =====
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Bundle name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Bundle name must be at least 3 characters';
    }

    if (!formData.includes || formData.includes.trim() === '') {
      errors.includes = 'Description is required';
    }

    if (!formData.items || formData.items === '') {
      errors.items = 'Number of items is required';
    } else if (parseInt(formData.items) < 0) {
      errors.items = 'Items cannot be negative';
    } else if (parseInt(formData.items) === 0) {
      errors.items = 'Items must be at least 1';
    }

    if (!formData.value || formData.value === '') {
      errors.value = 'Value is required';
    } else if (parseFloat(formData.value) < 0) {
      errors.value = 'Value cannot be negative';
    }

    if (!formData.category || formData.category === 'General' || formData.category === '') {
      errors.category = 'Please select a category';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== BUNDLE CRUD =====
  const getFilteredBundles = () => {
    let filtered = [...bundles];
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(bundle => bundle.status === statusFilter);
    }
    return filtered;
  };

  const openBundleBooks = (bundle) => {
    setSelectedBundleForBooks(bundle);
    setShowBooksModal(true);
  };

  const filteredBundles = getFilteredBundles();

  const handleCreate = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before continuing.');
      return;
    }

    try {
      const newBundle = await collectionAPI.create({
        title: formData.name,
        description: formData.includes,
        category: formData.category || 'General',
        type: formData.type || 'book',
        stock: parseInt(formData.items),
        pointsRequired: Math.round(parseFloat(formData.value) / 100),
        cashPrice: parseFloat(formData.value),
        isRare: formData.status === 'PUBLISHED',
        userId: currentUser.id
      });
      console.log('Bundle created:', newBundle);
      
      await loadAllData();
      setShowModal(false);
      resetForm();
      alert('Bundle created successfully!');
    } catch (error) {
      console.error('Error creating bundle:', error);
      alert('Failed to create bundle: ' + error.message);
    }
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setValidationErrors({});
    setBundleType(bundle.type || 'book');
    setFormData({
      name: bundle.name,
      includes: bundle.includes,
      items: bundle.items.toString(),
      value: bundle.value.toString(),
      status: bundle.status,
      category: bundle.category || 'General',
      type: bundle.type || 'book'
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before continuing.');
      return;
    }

    try {
      const updated = await collectionAPI.update(editingBundle.id, {
        title: formData.name,
        description: formData.includes,
        category: formData.category || 'General',
        type: formData.type || 'book',
        stock: parseInt(formData.items),
        pointsRequired: Math.round(parseFloat(formData.value) / 100),
        cashPrice: parseFloat(formData.value),
        isRare: formData.status === 'PUBLISHED'
      });
      console.log('Bundle updated:', updated);
      
      await loadAllData();
      setShowModal(false);
      setEditingBundle(null);
      resetForm();
      alert('Bundle updated successfully!');
    } catch (error) {
      console.error('Error updating bundle:', error);
      alert('Failed to update bundle: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) return;
    try {
      await collectionAPI.delete(id);
      console.log('Bundle deleted');
      await loadAllData();
      alert('Bundle deleted successfully!');
    } catch (error) {
      console.error('Error deleting bundle:', error);
      alert('Failed to delete bundle: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      includes: '',
      items: '',
      value: '',
      status: 'DRAFT',
      category: 'General',
      type: 'book'
    });
    setValidationErrors({});
    setBundleType('book');
  };

  // ===== ADD TO MARKETPLACE FUNCTIONS =====
  const openMarketplaceForm = async (book) => {
    console.log('📖 Opening marketplace form for book:', book);
    setSelectedBookToMarketplace(book);
    setIsSearching(true);
    
    const collectionBooks = bundleBooks[book.collectionId]?.books || [];
    const unavailableCount = collectionBooks.filter(b => !b.isAvailable).length;

    const bookTitle = book.title || '';
    
    setMarketplaceFormData({
      title: bookTitle,
      price: book.cashPrice || book.value || '0',
      image: null,
      imagePreview: book.imageUrl || null,
      qty: '1',
      maxQty: unavailableCount,
      existingBook: null,
      isExistingTitle: false,
      category: book.category || 'General',
      condition: book.condition || 'Good',
      description: book.description || '',
      source: 'Donated Book'
    });

    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching marketplace books...');
      const response = await fetch(`${API_BASE}/books/marketplace`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📚 Marketplace books loaded:', data);
        setMarketplaceBooksList(data);
        
        // Case-insensitive search for existing title
        const matched = data.find(
          b => (b.title || '').toLowerCase().trim() === bookTitle.toLowerCase().trim()
        );
        
        console.log('🔍 Searching for:', bookTitle);
        console.log('📖 Found match:', matched);
        
        if (matched) {
          console.log('✅ Title exists in marketplace!');
          setMarketplaceFormData(prev => ({
            ...prev,
            existingBook: matched,
            isExistingTitle: true,
            price: matched.pointsPrice || matched.price || '',
            imagePreview: matched.imageUrl || null
          }));
        } else {
          console.log('❌ Title does not exist in marketplace. Will create new entry.');
        }
      } else {
        console.error('Failed to fetch marketplace books');
      }
    } catch (err) {
      console.error('Failed to load marketplace books:', err);
    } finally {
      setIsSearching(false);
    }

    setShowAddToMarketplaceModal(true);
  };

  const searchMarketplaceTitle = (typedTitle) => {
    console.log('🔍 Searching for title:', typedTitle);
    
    if (!typedTitle || typedTitle.trim() === '') {
      setMarketplaceFormData(prev => ({
        ...prev,
        title: typedTitle,
        existingBook: null,
        isExistingTitle: false
      }));
      return;
    }

    const matched = marketplaceBooksList.find(
      b => (b.title || '').toLowerCase().trim() === typedTitle.toLowerCase().trim()
    );
    
    console.log('📖 Match found:', matched);
    
    if (matched) {
      setMarketplaceFormData(prev => ({
        ...prev,
        title: typedTitle,
        existingBook: matched,
        isExistingTitle: true,
        price: matched.pointsPrice || matched.price || '',
        imagePreview: matched.imageUrl || null
      }));
    } else {
      setMarketplaceFormData(prev => ({
        ...prev,
        title: typedTitle,
        existingBook: null,
        isExistingTitle: false
      }));
    }
  };

  const submitToMarketplace = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // CASE 1: Title already exists - Update quantity only
      if (marketplaceFormData.existingBook) {
        console.log('📝 Updating existing marketplace entry...');
        const existingId = marketplaceFormData.existingBook.id;
        const newQuantity = (marketplaceFormData.existingBook.quantity || 0) + parseInt(marketplaceFormData.qty);
        
        const response = await fetch(`${API_BASE}/books/marketplace/${existingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quantity: newQuantity
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update marketplace quantity');
        }
        
        alert(`✅ Quantity updated! Added ${marketplaceFormData.qty} more to "${marketplaceFormData.existingBook.title}" (Total: ${newQuantity})`);
        setShowAddToMarketplaceModal(false);
        await loadAllData();
        return;
      }
      
      // CASE 2: Title doesn't exist - Create new marketplace entry
      console.log('🆕 Creating new marketplace entry...');
      const formData = new FormData();
      
      // Use the book's actual title
      const bookTitle = selectedBookToMarketplace.title || marketplaceFormData.title;
      
      // Required fields
      formData.append('title', bookTitle);
      formData.append('pointsPrice', marketplaceFormData.price);
      formData.append('qty', marketplaceFormData.qty);
      
      // Book details
      formData.append('category', selectedBookToMarketplace.category || 'General');
      formData.append('condition', selectedBookToMarketplace.condition || 'Good');
      formData.append('description', selectedBookToMarketplace.description || '');
      formData.append('source', 'Donated Book');
      formData.append('bookId', selectedBookToMarketplace.id);
      formData.append('displayTitle', bookTitle);
      
      // Image handling
      if (marketplaceFormData.image) {
        formData.append('image', marketplaceFormData.image);
      } else if (selectedBookToMarketplace.imageUrl) {
        try {
          const imageResponse = await fetch(selectedBookToMarketplace.imageUrl);
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const file = new File([blob], 'book-image.jpg', { type: blob.type || 'image/jpeg' });
            formData.append('image', file);
          }
        } catch (imgError) {
          console.warn('Could not fetch existing image:', imgError);
        }
      }
      
      console.log('📤 Sending to marketplace:', {
        title: bookTitle,
        pointsPrice: marketplaceFormData.price,
        qty: marketplaceFormData.qty,
        category: selectedBookToMarketplace.category,
        condition: selectedBookToMarketplace.condition,
        source: 'Donated Book',
        bookId: selectedBookToMarketplace.id,
        hasImage: !!marketplaceFormData.image || !!selectedBookToMarketplace.imageUrl
      });
      
      const response = await fetch(`${API_BASE}/books/${selectedBookToMarketplace.id}/add-to-marketplace`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add to marketplace');
      }
      
      const result = await response.json();
      console.log('✅ Marketplace response:', result);
      
      alert(`✅ "${bookTitle}" added to marketplace successfully!`);
      setShowAddToMarketplaceModal(false);
      await loadAllData();
      
    } catch (error) {
      console.error('Error adding book to marketplace:', error);
      alert('❌ Failed to add book to marketplace: ' + error.message);
    }
  };

  const handleAddAllBooksToMarketplace = async (bundleId) => {
    const books = bundleBooks[bundleId]?.books || [];
    const inventoryBooks = books.filter(b => !b.isAvailable);
    if (inventoryBooks.length === 0) {
      alert('All items are already on the marketplace!');
      return;
    }
    if (!window.confirm(`Add ${inventoryBooks.length} item(s) to marketplace?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      for (const book of inventoryBooks) {
        await fetch(`${API_BASE}/books/${book.id}/add-to-marketplace`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      alert(`${inventoryBooks.length} item(s) added to marketplace!`);
      await loadAllData();
    } catch (error) {
      console.error('Error adding items to marketplace:', error);
      alert('Failed to add some items: ' + error.message);
    }
  };

  // Group bundles by type and category
  const getBundlesByType = () => {
    const bookBundles = {};
    const craftBundles = {};
    const filtered = getFilteredBundles();
    
    BOOK_CATEGORIES.forEach(cat => {
      bookBundles[cat] = [];
    });
    
    CRAFT_CATEGORIES.forEach(cat => {
      craftBundles[cat] = [];
    });
    
    filtered.forEach(bundle => {
      const category = bundle.category || 'General';
      const isCraft = (bundle.type || '').toLowerCase() === 'craft' || 
                      (category && category.startsWith('Craft:'));
      
      if (isCraft) {
        const matchingCat = CRAFT_CATEGORIES.find(cat => 
          cat.toLowerCase() === category.toLowerCase()
        );
        if (matchingCat) {
          craftBundles[matchingCat].push(bundle);
        } else {
          craftBundles['Craft: Mixed Media / Other'].push(bundle);
        }
      } else {
        const matchingCat = BOOK_CATEGORIES.find(cat => 
          cat.toLowerCase() === category.toLowerCase()
        );
        if (matchingCat) {
          bookBundles[matchingCat].push(bundle);
        } else {
          bookBundles['Mixed'].push(bundle);
        }
      }
    });
    
    return { bookBundles, craftBundles };
  };

  const { bookBundles, craftBundles } = getBundlesByType();
  const bookCategoryNames = BOOK_CATEGORIES;
  const craftCategoryNames = CRAFT_CATEGORIES;

  const getCategoryElementId = (categoryName) => {
    return `category-section-${categoryName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  };

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Bundle Management</h1>
          <p className="page-subtitle">Curate, monitor, and publish book collections for the marketplace.</p>
          {highlightedCategory && (
            <div className="navigated-banner">
              <span>
                Navigated to: <strong>{highlightedCategory.replace('Craft: ', '')}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="bundle-stats">
        <div className="stat-card">
          <h3>TOTAL BUNDLES</h3>
          <div className="stat-value">{stats.totalBundles}</div>
          <div className="stat-trend">All collections</div>
        </div>

        <div className="stat-card accent-warning">
          <h3>DRAFT</h3>
          <div className="stat-value">{stats.draftBundles}</div>
          <div className="stat-trend">Awaiting approval</div>
        </div>

        <div className="stat-card accent-success">
          <h3>PUBLISHED</h3>
          <div className="stat-value">{stats.publishedBundles}</div>
          <div className="stat-trend">Available in marketplace</div>
        </div>

        <div className="stat-card accent-teal">
          <h3>BOOKS</h3>
          <div className="stat-value">{stats.totalBooks}</div>
          <div className="stat-trend">In book bundles</div>
        </div>

        <div className="stat-card accent-teal">
          <h3>CRAFTS</h3>
          <div className="stat-value">{stats.totalCrafts}</div>
          <div className="stat-trend">In craft bundles</div>
        </div>
      </div>

      {/* ===== BUNDLES TABLE ===== */}
      <div className="bundle-table-section">
        <div className="table-header">
          <h3>Bundle Inventory</h3>
          <div className="table-controls">
            <select 
              className="filter-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>

            <button className="btn-primary" onClick={() => { resetForm(); setEditingBundle(null); setShowModal(true); }}>
              + New Bundle
            </button>
          </div>
        </div>

        {/* ===== FILTER TOGGLES ===== */}
        <div className="filter-toggles">
          <label className="filter-toggle-label">
            <input
              type="checkbox"
              checked={showBookBundles}
              onChange={(e) => setShowBookBundles(e.target.checked)}
            />
            <span>Show Book Bundles</span>
          </label>
          <label className="filter-toggle-label">
            <input
              type="checkbox"
              checked={showCraftBundles}
              onChange={(e) => setShowCraftBundles(e.target.checked)}
            />
            <span>Show Craft Bundles</span>
          </label>
        </div>

        {loading ? (
          <div className="loading-container">Loading bundles...</div>
        ) : (
          <>
            {/* ===== BOOK BUNDLES SECTION ===== */}
            {showBookBundles && (
              <div className="bundle-section">
                <div className="bundle-section-header book-header">
                  <h3>Book Bundles</h3>
                  <span className="bundle-section-count">
                    {Object.values(bookBundles).reduce((sum, arr) => sum + arr.length, 0)} bundle(s)
                  </span>
                </div>

                {bookCategoryNames.map(category => {
                  const bundlesInCategory = bookBundles[category] || [];
                  const isHighlighted = highlightedCategory === category;
                  const elementId = getCategoryElementId(category);
                  
                  return (
                    <div 
                      key={category} 
                      id={elementId}
                      className={`bundle-category ${isHighlighted ? 'highlighted' : ''}`}
                    >
                      <div className="bundle-category-header">
                        <h4>
                          {category}
                          {isHighlighted && (
                            <span className="navigated-badge">Navigated</span>
                          )}
                        </h4>
                        <span className="bundle-count">
                          {bundlesInCategory.length} bundle(s)
                        </span>
                      </div>

                      {bundlesInCategory.length === 0 ? (
                        <div className="empty-bundle-state">
                          No {category} book bundles yet. Books verified with {category} category will appear here.
                        </div>
                      ) : (
                        <div className="data-table">
                          <table>
                            <thead>
                              <tr>
                                <th>BUNDLE ID</th>
                                <th>BUNDLE NAME</th>
                                <th>ITEMS</th>
                                <th>VALUE (Rs.)</th>
                                <th>STATUS</th>
                                <th>DATE CREATED</th>
                                <th>ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bundlesInCategory.map((bundle) => (
                                <tr key={bundle.id}>
                                  <td className="bundle-id">{bundle.bundleId}</td>
                                  <td>
                                    <div className="bundle-name">{bundle.name}</div>
                                    <div className="bundle-includes">{bundle.includes}</div>
                                  </td>
                                  <td>{bundleBooks[bundle.id]?.count || bundle.items || 0}</td>
                                  <td>Rs. {bundle.value.toLocaleString('en-IN')}</td>
                                  <td>
                                    <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                                      {bundle.status}
                                    </span>
                                  </td>
                                  <td>{bundle.date}</td>
                                  <td>
                                    <div className="action-group">
                                      <button className="btn-small" onClick={() => openBundleBooks(bundle)}>
                                        View Items ({bundleBooks[bundle.id]?.count || 0})
                                      </button>
                                      <button className="btn-edit" onClick={() => handleEdit(bundle)}>Edit</button>
                                      <button className="btn-delete" onClick={() => handleDelete(bundle.id)}>Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ===== CRAFT BUNDLES SECTION ===== */}
            {showCraftBundles && (
              <div className="bundle-section">
                <div className="bundle-section-header craft-header">
                  <h3>Craft Bundles</h3>
                  <span className="bundle-section-count">
                    {Object.values(craftBundles).reduce((sum, arr) => sum + arr.length, 0)} bundle(s)
                  </span>
                </div>

                {craftCategoryNames.map(category => {
                  const bundlesInCategory = craftBundles[category] || [];
                  const isHighlighted = highlightedCategory === category;
                  const elementId = getCategoryElementId(category);
                  const displayName = category.replace('Craft: ', '');
                  
                  return (
                    <div 
                      key={category} 
                      id={elementId}
                      className={`bundle-category craft ${isHighlighted ? 'highlighted' : ''}`}
                    >
                      <div className="bundle-category-header">
                        <h4>
                          {displayName}
                          {isHighlighted && (
                            <span className="navigated-badge">Navigated</span>
                          )}
                        </h4>
                        <span className="bundle-count">
                          {bundlesInCategory.length} bundle(s)
                        </span>
                      </div>

                      {bundlesInCategory.length === 0 ? (
                        <div className="empty-bundle-state craft-empty">
                          No {displayName} craft bundles yet. Crafts verified with {category} category will appear here.
                        </div>
                      ) : (
                        <div className="data-table">
                          <table>
                            <thead>
                              <tr>
                                <th>BUNDLE ID</th>
                                <th>BUNDLE NAME</th>
                                <th>ITEMS</th>
                                <th>VALUE (Rs.)</th>
                                <th>STATUS</th>
                                <th>DATE CREATED</th>
                                <th>ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bundlesInCategory.map((bundle) => (
                                <tr key={bundle.id}>
                                  <td className="bundle-id">{bundle.bundleId}</td>
                                  <td>
                                    <div className="bundle-name">{bundle.name}</div>
                                    <div className="bundle-includes">{bundle.includes}</div>
                                  </td>
                                  <td>{bundleBooks[bundle.id]?.count || bundle.items || 0}</td>
                                  <td>Rs. {bundle.value.toLocaleString('en-IN')}</td>
                                  <td>
                                    <span className={`status-badge ${bundle.status.toLowerCase()}`}>
                                      {bundle.status}
                                    </span>
                                  </td>
                                  <td>{bundle.date}</td>
                                  <td>
                                    <div className="action-group">
                                      <button className="btn-small" onClick={() => openBundleBooks(bundle)}>
                                        View Items ({bundleBooks[bundle.id]?.count || 0})
                                      </button>
                                      <button className="btn-edit" onClick={() => handleEdit(bundle)}>Edit</button>
                                      <button className="btn-delete" onClick={() => handleDelete(bundle.id)}>Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="table-footer">
              <span>Showing {filteredBundles.length} of {bundles.length} bundles across book and craft categories</span>
            </div>
          </>
        )}
      </div>

      {/* ===== BUNDLE MODAL ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bundle-modal">
            <div className="bundle-modal-header">
              <h2>{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</h2>
              <button
                className="bundle-modal-close"
                onClick={() => { setShowModal(false); setEditingBundle(null); resetForm(); }}
              >
                ×
              </button>
            </div>

            {/* Bundle Type Selection */}
            <div className="bundle-type-selector">
              <label>Bundle Type <span className="required">*</span></label>
              <div className="bundle-type-buttons">
                <button
                  type="button"
                  className={`bundle-type-btn ${formData.type === 'book' ? 'active-book' : ''}`}
                  onClick={() => {
                    setFormData({...formData, type: 'book', category: ''});
                    setBundleType('book');
                    if (validationErrors.category) {
                      setValidationErrors({...validationErrors, category: ''});
                    }
                  }}
                  disabled={!!editingBundle}
                >
                  📚 Book Bundle
                </button>
                <button
                  type="button"
                  className={`bundle-type-btn ${formData.type === 'craft' ? 'active-craft' : ''}`}
                  onClick={() => {
                    setFormData({...formData, type: 'craft', category: ''});
                    setBundleType('craft');
                    if (validationErrors.category) {
                      setValidationErrors({...validationErrors, category: ''});
                    }
                  }}
                  disabled={!!editingBundle}
                >
                  🎨 Craft Bundle
                </button>
              </div>
              {editingBundle && (
                <p className="bundle-type-note">Bundle type cannot be changed while editing</p>
              )}
            </div>

            {/* Bundle Name */}
            <div className="form-group">
              <label>Bundle Name <span className="required">*</span></label>
              <input 
                type="text" 
                className={`form-control ${validationErrors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (validationErrors.name) {
                    setValidationErrors({...validationErrors, name: ''});
                  }
                }}
                placeholder="Enter a descriptive name for the bundle"
              />
              {validationErrors.name && (
                <p className="error-text">{validationErrors.name}</p>
              )}
              <p className="helper-text">Choose a name that clearly describes what's in this bundle</p>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <input 
                type="text" 
                className={`form-control ${validationErrors.includes ? 'error' : ''}`}
                value={formData.includes}
                onChange={(e) => {
                  setFormData({...formData, includes: e.target.value});
                  if (validationErrors.includes) {
                    setValidationErrors({...validationErrors, includes: ''});
                  }
                }}
                placeholder="e.g., Includes works by Jane Austen, Charles Dickens"
              />
              {validationErrors.includes && (
                <p className="error-text">{validationErrors.includes}</p>
              )}
              <p className="helper-text">Briefly describe what's included in this bundle</p>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                className={`form-control ${validationErrors.category ? 'error' : ''}`}
                value={formData.category || ''}
                onChange={(e) => {
                  setFormData({...formData, category: e.target.value});
                  if (validationErrors.category) {
                    setValidationErrors({...validationErrors, category: ''});
                  }
                }}
              >
                <option value="">Select a category...</option>
                {(formData.type === 'book' ? BOOK_CATEGORIES : CRAFT_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="error-text">{validationErrors.category}</p>
              )}
              <p className="helper-text">Select the category that best fits this bundle</p>
            </div>

            {/* Items and Value - Two columns */}
            <div className="form-row">
              <div className="form-group">
                <label>Number of Items <span className="required">*</span></label>
                <input 
                  type="number" 
                  className={`form-control ${validationErrors.items ? 'error' : ''}`}
                  value={formData.items}
                  onChange={(e) => {
                    setFormData({...formData, items: e.target.value});
                    if (validationErrors.items) {
                      setValidationErrors({...validationErrors, items: ''});
                    }
                  }}
                  placeholder="0"
                  min="1"
                />
                {validationErrors.items && (
                  <p className="error-text">{validationErrors.items}</p>
                )}
                <p className="helper-text">Total items in this bundle</p>
              </div>

              <div className="form-group">
                <label>Value (Rs.) <span className="required">*</span></label>
                <input 
                  type="number" 
                  className={`form-control ${validationErrors.value ? 'error' : ''}`}
                  value={formData.value}
                  onChange={(e) => {
                    setFormData({...formData, value: e.target.value});
                    if (validationErrors.value) {
                      setValidationErrors({...validationErrors, value: ''});
                    }
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {validationErrors.value && (
                  <p className="error-text">{validationErrors.value}</p>
                )}
                <p className="helper-text">Total value in Rupees</p>
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status <span className="required">*</span></label>
              <div className="status-toggle-group">
                <button
                  type="button"
                  className={`status-toggle-btn ${formData.status === 'DRAFT' ? 'active-draft' : ''}`}
                  onClick={() => {
                    setFormData({...formData, status: 'DRAFT'});
                    if (validationErrors.status) {
                      setValidationErrors({...validationErrors, status: ''});
                    }
                  }}
                >
                  Draft
                </button>
                <button
                  type="button"
                  className={`status-toggle-btn ${formData.status === 'PUBLISHED' ? 'active-published' : ''}`}
                  onClick={() => {
                    setFormData({...formData, status: 'PUBLISHED'});
                    if (validationErrors.status) {
                      setValidationErrors({...validationErrors, status: ''});
                    }
                  }}
                >
                  Published
                </button>
              </div>
              {validationErrors.status && (
                <p className="error-text">{validationErrors.status}</p>
              )}
              <p className="status-helper">Draft bundles are hidden from users. Published bundles appear in the marketplace.</p>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowModal(false); setEditingBundle(null); resetForm(); }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={editingBundle ? handleUpdate : handleCreate}
              >
                {editingBundle ? 'Update Bundle' : 'Create Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKS IN BUNDLE MODAL ===== */}
      {showBooksModal && selectedBundleForBooks && (
        <div className="modal-overlay">
          <div className="modal-content books-modal">
            <h2>Items in {selectedBundleForBooks.name}</h2>
            <p className="books-modal-meta">
              Category: <strong>{selectedBundleForBooks.category || 'General'}</strong> | 
              Type: <strong>{selectedBundleForBooks.type === 'craft' ? 'Craft' : 'Book'}</strong>
            </p>
            
            {(bundleBooks[selectedBundleForBooks.id]?.books || []).length === 0 ? (
              <div className="empty-books-state">
                No items assigned to this bundle yet. Verified items will appear here.
              </div>
            ) : (
              <>
                <div className="books-modal-header">
                  <span>Total Items: {(bundleBooks[selectedBundleForBooks.id]?.books || []).length}</span>
                  <button
                    className="btn-add-all"
                    onClick={() => handleAddAllBooksToMarketplace(selectedBundleForBooks.id)}
                  >
                    Add All to Marketplace ({(bundleBooks[selectedBundleForBooks.id]?.books || []).filter(b => !b.isAvailable).length})
                  </button>
                </div>
                <div className="books-grid">
                  {(bundleBooks[selectedBundleForBooks.id]?.books || []).map((book) => (
                    <div key={book.id} className="book-card">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="book-card-image" />
                      ) : (
                        <div className="book-card-placeholder">
                          {book.title?.[0] || 'I'}
                        </div>
                      )}
                      <div className="book-card-details">
                        <p className="book-card-title">{book.title}</p>
                        <p className="book-card-condition">{book.condition || 'No condition'}</p>
                        <p className="book-card-category">Category: {book.category || 'General'}</p>
                        {book.isAvailable ? (
                          <span className="book-card-badge">On Marketplace</span>
                        ) : (
                          <button
                            className="btn-add-marketplace"
                            onClick={() => openMarketplaceForm(book)}
                          >
                            Add to Marketplace
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => { setShowBooksModal(false); setSelectedBundleForBooks(null); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD TO MARKETPLACE MODAL ===== */}
      {showAddToMarketplaceModal && selectedBookToMarketplace && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="bundle-modal-header">
              <h2>Add to Marketplace</h2>
              <button
                className="bundle-modal-close"
                onClick={() => {
                  setShowAddToMarketplaceModal(false);
                  setSelectedBookToMarketplace(null);
                }}
              >
                ×
              </button>
            </div>
            
            {isSearching ? (
              <p style={{ 
                color: '#6B7280', 
                marginBottom: 20, 
                fontSize: 14,
                padding: '10px 16px',
                borderRadius: 8,
                background: '#f3f4f6'
              }}>
                🔍 Searching marketplace...
              </p>
            ) : marketplaceFormData.existingBook ? (
              <p style={{ 
                color: '#065f46', 
                marginBottom: 20, 
                fontSize: 14,
                background: '#d1fae5',
                padding: '10px 16px',
                borderRadius: 8,
                fontWeight: 500
              }}>
                📚 "{marketplaceFormData.existingBook.title}" already exists in marketplace.
                <br />
                <span style={{ fontSize: 13, fontWeight: 400 }}>
                  Current Qty: {marketplaceFormData.existingBook.quantity || 1} | 
                  Price: Rs. {marketplaceFormData.existingBook.pointsPrice || marketplaceFormData.existingBook.price}
                </span>
                <br />
                <span style={{ fontSize: 13, fontWeight: 400, color: '#1A6B68' }}>
                  Adding {marketplaceFormData.qty} more will make total: {(marketplaceFormData.existingBook.quantity || 0) + parseInt(marketplaceFormData.qty || 0)}
                </span>
              </p>
            ) : (
              <p style={{ color: '#5C6A6A', marginBottom: 20, fontSize: 14 }}>
                Adding new book: <strong>{selectedBookToMarketplace.title}</strong>
              </p>
            )}
            
            <form onSubmit={submitToMarketplace}>
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input 
                  type="text" 
                  required
                  className="form-control"
                  value={marketplaceFormData.title}
                  onChange={(e) => {
                    const typedTitle = e.target.value;
                    searchMarketplaceTitle(typedTitle);
                  }}
                  placeholder="Enter book title"
                  style={{
                    background: marketplaceFormData.existingBook ? '#f0fdf4' : 'white'
                  }}
                />
                {marketplaceFormData.existingBook && (
                  <p style={{ 
                    color: '#065f46', 
                    fontSize: '13px', 
                    marginTop: '4px', 
                    fontWeight: '600',
                    background: '#d1fae5',
                    padding: '8px 12px',
                    borderRadius: 6
                  }}>
                    ✓ Title exists in marketplace (Price: Rs. {marketplaceFormData.existingBook.pointsPrice || marketplaceFormData.existingBook.price})
                  </p>
                )}
                {!marketplaceFormData.existingBook && marketplaceFormData.title && marketplaceFormData.title.trim() !== '' && !isSearching && (
                  <p style={{ 
                    color: '#6B7280', 
                    fontSize: '13px', 
                    marginTop: '4px',
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#f3f4f6'
                  }}>
                    ✏️ New title - will create new marketplace entry
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Quantity to Add <span className="required">*</span></label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="form-control"
                  value={marketplaceFormData.qty}
                  onChange={(e) => setMarketplaceFormData({...marketplaceFormData, qty: e.target.value})}
                />
                <p className="helper-text">
                  {marketplaceFormData.existingBook 
                    ? `Current quantity: ${marketplaceFormData.existingBook.quantity || 1}. New total will be ${(marketplaceFormData.existingBook.quantity || 0) + parseInt(marketplaceFormData.qty || 0)}`
                    : 'Enter quantity for the new marketplace entry'
                  }
                </p>
              </div>

              <div className="form-group">
                <label>Price (Points) <span className="required">*</span></label>
                <input 
                  type="number" 
                  required
                  disabled={!!marketplaceFormData.existingBook}
                  min="0"
                  className="form-control"
                  value={marketplaceFormData.price}
                  onChange={(e) => setMarketplaceFormData({...marketplaceFormData, price: e.target.value})}
                  style={{ 
                    background: marketplaceFormData.existingBook ? '#f1f5f9' : 'white'
                  }}
                />
                {marketplaceFormData.existingBook && (
                  <p className="helper-text">Price is locked for existing titles. Use the same price.</p>
                )}
              </div>

              <div className="form-group">
                <label>Image {!marketplaceFormData.existingBook && <span className="required">*</span>}</label>
                {marketplaceFormData.imagePreview && (
                  <div style={{ marginBottom: '10px' }}>
                    <img src={marketplaceFormData.imagePreview} alt="Preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                  </div>
                )}
                {!marketplaceFormData.existingBook ? (
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control"
                    required={!marketplaceFormData.existingBook && !marketplaceFormData.imagePreview}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setMarketplaceFormData({
                          ...marketplaceFormData,
                          image: file,
                          imagePreview: URL.createObjectURL(file)
                        });
                      }
                    }}
                    style={{ padding: '8px' }}
                  />
                ) : (
                  <p className="helper-text" style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: 6 }}>
                    Using existing image from marketplace
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => {
                    setShowAddToMarketplaceModal(false);
                    setSelectedBookToMarketplace(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{
                    background: marketplaceFormData.existingBook ? '#10b981' : '#1A6B68'
                  }}
                >
                  {marketplaceFormData.existingBook 
                    ? `✅ Update Quantity (+${marketplaceFormData.qty})` 
                    : '➕ Add to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default BundleManagement;
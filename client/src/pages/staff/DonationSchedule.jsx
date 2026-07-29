// pages/staff/DonationSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../../components/StaffLayout';
import { systemConfigAPI, API_BASE } from '../../services/api';
import { showToast } from '../../utils/toast';

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

function DonationSchedule() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({ name: '', role: '', id: '' });
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemConfig, setSystemConfig] = useState({});
  const [levels, setLevels] = useState([]);
  const [mysteryBoxLocks, setMysteryBoxLocks] = useState([]);
  const [mysteryBoxConfigs, setMysteryBoxConfigs] = useState([]);
  const [leveledUpResult, setLeveledUpResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [selectedBundleId, setSelectedBundleId] = useState('');
  const [addToMarketplace, setAddToMarketplace] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [verifyForm, setVerifyForm] = useState({
    verifiedCount: 0,
    condition: 'good',
    notes: '',
    isComplete: true,
    awardPoints: 0,
    userLevel: 0,
    currentPoints: 0,
    userId: null,
    booksDonated: 0,
    category: ''
  });

  // Download state
    category: '',
    isCraft: false,
    requestedPoints: 0
  });

  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadReceiptAfterVerify, setDownloadReceiptAfterVerify] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          name: user.name || user.email || 'Staff User',
          role: user.role || 'LOGISTICS STAFF',
          id: user.id || user.userId || 'staff-123'
        });
      } catch (e) {
        setCurrentUser({
          name: 'Staff User',
          role: 'LOGISTICS STAFF',
          id: 'staff-123'
        });
      }
    }
    fetchAllData();
    fetchConfig();

    // Check if coming from verification
    const fromVerification = sessionStorage.getItem('fromVerification');
    if (fromVerification === 'true') {
      sessionStorage.removeItem('fromVerification');
      fetchAllData();
    }
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await systemConfigAPI.getAll();
      setSystemConfig(config);
      if (config.LEVEL_THRESHOLDS) {
        try { setLevels(JSON.parse(config.LEVEL_THRESHOLDS)); } catch {}
      }
      if (config.MYSTERY_BOX_LOCKS) {
        try { setMysteryBoxLocks(JSON.parse(config.MYSTERY_BOX_LOCKS)); } catch {}
      }
      if (config.MYSTERY_BOX_LEVEL_CONFIG) {
        try { setMysteryBoxConfigs(JSON.parse(config.MYSTERY_BOX_LEVEL_CONFIG)); } catch {}
      }
    } catch (err) {
      console.warn('Could not load system config');
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      let usersData = [];
      const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (usersResponse.ok) {
        usersData = await usersResponse.json();
        setUsers(usersData);
      }

      const donationsResponse = await fetch(`${API_BASE}/donations?status=PENDING`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!donationsResponse.ok) {
        throw new Error('Failed to fetch donations');
      }

      const donationsData = await donationsResponse.json();
      
      const processedDonations = donationsData.map(donation => {
        const user = usersData?.find(u => u.id === donation.userId);
        return {
          id: donation.id,
          userId: donation.userId,
          donor: user?.name || donation.donor || donation.user?.name || 'Unknown Donor',
          email: user?.email || donation.email || donation.user?.email || 'No email',
          phone: user?.phoneNumber || donation.phone || donation.user?.phoneNumber || 'No phone',
          userLevel: user?.level || donation.user?.level || 0,
          userPoints: user?.points || donation.user?.points || 0,
          location: user?.address || donation.location || donation.user?.address || 'Not specified',
          dropOffDate: donation.dropOffDate || donation.createdAt || new Date().toISOString(),
          timeSlot: donation.timeSlot || 'Morning (10:00 AM - 12:00 PM)',
          requestedCount: donation.requestedCount || donation.bookCount || 0,
          type: donation.type || 'SINGLE_BOOK',
          books: `${donation.requestedCount || donation.bookCount || 0} Books`,
          category: donation.category || 'General',
          notes: donation.notes || '',
          collectionName: donation.collectionName || null,
          status: donation.status || 'PENDING',
          estimatedPoints: donation.estimatedPoints || (donation.requestedCount || 0) * 10 || 0,
          verifiedCount: donation.verifiedCount || 0,
          pointsAwarded: donation.pointsAwarded || 0,
          staffNotes: donation.staffNotes || '',
          createdAt: donation.createdAt || new Date().toISOString(),
          isCollectionComplete: donation.isCollectionComplete || false,
          awardedMysteryBox: donation.awardedMysteryBox || false,
          condition: donation.condition || null,
          donationImages: donation.donationImages || [],
          booksDonated: user?.booksDonated || donation.user?.booksDonated || 0,
          requestedPoints: donation.requestedPoints || 0
        };
      });
      
      setDonations(processedDonations);

    } catch (error) {
      console.error('Error fetching data:', error);
      setDonations([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    if (levels.length > 0) {
      const found = levels.find(l => l.level === level);
      if (found) return { label: found.name || `Level ${level}`, color: '#4caf50' };
    }
    const levelMap = {
      1: { label: 'Book Lover', color: '#4caf50' },
      2: { label: 'Bibliophile', color: '#2196f3' },
      3: { label: 'Grand Librarian', color: '#ff9800' },
      4: { label: 'Literary Elite', color: '#9c27b0' },
      5: { label: 'Legendary Reader', color: '#f44336' }
    };
    return levelMap[level] || levelMap[1];
  };

  const getMysteryBoxInfoForLevel = (level) => {
    const lock = mysteryBoxLocks.find(l => parseInt(l.level) === level);
    const config = mysteryBoxConfigs.find(c => c.level === level);
    if (!lock && !config) return null;
    return {
      unlock: lock?.unlock || null,
      points: config?.points || 0,
      books: config?.books || 0
    };
  };

  const calculatePoints = (actualCount, isCollectionComplete, isCraft, userPoints) => {
    if (isCraft) {
      return {
        basePoints: userPoints || 0,
        bonus: 0,
        total: userPoints || 0,
        baseRate: 0,
        bonusPct: 0
      };
    }
    
    const baseRate = parseInt(systemConfig.BASE_POINTS_PER_BOOK) || 10;
    const bonusPct = parseInt(systemConfig.COLLECTION_BONUS_PERCENTAGE) || 10;
    const basePoints = actualCount * baseRate;
    const applyBonus = isCollectionComplete || actualCount > 1;
    const bonus = applyBonus ? Math.round(basePoints * (bonusPct / 100)) : 0;
    return { basePoints, bonus, total: basePoints + bonus, baseRate, bonusPct };
  };

  const calculateLevelByBooks = (booksDonated) => {
    if (levels.length === 0) {
      if (booksDonated >= 100) return 5;
      if (booksDonated >= 50) return 4;
      if (booksDonated >= 25) return 3;
      if (booksDonated >= 10) return 2;
      return 1;
    }
    const sorted = [...levels].sort((a, b) => (a.minPoints || a.minBooks || 0) - (b.minPoints || b.minBooks || 0));
    let currentLevel = 1;
    for (const lvl of sorted) {
      const threshold = lvl.minBooks || lvl.minPoints || 0;
      if (booksDonated >= threshold) currentLevel = lvl.level;
    }
    return currentLevel;
  };

  // ===== VALIDATION FUNCTION =====
  // ===== FIXED VALIDATION FUNCTION =====
  const validateForm = () => {
    const errors = {};
    
    // Validate verified count
    if (verifyForm.verifiedCount === undefined || verifyForm.verifiedCount === null) {
      errors.verifiedCount = 'Please enter the number of books received';
    } else if (verifyForm.verifiedCount < 0) {
      errors.verifiedCount = 'Number of books cannot be negative';
    } else if (verifyForm.verifiedCount > (selectedDonation?.requestedCount || 0)) {
      errors.verifiedCount = `Cannot verify more than the submitted count (${selectedDonation?.requestedCount || 0})`;
    } else if (verifyForm.verifiedCount === 0) {
      errors.verifiedCount = 'Please enter at least 1 book received';
    }

    // Validate condition
    if (!verifyForm.condition) {
      errors.condition = 'Please select a book condition';
    }

    // Validate category (only for books, not crafts)
    if (!selectedDonation?.category?.startsWith('Craft:')) {
      if (!verifyForm.category || verifyForm.category === '') {
        errors.category = 'Please select a category';
      }
      errors.verifiedCount = 'Please enter the number of items received';
    } else if (verifyForm.verifiedCount < 0) {
      errors.verifiedCount = 'Number of items cannot be negative';
    } else if (verifyForm.verifiedCount > (selectedDonation?.requestedCount || 0)) {
      errors.verifiedCount = `Cannot verify more than the submitted count (${selectedDonation?.requestedCount || 0})`;
    } else if (verifyForm.verifiedCount === 0) {
      errors.verifiedCount = 'Please enter at least 1 item received';
    }

    // Validate condition
    if (!verifyForm.condition || verifyForm.condition === '') {
      errors.condition = 'Please select a condition';
    }

    // ===== FIXED CATEGORY VALIDATION =====
    const categoryValue = verifyForm.category || '';
    const trimmedCategory = categoryValue.trim();
    
    // Check if category is empty or just the placeholder
    const isValidCategory = trimmedCategory !== '' && 
                           trimmedCategory !== 'Select a craft category...' &&
                           trimmedCategory !== 'Select a book category...' &&
                           trimmedCategory !== 'General' &&
                           trimmedCategory !== 'Select a category...';
    
    // Also check if it's a valid category from the lists
    const allCategories = [...BOOK_CATEGORIES, ...CRAFT_CATEGORIES];
    const isInCategoryList = allCategories.some(cat => 
      cat.toLowerCase() === trimmedCategory.toLowerCase()
    );
    
    if (!isValidCategory || !isInCategoryList) {
      errors.category = 'Please select a valid category from the list';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyDonation = async (donation) => {
    setSelectedDonation(donation);
    setValidationErrors({});
    const points = calculatePoints(donation.requestedCount || 0, donation.type === 'COLLECTION');
    
    const isCraft = donation.category && donation.category.startsWith('Craft:');
    
    let points;
    if (isCraft) {
      const userRequestedPoints = donation.requestedPoints || donation.estimatedPoints || 0;
      points = {
        total: userRequestedPoints,
        basePoints: userRequestedPoints,
        bonus: 0,
        baseRate: 0,
        bonusPct: 0
      };
    } else {
      points = calculatePoints(donation.requestedCount || 0, donation.type === 'COLLECTION', false, 0);
    }
    
    setVerifyForm({
      verifiedCount: donation.requestedCount || 0,
      condition: donation.condition || 'good',
      notes: '',
      isComplete: donation.type === 'COLLECTION',
      awardPoints: points.total,
      userLevel: donation.userLevel || 0,
      currentPoints: donation.userPoints || 0,
      userId: donation.userId || null,
      booksDonated: donation.booksDonated || 0,
      category: donation.category || ''
      category: donation.category || '',
      isCraft: isCraft,
      requestedPoints: isCraft ? (donation.requestedPoints || donation.estimatedPoints || 0) : 0
    });
    setDownloadReceiptAfterVerify(false);
    setShowVerifyModal(true);

    // Fetch bundles to get the correct bundle ID for each category
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching bundles...');
      const bundleRes = await fetch(`${API_BASE}/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bundleRes.ok) {
        const bundleData = await bundleRes.json();
        setBundles(bundleData);
        console.log('Bundles fetched:', bundleData.map(b => ({ id: b.id, category: b.category, type: b.type })));
      } else {
        console.error('Failed to fetch bundles:', bundleRes.status);
      }
    } catch (err) {
      console.warn('Could not fetch bundles:', err);
    }
  };

  // ===== FIXED: UPDATED HANDLE CONFIRM VERIFICATION =====
  const handleConfirmVerification = async () => {
    if (!selectedDonation) {
      showToast('No donation selected', 'error');
      return;
    }

    // ===== RUN VALIDATION =====
    if (!validateForm()) {
      showToast('Please fix the validation errors before continuing', 'error');
    // ===== VALIDATE FORM BEFORE SUBMITTING =====
    if (!validateForm()) {
      // Show specific error messages
      const errorMessages = Object.values(validationErrors);
      if (errorMessages.length > 0) {
        showToast(errorMessages[0], 'error');
      } else {
        showToast('Please fix all validation errors before continuing', 'error');
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login again', 'error');
        return;
      }

      // ===== FIND BUNDLE ID FOR THE SELECTED CATEGORY =====
      const getBundleIdForCategory = (category) => {
        const matchingBundle = bundles.find(b => b.category === category);
        return matchingBundle ? matchingBundle.id : null;
      };
      
      const selectedCategory = verifyForm.category || selectedDonation.category || 'General';
      const bundleIdForCategory = getBundleIdForCategory(selectedCategory);

      console.log(`✅ Selected Category: ${selectedCategory}, Bundle ID: ${bundleIdForCategory}`);
      const isCraft = selectedDonation.category && selectedDonation.category.startsWith('Craft:');
      const selectedCategory = verifyForm.category || selectedDonation.category || 'General';
      
      console.log(`Selected Category from form: "${selectedCategory}"`);
      console.log(`Is Craft: ${isCraft}`);

      let bundleIdForCategory = null;
      
      const getBundleIdForCategory = (category) => {
        let match = bundles.find(b => b.category === category);
        if (!match) {
          match = bundles.find(b => b.category?.toLowerCase() === category.toLowerCase());
        }
        return match ? match.id : null;
      };
      
      bundleIdForCategory = getBundleIdForCategory(selectedCategory);
      console.log(`Selected Category: ${selectedCategory}, Bundle ID: ${bundleIdForCategory}, isCraft: ${isCraft}`);

      if (!bundleIdForCategory) {
        console.log(`No bundle found for category: ${selectedCategory}, backend will create one`);
      }

      let pointsToAward = verifyForm.awardPoints;
      
      if (isCraft) {
        pointsToAward = selectedDonation.requestedPoints || selectedDonation.estimatedPoints || verifyForm.awardPoints || 0;
        console.log(`Craft points from user: ${pointsToAward}`);
      }

      const response = await fetch(`${API_BASE}/donations/${selectedDonation.id}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verifiedCount: verifyForm.verifiedCount,
          condition: verifyForm.condition,
          notes: verifyForm.notes,
          staffId: currentUser.id,
          isCollectionComplete: verifyForm.isComplete,
          bundleId: bundleIdForCategory,
          addToMarketplace: true, // Always add to marketplace
          category: selectedCategory
          addToMarketplace: false,
          category: selectedCategory,
          isCraft: isCraft,
          pointsToAward: pointsToAward
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to verify donation';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const { points, leveledUp, newLevel, newBooksDonated, bundleId: returnedBundleId } = result;

      setLeveledUpResult(leveledUp ? { newLevel, newBooksDonated } : null);
      setDonations(prevDonations => prevDonations.filter(d => d.id !== selectedDonation.id));
      setShowVerifyModal(false);
      
      const levelUpMsg = leveledUp ? ` Level up to Level ${newLevel}! Mystery Box awarded!` : '';

      setVerifyForm({
        verifiedCount: 0, condition: 'good', notes: '', isComplete: true,
        awardPoints: 0, userLevel: 0, currentPoints: 0, userId: null, booksDonated: 0,
        category: ''
      });
      setValidationErrors({});

      // ===== REFRESH DATA FIRST =====
        category: '', isCraft: false, requestedPoints: 0
      });
      setValidationErrors({});

      await fetchAllData();

      if (downloadReceiptAfterVerify) {
        setTimeout(() => {
          downloadReceipt(selectedDonation);
        }, 500);
      }

      showToast(`Donation verified! ${points} points awarded.${levelUpMsg}`, 'success');

      // ===== FIX: Navigate to Bundle Management with session flag =====
      setTimeout(() => {
        // Set flag to indicate we're coming from verification
        sessionStorage.setItem('fromVerification', 'true');
        
        if (window.confirm(`✅ Donation verified successfully!\n\nBooks added to "${selectedCategory}" bundle.\n\nWould you like to go to Bundle Management to manage the books?`)) {
          navigate('/staff/bundle-management');

      const itemType = isCraft ? 'Craft' : 'Books';
      const displayCategory = isCraft ? selectedCategory.replace('Craft: ', '') : selectedCategory;
      const pointsAwarded = isCraft ? pointsToAward : (points?.total || 0);
      showToast(`Donation verified! ${pointsAwarded} points awarded. ${itemType} added to "${displayCategory}" bundle.${levelUpMsg}`, 'success');

      const finalBundleId = returnedBundleId || bundleIdForCategory;
      const navigationState = {
        bundleId: finalBundleId,
        category: selectedCategory,
        type: isCraft ? 'craft' : 'book',
        displayName: displayCategory,
        timestamp: Date.now()
      };
      
      console.log('Storing navigation state:', navigationState);
      sessionStorage.setItem('bundleNavigationState', JSON.stringify(navigationState));

      setTimeout(() => {
        sessionStorage.setItem('fromVerification', 'true');
        
        if (window.confirm(`Donation verified successfully!\n\n${itemType} added to "${displayCategory}" bundle.\n\nWould you like to go to Bundle Management to manage the items?`)) {
          navigate('/staff/bundle-management', { 
            state: {
              bundleId: finalBundleId,
              category: selectedCategory,
              type: isCraft ? 'craft' : 'book'
            }
          });
        } else {
          showToast('You can also go to Bundle Management from the sidebar.', 'info');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error verifying donation:', error);
      showToast('Failed to verify: ' + error.message, 'error');
    }
  };

  const handleRejectDonation = async () => {
    if (!selectedDonation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/donations/${selectedDonation.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          notes: verifyForm.notes || 'Rejected by staff'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject donation');
      }

      setDonations(prevDonations => prevDonations.filter(d => d.id !== selectedDonation.id));
      setShowVerifyModal(false);
      setSelectedDonation(null);
      setVerifyForm({
        verifiedCount: 0,
        condition: 'good',
        notes: '',
        isComplete: true,
        awardPoints: 0,
        userLevel: 0,
        currentPoints: 0,
        userId: null,
        category: ''
        booksDonated: 0,
        category: '',
        isCraft: false,
        requestedPoints: 0
      });
      setValidationErrors({});

      showToast('Donation rejected.', 'warning');
      fetchAllData();
      
    } catch (error) {
      console.error('Error rejecting donation:', error);
      showToast('Error rejecting donation: ' + error.message, 'error');
    }
  };

  const getUserInitials = () => {
    if (currentUser.name) {
      const names = currentUser.name.split(' ');
      if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
      return currentUser.name[0].toUpperCase();
    }
    return 'SU';
  };

  const downloadReceipt = (donation) => {
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    const isCraft = donation.category && donation.category.startsWith('Craft:');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation Receipt - ${donation.donor}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 40px; 
              background: white; 
              max-width: 700px; 
              margin: 0 auto;
              color: #1a1a1a;
            }
            .receipt {
              border: 2px solid #1E4D4B;
              border-radius: 16px;
              padding: 40px;
              position: relative;
            }
            .receipt-header {
              text-align: center;
              border-bottom: 2px solid #1E4D4B;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .receipt-title { font-size: 28px; color: #1E4D4B; font-weight: 700; }
            .receipt-subtitle { color: #6C757D; font-size: 14px; margin-top: 4px; }
            .receipt-number {
              position: absolute;
              top: 20px;
              right: 30px;
              font-size: 13px;
              color: #6C757D;
              background: #f8fafc;
              padding: 4px 12px;
              border-radius: 20px;
            }
            .receipt-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px 24px;
              margin: 20px 0;
            }
            .detail-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .detail-label { font-weight: 600; color: #495057; font-size: 13px; }
            .detail-value { font-size: 15px; margin-top: 2px; }
            .status-badge {
              display: inline-block;
              padding: 4px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              background: #28a745;
              color: white;
            }
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #e5e5e5;
              text-align: center;
              font-size: 12px;
              color: #6C757D;
            }
            .watermark {
              position: absolute;
              bottom: 40px;
              right: 40px;
              opacity: 0.05;
              font-size: 50px;
              font-weight: 700;
              color: #1E4D4B;
              pointer-events: none;
            }
            .print-btn {
              background: #1E4D4B;
              color: white;
              border: none;
              padding: 10px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 20px;
            }
            .print-btn:hover { background: #163a38; }
            @media print {
              .no-print { display: none; }
              body { padding: 20px; }
              .receipt { border-color: #ddd; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="watermark">RECEIPT</div>
            <div class="receipt-number">#${donation.id?.substring(0, 8) || 'N/A'}</div>
            
            <div class="receipt-header">
              <div class="receipt-title">Donation Receipt</div>
              <div class="receipt-subtitle">Thank you for your donation!</div>
            </div>

            <div class="receipt-details">
              <div class="detail-item">
                <div class="detail-label">Donor Name</div>
                <div class="detail-value"><strong>${donation.donor}</strong></div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date</div>
                <div class="detail-value">${new Date(donation.createdAt).toLocaleDateString()} at ${new Date(donation.createdAt).toLocaleTimeString()}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${donation.category || 'General'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${isCraft ? 'Craft' : 'Book'}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Quantity</div>
                <div class="detail-value"><strong>${donation.requestedCount || 0}</strong></div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Points Awarded</div>
                <div class="detail-value"><strong>${donation.estimatedPoints || 0} pts</strong></div>
                <div class="detail-value"><strong>${isCraft ? (donation.requestedPoints || donation.estimatedPoints || 0) : (donation.estimatedPoints || 0)} pts</strong></div>
              </div>
              ${donation.collectionName ? `
                <div class="detail-item" style="grid-column: span 2;">
                  <div class="detail-label">Collection</div>
                  <div class="detail-value">${donation.collectionName}</div>
                </div>
              ` : ''}
              ${donation.notes ? `
                <div class="detail-item" style="grid-column: span 2;">
                  <div class="detail-label">Notes</div>
                  <div class="detail-value">${donation.notes}</div>
                </div>
              ` : ''}
              <div class="detail-item" style="grid-column: span 2;">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status-badge">VERIFIED</span></div>
              </div>
            </div>

            <div style="text-align: center; margin: 16px 0; padding: 12px; background: #e8f5e9; border-radius: 8px;">
              <p style="font-size: 13px; color: #2E7D32; font-weight: 500;">
                This donation has been verified by staff.
              </p>
            </div>

            <div class="footer">
              <p>Verified by ${currentUser.name} on ${dateStr} at ${timeStr}</p>
              <p style="margin-top: 4px;">ShareShelf — Donation Receipt</p>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 16px;">
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
            <button class="print-btn" style="background: #6C757D; margin-left: 12px;" onclick="window.close()">Close</button>
          </div>

          <script>
            window.onload = function() {
              if (window.location.search.includes('print=true')) {
                setTimeout(function() { window.print(); }, 500);
              }
            }
          <\/script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to download the receipt.', 'error');
      return;
    }
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const pendingCount = donations.length;

  if (loading) {
    return (
      <StaffLayout>
        <div className="loading-container">
          <h2>Loading donations...</h2>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="content-header">
        <div>
          <h1>Donation Management</h1>
          <p className="page-subtitle">Review and award points for pending donation submissions</p>
        </div>
        {/* user-info div REMOVED - profile is already in StaffLayout top bar */}
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#1E4D4B', fontFamily: 'var(--font-family)' }}>Pending Donations</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              background: '#fff3e0', 
              color: '#e65100',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-family)'
            }}>
              {donations.filter(d => {
                const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
                const isCraft = d.category && d.category.startsWith('Craft:');
                let matchesType = true;
                if (typeFilter === 'BOOKS') matchesType = !isCraft;
                if (typeFilter === 'CRAFTS') matchesType = isCraft;
                return matchesSearch && matchesType;
              }).length} pending
            </span>
            <input
              type="text"
              placeholder="Search by donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '13px',
                width: '200px',
                outline: 'none',
                fontFamily: 'var(--font-family)'
              }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)'
              }}
            >
              <option value="ALL">All Items (Books & Crafts)</option>
              <option value="BOOKS">Books Only</option>
              <option value="CRAFTS">Crafts Only</option>
            </select>
          </div>
        </div>

        {donations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
            <p style={{ fontSize: '24px' }}>All caught up!</p>
            <p>No pending donations.</p>
            <p style={{ fontSize: '13px' }}>Check back later for new submissions.</p>
          </div>
        ) : donations.filter(d => {
          const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
          const isCraft = d.category && d.category.startsWith('Craft:');
          let matchesType = true;
          if (typeFilter === 'BOOKS') matchesType = !isCraft;
          if (typeFilter === 'CRAFTS') matchesType = isCraft;
          return matchesSearch && matchesType;
        }).length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
            <p style={{ fontSize: '24px' }}>No donations found</p>
            <p>No donations found matching criteria.</p>
          </div>
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Category</th>
                  <th>Type & Qty</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .filter(d => {
                    const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
                    const isCraft = d.category && d.category.startsWith('Craft:');
                    let matchesType = true;
                    if (typeFilter === 'BOOKS') matchesType = !isCraft;
                    if (typeFilter === 'CRAFTS') matchesType = isCraft;
                    return matchesSearch && matchesType;
                  })
                  .map((d) => {
                  const levelInfo = getLevelBadge(d.userLevel || 0);
                  const isCraft = d.category && d.category.startsWith('Craft:');
                  const displayPoints = isCraft ? (d.requestedPoints || d.estimatedPoints || 0) : (d.estimatedPoints || 0);
                  return (
                    <tr key={d.id}>
                      <td>
                        <div>
                          <strong style={{ fontFamily: 'var(--font-family)' }}>{d.donor}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
                            {levelInfo.label}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-family)' }}>{d.category || 'General'}</td>
                      <td style={{ fontFamily: 'var(--font-family)' }}>
                        {isCraft ? (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#FFF3E0',
                            color: '#E65100',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Craft • {d.requestedCount || 0}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            Book • {d.requestedCount || 0}
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-family)', fontWeight: '600' }}>
                        {displayPoints} pts
                      </td>
                      <td>
                        <span className="status-badge draft">Pending</span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-light)', fontFamily: 'var(--font-family)' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="action-group">
                          <button 
                            className="btn-small"
                            onClick={() => handleVerifyDonation(d)}
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Showing {donations.filter(d => {
            const matchesSearch = !searchTerm || d.donor.toLowerCase().includes(searchTerm.toLowerCase());
            const isCraft = d.category && d.category.startsWith('Craft:');
            let matchesType = true;
            if (typeFilter === 'BOOKS') matchesType = !isCraft;
            if (typeFilter === 'CRAFTS') matchesType = isCraft;
            return matchesSearch && matchesType;
          }).length} pending donations</span>
        </div>
      </div>

      {showVerifyModal && selectedDonation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <h2 style={{ color: '#1E4D4B', marginBottom: '8px', fontFamily: 'var(--font-family)' }}>Verify Donation</h2>
            <p className="modal-subtitle" style={{ color: 'var(--text-light)', marginBottom: '20px', fontFamily: 'var(--font-family)' }}>
              Review donation from <strong>{selectedDonation.donor}</strong>
            </p>

            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ color: '#1E4D4B', marginBottom: '12px', fontFamily: 'var(--font-family)' }}>Donation Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', fontFamily: 'var(--font-family)' }}>
                <p><strong>Type:</strong> {selectedDonation.type || 'SINGLE_BOOK'}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Items Submitted:</strong> {selectedDonation.requestedCount}</p>
                <p><strong>Est. Points:</strong> {selectedDonation.estimatedPoints}</p>
                {selectedDonation.category && selectedDonation.category.startsWith('Craft:') && (
                  <p><strong>User Requested Points:</strong> {selectedDonation.requestedPoints || selectedDonation.estimatedPoints || 0}</p>
                )}
                <p><strong>Current Level:</strong> {getLevelBadge(selectedDonation.userLevel || 0).label}</p>
                <p><strong>Current Points:</strong> {selectedDonation.userPoints || 0}</p>
                {selectedDonation.collectionName && <p><strong>Collection:</strong> {selectedDonation.collectionName}</p>}
                {selectedDonation.notes && <p><strong>Notes:</strong> {selectedDonation.notes}</p>}
              </div>

            {selectedDonation.donationImages && selectedDonation.donationImages.length > 0 && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-family)' }}>
                  Donor Photos ({selectedDonation.donationImages.length})
                </h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedDonation.donationImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Donation photo ${i + 1}`}
                      style={{
                        width: 100, height: 100, objectFit: 'cover',
                        borderRadius: 8, border: '1px solid #DEE2E6',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
              {(() => {
                const newBooksDonated = (selectedDonation.booksDonated || 0) + (verifyForm.verifiedCount || 0);
                const predictedLevel = calculateLevelByBooks(newBooksDonated);
                const willLevelUp = predictedLevel > (selectedDonation.userLevel || 0);
                const mbInfo = getMysteryBoxInfoForLevel(predictedLevel);
                return (
                  <div style={{ marginTop: '12px', padding: '12px', background: willLevelUp ? '#FFF3E0' : '#F5F5F5', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font-family)' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: '600' }}>
                      After Verification: Level {predictedLevel} ({getLevelBadge(predictedLevel).label})
                      {willLevelUp && <span style={{ color: '#E65100', marginLeft: 8 }}>Level Up!</span>}
                    </p>
                    {willLevelUp && mbInfo && (
                      <p style={{ margin: 0, color: '#E65100' }}>
                        Mystery Box: {mbInfo.unlock} ({mbInfo.books} books) - Costs {mbInfo.points} pts to claim
                      </p>
                    )}
                    {willLevelUp && !mbInfo && (
                      <p style={{ margin: 0, color: '#666' }}>No mystery box configured for Level {predictedLevel}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ===== VERIFIED COUNT WITH VALIDATION ===== */}
            {/* ===== VERIFIED COUNT ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                {selectedDonation.category && selectedDonation.category.startsWith('Craft:') ? 'Actual Crafts Received' : 'Actual Books Received'}
                <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="number"
                className="form-control"
                value={verifyForm.verifiedCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0;
                  const isCraft = selectedDonation.category && selectedDonation.category.startsWith('Craft:');
                  
                  let points;
                  if (isCraft) {
                    const userPoints = selectedDonation.requestedPoints || selectedDonation.estimatedPoints || 0;
                    points = userPoints;
                  } else {
                    const calcPoints = calculatePoints(count, verifyForm.isComplete && selectedDonation.type === 'COLLECTION', false, 0);
                    points = calcPoints.total;
                  }
                  
                  setVerifyForm({ 
                    ...verifyForm, 
                    verifiedCount: count,
                    awardPoints: points
                  });
                  // Clear validation error when user types
                  if (validationErrors.verifiedCount) {
                    setValidationErrors({ ...validationErrors, verifiedCount: '' });
                  }
                }}
                min="0"
                max={selectedDonation?.requestedCount || 0}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${validationErrors.verifiedCount ? '#dc3545' : 'var(--border-light)'}`,
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-family)'
                }}
              />
              {validationErrors.verifiedCount && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                  {validationErrors.verifiedCount}
                </p>
              )}
              <p style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                Max allowed: {selectedDonation?.requestedCount || 0} books
              </p>
            </div>

            {/* ===== CONDITION WITH VALIDATION ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                Book Condition <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
                Max allowed: {selectedDonation?.requestedCount || 0} items
              </p>
            </div>

            {/* ===== CONDITION ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                Condition <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
              </label>
              <select
                className="form-control"
                value={verifyForm.condition}
                onChange={(e) => {
                  setVerifyForm({ ...verifyForm, condition: e.target.value });
                  if (validationErrors.condition) {
                    setValidationErrors({ ...validationErrors, condition: '' });
                  }
                }}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${validationErrors.condition ? '#dc3545' : 'var(--border-light)'}`,
                  borderRadius: '8px', 
                  fontFamily: 'var(--font-family)' 
                }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
              {validationErrors.condition && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                  {validationErrors.condition}
                </p>
              )}
            </div>

            {/* ===== CATEGORY WITH VALIDATION ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                Book Category {!selectedDonation?.category?.startsWith('Craft:') && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
              </label>
              {selectedDonation.category && selectedDonation.category.startsWith('Craft:') ? (
                <div style={{
                  padding: '10px 14px',
                  background: '#f0f7f6',
                  borderRadius: '8px',
                  border: '1px solid #b2dfdb',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#1E4D4B',
                  fontFamily: 'var(--font-family)'
                }}>
                  {selectedDonation.category}
                </div>
              ) : (
                <>
                  <select
                    className="form-control"
                    value={verifyForm.category || selectedDonation.category || ''}
                    onChange={(e) => {
                      setVerifyForm({ ...verifyForm, category: e.target.value });
                      if (validationErrors.category) {
                        setValidationErrors({ ...validationErrors, category: '' });
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '10px 14px', 
                      border: `1px solid ${validationErrors.category ? '#dc3545' : 'var(--border-light)'}`,
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontFamily: 'var(--font-family)',
                      background: 'white'
                    }}
                  >
                    <option value="">Select a category...</option>
                    {BOOK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                      {validationErrors.category}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ===== DOWNLOAD RECEIPT CHECKBOX ===== */}
            {/* ===== CATEGORY WITH FIXED VALIDATION ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>
                Category <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>
              </label>
              
              {selectedDonation.category && selectedDonation.category.startsWith('Craft:') ? (
                <select
                  className="form-control"
                  value={verifyForm.category || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setVerifyForm({ ...verifyForm, category: value });
                    // Clear validation error when user selects a value
                    if (validationErrors.category && value && value !== '') {
                      setValidationErrors({ ...validationErrors, category: '' });
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${validationErrors.category ? '#dc3545' : 'var(--border-light)'}`,
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-family)',
                    background: 'white'
                  }}
                >
                  <option value="">Select a craft category...</option>
                  {CRAFT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="form-control"
                  value={verifyForm.category || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setVerifyForm({ ...verifyForm, category: value });
                    // Clear validation error when user selects a value
                    if (validationErrors.category && value && value !== '') {
                      setValidationErrors({ ...validationErrors, category: '' });
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${validationErrors.category ? '#dc3545' : 'var(--border-light)'}`,
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-family)',
                    background: 'white'
                  }}
                >
                  <option value="">Select a book category...</option>
                  {BOOK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.category && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', fontFamily: 'var(--font-family)' }}>
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* ===== DOWNLOAD RECEIPT ===== */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
                <input
                  type="checkbox"
                  checked={downloadReceiptAfterVerify}
                  onChange={(e) => setDownloadReceiptAfterVerify(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Download Receipt after verification</span>
              </label>
              <p style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px', marginLeft: '26px', fontFamily: 'var(--font-family)' }}>
                A printable receipt will be generated for the donor after verification
              </p>
            </div>

            {/* ===== COLLECTION COMPLETE ===== */}
            {selectedDonation.type === 'COLLECTION' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-family)' }}>
                  <input
                    type="checkbox"
                    checked={verifyForm.isComplete}
                    onChange={(e) => {
                      const isComplete = e.target.checked;
                      const isCraft = selectedDonation.category && selectedDonation.category.startsWith('Craft:');
                      let points;
                      if (isCraft) {
                        points = selectedDonation.requestedPoints || selectedDonation.estimatedPoints || 0;
                      } else {
                        const calcPoints = calculatePoints(verifyForm.verifiedCount, isComplete, false, 0);
                        points = calcPoints.total;
                      }
                      setVerifyForm({ 
                        ...verifyForm, 
                        isComplete,
                        awardPoints: points
                      });
                    }}
                  />
                  Collection Complete? ({parseInt(systemConfig.COLLECTION_BONUS_PERCENTAGE) || 10}% bonus if complete)
                </label>
              </div>
            )}

            {/* ===== STAFF NOTES ===== */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>Staff Notes</label>
              <textarea
                className="form-control"
                value={verifyForm.notes}
                onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                placeholder="Optional notes..."
                rows="2"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-light)', borderRadius: '8px', fontFamily: 'var(--font-family)' }}
              />
            </div>

            {/* ===== POINTS TO AWARD ===== */}
            <div style={{ 
              padding: '16px', 
              background: '#e8f5e9', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              fontFamily: 'var(--font-family)'
            }}>
              <span style={{ fontWeight: '500' }}>Points to Award:</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#1E4D4B' }}>
                {verifyForm.awardPoints}
              </span>
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowVerifyModal(false); setSelectedDonation(null); setValidationErrors({}); }}>Cancel</button>
              <button className="btn-reject" onClick={handleRejectDonation}>Reject</button>
              <button className="btn-save" onClick={handleConfirmVerification}>Verify & Award Points</button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}

export default DonationSchedule;
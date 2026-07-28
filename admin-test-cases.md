# Admin Pages — Manual Test Cases

> **Platform:** Book Donation & Exchange Platform  
> **Role Under Test:** `PLATFORM_ADMIN`  
> **Environment:** http://localhost:5173 (dev) / production URL  

---

## Pre-requisites

- A `PLATFORM_ADMIN` account is created in the database
- A regular `END_USER` account exists (for access-denied tests)
- Browser is logged out initially
- Backend server is running

---

## Section 1: Admin Authentication & Access Control

### TC-AUTH-01: Login with valid admin credentials
| Field | Value |
|-------|-------|
| **Preconditions** | Admin account exists with email `admin@example.com` |
| **Steps** | 1. Navigate to `/login` |
| | 2. Enter valid admin email and password |
| | 3. Click "Sign In" |
| **Expected** | User is redirected to `/admin/dashboard`. Sidebar shows "Analytics", "User Management", "Reviews", "Reports", "System Config". |
| **Actual** | |

### TC-AUTH-02: Login with invalid email
| Field | Value |
|-------|-------|
| **Preconditions** | None |
| **Steps** | 1. Navigate to `/login` |
| | 2. Enter `nonexistent@example.com` |
| | 3. Enter any password |
| | 4. Click "Sign In" |
| **Expected** | Error message is displayed (e.g., "Invalid email or password"). User stays on login page. |
| **Actual** | |

### TC-AUTH-03: Login with wrong password
| Field | Value |
|-------|-------|
| **Preconditions** | Admin account exists |
| **Steps** | 1. Navigate to `/login` |
| | 2. Enter correct admin email |
| | 3. Enter incorrect password |
| | 4. Click "Sign In" |
| **Expected** | Error message is displayed. User stays on login page. No redirect occurs. |
| **Actual** | |

### TC-AUTH-04: Access admin URL without logging in
| Field | Value |
|-------|-------|
| **Preconditions** | User is not logged in (no token in localStorage) |
| **Steps** | 1. Open browser, clear all site data |
| | 2. Navigate directly to `/admin/dashboard` |
| **Expected** | User is redirected to `/login?redirect=%2Fadmin%2Fdashboard` |
| **Actual** | |

### TC-AUTH-05: Non-admin user cannot access admin pages
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as regular `END_USER` |
| **Steps** | 1. Login as a user with role `END_USER` |
| | 2. Navigate to `/admin/dashboard` |
| **Expected** | User is redirected away (to `/user-dashboard` or `/`). Admin content is not rendered. |
| **Actual** | |

### TC-AUTH-06: Expired/tampered token is rejected
| Field | Value |
|-------|-------|
| **Preconditions** | User has an admin token in localStorage |
| **Steps** | 1. Open DevTools → Application → Local Storage |
| | 2. Manually edit the `token` value to `invalid-token` |
| | 3. Refresh the page |
| **Expected** | User is redirected to `/login`. OR an error toast "Your session has expired" is shown. |
| **Actual** | |

### TC-AUTH-07: Logout clears session
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Click "Sign Out" in the sidebar footer |
| **Expected** | User is redirected to home page. localStorage `token` and `user` are removed. Navigating to `/admin/dashboard` redirects to login. |
| **Actual** | |

### TC-AUTH-08: Direct API access without token returns 401
| Field | Value |
|-------|-------|
| **Preconditions** | No token in localStorage |
| **Steps** | 1. Open DevTools → Network tab |
| | 2. Navigate to any admin page |
| | 3. Observe the API call to `/api/admin/dashboard` (or similar) |
| **Expected** | API returns HTTP 401. Frontend shows error state or redirects. |
| **Actual** | |

---

## Section 2: Admin Dashboard (Analytics)

### TC-DASH-01: Dashboard loads successfully
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin. Some donation data exists in the system. |
| **Steps** | 1. Navigate to `/admin/dashboard` |
| | 2. Wait for page to fully load |
| **Expected** | Loading spinner appears briefly, then dashboard renders with: 4 hero stat boxes (Books Donated, Active Readers, Points Issued, Craft Listings), 6 metric cards, performance bar chart, genre distribution list, recent donations table. No error toasts appear. |
| **Actual** | |

### TC-DASH-02: Metric cards display correct values
| Field | Value |
|-------|-------|
| **Preconditions** | Dashboard is loaded |
| **Steps** | 1. Observe the six metric cards: Total Books Donated, Active Readers, Total Orders Placed, LKR Earned, Points Issued, Craft Listings |
| **Expected** | All values are numbers (not blank, not "NaN", not "0" if data exists). Currency is in LKR format. Points show both issued and spent. |
| **Actual** | |

### TC-DASH-03: Performance chart tab switching
| Field | Value |
|-------|-------|
| **Preconditions** | Dashboard is loaded |
| **Steps** | 1. Click "Daily" tab |
| | 2. Click "Monthly" tab |
| | 3. Click "Yearly" tab |
| **Expected** | Each tab shows a different bar chart. Daily shows last 30 days. Monthly shows last 6 months. Yearly shows last 5 years. Active tab button is highlighted. Chart updates smoothly. |
| **Actual** | |

### TC-DASH-04: Genre distribution displays correctly
| Field | Value |
|-------|-------|
| **Preconditions** | Books with various genres exist in the system |
| **Steps** | 1. Scroll to "Popular Genres" section |
| **Expected** | Genres are listed sorted by count (most first). Each has a name, percentage, and colored progress bar. Percentages add up to ~100%. |
| **Actual** | |

### TC-DASH-05: Recent Donations table works
| Field | Value |
|-------|-------|
| **Preconditions** | At least one donation exists |
| **Steps** | 1. Scroll to "Recent Donations Activity" table |
| **Expected** | Table shows Transaction ID, Donor Name, Quantity, Status, Points, Date. Status pills show correct colors (Verified=green, Pending=yellow, Flagged=red). Row count badge shows correct number. |
| **Actual** | |

### TC-DASH-06: Dashboard with zero data
| Field | Value |
|-------|-------|
| **Preconditions** | Database has no donations, no users, no orders |
| **Steps** | 1. Load `/admin/dashboard` |
| **Expected** | Page loads without crashing. All metric values show "0". Genre section shows "No genre data yet". Table shows "No recent donations recorded." No loading spinner stuck. |
| **Actual** | |

### TC-DASH-07: Dashboard error state (backend down)
| Field | Value |
|-------|-------|
| **Preconditions** | Backend server is stopped |
| **Steps** | 1. Stop the backend server |
| | 2. Navigate to `/admin/dashboard` |
| **Expected** | Loading spinner appears, then error banner "Failed to load dashboard data. Please try again." is shown with red background. Error toast also appears. |
| **Actual** | |

### TC-DASH-08: Only one toast on dashboard load
| Field | Value |
|-------|-------|
| **Preconditions** | Backend is running, dashboard has not been visited this session |
| **Steps** | 1. Clear all site data and login as admin |
| | 2. Navigate to `/admin/dashboard` |
| | 3. Wait for page to fully load |
| **Expected** | Only ONE toast notification appears (if any). No duplicate "Analytics dashboard loaded" toasts. ✓ This was a previously reported bug — now fixed. |
| **Actual** | |

---

## Section 3: User Management

### TC-UM-01: User list loads
| Field | Value |
|-------|-------|
| **Preconditions** | Multiple users exist in the database with different roles |
| **Steps** | 1. Navigate to `/admin/users` |
| | 2. Wait for table to render |
| **Expected** | Table shows users columns: User ID, Name, Role, Status, Level, Points Balance, Actions. Records badge shows correct count. Hero stats show Total Users, Active Users, Admins, Total Points. |
| **Actual** | |

### TC-UM-02: Search by name
| Field | Value |
|-------|-------|
| **Preconditions** | A user named "John Doe" exists |
| **Steps** | 1. Type "John" into the search box |
| **Expected** | Table filters to show only users matching "John" in name, email, or ID. Records count updates. Pagination resets to page 1. |
| **Actual** | |

### TC-UM-03: Search by email
| Field | Value |
|-------|-------|
| **Preconditions** | A user with email "jane@example.com" exists |
| **Steps** | 1. Type "jane@example.com" into the search box |
| **Expected** | Table filters to show only the matching user. |
| **Actual** | |

### TC-UM-04: Search with no results
| Field | Value |
|-------|-------|
| **Preconditions** | None |
| **Steps** | 1. Type `zzz_nonexistent_zzz` into the search box |
| **Expected** | Table shows "No users found matching your filters." message. Records badge shows "0 users found". |
| **Actual** | |

### TC-UM-05: Role filter
| Field | Value |
|-------|-------|
| **Preconditions** | Users with various roles exist |
| **Steps** | 1. Select "Platform Admin" from the Role dropdown |
| **Expected** | Table shows only users with the role `PLATFORM_ADMIN`. Records count updates. |
| **Actual** | |

### TC-UM-06: Status filter
| Field | Value |
|-------|-------|
| **Preconditions** | Both Active and Deactivated users exist |
| **Steps** | 1. Select "Deactivated" from the Status dropdown |
| **Expected** | Table shows only deactivated users. Status badge shows "Deactivated". |
| **Actual** | |

### TC-UM-07: Combined filters
| Field | Value |
|-------|-------|
| **Preconditions** | Users exist with various roles and statuses |
| **Steps** | 1. Select role "End User" |
| | 2. Select status "Active" |
| | 3. Type a partial name in search |
| **Expected** | All three filters apply together (AND logic). Results match all criteria. |
| **Actual** | |

### TC-UM-08: Add a new user
| Field | Value |
|-------|-------|
| **Preconditions** | None |
| **Steps** | 1. Click "Add New User" button |
| | 2. Fill in: Name = "Test User", Email = "test@example.com", Password = "password123", Role = "End User" |
| | 3. Click "Create User" |
| **Expected** | Modal closes. Success toast "User created successfully." New user appears in the list. |
| **Actual** | |

### TC-UM-09: Add user with empty fields
| Field | Value |
|-------|-------|
| **Preconditions** | None |
| **Steps** | 1. Click "Add New User" |
| | 2. Leave all fields empty |
| | 3. Click "Create User" |
| **Expected** | Browser's native validation prevents submission, OR server returns validation error displayed in the modal. |
| **Actual** | |

### TC-UM-10: Edit an existing user
| Field | Value |
|-------|-------|
| **Preconditions** | A user exists |
| **Steps** | 1. Click "Edit" on any user row |
| | 2. Change the user's name |
| | 3. Click "Save Changes" |
| **Expected** | Modal closes. Success toast appears. Table reflects the updated name. |
| **Actual** | |

### TC-UM-11: Toggle user active/deactivated
| Field | Value |
|-------|-------|
| **Preconditions** | An active user exists |
| **Steps** | 1. Click "Deactivate" on an active user |
| **Expected** | Success toast "User status updated successfully." Badge changes to "Deactivated" with red styling. Button text changes to "Activate". |
| **Actual** | |

### TC-UM-12: Delete a user
| Field | Value |
|-------|-------|
| **Preconditions** | A non-critical test user exists |
| **Steps** | 1. Click "Delete" on a user |
| | 2. In the browser confirm dialog, click "OK" |
| **Expected** | Success toast "User deleted successfully." User is removed from the list. |
| **Actual** | |

### TC-UM-13: Cancel delete
| Field | Value |
|-------|-------|
| **Preconditions** | A user exists |
| **Steps** | 1. Click "Delete" on a user |
| | 2. In the browser confirm dialog, click "Cancel" |
| **Expected** | No toast appears. User remains in the list unchanged. |
| **Actual** | |

### TC-UM-14: Pagination
| Field | Value |
|-------|-------|
| **Preconditions** | More than 10 users exist |
| **Steps** | 1. Navigate to User Management |
| | 2. Click page "2" in pagination |
| **Expected** | Table shows the next 10 users. Pagination info updates (e.g., "Showing 11-20 of 25 users"). Active page button is highlighted. |
| **Actual** | |

---

## Section 4: Review Management

### TC-RM-01: Reviews list loads
| Field | Value |
|-------|-------|
| **Preconditions** | Reviews exist in the database |
| **Steps** | 1. Navigate to `/admin/reviews` |
| **Expected** | Table shows: Reviewer, Rating (star icons), Comment, Status (Approved/Pending), Date, Actions. Hero stats show Total Reviews, Approved, Pending, Avg Rating. |
| **Actual** | |

### TC-RM-02: Approve a pending review
| Field | Value |
|-------|-------|
| **Preconditions** | At least one review with status "Pending" |
| **Steps** | 1. Click "Approve" on a pending review |
| **Expected** | Toast "Review approval status updated." Badge changes from "Pending" (yellow) to "Approved" (green). Button text changes to "Reject". |
| **Actual** | |

### TC-RM-03: Reject (unapprove) an approved review
| Field | Value |
|-------|-------|
| **Preconditions** | At least one approved review |
| **Steps** | 1. Click "Reject" on an approved review |
| **Expected** | Badge changes from "Approved" to "Pending". Button text changes to "Approve". |
| **Actual** | |

### TC-RM-04: Delete a review
| Field | Value |
|-------|-------|
| **Preconditions** | A review exists |
| **Steps** | 1. Click "Delete" on a review |
| | 2. In the confirmation modal, click "Delete Review" |
| **Expected** | Modal closes. Toast "Review deleted successfully." Review is removed from the list. |
| **Actual** | |

### TC-RM-05: Cancel delete review
| Field | Value |
|-------|-------|
| **Preconditions** | A review exists |
| **Steps** | 1. Click "Delete" on a review |
| | 2. Click "Cancel" in the confirmation modal |
| | 3. OR click outside the modal overlay |
| **Expected** | Modal closes. Review remains in the list. |
| **Actual** | |

### TC-RM-06: Filter by status
| Field | Value |
|-------|-------|
| **Preconditions** | Both Approved and Pending reviews exist |
| **Steps** | 1. Select "Approved" from the Status dropdown |
| **Expected** | Table shows only approved reviews. Filter indicator updates. |
| **Actual** | |

### TC-RM-07: Filter by rating
| Field | Value |
|-------|-------|
| **Preconditions** | Reviews with various ratings exist |
| **Steps** | 1. Select "5 Stars" from the Rating dropdown |
| **Expected** | Table shows only 5-star reviews. |
| **Actual** | |

### TC-RM-08: Search reviews
| Field | Value |
|-------|-------|
| **Preconditions** | A review contains the word "great" in the comment |
| **Steps** | 1. Type "great" in the search box |
| **Expected** | Table filters to reviews where name, email, or comment matches "great". |
| **Actual** | |

---

## Section 5: Custom Report Generation

### TC-REP-01: Default report type is System Logs
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Navigate to `/admin/reports/custom` |
| **Expected** | Report Type dropdown shows "System Logs" as selected. Preview area shows "Click 'Preview Report' to see your data here". |
| **Actual** | |

### TC-REP-02: Preview System Logs report
| Field | Value |
|-------|-------|
| **Preconditions** | Staff users exist and have logged in/out (LoginLog entries exist) |
| **Steps** | 1. Ensure Report Type is "System Logs" |
| | 2. Click "Preview Report" |
| **Expected** | Loading overlay appears briefly. Report displays with title "System Activity Logs", subtitle, and table with columns: Staff Member, Email, Role, Last Login, Last Logout. Chart shows login counts per role. "Live Preview Mode" badge appears. |
| **Actual** | |

### TC-REP-03: Preview error handling
| Field | Value |
|-------|-------|
| **Preconditions** | Backend is down or report query fails |
| **Steps** | 1. Stop backend server |
| | 2. Click "Preview Report" for any report type |
| **Expected** | Error message appears in red. Message is descriptive (e.g., "Server error: Unable to generate 'System Logs' report..."). No unhandled crashes. |
| **Actual** | |

### TC-REP-04: Different report types load correctly
| Field | Value |
|-------|-------|
| **Preconditions** | System has donations, orders, and user data |
| **Steps** | For each report type: |
| | 1. Select report type from dropdown |
| | 2. Click "Preview Report" |
| | 3. Verify table and chart render |
| **Expected** | All report types load successfully: Total Points Provided, Total Deliveries, Most Popular Collections, Top Users Who Level Up. Each shows appropriate columns and chart. |
| **Actual** | |

### TC-REP-05: Export CSV
| Field | Value |
|-------|-------|
| **Preconditions** | Report data has been previewed |
| **Steps** | 1. Preview a report |
| | 2. Select Export Format = "CSV" |
| | 3. Click "Export CSV" |
| **Expected** | A `.csv` file is downloaded. Opening it in a spreadsheet shows the same data as the preview. |
| **Actual** | |

### TC-REP-06: Export JSON
| Field | Value |
|-------|-------|
| **Preconditions** | Report data has been previewed |
| **Steps** | 1. Preview a report |
| | 2. Select Export Format = "JSON" |
| | 3. Click "Export JSON" |
| **Expected** | A `.json` file is downloaded. Opening it shows valid JSON with title, subtitle, headers, rows, and generated timestamp. |
| **Actual** | |

### TC-REP-07: Export PDF
| Field | Value |
|-------|-------|
| **Preconditions** | Report data has been previewed |
| **Steps** | 1. Preview a report |
| | 2. Select Export Format = "PDF" |
| | 3. Click "Export PDF" |
| **Expected** | Browser's print dialog opens with a formatted document preview. User can "Save as PDF". |
| **Actual** | |

### TC-REP-08: Export without preview shows error
| Field | Value |
|-------|-------|
| **Preconditions** | No report has been previewed in this session |
| **Steps** | 1. Navigate to Reports page (fresh load) |
| | 2. Without clicking "Preview Report", click "Export PDF" (or CSV/JSON) |
| **Expected** | Error message "Please preview the report first." is displayed in red. No download occurs. |
| **Actual** | |

### TC-REP-09: Date range filtering
| Field | Value |
|-------|-------|
| **Preconditions** | System has data from different time periods |
| **Steps** | 1. Set a narrow date range (e.g., last week) |
| | 2. Set a wide date range (e.g., full year) |
| | 3. Click "Preview Report" for each |
| **Expected** | Narrow range returns fewer/filtered results. Wide range returns more results. The date span is shown in the report metadata. |
| **Actual** | |

### TC-REP-10: Anonymize users checkbox
| Field | Value |
|-------|-------|
| **Preconditions** | Report data contains user emails |
| **Steps** | 1. Preview "Top Users Who Level Up" report |
| | 2. Check "Anonymize user IDs" |
| **Expected** | Email addresses in the report are masked (e.g., `jo***@example.com`). Toggling the checkbox updates the preview immediately. |
| **Actual** | |

---

## Section 6: System Configuration

### TC-CFG-01: Configuration loads
| Field | Value |
|-------|-------|
| **Preconditions** | System config exists in the database |
| **Steps** | 1. Navigate to `/admin/config` |
| **Expected** | Loading spinner appears briefly. Then the form loads with values populated: Point & Economics settings, Level tiers, Mystery Box configs. Hero stats show Levels count, Mystery Boxes count, Base Points, Box Cost. |
| **Actual** | |

### TC-CFG-02: Edit point rate
| Field | Value |
|-------|-------|
| **Preconditions** | Config page is loaded |
| **Steps** | 1. Change "Base Points Per Book" to a different value (e.g., 20) |
| | 2. Click "Save System Rules" |
| **Expected** | Success toast "System configuration saved successfully!" appears. On page refresh, the new value persists. |
| **Actual** | |

### TC-CFG-03: Add a new level tier
| Field | Value |
|-------|-------|
| **Preconditions** | Config page is loaded |
| **Steps** | 1. In the "Gamification & Levels" section, click "Add New Tier" |
| | 2. Fill in the new row: Level Name = "Book Worm", Min Books = "50", Reward = "Exclusive Badge" |
| | 3. Click "Save System Rules" |
| **Expected** | New level appears in the table. Hero stat "Levels" count increases. On refresh, level persists. |
| **Actual** | |

### TC-CFG-04: Delete a level tier
| Field | Value |
|-------|-------|
| **Preconditions** | At least two level tiers exist |
| **Steps** | 1. Click the X button on a level row |
| | 2. Click "Save System Rules" |
| **Expected** | Level row is removed. Hero stat "Levels" count decreases. |
| **Actual** | |

### TC-CFG-05: Add mystery box configuration
| Field | Value |
|-------|-------|
| **Preconditions** | Level tiers exist and have unlocks configured |
| **Steps** | 1. In the "Mystery Box — Per Level Configuration" section, click "Add Mystery Box for Level..." |
| | 2. Fill in Points Cost and Books count |
| | 3. Optionally add book titles |
| | 4. Click "Save System Rules" |
| **Expected** | New mystery box card appears. Hero stat "Mystery Boxes" count increases. |
| **Actual** | |

### TC-CFG-06: Cancel changes resets form
| Field | Value |
|-------|-------|
| **Preconditions** | Config page is loaded with saved values |
| **Steps** | 1. Change several field values |
| | 2. Click "Cancel Changes" |
| **Expected** | All fields revert to their previously saved values. No save occurs. |
| **Actual** | |

### TC-CFG-07: Invalid numeric input
| Field | Value |
|-------|-------|
| **Preconditions** | Config page is loaded |
| **Steps** | 1. Enter negative number in "Base Points Per Book" |
| | 2. Click "Save System Rules" |
| **Expected** | Either the field prevents negative values (input `min="0"`), OR the server returns an error and a message is displayed. |
| **Actual** | |

### TC-CFG-08: Mystery box unlock configuration
| Field | Value |
|-------|-------|
| **Preconditions** | Config page is loaded |
| **Steps** | 1. Scroll to "Level Unlocks & Rare Access" |
| | 2. Click "Add Level Unlock" |
| | 3. Enter Level number and unlock description |
| | 4. Click "Save System Rules" |
| **Expected** | New unlock row appears and persists after save. |
| **Actual** | |

---

## Section 7: Admin Profile

### TC-PROF-01: Profile loads with user data
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Click user avatar → "Profile" from the dropdown menu |
| | OR navigate to `/admin/profile` |
| **Expected** | Profile page shows admin's name, email (readonly), role as "Platform Administrator". Avatar shows initials or profile image. |
| **Actual** | |

### TC-PROF-02: Edit name
| Field | Value |
|-------|-------|
| **Preconditions** | Profile page is loaded |
| **Steps** | 1. Change the "Full Name" field |
| | 2. Click "Save Changes" |
| **Expected** | Success toast "Profile updated successfully!" Sidebar and top bar reflect the new name immediately. On refresh, new name persists. |
| **Actual** | |

### TC-PROF-03: Cancel resets changes
| Field | Value |
|-------|-------|
| **Preconditions** | Profile page is loaded |
| **Steps** | 1. Change the name field |
| | 2. Click "Cancel" |
| **Expected** | Name reverts to original saved value. |
| **Actual** | |

### TC-PROF-04: Upload profile image
| Field | Value |
|-------|-------|
| **Preconditions** | A valid image file (JPG/PNG, under 5MB) is available |
| **Steps** | 1. Click "Change" on the avatar |
| | 2. Select an image file |
| | 3. Click "Save Changes" |
| **Expected** | Avatar preview updates. After save, new image is displayed. Sidebar avatar also updates. |
| **Actual** | |

### TC-PROF-05: Upload non-image file is rejected
| Field | Value |
|-------|-------|
| **Preconditions** | A non-image file (e.g., .txt, .pdf) is available |
| **Steps** | 1. Click "Change" on the avatar |
| | 2. Select a .txt or .pdf file |
| **Expected** | Error message "Please select an image file." appears. No upload occurs. File input is cleared. |
| **Actual** | |

### TC-PROF-06: Upload oversized file is rejected
| Field | Value |
|-------|-------|
| **Preconditions** | An image file larger than 5MB is available |
| **Steps** | 1. Click "Change" on the avatar |
| | 2. Select a >5MB image |
| **Expected** | Error message "Image must be under 5MB." appears. No upload occurs. |
| **Actual** | |

### TC-PROF-07: Corrupt localStorage is handled gracefully
| Field | Value |
|-------|-------|
| **Preconditions** | None |
| **Steps** | 1. Open DevTools → Application → Local Storage |
| | 2. Set the `user` key value to `{invalid json` (malformed) |
| | 3. Refresh the profile page |
| **Expected** | Page does not crash. An error message "Invalid user data. Please log in again." is displayed. |
| **Actual** | |

---

## Section 8: Admin Layout & Navigation

### TC-SIDE-01: Sidebar navigation works
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Click each nav item in the sidebar: Analytics, User Management, Reviews, Reports, System Config |
| **Expected** | Each click navigates to the correct route. Active nav item is highlighted with a teal bar and bold text. Page content updates correctly. |
| **Actual** | |

### TC-SIDE-02: User dropdown menu
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Click the user avatar/name in the top-right corner |
| **Expected** | Dropdown shows user name, "Administrator" label, "Profile" link, and "Sign Out" button. Clicking outside closes the dropdown. |
| **Actual** | |

### TC-SIDE-03: Mobile responsive sidebar
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin, viewport is narrow (mobile) |
| **Steps** | 1. Open DevTools → toggle device toolbar (mobile view) |
| | 2. Observe the sidebar |
| | 3. Click the hamburger menu ☰ |
| **Expected** | Sidebar is hidden by default. Hamburger menu is visible. Clicking ☰ opens the sidebar as an overlay. Clicking overlay or a nav link closes sidebar. |
| **Actual** | |

### TC-SIDE-04: Sign out from dropdown
| Field | Value |
|-------|-------|
| **Preconditions** | Logged in as admin |
| **Steps** | 1. Click user avatar → "Sign Out" |
| **Expected** | User is signed out and redirected to home page. All localStorage auth items are cleared. |
| **Actual** | |

---

## Test Execution Log

| Test ID | Date | Tester | Result (Pass/Fail) | Notes / Bug Ref |
|---------|------|--------|--------------------|-----------------|
| TC-AUTH-01 | | | | |
| TC-AUTH-02 | | | | |
| TC-AUTH-03 | | | | |
| TC-AUTH-04 | | | | |
| TC-AUTH-05 | | | | |
| TC-AUTH-06 | | | | |
| TC-AUTH-07 | | | | |
| TC-AUTH-08 | | | | |
| TC-DASH-01 | | | | |
| TC-DASH-02 | | | | |
| TC-DASH-03 | | | | |
| TC-DASH-04 | | | | |
| TC-DASH-05 | | | | |
| TC-DASH-06 | | | | |
| TC-DASH-07 | | | | |
| TC-DASH-08 | | | | |
| TC-UM-01 | | | | |
| TC-UM-02 | | | | |
| TC-UM-03 | | | | |
| TC-UM-04 | | | | |
| TC-UM-05 | | | | |
| TC-UM-06 | | | | |
| TC-UM-07 | | | | |
| TC-UM-08 | | | | |
| TC-UM-09 | | | | |
| TC-UM-10 | | | | |
| TC-UM-11 | | | | |
| TC-UM-12 | | | | |
| TC-UM-13 | | | | |
| TC-UM-14 | | | | |
| TC-RM-01 | | | | |
| TC-RM-02 | | | | |
| TC-RM-03 | | | | |
| TC-RM-04 | | | | |
| TC-RM-05 | | | | |
| TC-RM-06 | | | | |
| TC-RM-07 | | | | |
| TC-RM-08 | | | | |
| TC-REP-01 | | | | |
| TC-REP-02 | | | | |
| TC-REP-03 | | | | |
| TC-REP-04 | | | | |
| TC-REP-05 | | | | |
| TC-REP-06 | | | | |
| TC-REP-07 | | | | |
| TC-REP-08 | | | | |
| TC-REP-09 | | | | |
| TC-REP-10 | | | | |
| TC-CFG-01 | | | | |
| TC-CFG-02 | | | | |
| TC-CFG-03 | | | | |
| TC-CFG-04 | | | | |
| TC-CFG-05 | | | | |
| TC-CFG-06 | | | | |
| TC-CFG-07 | | | | |
| TC-CFG-08 | | | | |
| TC-PROF-01 | | | | |
| TC-PROF-02 | | | | |
| TC-PROF-03 | | | | |
| TC-PROF-04 | | | | |
| TC-PROF-05 | | | | |
| TC-PROF-06 | | | | |
| TC-PROF-07 | | | | |
| TC-SIDE-01 | | | | |
| TC-SIDE-02 | | | | |
| TC-SIDE-03 | | | | |
| TC-SIDE-04 | | | | |

// Authentication helper functions for Bigg Mini Cafe

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Get current logged-in user
 * @returns {Object|null}
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Log in user
 * @param {Object} userData - User data object with email and username
 */
function loginUser(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
}

/**
 * Log out user
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.setItem('isLoggedIn', 'false');
}

/**
 * Update user profile in localStorage
 * @param {Object} updatedData - Updated user data
 */
function updateUserProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const updated = { ...currentUser, ...updatedData };
        localStorage.setItem('currentUser', JSON.stringify(updated));
    }
}

/**
 * Display user profile in header
 * Adds full name and logout button to navigation
 */
function displayUserProfile() {
    const user = getCurrentUser();
    const authLink = document.getElementById('authLink');
    
    if (!authLink) return;
    
    if (isLoggedIn() && user) {
        // Get the name - first try fullName, then look it up from registered users
        let displayName = user.fullName;
        
        // If fullName is missing, try to get it from the users list
        if (!displayName) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const registeredUser = users.find(u => u.email === user.email);
            displayName = registeredUser ? registeredUser.name : 'User';
        }
        
        // Create welcome message
        authLink.innerHTML = `
            <span class="welcome-text">Welcome, ${displayName}</span>
        `;
        
        // Add logout button to the end of nav links if not already there
        const navLinks = document.getElementById('navLinks');
        if (navLinks && !document.getElementById('logoutNavItem')) {
            const logoutLi = document.createElement('li');
            logoutLi.id = 'logoutNavItem';
            logoutLi.innerHTML = `<button class="logout-btn" onclick="handleLogout()">Logout</button>`;
            navLinks.appendChild(logoutLi);
        }
    } else {
        // Create login/signup links
        authLink.innerHTML = `
            <a href="SignIn.html" class="auth-link signin-link">Sign In</a>
            <a href="SignUp.html" class="auth-link signup-link">Sign Up</a>
        `;
        // Remove logout button from nav if it exists
        const logoutNavItem = document.getElementById('logoutNavItem');
        if (logoutNavItem) logoutNavItem.remove();
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        logoutUser();
        window.location.href = 'index.html';
    }
}

/**
 * Require authentication - redirect to login if not logged in
 * @param {string} redirectUrl - URL to redirect to after login
 */
function requireLogin(redirectUrl = 'index.html') {
    if (!isLoggedIn()) {
        localStorage.setItem('redirectAfterLogin', redirectUrl);
        window.location.href = 'SignIn.html';
    }
}

/**
 * Handle redirect after login
 */
function handlePostLoginRedirect() {
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    }
}

/**
 * Initialize authentication display on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    displayUserProfile();
});

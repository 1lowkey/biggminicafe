// ============================================
// FIREBASE AUTHENTICATION & BACKEND
// Bigg Mini Cafe - Complete Firebase Setup
// ============================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, browserLocalPersistence, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, setPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkyvBoPf2cOOlYYsnATmsL8Y2SOVDwuws",
    authDomain: "biggminicafe.firebaseapp.com",
    projectId: "biggminicafe",
    storageBucket: "biggminicafe.firebasestorage.app",
    messagingSenderId: "630615113167",
    appId: "1:630615113167:web:01e9fe5489b5c22c0626ba",
    measurementId: "G-8LKWEHGTLC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
function isLoggedIn() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(!!user);
        });
    });
}

/**
 * Get current logged-in user
 * @returns {Object|null}
 */
function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data (name, address, phone)
 * @returns {Promise<Object>}
 */
async function signUpUser(email, password, userData) {
    try {
        await setPersistence(auth, browserLocalPersistence);

        const normalizedEmail = normalizeEmail(email);
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const user = userCredential.user;

        // Update user profile
        await updateProfile(user, {
            displayName: userData.name
        });

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: normalizedEmail,
            name: userData.name,
            address: userData.address,
            phone: userData.phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return {
            success: true,
            user: user,
            message: "Account created successfully!"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>}
 */
async function signInUser(email, password) {
    try {
        await setPersistence(auth, browserLocalPersistence);

        const normalizedEmail = normalizeEmail(email);
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        return {
            success: true,
            user: userCredential.user,
            message: "Signed in successfully!"
        };
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            const normalizedEmail = normalizeEmail(email);
            const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail).catch(() => []);

            if (methods.length === 0) {
                return {
                    success: false,
                    error: 'No account found for this email. Check the email you used during sign up.'
                };
            }

            if (methods.includes('password')) {
                return {
                    success: false,
                    error: 'Email and password do not match. Try again or reset the password.'
                };
            }

            return {
                success: false,
                error: 'This email uses a different sign-in method. Use the same method you used when creating the account.'
            };
        }

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sign out current user
 * @returns {Promise<Object>}
 */
async function signOutUser() {
    try {
        await signOut(auth);
        return {
            success: true,
            message: "Signed out successfully!"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: "Password reset email sent!"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>}
 */
async function getUserProfile(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
}

/**
 * Update user profile
 * @param {string} uid - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
async function updateUserProfile(uid, updates) {
    try {
        await updateDoc(doc(db, "users", uid), {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        
        // Update auth profile if name is provided
        if (updates.name && getCurrentUser()) {
            await updateProfile(getCurrentUser(), { displayName: updates.name });
        }

        return {
            success: true,
            message: "Profile updated successfully!"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Display user profile in header
 * Adds full name and logout button to navigation
 */
async function displayUserProfile() {
    const user = getCurrentUser();
    const authLink = document.getElementById('authLink');
    
    if (!authLink) return;
    
    if (user) {
        let displayName = user.displayName || 'User';
        
        // Try to get full name from Firestore
        if (user.uid) {
            const profile = await getUserProfile(user.uid);
            if (profile && profile.name) {
                displayName = profile.name;
            }
        }
        
        // Create welcome message
        authLink.innerHTML = `
            <span class="welcome-text">Welcome, ${displayName}</span>
            <button class="logout-btn" style="background: none; border: none; color: #c4a37d; cursor: pointer; margin-left: 10px; text-decoration: underline;">Logout</button>
        `;

        const logoutButton = authLink.querySelector('.logout-btn');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    } else {
        // Create login/signup links
        authLink.innerHTML = `
            <a href="SignIn.html" class="auth-link signin-link">Sign In</a>
            <a href="SignUp.html" class="auth-link signup-link">Sign Up</a>
        `;
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    const result = await signOutUser();
    if (result.success) {
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    } else {
        alert('Error logging out: ' + result.error);
    }
}

/**
 * Initialize authentication display on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        displayUserProfile();
    });
});

// ============================================
// EXPORTS FOR MODULE USAGE
// ============================================

export {
    signUpUser,
    signInUser,
    signOutUser,
    resetPassword,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    displayUserProfile,
    handleLogout,
    isLoggedIn,
    onAuthStateChanged,
    auth,
    db
};

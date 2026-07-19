// ============================================================
// CHLORIS FRONTEND WITH BACKEND CONNECTION
// ============================================================

// ===== BACKEND URL =====
const API_BASE = 'http://localhost:5001/api';
// const API_BASE = window.location.hostname === 'localhost' 
//     ? 'http://localhost:5001/api' 
//     : 'https://your-backend-url.com/api';  // for deployment later

// ===== SPA NAVIGATION =====
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const navLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');

    // Refresh content when navigating
    if (page === 'garden') renderGarden();
    if (page === 'recommendations') renderRecommendations();
    if (page === 'profile') updateProfileUI();
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

// ===== AUTH: SIGNUP =====
async function signup(name, email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('✅ Account created!');
            updateProfileUI();
            navigateTo('home');
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Server error. Is the backend running?');
        console.error(err);
    }
}

// ===== AUTH: LOGIN =====
async function login(email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('✅ Welcome back!');
            updateProfileUI();
            navigateTo('home');
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Server error. Is the backend running?');
        console.error(err);
    }
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateProfileUI();
    alert('👋 Logged out');
    navigateTo('home');
}

// ===== HANDLE LOGIN FORM =====
function handleLogin() {
    const email = document.getElementById('authEmail')?.value;
    const password = document.getElementById('authPassword')?.value;
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    login(email, password);
}

function handleSignup() {
    const email = document.getElementById('authEmail')?.value;
    const password = document.getElementById('authPassword')?.value;
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    const name = prompt('Enter your name:');
    if (!name) return;
    signup(name, email, password);
}

// Make them global
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;

// ===== GET USER FROM LOCALSTORAGE =====
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function getToken() {
    return localStorage.getItem('token');
}

// ===== UPDATE PROFILE UI =====
function updateProfileUI() {
    const user = getUser();
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const authBtn = document.getElementById('authBtn');

    if (user) {
        nameEl.textContent = user.name || 'User';
        emailEl.textContent = user.email || 'Signed in';
        if (authBtn) {
            authBtn.textContent = 'Logout';
            authBtn.onclick = logout;
        }
    } else {
        nameEl.textContent = 'Guest';
        emailEl.textContent = 'Not signed in';
        if (authBtn) {
            authBtn.textContent = 'Sign In / Sign Up';
            authBtn.onclick = () => {
                const email = prompt('Enter your email:');
                if (!email) return;
                const password = prompt('Enter your password:');
                if (!password) return;
                const name = confirm('Do you have an account?') ? null : prompt('Enter your name:');
                if (name) signup(name, email, password);
                else login(email, password);
            };
        }
    }
}

// ===== IDENTIFY PLANT =====
async function identifyPlant(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${API_BASE}/identify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('identifyResult').classList.remove('hidden');
            document.getElementById('resultImage').src = URL.createObjectURL(file);
            document.getElementById('plantName').textContent = data.name || 'Unknown';
            document.getElementById('plantScientific').textContent = data.scientific || '—';
            document.getElementById('plantConfidence').textContent = data.confidence ? data.confidence + '%' : '—';
            // Save plant data for saving to garden
            window.lastIdentifiedPlant = data;
        } else {
            alert('❌ Identification failed: ' + data.error);
        }
    } catch (err) {
        alert('❌ Server error. Is the backend running?');
        console.error(err);
    }
}

// ===== SAVE PLANT TO GARDEN =====
async function savePlant() {
    const plant = window.lastIdentifiedPlant;
    if (!plant) {
        alert('No plant identified yet!');
        return;
    }
    if (!getToken()) {
        alert('Please log in first.');
        navigateTo('profile');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/garden`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ plantId: plant._id || plant.name })
        });
        const data = await res.json();
        if (res.ok) {
            alert('🌱 Plant saved to your garden!');
            window.lastIdentifiedPlant = null;
        } else {
            alert('❌ ' + data.error);
        }
    } catch (err) {
        alert('❌ Server error. Is the backend running?');
        console.error(err);
    }
}

// ===== RENDER GARDEN =====
async function renderGarden() {
    const container = document.getElementById('gardenContainer');
    if (!container) return;

    if (!getToken()) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔒</span>
                <p>Please log in to view your garden</p>
                <button class="btn-secondary" onclick="navigateTo('profile')">Go to Profile</button>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/garden`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (res.ok && data.garden && data.garden.length > 0) {
            container.innerHTML = data.garden.map(plant => `
                <div class="profile-event-card">
                    <div class="profile-event-info">
                        <img src="${plant.image || 'assets/plant-placeholder.png'}" alt="${plant.name}" class="profile-event-img">
                        <div class="profile-event-details">
                            <h4>${plant.name}</h4>
                            <p>🌿 ${plant.scientific || '—'} • ${plant.care?.light || 'Bright indirect light'}</p>
                        </div>
                    </div>
                    <button class="delete-event-btn" onclick="removePlant('${plant._id}')">🗑️</button>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🌱</span>
                    <p>Your garden is empty.</p>
                    <button class="btn-secondary" onclick="navigateTo('identify')">Identify a plant to get started</button>
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<p style="color: red;">❌ Could not load garden. Is the backend running?</p>`;
        console.error(err);
    }
}

// ===== REMOVE PLANT FROM GARDEN =====
async function removePlant(plantId) {
    if (!confirm('Remove this plant from your garden?')) return;
    try {
        const res = await fetch(`${API_BASE}/garden/${plantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
            renderGarden();
        } else {
            alert('❌ Failed to remove plant');
        }
    } catch (err) {
        alert('❌ Server error');
        console.error(err);
    }
}

// ===== RENDER RECOMMENDATIONS =====
async function renderRecommendations() {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    if (!getToken()) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔒</span>
                <p>Please log in to get recommendations</p>
                <button class="btn-secondary" onclick="navigateTo('profile')">Go to Profile</button>
            </div>
        `;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/recommendations`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();

        if (res.ok && data.recommendations && data.recommendations.length > 0) {
            container.innerHTML = data.recommendations.map(rec => `
                <div class="profile-event-card">
                    <div class="profile-event-info">
                        <img src="${rec.image || 'assets/plant-placeholder.png'}" alt="${rec.name}" class="profile-event-img">
                        <div class="profile-event-details">
                            <h4>${rec.name}</h4>
                            <p>🌿 ${rec.scientific || '—'}</p>
                            <p style="font-size: 0.7rem; color: #588157;">✨ ${rec.reason || 'Recommended for you'}</p>
                        </div>
                    </div>
                    <button class="delete-event-btn" onclick="alert('Add to garden?')">🌱</button>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">✨</span>
                    <p>Add plants to your garden to get personalized recommendations.</p>
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = `<p style="color: red;">❌ Could not load recommendations. Is the backend running?</p>`;
        console.error(err);
    }
}

// ============================================================
// UPLOAD ZONE EVENT LISTENERS
// ============================================================

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput?.click());
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        identifyPlant(file);
        fileInput.value = ''; // reset input
    });
}

// ============================================================
// DRAG AND DROP SUPPORT 
// ============================================================

if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#588157';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = '#a3b18a';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#a3b18a';
        const file = e.dataTransfer.files[0];
        if (file) identifyPlant(file);
    });
}

// ============================================================
// INIT ON PAGE LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Set default page
    navigateTo('home');
    updateProfileUI();

    // Check if token is expired or invalid (optional)
    // Could add a /api/auth/verify endpoint for this
});

// ============================================================
// MAKING FUNCTIONS GLOBAL FOR HTML ONCLICK
// ============================================================

window.navigateTo = navigateTo;
window.signup = signup;
window.login = login;
window.logout = logout;
window.savePlant = savePlant;
window.removePlant = removePlant;
window.renderGarden = renderGarden;
window.renderRecommendations = renderRecommendations;
window.updateProfileUI = updateProfileUI;
window.identifyPlant = identifyPlant;

console.log('🌱 Chlora frontend loaded!');
console.log('📡 Backend URL:', API_BASE);
console.log('👤 User:', getUser() || 'Guest');
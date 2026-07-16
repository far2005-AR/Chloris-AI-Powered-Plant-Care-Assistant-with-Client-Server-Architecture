// ===== PAGE NAVIGATION =====
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-links a[data-page="${page}"]`).classList.add('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
    });
});

// ===== UPLOAD PLANT IMAGE =====
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById('resultImage').src = event.target.result;
        document.getElementById('identifyResult').classList.remove('hidden');
        document.getElementById('plantName').textContent = 'Monstera Deliciosa';
        document.getElementById('plantScientific').textContent = 'Monstera deliciosa';
        document.getElementById('plantConfidence').textContent = '94%';
    };
    reader.readAsDataURL(file);
});

// ===== SAVE PLANT =====
function savePlant() {
    alert('🌱 Plant saved to your garden! (Backend coming soon)');
}

// ===== GARDEN (mock data) =====
function renderGarden() {
    const container = document.getElementById('gardenContainer');
    const saved = JSON.parse(localStorage.getItem('veridian_garden') || '[]');
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🌱</span>
                <p>Your garden is empty.</p>
                <button class="btn-secondary" onclick="navigateTo('identify')">Identify a plant to get started</button>
            </div>
        `;
        return;
    }
    // render garden cards here
}

// ===== RECOMMENDATIONS (mock) =====
function renderRecommendations() {
    const container = document.getElementById('recommendationsContainer');
    const saved = JSON.parse(localStorage.getItem('veridian_garden') || '[]');
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">✨</span>
                <p>Add plants to your garden to get personalized recommendations.</p>
            </div>
        `;
        return;
    }
    // render recommendations here
}

// ===== INIT =====
renderGarden();
renderRecommendations();
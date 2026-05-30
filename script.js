let currentUser = null;
let currentPassword = null;

// Fungsi Navigasi Halaman Utama (Welcome, Galeri, Dev)
function showPage(pageId) {
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active-page');
    });
    document.getElementById(pageId).classList.add('active-page');
}

// Manajemen Jendela Pop-up Akun
function openAuthModal() { document.getElementById('auth-modal').style.display = 'block'; }
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }
function switchAuthTab(type) {
    if(type === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('tab-login-btn').classList.add('active');
        document.getElementById('tab-register-btn').classList.remove('active');
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('tab-login-btn').classList.remove('active');
        document.getElementById('tab-register-btn').classList.add('active');
    }
}

// Kirim Data Pendaftaran Akun Teman Baru ke Server
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const token = document.getElementById('reg-token').value;

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, token })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success) {
            switchAuthTab('login');
            updateDevStats();
        }
    });
});

// Proses Masuk Sistem / Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            currentUser = username;
            currentPassword = password;
            closeAuthModal();
            
            // Perbarui UI Header & Tampilkan Panel Upload
            document.getElementById('auth-status-area').innerHTML = `<span style="font-weight:600; margin-right:10px;">@${username}</span><button class="btn btn-danger" style="width:auto;margin:0;" onclick="logout()">Logout</button>`;
            document.getElementById('user-upload-panel').style.display = 'block';
            document.getElementById('logged-user-name').innerText = username;
        } else {
            alert(data.message);
        }
    });
});

function logout() {
    location.reload();
}

// Fungsi Tambah Akun Manual dari Halaman Dev
function addAccountManual() {
    const adminPassword = document.getElementById('dev-admin-pass').value;
    const newUsername = document.getElementById('dev-new-username').value;
    const newPassword = document.getElementById('dev-new-password').value;

    fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, newUsername, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success) {
            document.getElementById('dev-new-username').value = '';
            document.getElementById('dev-new-password').value = '';
            updateDevStats();
        }
    });
}

function updateDevStats() {
    fetch('/api/gallery')
        .then(res => res.json())
        .then(data => {
            document.getElementById('dev-registered-users').innerText = data.totalUsers;
        });
}

// Logika muat data galeri terintegrasi (Sama dengan kode sebelumnya)
document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('foto-title').value;
    const fileInput = document.getElementById('foto-file');
    const file = fileInput.files[0];

    if (file && currentUser) {
        const reader = new FileReader();
        reader.onload = function(event) {
            fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    password: currentPassword,
                    title: title,
                    image: event.target.result
                })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if(data.success) {
                    document.getElementById('upload-form').reset();
                    document.getElementById('file-name-placeholder').innerText = "Belum ada file dipilih";
                    loadGallery();
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

function loadGallery() {
    fetch('/api/gallery')
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('gallery-grid');
            grid.innerHTML = '';
            data.gallery.forEach(item => {
                const el = document.createElement('div');
                el.className = 'gallery-item';
                el.innerHTML = `
                    <div class="img-container"><img src="${item.image}"></div>
                    <div class="item-content">
                        <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Diunggah oleh: @${item.author}</div>
                        <div class="item-title">${item.title}</div>
                    </div>
                `;
                grid.appendChild(el);
            });
            document.getElementById('dev-registered-users').innerText = data.totalUsers;
        });
}

document.getElementById('foto-file').addEventListener('change', function(e){
    const fileName = e.target.files[0] ? e.target.files[0].name : "Belum ada file dipilih";
    document.getElementById('file-name-placeholder').innerText = fileName;
});

window.addEventListener('DOMContentLoaded', loadGallery);

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// TOKEN ANGKATAN: Berikan kode ini ke 290 temanmu agar mereka bisa daftar akun sendiri
const REGISTRATION_TOKEN = "MUALLIMIN104"; 

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// DATABASE MEMORI SERVER
let users = {};          // Menampung 290+ akun teman (Format: { username: password })
let galleryData = [];    // Menampung postingan foto/video
let websiteBackground = "IMG-20260523-WA0022.jpg";

// ==================== API AUTHENTICATION (AKUN) ====================

// 1. API Daftar Akun Baru menggunakan Token Angkatan
app.post('/api/register', (req, res) => {
    const { username, password, token } = req.body;

    if (token !== REGISTRATION_TOKEN) {
        return res.status(400).json({ success: false, message: "Token Angkatan Salah/Tidak Valid!" });
    }
    if (users[username]) {
        return res.status(400).json({ success: false, message: "Username sudah digunakan orang lain!" });
    }

    // Daftarkan akun baru ke database server
    users[username] = password;
    res.json({ success: true, message: "Akun berhasil dibuat! Silahkan login." });
});

// 2. API Login Akun Teman
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username] === password) {
        return res.json({ success: true, message: "Berhasil masuk!", username });
    }
    res.status(401).json({ success: false, message: "Username atau password salah!" });
});

// 3. API Tambah Akun Manual oleh Kamu (Admin/Developer)
app.post('/api/admin/add-user', (req, res) => {
    const { adminPassword, newUsername, newPassword } = req.body;
    // Password khusus kamu sebagai pemilik utama website
    if (adminPassword !== "devmuallimin104") {
        return res.status(403).json({ success: false, message: "Akses ditolak!" });
    }
    
    users[newUsername] = newPassword;
    res.json({ success: true, message: `Akun @${newUsername} sukses ditambahkan!` });
});

// ==================== API KONTEN & GALERI ====================

app.get('/api/gallery', (req, res) => {
    res.json({ gallery: galleryData, background: websiteBackground, totalUsers: Object.keys(users).length });
});

app.post('/api/upload', (req, res) => {
    const { username, password, title, image } = req.body;
    
    // Proteksi ganda: Memastikan yang upload adalah akun terdaftar yang sah
    if (!users[username] || users[username] !== password) {
        return res.status(403).json({ success: false, message: "Sesi kadaluarsa, silahkan login ulang." });
    }

    const newPost = {
        id: Date.now(),
        author: username,
        title: title,
        image: image,
        likes: 0,
        comments: []
    };

    galleryData.unshift(newPost);
    res.json({ success: true, message: "Media berhasil dipublikasikan!" });

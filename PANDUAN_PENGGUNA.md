# Panduan Pengguna - Aplikasi Jurnal TK Dharma Wanita Kepung 2

Panduan ini menjelaskan cara menggunakan dan mengelola aplikasi Jurnal TK, mulai dari persiapan akun administrator (Admin), pengelolaan data master, hingga penggunaan oleh Guru dan Orang Tua.

---

## 🔑 1. Persiapan Awal (Membuat Akun Admin Pertama)

Karena aplikasi ini bersifat privat demi keamanan data anak, **pendaftaran akun baru (khususnya Admin) tidak dibuka untuk umum di halaman depan**. Akun Admin pertama harus dibuat secara manual melalui Dashboard Supabase.

### Cara A: Melalui Dashboard Supabase (Sangat Direkomendasikan)
1. Buka [Supabase Dashboard](https://supabase.com/).
2. Masuk ke proyek database Anda.
3. Di menu sebelah kiri, pilih **Authentication** -> **Users**.
4. Klik tombol **Add User** -> **Create User**.
5. Masukkan **Email** dan **Password** untuk akun Admin Anda.
6. Centang opsi **Auto-confirm User** agar langsung aktif tanpa verifikasi email.
7. Di bagian **User Metadata**, tambahkan JSON berikut untuk menetapkan nama dan peran sebagai Admin:
   ```json
   {
     "name": "Admin Utama",
     "role": "ADMIN"
   }
   ```
8. Klik **Save/Create**. Akun Admin Anda kini siap digunakan untuk login ke `/login`.

### Cara B: Melalui SQL Editor di Supabase
Jika Anda lebih suka menggunakan query SQL, jalankan perintah berikut di **SQL Editor** Supabase:
```sql
-- Ganti email dan password sesuai kebutuhan Anda
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@jurnal-tk.com', -- Email admin
  crypt('PasswordAdminAnda', gen_salt('bf')), -- Password
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Utama","role":"ADMIN"}', -- Metadata Nama dan Role
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

### Persiapan Supabase Storage (Untuk Upload Foto Kegiatan)
1. Buka **Supabase Dashboard** → **Storage**.
2. Klik **New Bucket**.
3. Beri nama bucket: `activities`.
4. Centang **Public bucket** agar foto dapat diakses oleh pengguna.
5. Klik **Create bucket**.

---

## 🖥️ 2. Alur Penggunaan Dashboard Admin (Admin Workspace)

Setelah masuk sebagai Admin di `/login`, ikuti urutan langkah pengelolaan data berikut agar sistem terhubung dengan benar:

### Langkah 1: Tahun Ajaran (Sudah Disediakan Default)
Pastikan tahun ajaran aktif telah diatur di database (Secara default, database sudah memiliki data `2025/2026` sebagai tahun ajaran aktif).

### Langkah 2: Pendaftaran & Pengelolaan Guru
1. Masuk ke menu **Data Guru** di sidebar.
2. Klik **Tambah Guru**.
3. Masukkan **Nama Lengkap**, **Email**, **Password** (ditentukan khusus atau opsional, default: `password123`), dan **No. HP**.
4. Klik **Simpan**. 
   * *Catatan: Admin dapat mengubah atau me-reset password akun Guru kapan saja melalui tombol aksi **(•••) -> Ubah Password**.*

### Langkah 3: Pendaftaran & Pengelolaan Orang Tua
1. Masuk ke menu **Data Orang Tua**.
2. Klik **Tambah Orang Tua**, masukkan nama, email, password, dan No. HP lalu simpan.
   * *Catatan: Admin juga memiliki kendali penuh untuk me-reset atau mengubah password akun Orang Tua melalui menu aksi **(•••) -> Ubah Password**.*

---

## 👩‍🏫 3. Alur Kerja Guru (Teacher Workspace)

Guru bertugas memantau perkembangan harian siswa di kelasnya melalui dashboard `/teacher`.

### 3.1 Login & Dashboard
1. **Login**: Guru menggunakan email terdaftar dan password yang ditentukan oleh Admin. Halaman login dilengkapi logo resmi **Dharma Wanita**.
2. **Dashboard**: Menampilkan ringkasan otomatis:
   - Nama kelas yang diajar beserta jumlah siswa.
   - Jumlah kegiatan hari ini dan total keseluruhan.
   - Daftar singkat kegiatan hari ini.
   - Tombol cepat **Buat Jurnal Kegiatan**.

### 3.2 Jurnal Kegiatan Harian (`/teacher/activities`)
Fitur utama aplikasi — Guru mencatat kegiatan harian anak-anak.

#### Melihat Daftar Kegiatan
1. Klik menu **Kegiatan** di sidebar.
2. Halaman menampilkan *timeline* kegiatan berdasarkan tanggal.
3. Gunakan **filter tanggal** untuk melihat kegiatan hari lain.

#### Membuat Jurnal Baru
1. Klik tombol **Buat Jurnal** (atau navigasi ke `/teacher/activities/new`).
2. Isi formulir:
   - **Judul Kegiatan** (wajib): Contoh: *Doa Pagi*, *Bernyanyi*, *Mewarnai*.
   - **Deskripsi** (opsional): Penjelasan lebih detail tentang kegiatan.
   - **Tanggal**: Otomatis terisi hari ini, dapat diubah.
   - **Waktu** (opsional): Contoh: `07:00`, `08:30`.
   - **Foto Kegiatan**: Unggah hingga **5 foto** (maksimal 5MB per foto). Foto akan ditampilkan sebagai pratinjau sebelum disimpan.
   - **Status**: Pilih *Draft* (hanya terlihat oleh Guru) atau *Publish* (dapat dilihat Orang Tua).
3. Klik **Buat Jurnal**.

#### Mengedit Jurnal
1. Pada daftar kegiatan, klik ikon **Edit** (pensil) pada jurnal yang ingin diubah.
2. Ubah informasi yang diperlukan.
3. Anda juga dapat **menghapus foto lama** dan **menambah foto baru**.
4. Klik **Simpan Perubahan**.

#### Mengatur Urutan Kegiatan
- Gunakan tombol **Panah Atas / Bawah** di samping setiap kegiatan untuk mengatur urutan tampilan (misal: *Doa Pagi* paling atas, *Istirahat* di tengah).

#### Menerbitkan / Menarik Kegiatan
- Klik ikon **Mata** untuk mengubah status:
  - 👁️ **Publish**: Orang Tua dapat melihat kegiatan ini.
  - 🙈 **Draft**: Kegiatan disembunyikan dari Orang Tua.

#### Menghapus Kegiatan
- Klik ikon **Tempat Sampah** → konfirmasi penghapusan. Foto di cloud juga akan ikut terhapus.

### 3.3 Laporan Kegiatan (`/teacher/reports`)
Guru dapat meng-*generate* laporan kegiatan secara otomatis.

1. Klik menu **Laporan** di sidebar.
2. Pilih **Tipe Laporan**:
   - **Harian**: Kegiatan pada satu hari tertentu.
   - **Mingguan**: Kegiatan Senin–Minggu pada minggu yang dipilih.
   - **Bulanan**: Seluruh kegiatan dalam satu bulan.
3. Pilih **Tanggal** acuan, lalu klik **Generate Laporan**.
4. Pratinjau laporan muncul dalam format 5 kolom: **{ No, Tanggal, Kegiatan, Keterangan, Gambar }**.
5. **Ekspor & Cetak**:
   - 📊 **Ekspor Excel (.xlsx)**: Mengunduh file Excel resmi dengan **foto asli kegiatan tertanam langsung di dalam sel**.
   - 📥 **Unduh CSV**: Untuk format spreadsheet UTF-8 alternatif.
   - 🖨️ **Cetak / PDF**: Menggunakan dialog cetak browser (`Ctrl+P` atau `Cmd+P`).

### 3.4 Data Siswa (`/teacher/students`)
Guru dapat mengklik menu **Siswa** di sidebar untuk melihat dan mengelola daftar siswa yang terdaftar.

---

## 👨‍👩‍👧 4. Alur Orang Tua (Parent Workspace)

Orang Tua dapat memantau aktivitas harian anaknya melalui antarmuka yang didesain khusus bertema sekolah TK (cerah, ceria, dan ramah anak).

### 4.1 Login & Beranda (`/parent`)
1. **Login**: Orang Tua login menggunakan email mereka dan password dari Admin.
2. **Beranda**: Halaman utama didesain dengan latar belakang cerah dan elemen kartun membulat (*soft rounded*):
   - **Kartu Info Anak**: Nama, kelas, dan tanggal lahir setiap anak yang terhubung ke akun Orang Tua.
   - **Statistik Ceria**: Jumlah anak terdaftar, kegiatan terbaru, dan total foto.
   - **Kegiatan Terbaru**: Jurnal kegiatan harian terbaru dari guru kelas.

### 4.2 Lini Masa Kegiatan (`/parent/timeline`)
1. Klik menu **Lini Masa** di sidebar.
2. Kegiatan ditampilkan dalam format *timeline* pastel yang dikelompokkan per tanggal (terbaru di atas).
3. Setiap entri menampilkan waktu, judul, deskripsi, dan foto kegiatan yang dipublikasikan oleh Guru.

### 4.3 Galeri Foto & Download (`/parent/gallery`)
1. Klik menu **Galeri Foto** di sidebar.
2. Semua foto kegiatan anak ditampilkan dalam grid foto yang bersih.
3. Arahkan kursor atau sentuh foto untuk melihat judul kegiatan dan tanggal.
4. **Unduh Gambar**: Setiap foto dilengkapi tombol **Download** di pojok kanan atas foto untuk menyimpan foto kegiatan anak secara langsung ke perangkat.

### 4.4 Profil Saya (`/parent/profile`)
1. Klik menu **Profil** di sidebar.
2. Menampilkan informasi akun, email, nomor telepon/WhatsApp, dan alamat Orang Tua.

---

## 📱 5. Tips Penggunaan

### Akses dari Smartphone
- Buka aplikasi melalui browser di smartphone.
- Tampilan aplikasi responsif di berbagai perangkat.
- Sidebar dapat dibuka dengan menekan ikon **☰ (hamburger menu)** di pojok kanan atas.

### Keamanan Akun
- Jika lupa password, hubungi Administrator Sekolah untuk melakukan **Reset / Ubah Password**.

### Peran Pengguna

| Peran | Akses | Warna Tema |
|---|---|---|
| 🟡 **Admin** | `/admin/*` — Kelola semua data master & password user | Kuning |
| 🟢 **Guru** | `/teacher/*` — Jurnal, laporan Excel, data siswa | Hijau Emerald |
| 🩷 **Orang Tua** | `/parent/*` — Lini masa ceria, galeri foto & download | Pink Ceria |

> **Catatan**: Setiap peran hanya dapat mengakses halaman sesuai perannya. Jika mencoba mengakses halaman peran lain, pengguna akan otomatis dialihkan ke dashboard miliknya.

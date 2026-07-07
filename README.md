# Ponytail Skills for Gemini / Antigravity

Kumpulan custom skills untuk AI Coding Assistant (Gemini/Antigravity) yang berfokus pada kesederhanaan, efisiensi tinggi, dan penghapusan kode yang tidak perlu (YAGNI).

Skill-skill ini disesuaikan (customized) dengan preferensi mode **ultra** secara default.

## Daftar Skill yang Tersedia

1. **`ponytail`**: Memaksa solusi paling sederhana, paling pendek, dan paling minimalis (mengutamakan standard library & native features).
2. **`ponytail-review`**: Melakukan review kode khusus untuk mendeteksi over-engineering dan kode mubazir.
3. **`ponytail-audit`**: Memindai seluruh repositori untuk mencari pola over-engineering.
4. **`ponytail-debt`**: Mengumpulkan semua catatan komentar `ponytail:` di codebase ke dalam sebuah file ledger.
5. **`ponytail-gain`**: Menampilkan metrik estimasi penghematan kode dan waktu yang dihasilkan oleh Ponytail.
6. **`ponytail-help`**: Panduan cepat referensi perintah-perintah Ponytail.
7. **`ponytail-update`**: Memperbarui skill Ponytail Anda langsung dari repositori ini ke versi terbaru.

---

## Cara Instalasi Cepat (Satu Baris Perintah)

```powershell
irm https://raw.githubusercontent.com/rizalrepo/ponytail/main/install.ps1 | iex
```
Catatan: Pastikan Gemini/Antigravity IDE ditutup terlebih dahulu sebelum menginstal agar konfigurasi baru dimuat dengan sempurna saat dibuka kembali.

---

## Lisensi
[MIT License](LICENSE)

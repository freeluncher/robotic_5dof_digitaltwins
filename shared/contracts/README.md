# shared/contracts

Folder ini menyimpan kontrak yang dipakai bersama frontend dan backend.

## Isi yang Disarankan

- DTO atau shape payload yang konsisten antara apps/web dan apps/api.
- Skema event SignalR.
- Spesifikasi OpenAPI atau JSON Schema.
- Dokumen referensi yang dipakai generator dokumentasi otomatis.

## Prinsip

- Kontrak di sini harus menjadi sumber kebenaran bersama.
- Jangan menyalin definisi payload secara bebas di setiap app.
- Jika kontrak berubah, perbarui test yang bergantung pada kontrak itu terlebih dahulu.

Folder ini disiapkan agar dokumentasi dan kode yang dihasilkan otomatis bisa mengambil struktur data dari satu lokasi pusat.
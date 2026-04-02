# Robotic Arm 5 DOF Digital Twin Monorepo

Monorepo ini memisahkan frontend, backend, dan kontrak bersama supaya pengembangan bisa berjalan dengan pola TDD yang konsisten.

## Struktur Utama

```text
apps/
  web/        # React + Vite + Zustand + Vitest
  api/        # .NET 8 Web API + SignalR + xUnit
shared/
  contracts/  # DTO, event contract, schema, dan dokumen kontrak bersama
```

## Alur Kerja TDD

Tim bekerja dengan urutan Red-Green-Refactor:

1. Red: tulis test yang gagal untuk perilaku baru atau bug yang ingin diperbaiki.
2. Green: implementasikan solusi paling kecil agar test lulus.
3. Refactor: rapikan struktur kode tanpa mengubah perilaku.

Aturan praktis untuk repo ini:

- Test frontend ditulis di `apps/web` dengan Vitest.
- Test backend ditulis di `apps/api/tests` dengan xUnit.
- Kontrak yang dipakai bersama frontend dan backend disimpan di `shared/contracts`.
- Setiap perubahan perilaku harus dimulai dari test, bukan dari implementasi.

## Dokumentasi Otomatis

Struktur ini sengaja dibuat ramah untuk dokumentasi otomatis:

- Setiap area utama punya README sendiri.
- Kontrak bersama berada di satu lokasi agar mudah diekstrak ke OpenAPI, JSON Schema, atau TypeScript types.
- Nama folder mengikuti batas tanggung jawab yang jelas sehingga generator dokumentasi dapat memetakan konteks tanpa menebak.
- Checklist progres proyek tersedia di [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md).

## Perintah Awal

- Frontend: jalankan test Vitest dari `apps/web`.
- Backend: jalankan `dotnet test` pada proyek xUnit di `apps/api/tests`.

Folder ini masih berupa scaffold awal. Implementasi fitur, integrasi SignalR, dan model kontrak akan menyusul setelah kerangka TDD siap.

## Workflow dengan Makefile

Target Makefile tersedia di root repository:

- `make install` untuk install npm dependency frontend dan `dotnet restore` backend.
- `make test` untuk menjalankan unit test frontend dan backend.
- `make dev` untuk menjalankan backend .NET dan frontend Vite secara bersamaan.

### Catatan Windows (VS Code Terminal)

Jika perintah `make` belum tersedia di terminal VS Code pada Windows, pasang GNU Make terlebih dahulu, misalnya melalui salah satu opsi berikut:

- Chocolatey: `choco install make`
- Scoop: `scoop install make`

Setelah instalasi, buka terminal VS Code baru lalu jalankan target Makefile dari root project.
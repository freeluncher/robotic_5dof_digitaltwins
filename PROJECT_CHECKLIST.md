# Project Checklist - Robotic Arm 5 DOF Digital Twin

Checklist ini dipakai untuk tracking progres dari awal sampai rilis. Centang item sesuai status implementasi.

## 1. Discovery dan Scope

- [x] Konfirmasi tujuan produk dan definisi selesai untuk digital twin robotic arm 5 DOF.
- [x] Validasi struktur joint dari robotic_v4_hiearchy.txt.
- [x] Tetapkan nama joint utama: waist_pivot, shoulder_pivot, elbow_pivot, wrist_roll_pivot, wrist_pivot.
- [x] Tetapkan batas aman mekanik tiap joint dari tim mekanik.
- [x] Tetapkan prioritas fitur fase 1, fase 2, dan fase 3.
- [x] Tetapkan owner untuk frontend, backend, testing, dan dokumentasi.

### 1.1 Overview Project

Membangun aplikasi Digital Twin untuk Robotic Arm 5 DOF (robotic_v4) yang memungkinkan sinkronisasi real-time antara gerakan fisik dan model 3D di web browser. Proyek ini mengedepankan akurasi kinematika dan skalabilitas sistem menggunakan alur kerja Test-Driven Development (TDD).

### 1.2 Validasi Teknis Awal

- Model 3D: diekspor dari Blender dalam format GLB dengan opsi transform +Y Up.
- Hierarki pergerakan: menggunakan Empty Pivot sebagai parent dari mesh agar rotasi mengikuti sumbu engsel.
- Pemetaan sendi 5 DOF:
	- J1: waist_pivot (rotasi dasar)
	- J2: shoulder_pivot (lengan bawah)
	- J3: elbow_pivot (lengan atas)
	- J4: wrist_roll_pivot (rotasi pergelangan)
	- J5: wrist_pivot (pitch pergelangan)

### 1.3 Batas Mekanik Joint

| Joint | Pivot Name | Batas Minimum | Batas Maksimum | Alasan Mekanis |
| --- | --- | --- | --- | --- |
| J1 | waist_pivot | -90 deg | +90 deg | Panjang kabel internal |
| J2 | shoulder_pivot | -30 deg | +60 deg | Menghindari tabrakan dengan base |
| J3 | elbow_pivot | 0 deg | +110 deg | Batas tekukan lengan |
| J4 | wrist_roll_pivot | -90 deg | +90 deg | Rotasi motor servo |
| J5 | wrist_pivot | -45 deg | +45 deg | Jangkauan gerak gripper |

### 1.4 Prioritas Fase

1. Fase 1 (prioritas utama): simulasi 3D berjalan stabil dan akurat.
2. Fase 2: backend API dan SignalR untuk alur data realtime.
3. Fase 3: integrasi hardware dan simulasi data perangkat.

### 1.5 Ownership

- Model pengembangan: solo developer.
- Owner frontend: Anda.
- Owner backend: Anda.
- Owner testing: Anda.
- Owner dokumentasi: Anda.

## 2. Setup Repository

- [x] Buat monorepo dengan `apps/web`, `apps/api`, dan `shared/contracts`.
- [x] Tambahkan README root untuk menjelaskan struktur dan alur kerja.
- [x] Tambahkan README per area utama.
- [x] Tambahkan tooling root untuk menjalankan tugas bersama dari satu tempat.
- [x] Tambahkan standard editor config, formatting, dan linting root.
- [x] Tambahkan script build/test lint yang konsisten di seluruh repo.

## 3. Kontrak Bersama

- [x] Definisikan format `RawHardwareData` untuk input hardware.
- [x] Definisikan format output mapping joint ke pivot.
- [x] Definisikan kontrak event SignalR untuk telemetry dan kontrol.
- [x] Definisikan skema DTO bersama dalam `shared/contracts`.
- [x] Tambahkan dokumentasi kontrak agar generator otomatis bisa membaca struktur data.
- [x] Tambahkan test untuk memastikan perubahan kontrak tidak memutus frontend dan backend.

## 4. Frontend Foundation

- [x] Buat scaffold React + Vite untuk `apps/web`.
- [x] Pasang dan verifikasi Zustand untuk state robot, UI, dan connectivity.
- [x] Siapkan konfigurasi Vitest.
- [x] Siapkan setup file test frontend.
- [x] Tambahkan test helper dan fixture data untuk state dan kinematics.
- [x] Buat struktur folder frontend untuk components, hooks, stores, utils, dan tests.
- [x] Tambahkan halaman awal untuk visualisasi digital twin.

## 5. Modul Kinematics Utility

- [x] Buat test RED untuk `convertToRadians(degrees: number)`.
- [x] Buat test RED untuk `mapHardwareToPivot(data: RawHardwareData)`.
- [x] Implementasikan `convertToRadians`.
- [x] Implementasikan `mapHardwareToPivot`.
- [x] Tambahkan guard untuk nilai di luar rentang hardware.
- [x] Tambahkan test untuk edge case batas minimum dan maksimum tiap joint.
- [x] Tambahkan test untuk nilai input tidak valid seperti `null`, `undefined`, atau `NaN` jika dibutuhkan.

## 6. 3D Robot Model Integration

- [x] Import GLB model ke pipeline frontend.
- [x] Verifikasi nama node dan pivot sesuai hierarchy Blender.
- [x] Pastikan rotasi diterapkan ke pivot, bukan mesh link.
- [x] Implementasikan pemetaan joint ke scene graph Three.js.
- [x] Verifikasi orientasi Y-up dan transform hasil export Blender.
- [x] Tambahkan catatan troubleshooting untuk `Apply All Transforms` di Blender.

## 7. Backend Foundation

- [x] Buat proyek .NET 8 API.
- [x] Buat proyek xUnit untuk backend.
- [x] Tambahkan solusi folder yang jelas untuk API, tests, dan shared.
- [x] Tambahkan endpoint health check yang stabil.
- [x] Tambahkan struktur service, controller, hub, dan validation.
- [x] Tambahkan logging dasar dan error handling global.

## 8. SignalR dan Realtime

- [x] Buat SignalR hub untuk telemetry robot.
- [x] Definisikan event untuk joint angle update.
- [x] Definisikan event untuk status koneksi hardware.
- [x] Definisikan event untuk command dari UI ke backend.
- [x] Tambahkan test integrasi untuk hub contract.
- [x] Tambahkan throttling update agar UI tetap stabil.

## 9. Testing Strategy

- [x] Terapkan pola Red-Green-Refactor di root README.
- [x] Siapkan Vitest untuk frontend.
- [x] Siapkan xUnit untuk backend.
- [x] Tambahkan test unit untuk utility kinematics.
- [x] Tambahkan test unit untuk state store Zustand.
- [x] Tambahkan test integrasi untuk backend API.
- [x] Tambahkan test integrasi untuk SignalR hub.
- [x] Tambahkan test kontrak untuk shared schema.
- [x] Tambahkan coverage target minimum.

## 10. Dokumentasi Otomatis

- [x] Struktur folder disiapkan agar mudah dipetakan oleh generator dokumentasi.
- [x] `shared/contracts` menjadi sumber referensi kontrak bersama.
- [ ] Tambahkan dokumentasi API untuk endpoint dan event.
- [ ] Tambahkan dokumentasi domain untuk joint, pivot, dan batas mekanik.
- [ ] Tambahkan contoh payload hardware ke dokumentasi.
- [ ] Tambahkan panduan generate docs otomatis.

## 11. Integrasi Perangkat

- [x] Definisikan format input dari hardware ESP32.
- [x] Definisikan format data serialisasi dari firmware ke backend.
- [x] Implementasikan koneksi hardware ke backend.
- [x] Verifikasi mapping data hardware ke joint robot.
- [x] Tambahkan simulasi data untuk mode development tanpa hardware.
- [x] Tambahkan test untuk kondisi hardware disconnect dan reconnect.

## 12. UI Operasional

- [x] Buat panel kontrol joint.
- [x] Buat panel telemetry realtime.
- [x] Buat indikator status koneksi.
- [ ] Buat panel limit mekanik dan warning.
- [ ] Buat mode manual control dan mode live data.
- [ ] Tambahkan state loading, error, dan fallback.

## 13. Quality Gate sebelum Rilis

- [ ] Semua test frontend lulus.
- [ ] Semua test backend lulus.
- [ ] Semua contract test lulus.
- [ ] Tidak ada warning lint yang blocker.
- [ ] Dokumentasi root dan area utama sudah diperbarui.
- [ ] Checklist ini sudah sepenuhnya terisi statusnya.

## 14. Release dan Maintenance

- [ ] Siapkan build pipeline untuk frontend dan backend.
- [ ] Siapkan environment development, staging, dan production.
- [ ] Siapkan versioning untuk kontrak dan API.
- [ ] Siapkan release notes untuk tiap milestone.
- [ ] Siapkan backlog teknis untuk iterasi berikutnya.
- [ ] Definisikan proses review dan merge untuk PR.

## Status Ringkas

- Selesai: folder monorepo, README dasar, Vitest setup, xUnit setup, dan test RED awal untuk kinematics.
- Sedang berjalan: implementasi modul kinematics utility.
- Berikutnya: kontrak bersama, integrasi SignalR, dan pipeline dokumentasi otomatis.

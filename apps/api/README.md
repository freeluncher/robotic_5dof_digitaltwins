# apps/api

Backend .NET 8 Web API untuk robotic arm digital twin.

## Fokus

- SignalR untuk komunikasi real-time.
- Endpoint API untuk kontrol dan telemetry.
- xUnit untuk test perilaku backend.

## Testing

- Jalankan `dotnet test apps/api/tests/robotic_v4.Api.Tests.csproj` untuk eksekusi test backend.
- Gunakan pola Red-Green-Refactor untuk setiap perubahan behavior.

## Struktur

- `src/` berisi API utama.
- `tests/` berisi proyek xUnit dan semua test backend.

README ini sengaja dipertahankan ringkas supaya generator dokumentasi dapat membaca peran folder ini dengan mudah.
# shared/contracts

Folder ini menyimpan kontrak yang dipakai bersama frontend dan backend.

## Kontrak yang Sudah Didefinisikan

- RawHardwareData:
	- TypeScript: `raw-hardware-data.ts`
	- JSON Schema: `raw-hardware-data.schema.json`
	- C#: `RawHardwareData.cs`

- JointPivotMappingOutput:
	- TypeScript: `joint-pivot-mapping-output.ts`
	- JSON Schema: `joint-pivot-mapping-output.schema.json`
	- C#: `JointPivotMappingOutput.cs`

- SignalR Events (Telemetry + Control):
	- TypeScript: `signalr-events.ts`
	- JSON Schema: `signalr-events.schema.json`
	- C#: `SignalREvents.cs`

- DTO Schema Bundle and Catalog:
	- Root schema bundle: `dto.schema.json`
	- Machine-readable catalog: `dto-catalog.json`

### RawHardwareData Shape

Payload ini merepresentasikan input hardware 5 DOF dalam derajat (envelope hardware 0..180):

```json
{
	"waist": 90,
	"shoulder": 45,
	"elbow": 110,
	"wristRoll": 80,
	"wrist": 70
}
```

Mapping ke pivot scene:

- `waist` -> `waist_pivot`
- `shoulder` -> `shoulder_pivot`
- `elbow` -> `elbow_pivot`
- `wristRoll` -> `wrist_roll_pivot`
- `wrist` -> `wrist_pivot`

### JointPivotMappingOutput Shape

Payload ini merepresentasikan output mapping untuk animasi scene 3D dalam radians:

```json
{
	"waist_pivot": 1.5708,
	"shoulder_pivot": 0.7854,
	"elbow_pivot": 1.9199,
	"wrist_roll_pivot": 0.3491,
	"wrist_pivot": 0.2618
}
```

Catatan:

- Input hardware berada di derajat (RawHardwareData).
- Output mapping ke pivot menggunakan radians agar langsung kompatibel dengan Three.js.

### SignalR Event Contracts

Event name yang disepakati:

- `telemetry.joint-state.updated`
- `telemetry.joint-angle.updated`
- `telemetry.connection.state`
- `control.command.requested`
- `control.set-joint-targets`
- `control.set-gripper`

Envelope standar:

```json
{
	"eventName": "telemetry.joint-state.updated",
	"messageId": "8f7e6d7a-3d24-45c1-b317-9ccce8b8d3ec",
	"timestampUtc": "2026-04-02T07:30:00Z",
	"source": "api",
	"payload": {}
}
```

Contoh payload telemetry joint:

```json
{
	"hardware": {
		"waist": 90,
		"shoulder": 45,
		"elbow": 110,
		"wristRoll": 80,
		"wrist": 70
	},
	"mapped": {
		"waist_pivot": 1.5708,
		"shoulder_pivot": 0.7854,
		"elbow_pivot": 1.9199,
		"wrist_roll_pivot": 0.3491,
		"wrist_pivot": 0.2618
	}
}
```

Contoh payload status koneksi hardware:

```json
{
	"isConnected": true,
	"transport": "signalr",
	"reason": "connected"
}
```

Contoh payload command UI ke backend:

```json
{
	"commandName": "control.set-joint-targets",
	"hardwareTargets": {
		"waist": 90,
		"shoulder": 45,
		"elbow": 110,
		"wristRoll": 80,
		"wrist": 70
	}
}
```

## Dokumentasi Otomatis

Generator dokumentasi dapat menggunakan berkas berikut:

- `dto-catalog.json` sebagai daftar kontrak lintas bahasa.
- `dto.schema.json` sebagai root schema bundle untuk validasi dan index.
- Seluruh `*.schema.json` untuk detail field-level.

Strategi konsumsi generator:

1. Baca `dto-catalog.json` untuk menemukan kontrak, kategori, dan path file.
2. Gunakan `schema` per kontrak untuk rendering tabel field dan validasi.
3. Tautkan `typescript` dan `csharp` agar docs menyajikan representasi lintas stack.

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

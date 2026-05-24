# Transaction Reconciliation Engine

A backend system that ingests crypto transaction data from two sources, matches them using configurable tolerance rules, and generates structured reconciliation reports.

## Deployed URL

```
https://reconciliation-engine-cggn.onrender.com
```

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- csv-parser, uuid, dotenv

## Project Structure

```
src/
├── features/
│   ├── reconciliation/
│   ├── ingestion/
│   ├── matching/
│   ├── normalization/
│   └── reports/
├── models/
├── config/
├── middleware/
└── utils/
server.js
data/
├── user_transactions.csv
└── exchange_transactions.csv
```

## Setup

1. Clone the repository

```bash
git clone https://github.com/sahilnikalje/Reconciliation-Engine.git
cd Reconciliation-Engine
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` in root

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
TIMESTAMP_TOLERANCE_SECONDS=300
QUANTITY_TOLERANCE_PCT=0.01
```

4. Add CSV files in `/data` folder with these columns

```
transaction_id, timestamp, type, asset, quantity, price_usd, fee, note
```

5. Start the server

```bash
nodemon server.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reconciliation/reconcile` | Trigger reconciliation run |
| GET | `/api/reports/:runId` | Get full report |
| GET | `/api/reports/:runId/summary` | Get counts summary |
| GET | `/api/reports/:runId/unmatched` | Get unmatched transactions |
| POST | `/api/ingestion/ingest` | Trigger ingestion separately |

Optional body for `/reconcile`:

```json
{
  "timestampToleranceSeconds": 300,
  "quantityTolerancePct": 0.01
}
```

## Matching Logic

Transactions are matched across both sources using:

- **Asset** — case-insensitive with alias support (BTC = Bitcoin)
- **Type** — direct match or equivalent pairs (TRANSFER_IN ↔ TRANSFER_OUT)
- **Timestamp** — within configurable tolerance (default ±300 seconds)
- **Quantity** — within configurable percentage tolerance (default ±0.01%)

One-to-one matching is enforced — a transaction can only be matched once.

## Reconciliation Categories

| Category | Description |
|----------|-------------|
| matched | Paired successfully within all tolerances |
| conflicting | Same asset and type but exceeds timestamp or quantity tolerance |
| unmatched_user | Present in user file, no match in exchange file |
| unmatched_exchange | Present in exchange file, no match in user file |

## Invalid Row Handling

Rows that fail validation are never silently dropped. Stored in `invalidtransactions` collection with the original row and failure reason.

Validation checks:
- Transaction ID must exist
- Timestamp must be valid
- Asset must exist
- Quantity must be numeric and greater than zero
- Transaction type must exist

## Key Decisions

- **Feature-based folder structure** — each feature owns its controller, routes and service keeping the codebase modular and easy to scale
- **Bulk insert over row-by-row** — rows are collected first then bulk inserted after stream completes to avoid async race conditions
- **Fresh ingestion per run** — transactions are cleared before each reconciliation run to prevent duplicate data
- **Configurable tolerances** — set via environment variables or overridden per request via POST body
- **Normalization separated from ingestion** — asset and type normalization live in their own feature making it reusable and easy to extend

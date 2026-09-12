# AWS Migration Notes

Status of the Firebase → AWS migration, kept here so the whole team knows what's
connected and what isn't yet.

## ✅ Done

- **Infrastructure**: `infra/` (Terraform) — 4 DynamoDB tables, Cognito User Pool,
  IAM user, $1 budget alert. All Always-Free-tier-safe (see `infra/README.md`).
- **Product catalog**: 11,513 real products migrated from the Kaggle/HuggingFace
  fashion dataset into `fitstyle-ai-Products` (one-time migration, scripts in
  `export_catalog_for_migration.py` / `migrate_catalog_to_dynamodb.py` — not
  needed again, Kaggle is no longer a dependency).
- **Products API** (`server.ts` `/api/products` GET/POST/PUT/DELETE): now reads
  from DynamoDB (cached in memory at startup, writes go straight to DynamoDB).
  Used by: Admin Dashboard, Landing Page, Trending, My Looks, Wardrobe, Shopper
  Studio.
- **Body-shape taxonomy**: unified across the sizing model, recommendation
  engine, and frontend to one 5-value standard (`pear` / `hourglass` / `apple` /
  `rectangle` / `inverted_triangle`). See `FitVerse_Detect_Size_Module_FIXED.ipynb`
  and `src/utils/bodyShapeMap.ts`.

## ⏳ Not done yet

- **Auth**: still Firebase Auth + Firestore user profiles. Cognito (`Users`
  table + User Pool) exists in AWS but nothing calls it yet.
- **Body analysis**: `server.ts` `/api/analyze-body` still calls Qwen Vision via
  OpenRouter. `FitVerse_Detect_Size_Module_FIXED.ipynb` (MediaPipe-based) is not
  wired into the server as an endpoint yet.
- **Recommendation engine**: `FitStyle_v16` (FashionCLIP + CompatibilityNet) is
  not wired into the server as an endpoint yet — the site currently uses a
  simpler in-app rule + Groq for outfit advice.
- **Product images**: currently blank for all migrated products (no S3 bucket
  yet — pending a decision on whether S3 is free-tier-safe on this account).
- **Orders / Measurements tables**: created in DynamoDB, unused so far.

## Known data-quality caveats (placeholder data, not solved yet)

- `available_sizes` and `price` in the migrated catalog are randomly generated,
  not real merchant data.
- `occasion` is derived from Kaggle's `usage` field via a rough mapping
  (`server.ts` `mapUsageToOccasion`) — **Wedding and Interview currently have
  zero real inventory** since Kaggle's dataset has no matching values.
- Frontend `category` has no dedicated slot for dresses/outerwear; both are
  mapped to `"top"` as an approximation (see `export_catalog_for_migration.py`).

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env`, fill in values from `terraform output` (run
   inside `infra/`) — see `infra/README.md`.
3. `npm run dev`
4. Confirm the terminal shows `[DynamoDB] Loaded 11513 products into memory`.

## Infra changes (adding/removing AWS resources)

Only one person should run `terraform apply` / `terraform destroy` against the
shared AWS account (to avoid duplicate resources and free-tier limits being
split across multiple deployments). Everyone else just needs the connection
values shared via `.env` (never committed to git).

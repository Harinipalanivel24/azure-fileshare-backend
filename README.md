# ☁️ CloudShare — Azure Cloud File Upload & Sharing System

A complete cloud-native file upload and sharing web application built with **React**, **Node.js/Express**, and **7 Microsoft Azure services**.

---

## SECTION 1 — ARCHITECTURE OVERVIEW

```
┌──────────────────┐       HTTPS       ┌──────────────────────┐
│  React Frontend  │ ◄───────────────► │  Node.js Backend     │
│  (Azure Static   │                   │  (Azure App Service) │
│   Web Apps)      │                   │                      │
└──────────────────┘                   └──────┬───────┬───────┘
                                              │       │
                            ┌─────────────────┘       └──────────────┐
                            ▼                                        ▼
                  ┌──────────────────┐                 ┌──────────────────────┐
                  │  Azure Blob      │                 │  Azure Cosmos DB     │
                  │  Storage         │                 │  (MongoDB API)       │
                  │  (file uploads)  │                 │  (users + metadata)  │
                  └──────────────────┘                 └──────────────────────┘
                                                                 ▲
                                                                 │
                  ┌──────────────────┐                           │
                  │  Azure Functions │ ──── increments ──────────┘
                  │  (download       │     downloadCount
                  │   tracker)       │
                  └──────────────────┘

                  ┌──────────────────┐     ┌──────────────────┐
                  │  Azure Key Vault │     │  Azure Monitor   │
                  │  (secrets mgmt) │     │  (App Insights)  │
                  └──────────────────┘     └──────────────────┘
```

**How it works:**
1. React frontend talks to the Express backend via REST API.
2. Backend stores uploaded files in **Azure Blob Storage** and file metadata + user data in **Azure Cosmos DB (MongoDB API)**.
3. On every download, backend calls an **Azure Function** (HTTP trigger) to increment the download count (serverless).
4. **Azure Key Vault** manages secrets (connection strings, API keys).
5. **Azure Monitor / Application Insights** tracks requests, errors, and performance.
6. Frontend deployed on **Azure Static Web Apps**, backend on **Azure App Service**.

---

## SECTION 2 — FOLDER STRUCTURE

```
Project1/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   ├── azureStorage.js
│       │   ├── keyVault.js
│       │   └── monitor.js
│       ├── models/
│       │   ├── User.js
│       │   └── File.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── upload.js
│       ├── controllers/
│       │   ├── authController.js
│       │   └── fileController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── fileRoutes.js
│       └── utils/
│           └── generateToken.js
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css
│       ├── App.js
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── PrivateRoute.js
│       │   └── FilePreviewModal.js
│       └── pages/
│           ├── Register.js
│           ├── Login.js
│           ├── Dashboard.js
│           ├── Upload.js
│           ├── MyFiles.js
│           └── SharedFile.js
│
└── azure-function/
    ├── host.json
    ├── package.json
    ├── local.settings.example.json
    └── src/
        └── functions/
            └── trackDownload.js
```

---

## SECTION 3 — FRONTEND CODE

All frontend files have been generated at `d:\Project1\frontend\`.
The complete list of files and their purposes:

| File | Purpose |
|------|---------|
| `public/index.html` | HTML entry point with Inter font |
| `src/index.js` | React entry point |
| `src/index.css` | Full CSS design system |
| `src/App.js` | React Router with all routes |
| `src/services/api.js` | Axios instance with JWT interceptor |
| `src/components/Navbar.js` | Auth-aware navigation bar |
| `src/components/PrivateRoute.js` | Route guard for logged-in users |
| `src/components/FilePreviewModal.js` | Image/PDF preview modal |
| `src/pages/Register.js` | Sign up form |
| `src/pages/Login.js` | Login form |
| `src/pages/Dashboard.js` | Dashboard with stats cards |
| `src/pages/Upload.js` | Drag-and-drop file upload |
| `src/pages/MyFiles.js` | File grid with search, download, share, delete, preview |
| `src/pages/SharedFile.js` | Public shared file view (no login needed) |

---

## SECTION 4 — BACKEND CODE

All backend files have been generated at `d:\Project1\backend\`.

| File | Purpose |
|------|---------|
| `src/server.js` | Express app with Azure init, CORS, routes |
| `src/config/db.js` | Mongoose → Cosmos DB connection |
| `src/config/azureStorage.js` | Blob Storage client factory |
| `src/config/keyVault.js` | Key Vault SecretClient setup |
| `src/config/monitor.js` | Application Insights init |
| `src/models/User.js` | User schema with bcrypt hashing |
| `src/models/File.js` | File metadata schema |
| `src/middleware/auth.js` | JWT verify middleware |
| `src/middleware/upload.js` | Multer with file type/size validation |
| `src/controllers/authController.js` | Register, login, get-me |
| `src/controllers/fileController.js` | Upload, list, search, download, delete, share |
| `src/routes/authRoutes.js` | `/api/auth/*` routes |
| `src/routes/fileRoutes.js` | `/api/files/*` routes |
| `src/utils/generateToken.js` | JWT token generation |

### API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login` | ✗ | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| POST | `/api/files/upload` | ✓ | Upload a file |
| GET | `/api/files` | ✓ | List user's files |
| GET | `/api/files/search?q=` | ✓ | Search files by name |
| GET | `/api/files/:id` | ✓ | Get file details |
| GET | `/api/files/:id/download` | ✓ | Download a file |
| DELETE | `/api/files/:id` | ✓ | Delete a file |
| POST | `/api/files/:id/share` | ✓ | Generate share link |
| GET | `/api/files/shared/:token` | ✗ | Get shared file info |
| GET | `/api/files/shared/:token/download` | ✗ | Download shared file |

---

## SECTION 5 — AZURE FUNCTION CODE

File: `azure-function/src/functions/trackDownload.js`

- **Trigger:** HTTP POST to `/api/trackDownload`
- **Input:** `{ "fileId": "..." }`
- **Action:** Connects to Cosmos DB (same database), finds the file document, increments `downloadCount` by 1, saves.
- **Output:** `{ message, fileId, downloadCount }`

Uses **Azure Functions v4 programming model** with Node.js.

---

## SECTION 6 — ENVIRONMENT VARIABLES

### Backend `.env.example`

```
PORT=5000
JWT_SECRET=any_strong_random_string_here
COSMOS_MONGODB_URI=YOUR_VALUE_HERE
AZURE_STORAGE_CONNECTION_STRING=YOUR_VALUE_HERE
AZURE_STORAGE_CONTAINER_NAME=uploads
KEY_VAULT_URL=YOUR_VALUE_HERE
APPLICATIONINSIGHTS_CONNECTION_STRING=YOUR_VALUE_HERE
AZURE_FUNCTION_BASE_URL=YOUR_VALUE_HERE
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.example`

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Azure Function `local.settings.example.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "YOUR_VALUE_HERE",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_MONGODB_URI": "YOUR_VALUE_HERE"
  }
}
```

### Placeholder Summary

| Placeholder | Where it comes from |
|---|---|
| `COSMOS_MONGODB_URI` | Azure Cosmos DB → Connection strings → Primary connection string |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage Account → Access keys → Connection string |
| `KEY_VAULT_URL` | Azure Key Vault → Overview → Vault URI |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights → Overview → Connection string |
| `AZURE_FUNCTION_BASE_URL` | Azure Functions → Overview → URL (e.g. `https://your-func.azurewebsites.net`) |
| `AzureWebJobsStorage` | Same storage account connection string |

---

## SECTION 7 — LOCAL RUN INSTRUCTIONS

### Prerequisites
- Node.js 18+ installed
- Azure resources created (Section 8)
- `.env` files filled in (copy from `.env.example`)

### Run Backend

```bash
cd backend
copy .env.example .env          # then fill in real values
npm install
npm run dev
```

Backend runs at `http://localhost:5000`

### Run Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm start
```

Frontend runs at `http://localhost:3000`

### Run Azure Function (locally)

```bash
cd azure-function
copy local.settings.example.json local.settings.json   # fill in values
npm install
npm start                       # requires Azure Functions Core Tools installed
```

Function runs at `http://localhost:7071`

> **Note:** Install Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4 --unsafe-perm true`

---

## SECTION 8 — DETAILED AZURE SETUP

### 1. Azure Cosmos DB (MongoDB API)

**Used for:** Storing user accounts and file metadata.

**Steps:**
1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource** → Search **"Azure Cosmos DB"**
2. Click **Create** → Choose **"Azure Cosmos DB for MongoDB"**
3. **Subscription:** Select your subscription
4. **Resource Group:** Create new → `cloudshare-rg`
5. **Account Name:** `cloudshare-cosmosdb` (must be globally unique)
6. **Location:** Choose nearest region (e.g., `Central India`)
7. **Capacity mode:** Select **Serverless** (cheapest for demo)
8. Click **Review + Create** → **Create**
9. After deployment → Go to resource → **Connection strings** (left sidebar)
10. Copy **Primary Connection String**
11. Paste into:
    - `backend/.env` → `COSMOS_MONGODB_URI`
    - `azure-function/local.settings.json` → `COSMOS_MONGODB_URI`

**Verify:** Run backend → check console for `✅ Cosmos DB connected`.

**Common mistakes:**
- Don't pick "Core (SQL)" — you MUST pick **"MongoDB"** API
- Serverless mode is fine for demo; don't pick provisioned unless needed
- Append database name to connection string if needed: `.../?retryWrites=false&dbName=cloudshare`

---

### 2. Azure Blob Storage

**Used for:** Storing uploaded files (PDFs, images, documents).

**Steps:**
1. Azure Portal → **Create a resource** → Search **"Storage account"**
2. Click **Create**
3. **Resource Group:** `cloudshare-rg` (same as above)
4. **Storage account name:** `cloudsharestorage` (lowercase, globally unique)
5. **Region:** Same as Cosmos DB
6. **Performance:** Standard
7. **Redundancy:** LRS (cheapest)
8. Click **Review + Create** → **Create**
9. Go to resource → **Access keys** (left sidebar) → **Show keys**
10. Copy **Connection string** (key1)
11. Paste into `backend/.env` → `AZURE_STORAGE_CONNECTION_STRING`
12. Go to **Containers** (left sidebar) → **+ Container**
13. Name: `uploads` | Public access level: **Blob (anonymous read access for blobs only)**
14. Click **Create**

**Verify:** Upload a file → check the `uploads` container in portal.

**Common mistakes:**
- Container name MUST match `AZURE_STORAGE_CONTAINER_NAME` in `.env` (which is `uploads`)
- Set container access to **Blob** so previews and downloads work via direct URL
- Storage account names: only lowercase letters and numbers, 3-24 characters

---

### 3. Azure Key Vault

**Used for:** Securely storing secrets (connection strings, API keys) — demonstrates secure secrets management.

**Steps:**
1. Azure Portal → **Create a resource** → Search **"Key Vault"**
2. Click **Create**
3. **Resource Group:** `cloudshare-rg`
4. **Key vault name:** `cloudshare-keyvault` (globally unique)
5. **Region:** Same region
6. **Pricing tier:** Standard
7. Click **Review + Create** → **Create**
8. Go to resource → **Overview** → Copy **Vault URI** (looks like `https://cloudshare-keyvault.vault.azure.net/`)
9. Paste into `backend/.env` → `KEY_VAULT_URL`
10. Go to **Access policies** or **Access control (IAM)** → Give your own Azure account `Key Vault Secrets User` role

**Verify:** Backend starts without Key Vault errors.

**Common mistakes:**
- Your Azure account (or App Service's managed identity) must have permissions to read secrets
- If running locally, you need Azure CLI logged in (`az login`) for DefaultAzureCredential to work
- The code gracefully skips Key Vault if not configured (prints a warning)

---

### 4. Azure Monitor / Application Insights

**Used for:** Real-time monitoring, request logging, error tracking, performance metrics.

**Steps:**
1. Azure Portal → **Create a resource** → Search **"Application Insights"**
2. Click **Create**
3. **Resource Group:** `cloudshare-rg`
4. **Name:** `cloudshare-appinsights`
5. **Region:** Same region
6. **Resource Mode:** Workspace-based (create new Log Analytics Workspace if prompted)
7. Click **Review + Create** → **Create**
8. Go to resource → **Overview** → Copy **Connection string**
9. Paste into `backend/.env` → `APPLICATIONINSIGHTS_CONNECTION_STRING`

**Verify:** Run the backend → make a few API requests → Go back to Application Insights → **Live Metrics** or **Transaction Search** → you should see incoming requests.

**Common mistakes:**
- Copy the **Connection string**, NOT the Instrumentation Key (connection string is preferred)
- It may take 2-5 minutes for first data to appear

---

### 5. Azure Functions

**Used for:** Serverless download count tracking — the `trackDownload` function increments the download counter.

**Steps:**
1. Azure Portal → **Create a resource** → Search **"Function App"**
2. Click **Create**
3. **Resource Group:** `cloudshare-rg`
4. **Function App name:** `cloudshare-functions` (globally unique)
5. **Runtime stack:** Node.js
6. **Version:** 18 LTS or 20 LTS
7. **Region:** Same region
8. **Operating System:** Windows or Linux (either works)
9. **Plan:** Consumption (Serverless) — cheapest
10. Click **Review + Create** → **Create**
11. Go to resource → **Overview** → Copy the **URL** (e.g., `https://cloudshare-functions.azurewebsites.net`)
12. Paste into `backend/.env` → `AZURE_FUNCTION_BASE_URL`
13. Go to **Configuration** → **Application settings** → Add:
    - `COSMOS_MONGODB_URI` = (paste your Cosmos DB connection string)
14. **Deploy code:**
    - Install Azure Functions Core Tools
    - From `azure-function/` folder, run: `func azure functionapp publish cloudshare-functions`

**Verify:** Use Postman or curl: `POST https://cloudshare-functions.azurewebsites.net/api/trackDownload` with body `{"fileId":"any-valid-id"}`.

**Common mistakes:**
- Make sure `COSMOS_MONGODB_URI` is also set in the Function App's Application Settings
- The function uses v4 programming model — ensure the runtime supports it
- CORS: In Function App → **CORS** → Add `*` or your frontend URL

---

### 6. Azure App Service (Backend)

**Used for:** Hosting the Node.js/Express backend API.

**Steps:**
1. Azure Portal → **Create a resource** → Search **"App Service"**
2. Click **Create** → **Web App**
3. **Resource Group:** `cloudshare-rg`
4. **Name:** `cloudshare-backend` (becomes `cloudshare-backend.azurewebsites.net`)
5. **Runtime stack:** Node 18 LTS or 20 LTS
6. **Operating System:** Linux
7. **Region:** Same region
8. **Pricing plan:** Free F1 (for demo)
9. Click **Review + Create** → **Create**
10. Go to resource → **Configuration** → **Application settings** → Add ALL `.env` variables:
    - `PORT` = `8080` (App Service defaults to 8080)
    - `JWT_SECRET` = your secret
    - `COSMOS_MONGODB_URI` = your Cosmos connection string
    - `AZURE_STORAGE_CONNECTION_STRING` = your storage connection string
    - `AZURE_STORAGE_CONTAINER_NAME` = `uploads`
    - `KEY_VAULT_URL` = your vault URI
    - `APPLICATIONINSIGHTS_CONNECTION_STRING` = your insights connection string
    - `AZURE_FUNCTION_BASE_URL` = your function URL
    - `FRONTEND_URL` = your Static Web App URL (after step 7)
11. **Deploy code:**
    - Easiest: **Deployment Center** → Connect to GitHub repo → auto-deploy
    - OR: Use VS Code Azure extension → right-click `backend` folder → Deploy to Web App

**Verify:** Visit `https://cloudshare-backend.azurewebsites.net/api/health` → should return `{"status":"ok"}`

**Common mistakes:**
- Set **Startup Command** to `node src/server.js` in Configuration → General settings
- Make sure CORS allows your frontend domain

---

### 7. Azure Static Web Apps (Frontend)

**Used for:** Hosting the React frontend as a static site with global CDN.

**Steps:**
1. Azure Portal → **Create a resource** → Search **"Static Web App"**
2. Click **Create**
3. **Resource Group:** `cloudshare-rg`
4. **Name:** `cloudshare-frontend`
5. **Plan:** Free
6. **Source:** GitHub (connect your repo)
7. **Build Details:**
    - **Build Preset:** React
    - **App location:** `/frontend`
    - **Output location:** `build`
8. Click **Review + Create** → **Create**
9. Go to resource → **Overview** → Copy the **URL** (e.g., `https://blue-ocean-123.azurestaticapps.net`)
10. Update `REACT_APP_API_URL` before building:
    - Set it to `https://cloudshare-backend.azurewebsites.net/api`
11. Also update backend's `FRONTEND_URL` env variable to this Static Web App URL for CORS

**Verify:** Navigate to the URL → should see the CloudShare login page.

**Common mistakes:**
- `REACT_APP_API_URL` must be set at **build time** (it's baked into the React bundle)
- You may need to add a `staticwebapp.config.json` to handle SPA routing:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```
Place this file in `frontend/public/`.

---

## SECTION 9 — DEPLOYMENT MAPPING

| Azure Service | What to Create | Value to Copy | Goes into |
|---|---|---|---|
| **Cosmos DB** | Azure Cosmos DB for MongoDB account | Primary Connection String | `backend/.env` → `COSMOS_MONGODB_URI` **AND** `azure-function/local.settings.json` → `COSMOS_MONGODB_URI` |
| **Blob Storage** | Storage Account + Container `uploads` | Access Key Connection String | `backend/.env` → `AZURE_STORAGE_CONNECTION_STRING` |
| **Key Vault** | Key Vault | Vault URI (`https://...vault.azure.net/`) | `backend/.env` → `KEY_VAULT_URL` |
| **App Insights** | Application Insights | Connection String | `backend/.env` → `APPLICATIONINSIGHTS_CONNECTION_STRING` |
| **Functions** | Function App | Function App URL (`https://...azurewebsites.net`) | `backend/.env` → `AZURE_FUNCTION_BASE_URL` |
| **App Service** | Web App | Web App URL | `frontend/.env` → `REACT_APP_API_URL` (append `/api`) |
| **Static Web Apps** | Static Web App | Static Web App URL | `backend/.env` → `FRONTEND_URL` (for CORS) |

---

## SECTION 10 — FINAL TEST CHECKLIST

- [ ] Backend `npm run dev` starts without errors
- [ ] Frontend `npm start` loads without errors
- [ ] Register a new user → success → redirects to dashboard
- [ ] Login with the same user → success
- [ ] Upload a PDF file → appears in My Files
- [ ] Upload an image file → appears in My Files
- [ ] Search for a file by name → found
- [ ] Preview an image → modal shows image
- [ ] Preview a PDF → modal shows embedded PDF
- [ ] Download a file → file downloads correctly
- [ ] Download count increments after download
- [ ] Generate a share link → URL displayed
- [ ] Open share link in incognito/new browser (no login) → file visible
- [ ] Download from share link → works
- [ ] Delete a file → removed from list and Blob Storage
- [ ] Azure Portal → Cosmos DB → Data Explorer → `users` and `files` collections exist with data
- [ ] Azure Portal → Storage Account → `uploads` container has blobs
- [ ] Azure Portal → Application Insights → Live Metrics shows requests
- [ ] Azure Function → invoke manually via Postman → returns updated downloadCount
- [ ] Deploy backend to App Service → `/api/health` returns OK
- [ ] Deploy frontend to Static Web Apps → login page loads
- [ ] Full flow works end-to-end on deployed URLs

---

## Quick Reference Commands

```bash
# Install backend
cd backend && npm install

# Run backend (dev)
npm run dev

# Install frontend
cd frontend && npm install

# Run frontend
npm start

# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Run Azure Function locally
cd azure-function && npm install && npm start

# Deploy function to Azure
func azure functionapp publish cloudshare-functions
```

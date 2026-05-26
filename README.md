# BMH Perumbavoor CMS - Setup & Deployment Guide

This repository contains the Node.js Express backend CMS and dynamic client-side setup for the BMH Perumbavoor hospital website.

---

## 1. Prerequisites
Ensure you have the following installed on your machine/server:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [PostgreSQL](https://www.postgresql.org/) (v12 or higher)

---

## 2. Database Configuration
1. Make sure your PostgreSQL server is running.
2. The Node.js application will automatically check for the existence of the database and set up the schema and seed data when initialized. You only need to provide connection credentials.

---

## 3. Local Installation & Configuration

### Step A: Configure Environment Variables
Inside the `server/` directory, create a file named `.env` and configure your credentials:

```env
PORT=5000
DATABASE_URL=postgresql://<db_user>:<db_password>@127.0.0.1:5432/bmh_perumbavoor
JWT_SECRET=any_secure_random_string_for_tokens

# Initial Super Admin Details
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword123
ADMIN_EMAIL=admin@bmhperumbavoor.com

# SMTP Settings for Forgot Password (Gmail)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_16_digit_app_password
```
*(Note: To generate a Google App Password, go to Google Account -> Security -> Enable 2-Step Verification -> Search 'App Passwords' -> Generate a code).*

### Step B: Install Dependencies & Run Database Seeding
Open your terminal inside the `server/` directory and run:

```bash
# Install NPM modules
npm install

# Run database setup & seeding (Creates database and inserts website content)
npm run init-db
```

### Step C: Run local development server
Start the Express server:

```bash
npm start
```
The server will start running on `http://localhost:5000`.

---

## 4. Administrative Features

### Accessing the CMS Dashboard
Open `http://localhost:5000/admin` in your web browser.
*   **Default Username**: `admin`
*   **Default Password**: `adminpassword123`

### CMS Features Included
1.  **Dynamic Content Editor**: Edit Heroes, Facilities, Specialties, Gallery, Events, Attractions, Transit Modes, and Footer contacts in real-time.
2.  **Media Library**: Upload images directly. Copy image path URLs (e.g. `/uploads/...`) and paste them into content sections, or delete unneeded assets.
3.  **Account Registration**: Register additional administrator accounts.
4.  **Forgot Password Reset**: Request a secure 6-digit verification code to reset passwords via email.

---

## 5. Client Integration
The homepage is pre-integrated to auto-detect and consume the CMS API. If you run the homepage locally (e.g., using VS Code Live Server on any port), it will automatically fetch content from `http://localhost:5000/api/homepage`.

---

## 6. Production Deployment

### Deployed Server Environments (e.g., Render, Railway, Heroku)
When deploying the Express app to cloud instances:
1.  Set the repository root directory as `/server`.
2.  Define all `.env` credentials in the host's **Environment Variables / Config Vars** panel.
3.  Set the Start Command to: `npm start`.
4.  Optionally point the database URL `DATABASE_URL` to a cloud-managed PostgreSQL instance.

---

## ✨ Features
- **Image upload** with automatic storage under `server/uploads/`
- **Admin authentication** (registration, login, JWT, password reset)
- **Email integration** (`nodemailer`) for reset tokens
- **Remote PostgreSQL support** with SSL (`NODE_ENV=production`)
- **Docker‑compatible** (Dockerfile provided in the repo)
- **README for client deployment** (`readme_client.md`)
- **Future‑ready sidebar** to list all uploaded images

---

## ☁️ Cloud Deployment & Remote PostgreSQL
1. **Provision a PostgreSQL instance** on your cloud provider (e.g., Railway, Supabase, Neon). Copy the connection string.
2. **Set the following environment variables** on the hosting platform:
   - `DATABASE_URL` – remote URI (includes SSL mode if required)
   - `JWT_SECRET`
   - `EMAIL_USER` & `EMAIL_PASS`
   - `NODE_ENV=production`
3. Deploy the repo (GitHub → Cloud provider CI/CD). The server will automatically use SSL for the DB connection.

---

## 🔐 Admin Panel
Open the admin UI at:
```
http://localhost:5000/admin
```
From there you can:
- **Register** a new admin using a Gmail address.
- **Login** to obtain a JWT (stored in localStorage).
- **Forgot password** → receive a 6‑digit reset token via email.
- **Reset password** using the token.
- **View uploaded images** via the *Sidebar → All Images* link (implemented and ready).

---

## 📂 Project Structure
```
├─ server/                # Express backend
│  ├─ public/            # Static assets (admin UI, uploads)
│  ├─ db.js              # DB connection (SSL handling)
│  ├─ initDb.js          # DB seed / schema creation
│  ├─ schema.sql         # SQL schema
│  └─ index.js           # Main server file
├─ .env                   # Environment configuration (git‑ignored)
├─ .gitignore             # Ignored files
├─ README.md              # <‑ **this file**
├─ readme_client.md      # Client‑side deployment guide
└─ package.json
```

---

## 🚀 Running Tests / Verification
_No automated tests are bundled yet, but you can quickly verify functionality by:_
1. Starting the server (`npm start`).
2. Visiting `http://localhost:5000/` – upload an image.
3. Opening `http://localhost:5000/admin` – register/login and view the image list.

---

## 🤝 Contributing
Feel free to open issues or submit pull requests. Follow the existing code style and run `npm run lint` before committing.

---

## 📄 License
This project is licensed under the MIT License.

---

*Enjoy building with it!*

# Deployment Guide — Portfolio Project

This guide provides instructions on how to build, deploy, backup, and secure the Portfolio Project in a production environment.

---

## 1. Prerequisites
Before deploying, ensure the target server has the following installed:
* **Docker** (version 20.10+)
* **Docker Compose** (version 2.0+)
* **Git**

---

## 2. Environment Configurations
Prepare your production environment variables. Create a `.env` file in the root directory of the project:

```bash
# PostgreSQL
POSTGRES_USER=your_secure_db_user
POSTGRES_PASSWORD=your_super_secure_db_password
POSTGRES_DB=portfolio_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://your_secure_db_user:your_super_secure_db_password@db:5432/portfolio_db

# Backend & Security
BACKEND_PORT=3000
NODE_ENV=production
# Generate a secure random string (64 characters):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_secure_64_char_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourportfolio.com

# First Admin Credentials (Seeded on first startup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_highly_secure_admin_password_123!

# AI Assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 3. Launching with Docker Compose
The project is completely containerized. Start the stack (Database, NestJS Backend, React Frontend served via Nginx) using:

```bash
# Build and start services in detached mode
docker-compose up -d --build
```

### Checking Services Health
You can check the health and status of the running containers with:
```bash
docker ps
```
The output should show three healthy containers:
* `portfolio_frontend` (serving SPA and acting as reverse-proxy on port 80/443)
* `portfolio_backend` (running NestJS API on internal port 3000)
* `portfolio_db` (running PostgreSQL 16 on port 5432)

---

## 4. Automated Database Backups
A backup script is available under [scripts/backup.sh](file:///Users/hot_pepper/MyProjectGitHub/MyPortfolio/scripts/backup.sh). It dumps the database, compresses it with gzip, and deletes backups older than 30 days.

### Setting up a Cron Job
To automate nightly backups (e.g., at 2:00 AM), edit the root crontab on the host machine:

```bash
sudo crontab -e
```

Add the following line (adjust path to match your project root folder):
```bash
0 2 * * * /path/to/MyPortfolio/scripts/backup.sh >> /path/to/MyPortfolio/backups/backup.log 2>&1
```

Make sure the script has execute permissions:
```bash
chmod +x /path/to/MyPortfolio/scripts/backup.sh
```

---

## 5. SSL & HTTPS Configurations (Let's Encrypt)
To secure connection with HTTPS (SSL/TLS), we recommend using **Certbot** on the host machine or adding a Let's Encrypt sidecar container.

### Option: Nginx Reverse Proxy with Certbot on the Host
If you choose to run Certbot on the host:
1. Install certbot and the Nginx plugin:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```
2. Request a certificate:
   ```bash
   sudo certbot --nginx -d yourportfolio.com
   ```
3. Map Nginx ports in `docker-compose.yml` to internal ports (e.g. `8080:80`) and let host Nginx handle SSL termination and proxying to the frontend container.

---

## 6. Built-in Security Safeguards
The application includes several production-grade security protections:

* **Account Lockout**: After 5 consecutive failed login attempts, the admin account is locked for **15 minutes**.
* **Request Limits**: JSON payload limits are globally restricted to **2MB** in NestJS to prevent memory exhaustion. Nginx supports up to **10MB** only for file uploads (`client_max_body_size 10M`).
* **CSRF Protection**: All mutating endpoints (POST, PUT, DELETE, PATCH) validate the custom `X-Requested-With: XMLHttpRequest` header.
* **CSP Headers**: Content-Security-Policy headers are enforced on both the Nginx proxy layer and the NestJS Helmet middleware to prevent XSS.
* **Gzip Compression**: Backend responses and frontend assets are compressed using Gzip for fast loading.

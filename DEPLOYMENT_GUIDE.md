# Deployment Guide — Portfolio Project

This guide provides instructions on how to build, deploy, backup, and secure the Portfolio Project in a production environment (such as a Linux VPS) using Docker Compose, set up secure HTTPS using Nginx and Certbot, and configure automated backups.

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

## 4. Host-Level Nginx Reverse Proxy Setup (Recommended for SSL)
For full production security, it is recommended to run Nginx on the host machine to proxy requests into the Docker network and manage SSL certificates.

### A. Install Nginx and Certbot
On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### B. Configure Server Block
Create an Nginx configuration file at `/etc/nginx/sites-available/portfolio` with reverse proxy rules pointing to the Docker services:

```nginx
server {
    listen 80;
    server_name yourportfolio.com www.yourportfolio.com;

    # Backend API proxy
    location /api {
        proxy_pass http://127.0.0.1:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads folder proxy
    location /uploads {
        proxy_pass http://127.0.0.1:3000/uploads;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Host $host;
    }

    # Frontend SPA proxy
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### C. Obtain SSL (HTTPS) Certificates
Run Certbot to obtain and automatically configure Let's Encrypt certificates:
```bash
sudo certbot --nginx -d yourportfolio.com -d www.yourportfolio.com
```
Follow the interactive prompts. Certbot will automatically rewrite the Nginx configuration to support secure HTTPS redirects on port 443.

---

## 5. Automated Database Backups
A backup script is available under [scripts/backup.sh](file:///Users/hot_pepper/MyProjectGitHub/MyPortfolio/scripts/backup.sh). It dumps the database, compresses it with gzip, and deletes backups older than 30 days.

### Setting up a Cron Job
To automate nightly backups (e.g., at 2:00 AM), edit the root crontab on the host machine:

```bash
sudo crontab -e
```

Add the following line (adjust path to match your project root folder):
```bash
0 2 * * * /bin/bash /path/to/MyPortfolio/scripts/backup.sh >> /path/to/MyPortfolio/backups/backup.log 2>&1
```

Make sure the script has execute permissions:
```bash
chmod +x /path/to/MyPortfolio/scripts/backup.sh
```

---

## 6. Built-in Security & Performance Safeguards
The application includes several production-grade security protections:

* **Account Lockout**: After 5 consecutive failed login attempts, the admin account is locked for **15 minutes** to prevent brute-force attacks.
* **Password Complexity**: Admin passwords must satisfy strength requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).
* **Request Limits**: JSON payload limits are globally restricted to **2MB** in NestJS to prevent memory exhaustion. Nginx supports up to **10MB** only for file uploads (`client_max_body_size 10M`).
* **CSRF Protection**: JWT tokens are stored in `SameSite=Strict` HttpOnly cookies. The browser automatically rejects cross-origin requests, eliminating the need for custom headers.
* **CSP Headers**: Content-Security-Policy headers are enforced on both the Nginx proxy layer and the NestJS Helmet middleware to prevent XSS.
* **Gzip Compression**: Backend responses and frontend assets are compressed using Gzip for fast loading.
* **CI/CD Workflow**: Every pull request and push to the `main` branch triggers an automated test runner (Unit and E2E tests inside a Postgres container) to ensure no regressions.

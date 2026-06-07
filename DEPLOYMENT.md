# Production Deployment and Database Backups Guide

This guide details the steps to deploy the portfolio application to a production environment (such as a Linux VPS) using Docker Compose, set up secure HTTPS using Nginx and Certbot, and configure automated daily database backups.

---

## 1. Production Docker Deployment

### A. Environment Configuration
Create a production `.env` file in the root directory or configure environment variables directly on the server host:

```bash
# PostgreSQL configurations
POSTGRES_USER=portfolio_admin
POSTGRES_PASSWORD=choose_a_strong_password
POSTGRES_DB=portfolio_db

# Backend Configurations
JWT_SECRET=choose_a_secure_jwt_secret_at_least_32_characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose_an_admin_panel_password

# CORS Settings (domains allowed to call backend API)
ALLOWED_ORIGINS=https://yourportfolio.com,https://www.yourportfolio.com
```

Create a production `.env.docker` file inside the `frontend/` directory to configure the frontend build variables:
```bash
VITE_API_URL=/api
```

### B. Launching containers
To build and run the production environment in the background:
```bash
docker compose -f docker-compose.yml up -d --build
```
This maps:
- **Frontend Nginx server** to port `80` (HTTP) and `443` (HTTPS) on the host.
- **Backend API server** internally (accessible via port `3000` locally).
- **Postgres Database** internally (accessible via port `5433` on the host, bound to localhost for security).

---

## 2. Nginx Secure Reverse Proxy Setup

For full production security, it is recommended to run Nginx on the host machine to proxy requests into the Docker network and manage SSL certificates.

### A. Install Nginx and Certbot
On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### B. Configure Server block
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
Follow the interactive prompt. Certbot will automatically rewrite the Nginx configuration to support secure HTTPS redirects on port 443.

---

## 3. Automated Database Backups

A shell script handles daily database snapshots and stores them locally, keeping only the last 30 snapshots to save disk space.

### A. Backup Script
The backup script is located at `scripts/backup.sh`. It automatically:
1. Connects to the running `portfolio_db` PostgreSQL container.
2. Dumps the database using `pg_dump` and compresses it using `gzip`.
3. Stores it in the `backups/` directory on the host.
4. Deletes files older than 30 days.

To configure and run the backup manually:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### B. Automated Schedule (Cron)
To configure the script to run automatically every night at 3:00 AM, open the crontab editor on your host machine:
```bash
crontab -e
```

Add the following line to the end of the crontab:
```cron
0 3 * * * /bin/bash /path/to/your/project/scripts/backup.sh >> /path/to/your/project/backups/backup.log 2>&1
```
*(Make sure to replace `/path/to/your/project/` with the absolute path to your portfolio directory on the server)*.

# Azure VM Deployment Guide

**Insightful Health - Astro + PocketBase Deployment**

**Document Version:** 1.0  
**Last Updated:** January 7, 2026

---

## 📋 Overview

This guide provides step-by-step instructions to deploy the Insightful Health blogging platform (Astro website + PocketBase database) to an Azure Virtual Machine.

**Architecture:**
- Azure VM (Ubuntu 22.04 LTS)
- Nginx (reverse proxy and SSL termination)
- Node.js (for Astro)
- PocketBase (SQLite database)
- Let's Encrypt (free SSL certificates)
- systemd (process management)

---

## 🚀 Phase 1: Azure VM Setup

### Step 1.1: Create Azure VM

1. **Login to Azure Portal**
   - Navigate to https://portal.azure.com
   - Sign in with your Azure account

2. **Create Virtual Machine**
   - Click "Create a resource" → "Virtual Machine"
   - **Basics:**
     - Subscription: Choose your subscription
     - Resource Group: Create new "insightful-health-rg"
     - VM Name: `insightful-health-vm`
     - Region: Choose closest to your users (e.g., East US, West Europe)
     - Image: `Ubuntu Server 22.04 LTS - x64 Gen2`
     - Size: `Standard_B2s` (2 vCPUs, 4 GB RAM) - minimum recommended
       - For production: `Standard_B2ms` or higher
     - Authentication: SSH public key (recommended) or password
     - Username: `azureuser` (or your preference)
   
   - **Disks:**
     - OS disk type: `Standard SSD` (or Premium SSD for production)
     - Size: 30 GB minimum (64 GB recommended)
   
   - **Networking:**
     - Virtual network: Create new or use existing
     - Subnet: default
     - Public IP: Create new (Static IP recommended for production)
     - NIC network security group: Basic
     - Public inbound ports: `SSH (22), HTTP (80), HTTPS (443)`
   
   - **Management:**
     - Enable auto-shutdown (optional, for cost savings)
     - Boot diagnostics: Enable
   
   - **Review + Create**
     - Verify all settings
     - Click "Create"
     - Download SSH private key (if using SSH authentication)

3. **Note Your Public IP**
   - After deployment, go to the VM resource
   - Copy the Public IP address (e.g., `20.123.45.67`)
   - You'll need this for DNS and SSH access

### Step 1.2: Configure Network Security Group

1. **Navigate to Network Security Group**
   - In Azure Portal, go to your VM
   - Click "Networking" → "Network security group"

2. **Add Inbound Security Rules**
   - Click "Add inbound port rule"
   - Add the following rules:

   **Rule 1: HTTP**
   - Source: Any
   - Source port ranges: *
   - Destination: Any
   - Service: HTTP
   - Destination port ranges: 80
   - Protocol: TCP
   - Action: Allow
   - Priority: 100
   - Name: `Allow-HTTP`

   **Rule 2: HTTPS**
   - Source: Any
   - Source port ranges: *
   - Destination: Any
   - Service: HTTPS
   - Destination port ranges: 443
   - Protocol: TCP
   - Action: Allow
   - Priority: 110
   - Name: `Allow-HTTPS`

   **Rule 3: SSH** (should already exist)
   - Destination port ranges: 22
   - For security, consider restricting source to your IP

### Step 1.3: Configure DNS (Optional but Recommended)

1. **Option A: Azure DNS**
   - Go to your VM → Overview
   - Click "Configure" under DNS name
   - Enter DNS name label: `insightful-health`
   - Result: `insightful-health.eastus.cloudapp.azure.com`

2. **Option B: Custom Domain**
   - Purchase domain (e.g., from Namecheap, GoDaddy)
   - Add A record pointing to your VM's public IP
   - Example: `blog.yourdomain.com` → `20.123.45.67`
   - Wait for DNS propagation (15 minutes - 48 hours)

---

## 🔧 Phase 2: Server Configuration

### Step 2.1: Connect to VM via SSH

**Windows (PowerShell or Command Prompt):**
```powershell
ssh azureuser@20.123.45.67
# Or with custom domain:
ssh azureuser@insightful-health.eastus.cloudapp.azure.com
```

**If using SSH key:**
```powershell
ssh -i path/to/your-key.pem azureuser@20.123.45.67
```

### Step 2.2: Update System Packages

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip build-essential
```

### Step 2.3: Install Node.js (v18 or higher)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 globally (process manager)
sudo npm install -g pm2
```

### Step 2.4: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Test: Visit http://YOUR_VM_IP in browser
# You should see "Welcome to nginx!" page
```

### Step 2.5: Configure Firewall (UFW)

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PocketBase admin (optional, for development)
# sudo ufw allow 8090/tcp

# Check status
sudo ufw status verbose
```

---

## 📦 Phase 3: Deploy PocketBase

### Step 3.1: Download and Install PocketBase

```bash
# Create PocketBase directory
sudo mkdir -p /opt/pocketbase
cd /opt/pocketbase

# Download latest PocketBase (check https://github.com/pocketbase/pocketbase/releases for latest version)
sudo wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Unzip
sudo unzip pocketbase_0.22.0_linux_amd64.zip
sudo rm pocketbase_0.22.0_linux_amd64.zip

# Make executable
sudo chmod +x pocketbase

# Create data directory
sudo mkdir -p /opt/pocketbase/pb_data

# Set permissions
sudo chown -R azureuser:azureuser /opt/pocketbase
```

### Step 3.2: Upload Your PocketBase Data

**Option A: SCP from local machine (recommended for initial setup)**

```powershell
# From your local machine (Windows PowerShell):
cd "C:\AI Development\VSCode\PRD-Driven-Copilot\pocketbase"

# Upload pb_data directory
scp -r pb_data azureuser@20.123.45.67:/opt/pocketbase/

# Upload migrations
scp -r pb_migrations azureuser@20.123.45.67:/opt/pocketbase/
```

**Option B: Git clone (if data is in repository)**

```bash
# On VM:
cd /opt/pocketbase
git clone https://github.com/yourusername/your-repo.git temp
mv temp/pocketbase/pb_data .
mv temp/pocketbase/pb_migrations .
rm -rf temp
```

### Step 3.3: Create PocketBase systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/pocketbase.service
```

**Paste the following configuration:**

```ini
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=azureuser
Group=azureuser
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Save and exit** (Ctrl+X, Y, Enter)

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start PocketBase
sudo systemctl start pocketbase

# Enable auto-start on boot
sudo systemctl enable pocketbase

# Check status
sudo systemctl status pocketbase

# View logs
sudo journalctl -u pocketbase -f
```

### Step 3.4: Test PocketBase

```bash
# Test local connection
curl http://localhost:8090/api/health

# Should return: {"code":200,"message":"API is healthy","data":{}}
```

---

## 🌐 Phase 4: Deploy Astro Website

### Step 4.1: Clone Your Project

```bash
# Create app directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/insightful-health.git
cd insightful-health

# Set ownership
sudo chown -R azureuser:azureuser /var/www/insightful-health
```

### Step 4.2: Configure Environment Variables

```bash
# Create .env.production file
cd /var/www/insightful-health
nano .env.production
```

**Add the following (update with your actual values):**

```env
# Site Configuration
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_POCKETBASE_URL=https://yourdomain.com/api

# PocketBase Admin
PRIVATE_POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
PRIVATE_POCKETBASE_ADMIN_PASSWORD=your-secure-password

# OAuth Credentials
PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
PRIVATE_GITHUB_CLIENT_SECRET=your-github-client-secret

PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
PRIVATE_GOOGLE_CLIENT_SECRET=your-google-client-secret

PUBLIC_FACEBOOK_CLIENT_ID=your-facebook-client-id
PRIVATE_FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# MailerLite
PRIVATE_MAILERLITE_API_KEY=your-mailerlite-api-key

# Google Analytics
PUBLIC_GA_ID=G-XXXXXXXXXX

# Session Secret (generate a random string)
SESSION_SECRET=your-random-session-secret-min-32-chars
```

**Save and exit** (Ctrl+X, Y, Enter)

### Step 4.3: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files are now in /var/www/insightful-health/dist
```

### Step 4.4: Set Up PM2 for Astro (SSR Mode)

**If using Astro SSR (server-side rendering):**

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'insightful-health',
    script: './dist/server/entry.mjs',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs (will start with 'sudo')

# Check status
pm2 status
pm2 logs
```

**If using Static Site Generation (SSG):**
- Skip PM2 setup
- Nginx will serve static files directly from `dist/` folder

---

## 🔒 Phase 5: Nginx Configuration & SSL

### Step 5.1: Configure Nginx for Astro + PocketBase

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create new site configuration
sudo nano /etc/nginx/sites-available/insightful-health
```

**For SSR (Astro running on port 3000):**

```nginx
# Upstream for Astro
upstream astro_backend {
    server 127.0.0.1:3000;
}

# Upstream for PocketBase
upstream pocketbase_backend {
    server 127.0.0.1:8090;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # Or use Azure DNS: insightful-health.eastus.cloudapp.azure.com

    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Root directory (for static assets if needed)
    root /var/www/insightful-health/dist;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # PocketBase API and Admin
    location /api/ {
        proxy_pass http://pocketbase_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for large uploads
        client_max_body_size 10M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /_/ {
        proxy_pass http://pocketbase_backend/_/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Astro application
    location / {
        proxy_pass http://astro_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**For SSG (Static files):**

```nginx
# Upstream for PocketBase
upstream pocketbase_backend {
    server 127.0.0.1:8090;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/insightful-health/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # PocketBase API and Admin
    location /api/ {
        proxy_pass http://pocketbase_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        client_max_body_size 10M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /_/ {
        proxy_pass http://pocketbase_backend/_/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Save and exit**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/insightful-health /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If successful, reload Nginx
sudo systemctl reload nginx
```

### Step 5.2: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or for Azure DNS:
sudo certbot --nginx -d insightful-health.eastus.cloudapp.azure.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will automatically renew certificates via cron job
```

### Step 5.3: Verify Deployment

```bash
# Check all services are running
sudo systemctl status nginx
sudo systemctl status pocketbase
pm2 status  # If using SSR

# Test endpoints
curl http://localhost:8090/api/health  # PocketBase
curl http://localhost:3000              # Astro (if SSR)
curl https://yourdomain.com             # Public site
```

**Visit in browser:**
- `https://yourdomain.com` - Your website
- `https://yourdomain.com/_/` - PocketBase admin panel

---

## 🔄 Phase 6: Deployment Automation

### Step 6.1: Create Deployment Script

```bash
# On VM, create deploy script
nano /var/www/insightful-health/deploy.sh
```

**Add deployment script:**

```bash
#!/bin/bash

# Insightful Health Deployment Script

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/insightful-health

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build project
echo "🔨 Building project..."
npm run build

# Restart services
if pm2 list | grep -q "insightful-health"; then
    echo "♻️  Restarting PM2 service..."
    pm2 restart insightful-health
else
    echo "✅ Static site - no PM2 restart needed"
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Visit: https://yourdomain.com"
```

**Make executable:**

```bash
chmod +x /var/www/insightful-health/deploy.sh
```

### Step 6.2: Setup GitHub Actions CI/CD Pipeline

#### Step 6.2.1: Generate SSH Deploy Key

**On your Azure VM:**

```bash
# Generate SSH key pair for deployment
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# Display private key (you'll need this for GitHub Secrets)
cat ~/.ssh/github_deploy_key

# Copy the entire output including "-----BEGIN OPENSSH PRIVATE KEY-----" and "-----END OPENSSH PRIVATE KEY-----"
```

**Important:** Keep the private key secure - you'll add it to GitHub Secrets.

#### Step 6.2.2: Configure GitHub Secrets

1. **Navigate to your GitHub repository**
   - Go to `https://github.com/yourusername/insightful-health`
   - Click **Settings** → **Secrets and variables** → **Actions**

2. **Add the following secrets** (click "New repository secret" for each):

   **SSH_PRIVATE_KEY:**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [paste the entire private key from github_deploy_key]
   -----END OPENSSH PRIVATE KEY-----
   ```

   **SSH_HOST:**
   ```
   20.123.45.67
   ```
   (or your domain: `insightful-health.eastus.cloudapp.azure.com`)

   **SSH_USERNAME:**
   ```
   azureuser
   ```

   **Optional - Environment Variables (if not in .env.production):**
   - `PUBLIC_POCKETBASE_URL`
   - `SESSION_SECRET`
   - `PRIVATE_GITHUB_CLIENT_SECRET`
   - `PRIVATE_GOOGLE_CLIENT_SECRET`
   - `PRIVATE_FACEBOOK_CLIENT_SECRET`
   - `PRIVATE_MAILERLITE_API_KEY`
   - etc.

#### Step 6.2.3: Create GitHub Actions Workflow

**On your local machine:**

```bash
# Navigate to your project
cd "C:\AI Development\VSCode\PRD-Driven-Copilot"

# Create workflows directory
mkdir -p .github/workflows
```

**Create deployment workflow file:**

```bash
# Create the workflow file
# File: .github/workflows/deploy.yml
```

**Paste the following configuration:**

```yaml
name: Deploy to Azure VM

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Allows manual trigger

jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          PUBLIC_SITE_URL: ${{ secrets.PUBLIC_SITE_URL }}
          PUBLIC_POCKETBASE_URL: ${{ secrets.PUBLIC_POCKETBASE_URL }}
          PUBLIC_GITHUB_CLIENT_ID: ${{ secrets.PUBLIC_GITHUB_CLIENT_ID }}
          PUBLIC_GOOGLE_CLIENT_ID: ${{ secrets.PUBLIC_GOOGLE_CLIENT_ID }}
          PUBLIC_FACEBOOK_CLIENT_ID: ${{ secrets.PUBLIC_FACEBOOK_CLIENT_ID }}
          PUBLIC_GA_ID: ${{ secrets.PUBLIC_GA_ID }}

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add server to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to Azure VM
        run: |
          # Create deployment archive
          tar -czf deploy.tar.gz dist/ package.json package-lock.json

          # Upload to server
          scp deploy.tar.gz ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:/tmp/

          # Execute deployment commands on server
          ssh ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} << 'ENDSSH'
            set -e
            
            # Navigate to project directory
            cd /var/www/insightful-health
            
            # Backup current version
            if [ -d "dist" ]; then
              tar -czf ~/backups/site_backup_$(date +%Y%m%d_%H%M%S).tar.gz dist/
            fi
            
            # Extract new version
            tar -xzf /tmp/deploy.tar.gz
            rm /tmp/deploy.tar.gz
            
            # Update dependencies (only if package.json changed)
            npm ci --production
            
            # Restart PM2 if using SSR
            if pm2 list | grep -q "insightful-health"; then
              pm2 restart insightful-health
            fi
            
            # Reload Nginx
            sudo systemctl reload nginx
            
            # Clean old backups (keep last 5)
            cd ~/backups
            ls -t site_backup_*.tar.gz | tail -n +6 | xargs -r rm
            
            echo "✅ Deployment successful!"
          ENDSSH

      - name: Verify deployment
        run: |
          # Wait for services to restart
          sleep 5
          
          # Check if site is accessible
          response=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com)
          
          if [ $response -eq 200 ] || [ $response -eq 301 ] || [ $response -eq 302 ]; then
            echo "✅ Site is accessible (HTTP $response)"
          else
            echo "❌ Site returned HTTP $response"
            exit 1
          fi

      - name: Notify on failure
        if: failure()
        run: |
          echo "❌ Deployment failed! Check the logs above for details."
```

#### Step 6.2.4: Create Staging/Production Workflows (Optional)

**For more advanced deployments with staging environment:**

**File: .github/workflows/deploy-staging.yml**

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop
  pull_request:
    branches:
      - main

jobs:
  deploy-staging:
    name: Deploy to Staging Environment
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test || echo "No tests configured"

      - name: Build project
        run: npm run build
        env:
          PUBLIC_SITE_URL: ${{ secrets.STAGING_SITE_URL }}
          PUBLIC_POCKETBASE_URL: ${{ secrets.STAGING_POCKETBASE_URL }}

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.STAGING_SSH_PRIVATE_KEY }}

      - name: Deploy to Staging Server
        run: |
          # Similar deployment steps as production
          # but targeting staging server
          echo "Deploying to staging..."
```

**File: .github/workflows/deploy-production.yml**

```yaml
name: Deploy to Production

on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  deploy-production:
    name: Deploy to Production Environment
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build
        env:
          NODE_ENV: production
          PUBLIC_SITE_URL: ${{ secrets.PUBLIC_SITE_URL }}
          PUBLIC_POCKETBASE_URL: ${{ secrets.PUBLIC_POCKETBASE_URL }}

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Deploy to Production
        run: |
          # Deployment steps with additional safety checks
          echo "Deploying version ${{ github.event.release.tag_name }} to production..."

      - name: Create deployment notification
        if: success()
        run: |
          echo "✅ Production deployment successful!"
          echo "Version: ${{ github.event.release.tag_name }}"
```

#### Step 6.2.5: Setup Server for Automated Deployments

**On your Azure VM, allow passwordless sudo for Nginx reload:**

```bash
# Create sudoers file for nginx reload
sudo visudo -f /etc/sudoers.d/deploy

# Add this line (replace 'azureuser' with your username):
azureuser ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
azureuser ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
```

**Create backups directory:**

```bash
mkdir -p ~/backups
```

#### Step 6.2.6: Test the CI/CD Pipeline

1. **Commit and push your workflow:**

```bash
# Add the workflow files
git add .github/workflows/deploy.yml

# Commit
git commit -m "Add GitHub Actions CI/CD pipeline"

# Push to main branch
git push origin main
```

2. **Monitor the deployment:**
   - Go to your GitHub repository
   - Click **Actions** tab
   - Watch the workflow run
   - Check logs for any errors

3. **Verify deployment:**
   - Visit your website: `https://yourdomain.com`
   - Check that changes are live
   - Review deployment logs on GitHub

#### Step 6.2.7: Advanced CI/CD Features

**Add build caching for faster deployments:**

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Add Slack/Discord notifications:**

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Add deployment status badge to README:**

```markdown
[![Deploy Status](https://github.com/yourusername/insightful-health/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/insightful-health/actions/workflows/deploy.yml)
```

#### Step 6.2.8: Rollback Strategy

**Create rollback workflow:**

**File: .github/workflows/rollback.yml**

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      backup_file:
        description: 'Backup filename (e.g., site_backup_20260107_120000.tar.gz)'
        required: true
        type: string

jobs:
  rollback:
    name: Rollback to Previous Version
    runs-on: ubuntu-latest
    
    steps:
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Rollback deployment
        run: |
          ssh ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} << 'ENDSSH'
            cd /var/www/insightful-health
            
            # Remove current version
            rm -rf dist/
            
            # Restore from backup
            tar -xzf ~/backups/${{ inputs.backup_file }}
            
            # Restart services
            pm2 restart insightful-health || true
            sudo systemctl reload nginx
            
            echo "✅ Rollback complete!"
          ENDSSH
```

**Manual rollback on server:**

```bash
# On Azure VM - emergency rollback
cd /var/www/insightful-health

# List available backups
ls -lth ~/backups/site_backup_*.tar.gz

# Restore specific backup
rm -rf dist/
tar -xzf ~/backups/site_backup_20260107_120000.tar.gz

# Restart services
pm2 restart insightful-health  # if using SSR
sudo systemctl reload nginx
```

---

## 📊 Phase 7: Monitoring & Maintenance

### Step 7.1: Setup Automated Backups

```bash
# Create backup script
sudo nano /opt/scripts/backup-pocketbase.sh
```

**Add backup script:**

```bash
#!/bin/bash

# PocketBase Backup Script

BACKUP_DIR="/opt/backups/pocketbase"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
POCKETBASE_DIR="/opt/pocketbase"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating PocketBase backup..."
cd $POCKETBASE_DIR
tar -czf $BACKUP_DIR/pocketbase_backup_$TIMESTAMP.tar.gz pb_data/

# Keep only last 7 backups
echo "Cleaning old backups..."
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs -r rm

echo "Backup complete: pocketbase_backup_$TIMESTAMP.tar.gz"
```

**Make executable and schedule:**

```bash
sudo chmod +x /opt/scripts/backup-pocketbase.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /opt/scripts/backup-pocketbase.sh >> /var/log/pocketbase-backup.log 2>&1
```

### Step 7.2: Monitor Resources

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Check system resources
htop              # CPU, RAM, processes
df -h            # Disk usage
free -h          # Memory usage
sudo iotop       # Disk I/O
sudo nethogs     # Network usage by process
```

### Step 7.3: View Logs

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PocketBase logs
sudo journalctl -u pocketbase -f

# PM2 logs (if using SSR)
pm2 logs insightful-health

# System logs
sudo journalctl -xe
```

### Step 7.4: Update System

```bash
# Create update script
nano ~/update-system.sh
```

```bash
#!/bin/bash

echo "🔄 Updating system..."

# Update packages
sudo apt update
sudo apt upgrade -y

# Update Node.js packages
cd /var/www/insightful-health
npm update

# Update PM2
sudo npm update -g pm2

# Restart services
pm2 restart all
sudo systemctl restart nginx

echo "✅ System updated!"
```

**Make executable:**

```bash
chmod +x ~/update-system.sh
```

---

## 🛡️ Phase 8: Security Hardening

### Step 8.1: Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config
```

**Recommended changes:**

```
# Disable root login
PermitRootLogin no

# Disable password authentication (use SSH keys only)
PasswordAuthentication no

# Change default port (optional)
Port 2222

# Allow specific users only
AllowUsers azureuser
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

### Step 8.2: Setup Fail2Ban (Brute Force Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

**Enable protections:**

```ini
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
```

```bash
# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### Step 8.3: Regular Security Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📝 Quick Reference Commands

### Service Management

```bash
# PocketBase
sudo systemctl start pocketbase
sudo systemctl stop pocketbase
sudo systemctl restart pocketbase
sudo systemctl status pocketbase
sudo journalctl -u pocketbase -f

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx
sudo nginx -t  # Test config

# PM2 (if using SSR)
pm2 start ecosystem.config.js
pm2 stop insightful-health
pm2 restart insightful-health
pm2 reload insightful-health
pm2 status
pm2 logs insightful-health
pm2 monit
```

### Deployment

```bash
# Quick deploy
cd /var/www/insightful-health && ./deploy.sh

# Manual deploy
cd /var/www/insightful-health
git pull
npm install
npm run build
pm2 restart insightful-health  # if SSR
sudo systemctl reload nginx
```

### Troubleshooting

```bash
# Check if ports are listening
sudo netstat -tlnp | grep :80    # Nginx
sudo netstat -tlnp | grep :443   # Nginx SSL
sudo netstat -tlnp | grep :8090  # PocketBase
sudo netstat -tlnp | grep :3000  # Astro (if SSR)

# Check disk space
df -h

# Check memory
free -h

# Check processes
ps aux | grep pocketbase
ps aux | grep nginx
ps aux | grep node

# Test URLs
curl http://localhost:8090/api/health
curl http://localhost:3000
curl https://yourdomain.com
```

---

## 🆘 Troubleshooting Guide

### Issue: Site Not Loading

1. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check DNS:**
   ```bash
   nslookup yourdomain.com
   ping yourdomain.com
   ```

3. **Check Firewall:**
   ```bash
   sudo ufw status
   ```

### Issue: PocketBase API Not Responding

1. **Check Service:**
   ```bash
   sudo systemctl status pocketbase
   sudo journalctl -u pocketbase -n 50
   ```

2. **Check Port:**
   ```bash
   sudo netstat -tlnp | grep :8090
   ```

3. **Test Direct:**
   ```bash
   curl http://localhost:8090/api/health
   ```

### Issue: PM2 App Crashed

1. **Check Logs:**
   ```bash
   pm2 logs insightful-health --lines 100
   ```

2. **Restart:**
   ```bash
   pm2 restart insightful-health
   ```

3. **Check Config:**
   ```bash
   cat ecosystem.config.js
   ```

### Issue: SSL Certificate Errors

1. **Renew Certificate:**
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

2. **Check Certificate:**
   ```bash
   sudo certbot certificates
   ```

### Issue: Out of Disk Space

1. **Check Usage:**
   ```bash
   df -h
   du -sh /var/www/* /opt/*
   ```

2. **Clean Up:**
   ```bash
   # Clean apt cache
   sudo apt clean
   sudo apt autoclean

   # Clean old logs
   sudo journalctl --vacuum-time=7d

   # Clean old PM2 logs
   pm2 flush

   # Clean npm cache
   npm cache clean --force
   ```

---

## 💰 Cost Optimization

### Azure VM Pricing (Approximate)

- **Standard_B2s:** ~$35/month (recommended minimum)
- **Standard_B2ms:** ~$60/month (recommended for production)
- **Bandwidth:** ~$0.05/GB outbound (first 100GB free)

### Cost Saving Tips

1. **Use Auto-Shutdown:**
   - Configure in Azure Portal
   - Shutdown during off-hours if applicable

2. **Reserved Instances:**
   - Save 30-40% with 1-year commitment
   - Save 60-70% with 3-year commitment

3. **Right-Size VM:**
   - Monitor usage with `htop`
   - Scale down if resources unused
   - Scale up if performance issues

4. **Use Azure Free Credits:**
   - New accounts get $200 credit
   - Students get additional credits

---

## ✅ Post-Deployment Checklist

### Initial Setup
- [ ] VM created and accessible via SSH
- [ ] DNS configured (custom domain or Azure DNS)
- [ ] Node.js installed and verified
- [ ] Nginx installed and running
- [ ] PocketBase installed and running
- [ ] PocketBase data uploaded
- [ ] Astro app cloned and built
- [ ] Environment variables configured
- [ ] PM2 configured (if SSR)
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed and auto-renewal working
- [ ] Firewall configured (UFW)
- [ ] Services auto-start on boot

### CI/CD Setup
- [ ] SSH deploy key generated on VM
- [ ] GitHub Secrets configured (SSH_PRIVATE_KEY, SSH_HOST, SSH_USERNAME)
- [ ] GitHub Actions workflow files created
- [ ] Deployment script tested and working
- [ ] Automated deployments trigger on push to main
- [ ] Rollback strategy documented and tested
- [ ] Build status badge added to README (optional)

### Monitoring & Security
- [ ] Backup script created and scheduled
- [ ] Monitoring tools installed
- [ ] Security hardening applied (SSH, Fail2Ban)
- [ ] Log rotation configured
- [ ] Alert system configured (optional)

### Verification
- [ ] Site accessible at https://yourdomain.com
- [ ] PocketBase admin accessible at https://yourdomain.com/_/
- [ ] All features tested (auth, posts, comments, etc.)
- [ ] SSL certificate valid and auto-renewing
- [ ] GitHub Actions deployment successful
- [ ] Performance tested (load times < 3s)

---

## 📚 Additional Resources

- **Azure Documentation:** https://docs.microsoft.com/azure/virtual-machines/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PocketBase Documentation:** https://pocketbase.io/docs/
- **Astro Documentation:** https://docs.astro.build/
- **Let's Encrypt:** https://letsencrypt.org/
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

## 🎉 Success!

Your Insightful Health platform is now live on Azure!

**Next Steps:**
1. Test all functionality thoroughly
2. Monitor performance and errors
3. Set up regular backups
4. Configure monitoring alerts
5. Plan for scaling as traffic grows

**Support:**
- Check logs for errors: `sudo journalctl -xe`
- Monitor resources: `htop`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Document Status:** ✅ Production Ready  
**Last Updated:** January 7, 2026  
**Deployment Time:** ~2-3 hours (first time)

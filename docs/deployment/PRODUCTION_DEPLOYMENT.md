# Production Deployment Guide

This guide provides step-by-step instructions for deploying the complete jinxcodes.ai application stack on a standalone server with Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Environment Configuration](#environment-configuration)
4. [Domain Configuration](#domain-configuration)
5. [Deployment Steps](#deployment-steps)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **Network**: Public IP address with ports 80 and 443 accessible

### Software Requirements

- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Git**: For cloning the repository

### Domain Requirements

- Control over `*.jinxcodes.ai` DNS records
- Ability to create A records pointing to your server's IP

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/JinxCodesAI/one.git
cd one

# Switch to the deployment branch (if different from main)
git checkout full_deployment
```

## Environment Configuration

### 1. AI API Service Configuration

```bash
# Copy the production environment template
cp internal/ai-api/.env.prod.example internal/ai-api/.env.prod

# Edit the configuration
nano internal/ai-api/.env.prod
```

**Required Environment Variables:**

```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

# At least one AI provider API key is required:
OPENAI_API_KEY=your-openai-api-key-here
# OR
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
# OR
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Production Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
ENABLE_ERROR_DETAILS=false
```

### 2. Profile Service Configuration

```bash
# Copy the production environment template
cp internal/profile-service/.env.prod.example internal/profile-service/.env.prod

# Edit the configuration
nano internal/profile-service/.env.prod
```

**Required Environment Variables:**

```bash
# Server Configuration
PROFILE_SERVICE_PORT=8081
NODE_ENV=production

# Database Configuration (optional - uses in-memory if not set)
# PROFILE_SERVICE_DATABASE_URL=postgresql://profile_user:profile_password@postgres:5432/profile_service

# CORS Configuration
CORS_ORIGINS=https://todoapp.jinxcodes.ai,https://aichat.jinxcodes.ai

# Cookie Configuration
COOKIE_DOMAIN=.jinxcodes.ai

# Credits Configuration
DAILY_BONUS_AMOUNT=10
INITIAL_CREDITS_AMOUNT=100
```

### 3. Database Configuration (Optional)

If you want to use PostgreSQL for the profile service:

```bash
# Create a .env file for database credentials
cat > .env << EOF
POSTGRES_USER=profile_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=profile_service
EOF
```

Then uncomment the postgres service in `docker-compose.prod.yml`.

## Domain Configuration

### 1. DNS Setup

Create the following DNS A records pointing to your server's IP address:

```
todoapp.jinxcodes.ai    A    YOUR_SERVER_IP
aichat.jinxcodes.ai     A    YOUR_SERVER_IP
profile.jinxcodes.ai    A    YOUR_SERVER_IP
```

### 2. Verify DNS Propagation

```bash
# Check if DNS records are propagated
nslookup todoapp.jinxcodes.ai
nslookup aichat.jinxcodes.ai
nslookup profile.jinxcodes.ai
```

## Deployment Steps

### 1. Build and Start Services

```bash
# Build all Docker images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### 2. Verify Deployment

```bash
# Check logs for any errors
docker-compose -f docker-compose.prod.yml logs

# Test individual services
curl -f http://localhost/health  # Should be routed through nginx

# Test specific applications
curl -H "Host: todoapp.jinxcodes.ai" http://localhost/
curl -H "Host: aichat.jinxcodes.ai" http://localhost/
curl -H "Host: profile.jinxcodes.ai" http://localhost/storage.html
```

### 3. Monitor Service Health

```bash
# Check health of all services
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
docker-compose -f docker-compose.prod.yml exec ai-api curl -f http://localhost:8000/health
docker-compose -f docker-compose.prod.yml exec profile-service curl -f http://localhost:8081/api/health

## SSL/HTTPS Setup

### Option 1: Using Certbot (Let's Encrypt) - Recommended

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Obtain SSL certificates
sudo certbot certonly --standalone -d todoapp.jinxcodes.ai -d aichat.jinxcodes.ai -d profile.jinxcodes.ai

# Create SSL directory and copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/todoapp.jinxcodes.ai/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/todoapp.jinxcodes.ai/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### Option 2: Manual SSL Certificate

If you have your own SSL certificates:

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your certificates
cp your-certificate.crt nginx/ssl/fullchain.pem
cp your-private-key.key nginx/ssl/privkey.pem
```

### Update Nginx Configuration for HTTPS

Create `nginx/nginx-ssl.conf` with HTTPS configuration:

```nginx
# Add to nginx.conf or create separate nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name todoapp.jinxcodes.ai;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Rest of your location blocks...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name todoapp.jinxcodes.ai aichat.jinxcodes.ai profile.jinxcodes.ai;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Maintenance

### 1. Log Management

```bash
# View logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f ai-api
docker-compose -f docker-compose.prod.yml logs -f profile-service
docker-compose -f docker-compose.prod.yml logs -f todo-app
docker-compose -f docker-compose.prod.yml logs -f ai-chat

# Set up log rotation (recommended)
sudo nano /etc/logrotate.d/docker-compose
```

### 2. Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup environment files
cp internal/ai-api/.env.prod $BACKUP_DIR/
cp internal/profile-service/.env.prod $BACKUP_DIR/

# Backup database (if using PostgreSQL)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U profile_user profile_service > $BACKUP_DIR/database.sql

# Backup nginx configuration
cp -r nginx/ $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

### 3. Update Process

```bash
# Pull latest changes
git pull origin full_deployment

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check service logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Check Docker daemon status
sudo systemctl status docker

# Restart Docker if needed
sudo systemctl restart docker
```

#### 2. Domain Not Accessible

```bash
# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Check DNS resolution
nslookup todoapp.jinxcodes.ai

# Check firewall settings
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Renew Let's Encrypt certificates
sudo certbot renew
```

#### 4. Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U profile_user -d profile_service -c "SELECT 1;"
```

### Performance Optimization

#### 1. Resource Limits

Add resource limits to `docker-compose.prod.yml`:

```yaml
services:
  ai-api:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

#### 2. Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 30;
client_body_timeout 12;
client_header_timeout 12;
send_timeout 10;
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 8000  # Block direct access to internal services
sudo ufw deny 8081
```

### 2. Regular Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Environment File Security

```bash
# Secure environment files
chmod 600 internal/ai-api/.env.prod
chmod 600 internal/profile-service/.env.prod
```

## Remaining Work for Full Deployment

### Critical Tasks

1. **SSL Certificate Setup**: Configure HTTPS with Let's Encrypt or custom certificates
2. **Database Setup**: If using PostgreSQL, set up and configure the database
3. **Environment Variables**: Configure all production API keys and secrets
4. **DNS Configuration**: Set up A records for all subdomains
5. **Monitoring**: Set up log aggregation and monitoring (optional but recommended)

### Optional Enhancements

1. **CDN Setup**: Configure Cloudflare or similar CDN for better performance
2. **Database Backups**: Set up automated database backups
3. **Health Monitoring**: Set up external health monitoring (e.g., UptimeRobot)
4. **Log Aggregation**: Set up centralized logging (e.g., ELK stack)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review service logs for error messages
3. Ensure all environment variables are correctly configured
4. Verify DNS and firewall settings
```

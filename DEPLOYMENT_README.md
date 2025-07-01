# jinxcodes.ai Production Deployment

This repository contains a complete Docker-based deployment setup for the jinxcodes.ai application ecosystem.

## 🏗️ Architecture Overview

The deployment consists of:

### Frontend Applications
- **Todo App** → `todoapp.jinxcodes.ai` (Port 3000 internal)
- **AI Chat** → `aichat.jinxcodes.ai` (Port 3000 internal)

### Internal Services (Not Exposed)
- **AI API Service** → Port 8000 (internal only)
- **Profile Service** → Port 8081 (internal only)

### Infrastructure
- **Nginx Reverse Proxy** → Ports 80/443 (public)
- **Docker Network** → Internal communication
- **Optional PostgreSQL** → Database for profile service

### Special Endpoints
- **Profile Storage** → `profile.jinxcodes.ai/storage.html` (public, for cross-domain storage)

## 🚀 Quick Deployment

### Prerequisites
- Linux server with Docker and Docker Compose installed
- Control over `*.jinxcodes.ai` DNS records
- At least one AI provider API key (OpenAI, Google, or OpenRouter)

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/JinxCodesAI/one.git
cd one

# Make deployment script executable
chmod +x deploy.sh

# Run the automated deployment
./deploy.sh
```

### 2. Configure Environment Variables

The deployment script will create template environment files. Edit them with your production values:

```bash
# Configure AI API with your API keys
nano internal/ai-api/.env.prod

# Configure Profile Service (optional database settings)
nano internal/profile-service/.env.prod
```

### 3. Set Up DNS

Create A records pointing to your server IP:
```
todoapp.jinxcodes.ai    A    YOUR_SERVER_IP
aichat.jinxcodes.ai     A    YOUR_SERVER_IP
profile.jinxcodes.ai    A    YOUR_SERVER_IP
```

### 4. Enable HTTPS (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Obtain SSL certificates
sudo certbot certonly --standalone \
  -d todoapp.jinxcodes.ai \
  -d aichat.jinxcodes.ai \
  -d profile.jinxcodes.ai

# Copy certificates
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/todoapp.jinxcodes.ai/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/todoapp.jinxcodes.ai/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# Start with SSL configuration
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

## 📁 File Structure

```
├── docker-compose.prod.yml          # Main production configuration
├── docker-compose.ssl.yml           # SSL/HTTPS override
├── deploy.sh                        # Automated deployment script
├── nginx/
│   ├── nginx.conf                   # HTTP configuration
│   ├── nginx-ssl.conf               # HTTPS configuration
│   └── ssl/                         # SSL certificates directory
├── internal/
│   ├── ai-api/
│   │   ├── Dockerfile.prod          # AI API production image
│   │   └── .env.prod.example        # AI API environment template
│   └── profile-service/
│       ├── Dockerfile.prod          # Profile service production image
│       └── .env.prod.example        # Profile service environment template
├── web/
│   ├── ai-chat/
│   │   └── Dockerfile.prod          # AI Chat production image
│   └── todo-app/
│       └── Dockerfile.prod          # Todo App production image
└── docs/
    └── deployment/
        └── PRODUCTION_DEPLOYMENT.md # Detailed deployment guide
```

## 🔧 Environment Variables

### AI API Service (.env.prod)
```bash
# Required: At least one AI provider
OPENAI_API_KEY=your-openai-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
OPENROUTER_API_KEY=your-openrouter-key

# Server configuration
PORT=8000
HOST=0.0.0.0
NODE_ENV=production
```

### Profile Service (.env.prod)
```bash
# Server configuration
PROFILE_SERVICE_PORT=8081
NODE_ENV=production

# CORS for your domains
CORS_ORIGINS=https://todoapp.jinxcodes.ai,https://aichat.jinxcodes.ai

# Cookie domain
COOKIE_DOMAIN=.jinxcodes.ai

# Optional: PostgreSQL database
PROFILE_SERVICE_DATABASE_URL=postgresql://user:pass@postgres:5432/profile_service
```

## 🐳 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Start with HTTPS
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart nginx
```

### Maintenance
```bash
# Update and rebuild
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f

# View service status
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Health Checks

### Service Health
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Test nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Check individual service health
curl -f http://localhost/health  # Through nginx
```

### Application Testing
```bash
# Test applications (replace with your domain)
curl -H "Host: todoapp.jinxcodes.ai" http://localhost/
curl -H "Host: aichat.jinxcodes.ai" http://localhost/
curl -H "Host: profile.jinxcodes.ai" http://localhost/storage.html
```

## 🔒 Security Features

- **Reverse Proxy**: Internal services not directly accessible
- **Rate Limiting**: Protection against abuse
- **Security Headers**: XSS, CSRF, and other protections
- **SSL/TLS**: HTTPS encryption (when configured)
- **Firewall Ready**: Only ports 80/443 need to be open

## 📊 Monitoring

### Log Locations
- **Application Logs**: `docker-compose logs [service-name]`
- **Nginx Logs**: Inside nginx container at `/var/log/nginx/`
- **System Logs**: Standard Docker logging

### Health Endpoints
- **Todo App**: `https://todoapp.jinxcodes.ai/health`
- **AI Chat**: `https://aichat.jinxcodes.ai/health`
- **Profile Storage**: `https://profile.jinxcodes.ai/storage.html`

## 🆘 Troubleshooting

### Common Issues

1. **Services not starting**: Check logs with `docker-compose logs [service]`
2. **Domain not accessible**: Verify DNS records and firewall settings
3. **SSL issues**: Ensure certificates are properly copied to `nginx/ssl/`
4. **API errors**: Check environment variables in `.env.prod` files

### Support Resources
- **Detailed Guide**: `docs/deployment/PRODUCTION_DEPLOYMENT.md`
- **Service Logs**: `docker-compose -f docker-compose.prod.yml logs -f`
- **Health Checks**: Built into each service

## 📝 Next Steps After Deployment

1. **Configure SSL certificates** for HTTPS
2. **Set up monitoring** and alerting
3. **Configure backups** for persistent data
4. **Set up log rotation** for long-term operation
5. **Configure firewall** to block unnecessary ports

For detailed instructions, see `docs/deployment/PRODUCTION_DEPLOYMENT.md`.

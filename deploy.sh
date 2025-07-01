#!/bin/bash

# Production Deployment Script for jinxcodes.ai
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting jinxcodes.ai Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check environment files
check_env_files() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "internal/ai-api/.env.prod" ]; then
        print_warning "AI API production environment file not found"
        print_status "Creating from template..."
        cp internal/ai-api/.env.prod.example internal/ai-api/.env.prod
        print_warning "Please edit internal/ai-api/.env.prod with your API keys before continuing"
        read -p "Press Enter when you have configured the AI API environment file..."
    fi
    
    if [ ! -f "internal/profile-service/.env.prod" ]; then
        print_warning "Profile Service production environment file not found"
        print_status "Creating from template..."
        cp internal/profile-service/.env.prod.example internal/profile-service/.env.prod
        print_warning "Please edit internal/profile-service/.env.prod if needed"
    fi
    
    print_success "Environment files are ready"
}

# Create nginx directory if it doesn't exist
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    if [ ! -d "nginx" ]; then
        print_error "Nginx directory not found. Please ensure nginx/nginx.conf exists."
        exit 1
    fi
    
    if [ ! -f "nginx/nginx.conf" ]; then
        print_error "Nginx configuration file not found at nginx/nginx.conf"
        exit 1
    fi
    
    print_success "Nginx configuration is ready"
}

# Build and start services
deploy_services() {
    print_status "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build
    
    print_status "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to start
    sleep 10
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Some services are not running properly"
        docker-compose -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Test nginx configuration
    if docker-compose -f docker-compose.prod.yml exec -T nginx nginx -t > /dev/null 2>&1; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        docker-compose -f docker-compose.prod.yml exec nginx nginx -t
        exit 1
    fi
    
    print_success "All services are healthy"
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "====================================="
    echo ""
    echo "Your applications are now available at:"
    echo "• Todo App: http://todoapp.jinxcodes.ai"
    echo "• AI Chat:  http://aichat.jinxcodes.ai"
    echo "• Profile Storage: http://profile.jinxcodes.ai/storage.html"
    echo ""
    echo "Internal services (not publicly accessible):"
    echo "• AI API: Running on port 8000 (internal)"
    echo "• Profile Service: Running on port 8081 (internal)"
    echo ""
    echo "Next steps:"
    echo "1. Configure DNS A records for your domains"
    echo "2. Set up SSL certificates (see docs/deployment/PRODUCTION_DEPLOYMENT.md)"
    echo "3. Configure monitoring and backups"
    echo ""
    echo "Useful commands:"
    echo "• View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "• Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "• Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo ""
}

# Main deployment process
main() {
    check_docker
    check_env_files
    setup_nginx
    deploy_services
    check_health
    show_deployment_info
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main

print_success "Deployment script completed successfully!"

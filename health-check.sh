#!/bin/bash

# Health Check Script for jinxcodes.ai Deployment
# This script checks the health of all services and applications

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  jinxcodes.ai Health Check${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Docker Compose is running
check_docker_services() {
    print_status "Checking Docker services..."
    
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Some Docker services are not running"
        docker-compose -f docker-compose.prod.yml ps
        return 1
    else
        print_success "All Docker services are running"
    fi
}

# Check nginx configuration
check_nginx() {
    print_status "Checking Nginx configuration..."
    
    if docker-compose -f docker-compose.prod.yml exec -T nginx nginx -t > /dev/null 2>&1; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        docker-compose -f docker-compose.prod.yml exec nginx nginx -t
        return 1
    fi
}

# Check internal service health
check_internal_services() {
    print_status "Checking internal services..."
    
    # Check AI API
    if docker-compose -f docker-compose.prod.yml exec -T ai-api curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "AI API service is healthy"
    else
        print_error "AI API service is not responding"
    fi
    
    # Check Profile Service
    if docker-compose -f docker-compose.prod.yml exec -T profile-service curl -f http://localhost:8081/api/health > /dev/null 2>&1; then
        print_success "Profile Service is healthy"
    else
        print_warning "Profile Service health check failed (may not have health endpoint)"
    fi
}

# Check external accessibility
check_external_access() {
    print_status "Checking external accessibility..."
    
    # Check if we can reach the applications through nginx
    if curl -f -H "Host: todoapp.jinxcodes.ai" http://localhost/health > /dev/null 2>&1; then
        print_success "Todo App is accessible through nginx"
    else
        print_error "Todo App is not accessible through nginx"
    fi
    
    if curl -f -H "Host: aichat.jinxcodes.ai" http://localhost/health > /dev/null 2>&1; then
        print_success "AI Chat is accessible through nginx"
    else
        print_error "AI Chat is not accessible through nginx"
    fi
    
    if curl -f -H "Host: profile.jinxcodes.ai" http://localhost/storage.html > /dev/null 2>&1; then
        print_success "Profile storage is accessible through nginx"
    else
        print_error "Profile storage is not accessible through nginx"
    fi
}

# Check SSL certificates (if they exist)
check_ssl() {
    print_status "Checking SSL certificates..."
    
    if [ -f "nginx/ssl/fullchain.pem" ] && [ -f "nginx/ssl/privkey.pem" ]; then
        # Check certificate validity
        if openssl x509 -in nginx/ssl/fullchain.pem -checkend 86400 > /dev/null 2>&1; then
            print_success "SSL certificates are valid and not expiring soon"
        else
            print_warning "SSL certificates are expiring soon or invalid"
        fi
    else
        print_warning "SSL certificates not found (HTTP only mode)"
    fi
}

# Check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -lt 80 ]; then
        print_success "Disk space is adequate ($DISK_USAGE% used)"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        print_warning "Disk space is getting low ($DISK_USAGE% used)"
    else
        print_error "Disk space is critically low ($DISK_USAGE% used)"
    fi
}

# Check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        print_success "Memory usage is normal ($MEMORY_USAGE% used)"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        print_warning "Memory usage is high ($MEMORY_USAGE% used)"
    else
        print_error "Memory usage is critically high ($MEMORY_USAGE% used)"
    fi
}

# Show service logs summary
show_recent_errors() {
    print_status "Checking for recent errors in logs..."
    
    # Check for errors in the last 10 minutes
    ERROR_COUNT=$(docker-compose -f docker-compose.prod.yml logs --since=10m 2>&1 | grep -i error | wc -l)
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        print_success "No recent errors found in logs"
    else
        print_warning "Found $ERROR_COUNT error messages in recent logs"
        echo "Recent errors:"
        docker-compose -f docker-compose.prod.yml logs --since=10m 2>&1 | grep -i error | tail -5
    fi
}

# Main health check function
main() {
    print_header
    
    local exit_code=0
    
    check_docker_services || exit_code=1
    check_nginx || exit_code=1
    check_internal_services || exit_code=1
    check_external_access || exit_code=1
    check_ssl
    check_disk_space || exit_code=1
    check_memory || exit_code=1
    show_recent_errors
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        print_success "Overall health check: PASSED"
        echo -e "${GREEN}All critical systems are operational${NC}"
    else
        print_error "Overall health check: FAILED"
        echo -e "${RED}Some critical issues were found${NC}"
    fi
    
    echo ""
    echo "For detailed logs, run:"
    echo "  docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    
    exit $exit_code
}

# Run the health check
main

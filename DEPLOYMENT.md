# Docker Deployment Guide

This guide explains how to deploy the Insurance Management System frontend using Docker.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Open your browser and navigate to: `http://localhost:3000`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. **Build the image:**
   ```bash
   docker build -t insurance-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 3000:80 --name insurance-frontend insurance-frontend
   ```

3. **Access the application:**
   - Open your browser and navigate to: `http://localhost:3000`

4. **Stop and remove the container:**
   ```bash
   docker stop insurance-frontend
   docker rm insurance-frontend
   ```

## Production Deployment

### Environment Configuration

Before deploying to production, ensure you update the API endpoint:

1. Create a `.env.production` file:
   ```env
   VITE_API_URL=https://your-api-domain.com
   ```

2. Update `src/config/api.js` to use environment variables

### Build for Production

```bash
# Build the Docker image with a version tag
docker build -t insurance-frontend:1.0.0 .

# Tag for production
docker tag insurance-frontend:1.0.0 insurance-frontend:latest
```

### Deploy to Server

#### Option 1: Using Docker Compose

1. Copy files to your server:
   ```bash
   scp docker-compose.yml nginx.conf Dockerfile your-server:/path/to/app/
   ```

2. SSH into your server:
   ```bash
   ssh your-server
   cd /path/to/app
   ```

3. Run the application:
   ```bash
   docker-compose up -d
   ```

#### Option 2: Using a Container Registry

1. **Tag and push to Docker Hub:**
   ```bash
   docker tag insurance-frontend:latest your-dockerhub-username/insurance-frontend:latest
   docker push your-dockerhub-username/insurance-frontend:latest
   ```

2. **Pull and run on your server:**
   ```bash
   docker pull your-dockerhub-username/insurance-frontend:latest
   docker run -d -p 80:80 --restart unless-stopped \
     --name insurance-frontend \
     your-dockerhub-username/insurance-frontend:latest
   ```

### Using with Reverse Proxy (Nginx/Traefik)

If you're using a reverse proxy, update `docker-compose.yml`:

```yaml
services:
  frontend:
    # ... other configurations
    ports:
      - "127.0.0.1:3000:80"  # Only expose to localhost
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"
```

## Monitoring

### View Logs

```bash
# Using Docker Compose
docker-compose logs -f

# Using Docker CLI
docker logs -f insurance-frontend
```

### Health Check

The application includes a health check endpoint:
```bash
curl http://localhost:3000/health
```

### Container Stats

```bash
docker stats insurance-frontend
```

## Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Verify port availability:
   ```bash
   netstat -tulpn | grep 3000
   ```

### Build fails

1. Clear Docker cache:
   ```bash
   docker builder prune
   ```

2. Rebuild without cache:
   ```bash
   docker-compose build --no-cache
   ```

### Application not accessible

1. Check if container is running:
   ```bash
   docker ps
   ```

2. Check nginx logs:
   ```bash
   docker exec insurance-frontend cat /var/log/nginx/error.log
   ```

## Updating the Application

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Security Best Practices

1. **Use HTTPS in production** - Configure SSL certificates
2. **Update base images regularly** - Run `docker pull` for base images
3. **Scan for vulnerabilities:**
   ```bash
   docker scan insurance-frontend
   ```
4. **Limit container resources:**
   ```yaml
   services:
     frontend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
           reservations:
             cpus: '0.5'
             memory: 256M
   ```

## Performance Optimization

### Enable HTTP/2 (with SSL)

Update `nginx.conf`:
```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### Adjust worker processes

For production, update nginx worker processes based on CPU cores.

## Backup and Restore

While the frontend doesn't store data, you may want to backup your configuration:

```bash
# Backup
docker-compose config > docker-compose.backup.yml

# Restore
docker-compose -f docker-compose.backup.yml up -d
```

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

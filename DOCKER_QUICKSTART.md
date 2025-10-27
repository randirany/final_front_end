# Docker Quick Start Guide

## TL;DR - Get Started in 30 Seconds

```bash
# 1. Build and run
docker-compose up -d

# 2. Open browser
http://localhost:3000

# 3. Stop
docker-compose down
```

## Common Commands

### Development

```bash
# Build the image
docker-compose build

# Run in foreground (see logs)
docker-compose up

# Run in background (detached)
docker-compose up -d

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down
```

### Production

```bash
# Deploy using script (Linux/Mac)
chmod +x deploy.sh
./deploy.sh production

# Deploy using script (Windows)
deploy.bat production

# Or manually
docker-compose build --no-cache
docker-compose up -d
```

### Troubleshooting

```bash
# Check if container is running
docker ps

# View container logs
docker logs insurance-frontend

# Access container shell
docker exec -it insurance-frontend sh

# Check health
curl http://localhost:3000/health

# Remove everything and start fresh
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Port Configuration

- **Default**: http://localhost:3000
- **Custom Port**: Edit `ports` in `docker-compose.yml`
  ```yaml
  ports:
    - "8080:80"  # Access via http://localhost:8080
  ```

## Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://your-api.com
```

Then build:
```bash
docker-compose build
docker-compose up -d
```

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation.

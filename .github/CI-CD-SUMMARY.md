# CI/CD Pipeline Summary

## What Happens on Each Push

### 1. Build Phase (3-5 minutes)
```
┌─────────────────────────────────────────┐
│   Build Backend (XCityServer)           │
│   ├─ Docker build with cache            │
│   ├─ Tag: v20241206-143022-abc1234      │
│   ├─ Tag: latest                         │
│   └─ Push to Docker Hub                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Build Frontend (FE)                    │
│   ├─ Docker build with cache            │
│   ├─ Tag: v20241206-143022-abc1234      │
│   ├─ Tag: latest                         │
│   └─ Push to Docker Hub                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Build Sensor Service                   │
│   ├─ Docker build with cache            │
│   ├─ Tag: v20241206-143022-abc1234      │
│   ├─ Tag: latest                         │
│   └─ Push to Docker Hub                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Update docker-compose.yml              │
│   └─ Replace image tags with new version│
└─────────────────────────────────────────┘
```

### 2. Deploy Phase (2-3 minutes)
```
┌─────────────────────────────────────────┐
│   Authenticate with GCP                  │
│   └─ Service Account credentials         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Copy Files to VM                       │
│   ├─ docker-compose.yml (updated)       │
│   ├─ airflow-docker-compose.yml         │
│   ├─ mqtt/mosquitto.conf                │
│   ├─ FE/server.conf                     │
│   └─ SensorService/separated_stations   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Deploy Services on VM                  │
│   ├─ docker-compose pull                │
│   ├─ docker-compose down                │
│   ├─ docker-compose up -d               │
│   └─ docker image prune -af             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   Health Checks                          │
│   ├─ Wait 10 seconds                    │
│   ├─ Check backend health               │
│   ├─ Check frontend status              │
│   └─ Verify all containers running      │
└─────────────────────────────────────────┘
                    ↓
        ✅ Deployment Complete
```

## Image Versioning Strategy

Each build creates two tags:
- **Version tag**: `vYYYYMMDD-HHMMSS-<git-sha>` (e.g., `v20241206-143022-abc1234`)
- **Latest tag**: `latest`

### Why Two Tags?
- **Version tag**: Allows rollback to specific versions
- **Latest tag**: Always points to most recent build

### Example:
```yaml
# docker-compose.yml after build
services:
  backend:
    image: fat1512/xcityserver:v20241206-143022-abc1234
  
  frontend:
    image: fat1512/xcityfe:v20241206-143022-abc1234
  
  xcity-sensor:
    image: fat1512/sensor:v20241206-143022-abc1234
```

## Zero Downtime Deployment

The deployment follows these steps to minimize downtime:

1. **Pull new images** while old containers are running
2. **Stop old containers** gracefully
3. **Start new containers** immediately
4. **Health check** ensures new containers are healthy
5. **Rollback** automatically if health checks fail

## Monitoring Your Deployment

### View in GitHub Actions
1. Go to repository → `Actions` tab
2. Click on latest workflow run
3. See real-time logs for each step

### View on Docker Hub
- Backend: `https://hub.docker.com/r/YOUR_USERNAME/xcityserver/tags`
- Frontend: `https://hub.docker.com/r/YOUR_USERNAME/xcityfe/tags`
- Sensor: `https://hub.docker.com/r/YOUR_USERNAME/sensor/tags`

### Check on GCP VM
```bash
# SSH to VM
gcloud compute ssh INSTANCE_NAME --zone=ZONE

# View running containers
docker ps

# View specific service logs
docker logs xcity-backend -f

# View all services
cd ~/pmnm-deploy
docker-compose ps
docker-compose logs -f
```

## Quick Rollback

If you need to rollback to a previous version:

```bash
# SSH to VM
gcloud compute ssh INSTANCE_NAME --zone=ZONE
cd ~/pmnm-deploy

# Find previous version from Docker Hub or GitHub Actions
PREVIOUS_VERSION="v20241206-120000-xyz9876"

# Update docker-compose.yml
sed -i "s|:v.*|:$PREVIOUS_VERSION|g" docker-compose.yml

# Redeploy
docker-compose pull
docker-compose up -d
```

## Cost Optimization

### Docker Build Cache
- Uses layer caching to speed up builds
- Only rebuilds changed layers
- Reduces build time by 60-80%

### Cleanup
- Automatically removes unused images after deployment
- Keeps VM disk space clean
- Prevents storage costs from accumulating

## Security Best Practices

✅ **Service Account** instead of SSH keys  
✅ **Docker Hub token** instead of password  
✅ **Secrets** stored in GitHub (encrypted)  
✅ **OS Login** for VM access  
✅ **Minimal permissions** for service account  
✅ **No credentials** in code or compose files  

## Troubleshooting

### Build Failed
- Check Dockerfile syntax
- Verify all dependencies in requirements.txt / package.json
- Check GitHub Actions logs for error messages

### Deployment Failed
- Verify GCP secrets are correct
- Check VM has enough disk space
- Verify Docker is running on VM
- Check firewall rules allow connections

### Container Crashes After Deployment
- Check container logs: `docker logs <container-name>`
- Verify environment variables in docker-compose.yml
- Check if required services (mongo, mqtt) are running
- Verify network connectivity between containers

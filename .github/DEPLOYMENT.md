# GitHub Actions Deployment Guide (GCP Service Account)

## Required GitHub Secrets

Add these secrets to your repository: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. DOCKER_USERNAME
Your Docker Hub username.
```
Example: fat1512
```

### 2. DOCKER_PASSWORD
Your Docker Hub password or access token (recommended).

**Create Docker Hub Access Token:**
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `github-actions-pmnm`
4. Copy the token and add to GitHub Secrets

### 3. GCP_SA_KEY
Your GCP Service Account JSON key.

**Create Service Account:**
```bash
# 1. Go to GCP Console → IAM & Admin → Service Accounts
# 2. Click "Create Service Account"
# 3. Name: github-actions-deploy
# 4. Grant roles:
#    - Compute Instance Admin (v1)
#    - Service Account User
# 5. Click "Create Key" → JSON → Download

# Or use gcloud CLI:
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deployment"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions-deploy@PROJECT_ID.iam.gserviceaccount.com
```

**Copy the entire JSON content to `GCP_SA_KEY` secret**

### 4. GCP_PROJECT_ID
Your GCP Project ID.
```
Example: my-project-123456
```

### 5. GCP_ZONE
The zone where your VM instance is located.
```
Example: us-central1-a
```

### 6. GCP_INSTANCE_NAME
The name of your Compute Engine VM instance.
```
Example: xcity-production-vm
```

## Workflow Overview

The pipeline consists of two jobs:

### Job 1: Build and Push Docker Images
1. **Builds** three Docker images:
   - Backend (`xcityserver`)
   - Frontend (`xcityfe`)
   - Sensor Service (`sensor`)
2. **Tags** images with:
   - Version tag: `vYYYYMMDD-HHMMSS-<git-sha>`
   - Latest tag: `latest`
3. **Pushes** to Docker Hub

### Job 2: Deploy to GCP VM
1. **Authenticates** with GCP using Service Account
2. **SSH to VM** and pulls latest Docker images
3. **Restarts** the 3 custom services (backend, frontend, sensor)
4. **Runs** health checks
5. **Verifies** deployment

## Setup GCP VM

### 1. Enable OS Login (Recommended)
```bash
# Enable OS Login for your project
gcloud compute project-info add-metadata \
  --metadata enable-oslogin=TRUE

# Enable OS Login for specific instance
gcloud compute instances add-metadata INSTANCE_NAME \
  --zone=ZONE \
  --metadata enable-oslogin=TRUE
```

### 2. Install Docker on VM
```bash
# SSH to VM
gcloud compute ssh INSTANCE_NAME --zone=ZONE

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add service account to docker group (if using OS Login)
sudo usermod -aG docker $USER

# Or for all users
sudo chmod 666 /var/run/docker.sock
```

### 3. Install Docker Compose on VM
```bash
# Still in SSH session
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 4. Set up docker-compose.yml on VM
```bash
# Clone your repository once to get the docker-compose.yml and other config files
cd ~
git clone https://github.com/Fat1512/PMNM.git pmnm
cd pmnm

# Start all infrastructure services first
docker-compose up -d mqtt-broker mongo orion-ld iot-agent

# The pipeline will deploy the 3 custom services (backend, frontend, sensor)
```

### 5. Configure Firewall Rules
```bash
# Allow HTTP/HTTPS traffic
gcloud compute firewall-rules create allow-http-https \
  --allow tcp:80,tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server,https-server

# Allow backend port
gcloud compute firewall-rules create allow-backend \
  --allow tcp:8090 \
  --source-ranges 0.0.0.0/0

# Apply tags to your instance
gcloud compute instances add-tags INSTANCE_NAME \
  --zone=ZONE \
  --tags=http-server,https-server
```

## Workflow Triggers

### Automatic Deployment
- Push to `main` branch: Builds images + Deploys main services
- Push to `test` branch: Builds images + Deploys to test environment
- Push to `production` branch: Builds images + Deploys main services + Airflow

### Manual Deployment
Go to: `Actions` → `Deploy to GCP VM` → `Run workflow`

## Docker Images

After each successful build, three images are pushed to Docker Hub:

```
your-username/xcityserver:vYYYYMMDD-HHMMSS-abc1234
your-username/xcityserver:latest

your-username/xcityfe:vYYYYMMDD-HHMMSS-abc1234
your-username/xcityfe:latest

your-username/sensor:vYYYYMMDD-HHMMSS-abc1234
your-username/sensor:latest
```

View your images at: `https://hub.docker.com/r/your-username/`

## Environment Variables

Create `.env` files on your GCP VM for sensitive data:

```bash
# ~/pmnm/.env
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/x-city
AUTH_SECRET_KEY=your-secret-key
AIRFLOW_JWT_SECRET=your-jwt-secret
AIRFLOW_WEBSERVER_SECRET=your-webserver-secret
AIRFLOW_FERNET_KEY=your-fernet-key
```

## Monitoring Deployment

### View GitHub Actions logs
`Actions` → Select workflow run → View logs

### Check deployment on VM
```bash
# SSH to VM using gcloud
gcloud compute ssh INSTANCE_NAME --zone=ZONE

# Check services
cd ~/pmnm
docker-compose ps
docker-compose logs -f

# Check Airflow (if deployed)
docker-compose -f airflow-docker-compose.yml ps
docker-compose -f airflow-docker-compose.yml logs -f
```

## Rollback

If deployment fails, you can rollback to a previous Docker image version:

```bash
# SSH to VM
gcloud compute ssh INSTANCE_NAME --zone=ZONE
cd ~/pmnm

# Pull specific version
docker pull your-username/xcityserver:v20250107-120000-abc1234
docker pull your-username/xcityfe:v20250107-120000-abc1234
docker pull your-username/sensor:v20250107-120000-abc1234

# Update docker-compose.yml manually or via sed
sed -i 's|xcityserver:latest|xcityserver:v20250107-120000-abc1234|g' docker-compose.yml
sed -i 's|xcityfe:latest|xcityfe:v20250107-120000-abc1234|g' docker-compose.yml
sed -i 's|sensor:latest|sensor:v20250107-120000-abc1234|g' docker-compose.yml

# Restart services
docker-compose up -d xcity-backend xcity-frontend xcity-sensor
```

## Troubleshooting

### GCP Authentication Failed
1. Verify `GCP_SA_KEY` secret contains valid JSON
2. Check service account has required permissions:
   - Compute Instance Admin (v1)
   - Service Account User
3. Verify project ID, zone, and instance name are correct

### SSH Connection Failed
1. Enable OS Login on your VM instance
2. Verify service account can access the instance
3. Check GCP firewall allows SSH (port 22)

### Permission Denied (Docker)
```bash
# SSH to VM
gcloud compute ssh INSTANCE_NAME --zone=ZONE

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
```

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory
free -h
```

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :8090

# Kill process
sudo kill -9 <PID>
```

## Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Rotate secrets** regularly
3. **Use firewall rules** to restrict access
4. **Enable 2FA** on GitHub account
5. **Use environment variables** for sensitive data
6. **Regular backups** of MongoDB data

## Additional Commands

### View all running containers
```bash
docker ps -a
```

### Restart specific service
```bash
cd ~/pmnm
docker-compose restart xcity-backend
```

### Update single service
```bash
cd ~/pmnm
docker-compose pull xcity-backend
docker-compose up -d xcity-backend
```

### View logs for specific service
```bash
docker logs xcity-backend -f
docker logs xcity-frontend -f
docker logs xcity-sensor -f
```

### Clean up system
```bash
docker system prune -a
```

## Deployment Workflow Summary

1. **Developer pushes code** to `main` or `test` branch
2. **GitHub Actions**:
   - Builds 3 Docker images
   - Pushes to Docker Hub with version tags and `latest` tag
3. **Deployment**:
   - Connects to GCP VM via SSH
   - Pulls latest images (using `latest` tag)
   - Restarts only the 3 custom services (backend, frontend, sensor)
   - Infrastructure services (MongoDB, Orion-LD, etc.) keep running

**Benefits**:
- ✅ Simple and straightforward
- ✅ No Git operations needed
- ✅ Infrastructure services are not touched
- ✅ Fast deployment (only custom services restart)
- ✅ Always uses `:latest` tag for simplicity

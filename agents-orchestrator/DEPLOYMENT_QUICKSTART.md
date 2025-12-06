# 🚀 Quick Start: Deployment System

## What's New

You can now deploy both your legacy PHP monolith and newly generated microservices to Docker containers with a single button click!

## How to Use

### Step 1: Generate a Microservice

1. Go to the Phoenix Engine dashboard
2. Upload your legacy code
3. Select an endpoint to migrate
4. Choose your target language (Go, Python, or Node.js)
5. Wait for the AI to generate your microservice

### Step 2: Deploy Services

After the microservice is generated, you'll see a new **"Deploy Services"** section:

1. Click the **"Deploy Now"** button
2. Wait for both services to build and start (this may take 1-2 minutes)
3. You'll see status indicators for both services:
   - ✅ **Legacy Monolith (PHP)** - Running on port 8081
   - ✅ **Modern Microservice (Go)** - Running on port 8080

### Step 3: Access Your Services

Click the "Open" links next to each service to access them:
- Legacy: `http://localhost:8081`
- Modern: `http://localhost:8080`

## Requirements

- **Docker** must be installed and running on your machine
- Ports **8080** and **8081** must be available

## Verify Deployment

Check running containers:
```bash
docker ps | grep phoenix
```

You should see:
- `phoenix-legacy` - The PHP monolith
- `phoenix-modern-{migration-id}` - Your new microservice

## Troubleshooting

**Docker not running?**
```bash
# Start Docker Desktop or run:
sudo systemctl start docker
```

**Port already in use?**
```bash
# Stop the conflicting container:
docker ps
docker stop <container-name>
```

**Need to redeploy?**
Just click "Deploy Now" again - old containers will be automatically stopped and replaced.

## What Happens Behind the Scenes

1. **Legacy Deployment:**
   - Builds Docker image from `example-monolith/`
   - Stops any existing legacy container
   - Starts new container on port 8081

2. **Modern Deployment:**
   - Auto-generates Go dependencies (`go.sum`)
   - Builds Docker image from `output/{migration-id}/`
   - Stops any existing container with same migration ID
   - Starts new container on port 8080

## Next Steps

After deployment, you can:
- Test both services side-by-side
- Compare responses and performance
- Gradually migrate traffic from legacy to modern
- Deploy additional microservices for other endpoints

---

**Enjoy your automated deployment system! 🎉**

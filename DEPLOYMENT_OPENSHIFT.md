# Deploying Élite Events on Red Hat OpenShift

This guide provides step-by-step instructions for deploying the **Élite Events Management Website** to any **Red Hat OpenShift Container Platform** cluster (including OpenShift 4.x, Red Hat Developer Sandbox, ROSA, ARO, or local Red Hat OpenShift Local / CRC).

---

## Architecture Overview

- **Base Image**: `registry.access.redhat.com/ubi9/nginx-122:latest` (Red Hat Universal Base Image 9).
- **Security & SCC**: Compliant with OpenShift's `restricted-v2` Security Context Constraint (SCC) — runs as unprivileged user (UID `1001`, group `0`) and binds to port `8080`.
- **High Availability**: Scalable deployment with rolling updates and zero-downtime deployments.
- **Health Probes**: Built-in `/healthz` endpoint for Kubernetes liveness and readiness checks.
- **Ingress**: OpenShift `Route` with automatic Edge TLS termination (HTTPS with auto-redirect).

---

## Method 1: OpenShift Web Console (Recommended & No CLI Required)

If you are using the **Red Hat Developer Sandbox** or have access to the OpenShift Web Console:

### Step 1: Push Code to Git (GitHub, GitLab, or Bitbucket)
Push this project folder to your Git repository:
```bash
git init
git add .
git commit -m "Initial commit for OpenShift deployment"
git remote add origin https://github.com/<your-username>/elite-events.git
git push -u origin main
```

### Step 2: Deploy from the OpenShift Web Console
1. Log in to your **OpenShift Web Console**.
2. Switch to the **Developer** perspective (top-left dropdown).
3. Select your project/namespace (e.g., `event-management`).
4. Click **+Add** from the left navigation menu.
5. Choose **Import from Git**:
   - **Git Repo URL**: Paste your repository URL (e.g., `https://github.com/<your-username>/elite-events.git`).
   - OpenShift will auto-detect the `Dockerfile` in the root directory.
   - **Application Name**: `elite-events-app`
   - **Name**: `elite-events`
   - **Target Port**: Ensure `8080` is selected.
   - **Create a route to the Application**: Check the box (ensures external internet URL).
   - Under **Routing**, expand **Advanced Routing options**:
     - Check **Secure Route**.
     - **TLS termination**: Select `Edge`.
     - **Insecure Traffic**: Select `Redirect` (forces HTTPS).
6. Click **Create**.
7. OpenShift will automatically build the container image, create the deployment, service, and route. Once the circle turns dark blue, click the **Open URL** arrow icon on the pod to view your live website!

---

## Method 2: OpenShift CLI (`oc`) - Local Binary Build (No Git Push Needed)

If you have the `oc` command-line tool installed and want to deploy directly from your local machine:

### Step 1: Log in to your OpenShift cluster
Copy your login command from OpenShift Web Console (**Copy login command** under your username) and run:
```bash
oc login --token=<your-token> --server=https://api.your-cluster-domain:6443
```

### Step 2: Create a project (or select existing)
```bash
oc new-project event-management
# Or switch to an existing one:
# oc project my-project
```

### Step 3: Create the ImageStream and BuildConfig
```bash
cd "c:\Users\nabil\OneDrive\amal jyothi work spce\event management\event-management-website"

# Create ImageStream and BuildConfig for binary Docker build
oc new-build --binary=true --strategy=docker --name=elite-events
```

### Step 4: Start the build from your local directory
```bash
oc start-build elite-events --from-dir=. --follow
```
*OpenShift will upload your local files, build the UBI9 Nginx image inside the cluster, and store it in the internal image registry.*

### Step 5: Deploy the application and expose the Route
```bash
# Create deployment and service
oc new-app elite-events

# Expose as a secure HTTPS Route
oc create route edge elite-events --service=elite-events --port=8080 --insecure-policy=Redirect
```

### Step 6: Get the public website URL
```bash
oc get route elite-events
```
You will get an output like:
```
NAME           HOST/PORT                                                         PATH   SERVICES       PORT   TERMINATION   WILDCARD
elite-events   elite-events-event-management.apps.mycluster.openshift.com               elite-events   8080   edge/Redirect None
```
Open `https://elite-events-event-management.apps.mycluster.openshift.com` in your browser!

---

## Method 3: Deploy using Declarative OpenShift Manifests

You can deploy the complete stack using the ready-to-use manifests located in the `openshift/` folder:

```bash
# Apply all resources in one command:
oc apply -f openshift/all-in-one.yaml

# If performing a binary build:
oc start-build elite-events --from-dir=. --follow
```

Or apply modular manifests individually:
```bash
oc apply -f openshift/imagestream.yaml
oc apply -f openshift/buildconfig.yaml
oc start-build elite-events --from-dir=. --follow
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml
```

---

## Method 4: Red Hat Source-to-Image (S2I) (Alternative)

OpenShift provides a built-in UBI Nginx S2I builder image. If your code is in a public Git repository, you can deploy in a single command without writing a Dockerfile:

```bash
oc new-app registry.access.redhat.com/ubi9/nginx-122~https://github.com/<your-username>/elite-events.git --name=elite-events

oc create route edge elite-events --service=elite-events --port=8080 --insecure-policy=Redirect
```

---

## Verification & Management

### Check Pod Status
```bash
oc get pods -l app=elite-events
```

### Stream Live Nginx Logs
```bash
oc logs -f deployment/elite-events
```

### Scale Replicas
```bash
# Scale up to 4 pods for high-traffic events:
oc scale deployment/elite-events --replicas=4
```

### Redeploy / Rolling Update
After making code changes locally:
```bash
oc start-build elite-events --from-dir=. --follow
```
OpenShift will build the updated image and perform a rolling update without downtime.

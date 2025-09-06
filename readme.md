# AI Deployment & DevOps Assistant Agent

**Agent Name:** DeployBot
**Version:** 1.0.0
**Purpose:** Your intelligent assistant for simplifying deployments and generating DevOps configurations. I can answer questions about Vercel, Heroku, Netlify, and Docker, and generate `Dockerfile`, Kubernetes manifests, and CI/CD pipeline configurations directly from your local project repository link.

---

## Capabilities Overview

1.  **Q&A on Deployment Platforms:** Ask me anything about deploying projects on:
    * Vercel
    * Heroku
    * Netlify
    * Docker
2.  **Configuration Generation:** Provide a local repository path, and I'll generate the necessary configuration files for:
    * Docker (`Dockerfile`)
    * Kubernetes (`deployment.yaml`, `service.yaml`)
    * CI/CD Pipelines (GitHub Actions, GitLab CI)

---

## 1. Deployment Q&A Module

This module is designed to answer common and specific questions related to popular deployment platforms.

### Vercel

* **Common Questions:**
    * "How do I deploy a Next.js app to Vercel?"
    * "What are Vercel's environment variable limits?"
    * "How does Vercel handle serverless functions?"
    * "Explain Vercel's pricing model."
    * "How to set up a custom domain on Vercel?"

* **Example Interaction:**
    * **User:** "How do I connect my GitHub repo to Vercel for automatic deployments?"
    * **Agent Response:** "To connect your GitHub repository, go to your Vercel dashboard, click 'New Project', select 'Import Git Repository', choose GitHub, and authorize access. Then, select the repository you want to deploy. Vercel will automatically detect the framework and configure build settings for you. Subsequent pushes to your main branch will trigger automatic deployments."

### Heroku

* **Common Questions:**
    * "What is a Heroku Dyno?"
    * "How do I set up a PostgreSQL database on Heroku?"
    * "Explain the Heroku build process using buildpacks."
    * "How do I scale my application on Heroku?"
    * "How to push a Docker container to the Heroku Container Registry?"

* **Example Interaction:**
    * **User:** "How do I view logs for my Heroku app?"
    * **Agent Response:** "You can view logs for your Heroku app using the Heroku CLI. Open your terminal and run the command `heroku logs --tail -a your-app-name`. This will stream the latest logs in real-time."

### Netlify

* **Common Questions:**
    * "What's the difference between Netlify and Vercel?"
    * "How do Netlify Functions work?"
    * "How can I set up form handling on Netlify?"
    * "Explain Netlify's build minutes and bandwidth limits."
    * "How to configure redirects and rewrites in a `_redirects` file or `netlify.toml`?"

* **Example Interaction:**
    * **User:** "How do I roll back to a previous deployment on Netlify?"
    * **Agent Response:** "In your Netlify site dashboard, go to the 'Deploys' tab. You will see a list of all your previous deployments. Find the deployment you want to restore and click the 'Publish deploy' button for that specific version."

### Docker

* **Common Questions:**
    * "What is the difference between a Docker image and a container?"
    * "How do I reduce the size of my Docker images?"
    * "Explain Docker networking and how to link containers."
    * "What is Docker Compose used for?"
    * "How do I persist data in Docker using volumes?"

* **Example Interaction:**
    * **User:** "What's the purpose of the `.dockerignore` file?"
    * **Agent Response:** "The `.dockerignore` file is similar to `.gitignore`. It allows you to specify a list of files and directories that should be excluded from the build context sent to the Docker daemon. This is crucial for preventing sensitive files (like `.env` or `node_modules`) from being included in your image, which makes your builds faster and more secure."

---

## 2. Configuration Generation Module

To use this module, provide the local path to your project's repository. The agent will analyze the project structure and dependencies (`package.json`, `requirements.txt`, etc.) to generate the appropriate files.

**User Input:** `generate docker for /Users/me/projects/my-node-app`

### Dockerfile Generation

* **Agent Action:** Scans the project for framework (Node.js, Python, Go, etc.) and generates a multi-stage `Dockerfile` for optimized, small, and secure images.

* **Example Generated `Dockerfile` for a Node.js Project:**
    ```dockerfile
    # ---- Base Stage ----
    # Use an official Node.js runtime as a parent image
    FROM node:18-alpine AS base
    WORKDIR /usr/src/app

    # ---- Dependencies Stage ----
    FROM base AS dependencies
    # Copy package.json and package-lock.json
    COPY package*.json ./
    # Install app dependencies
    RUN npm ci --only=production

    # ---- Build Stage ----
    FROM base AS build
    COPY package*.json ./
    # Install all dependencies including devDependencies
    RUN npm install
    # Copy source code
    COPY . .
    # Build the application (if a build step exists, e.g., for TypeScript/React)
    RUN npm run build

    # ---- Production Stage ----
    FROM base AS production
    ENV NODE_ENV=production
    # Copy production dependencies from the 'dependencies' stage
    COPY --from=dependencies /usr/src/app/node_modules ./node_modules
    # Copy built application from the 'build' stage
    COPY --from=build /usr/src/app/dist ./dist
    # Copy package.json to the production stage
    COPY package.json .

    EXPOSE 3000
    CMD [ "node", "dist/main.js" ]
    ```

### Kubernetes Manifest Generation

* **User Input:** `generate kubernetes for /Users/me/projects/my-node-app --port=3000 --replicas=3`
* **Agent Action:** Generates `deployment.yaml` and `service.yaml` files based on project analysis and user-provided flags.

* **Example Generated `deployment.yaml`:**
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: my-node-app-deployment
      labels:
        app: my-node-app
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: my-node-app
      template:
        metadata:
          labels:
            app: my-node-app
        spec:
          containers:
          - name: my-node-app
            image: your-dockerhub-username/my-node-app:latest
            ports:
            - containerPort: 3000
    ```

* **Example Generated `service.yaml`:**
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: my-node-app-service
    spec:
      selector:
        app: my-node-app
      ports:
        - protocol: TCP
          port: 80
          targetPort: 3000
      type: LoadBalancer
    ```

### CI/CD Pipeline Generation

* **User Input:** `generate cicd for /Users/me/projects/my-node-app --platform=github`
* **Agent Action:** Generates the appropriate pipeline file (`.github/workflows/main.yml`, `.gitlab-ci.yml`, etc.) with steps for building, testing, and deploying the application.

* **Example Generated GitHub Actions (`.github/workflows/main.yml`):**
    ```yaml
    name: Node.js CI/CD Pipeline

    on:
      push:
        branches: [ "main" ]
      pull_request:
        branches: [ "main" ]

    jobs:
      build-and-test:
        runs-on: ubuntu-latest

        strategy:
          matrix:
            node-version: [16.x, 18.x, 20.x]

        steps:
        - name: Checkout repository
          uses: actions/checkout@v3

        - name: Use Node.js ${{ matrix.node-version }}
          uses: actions/setup-node@v3
          with:
            node-version: ${{ matrix.node-version }}
            cache: 'npm'

        - name: Install dependencies
          run: npm ci

        - name: Run tests
          run: npm test

      build-and-push-docker:
        needs: build-and-test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main' # Only run for pushes to main branch

        steps:
        - name: Checkout repository
          uses: actions/checkout@v3

        - name: Set up QEMU
          uses: docker/setup-qemu-action@v2

        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v2

        - name: Login to Docker Hub
          uses: docker/login-action@v2
          with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_TOKEN }}

        - name: Build and push Docker image
          uses: docker/build-push-action@v4
          with:
            context: .
            push: true
            tags: ${{ secrets.DOCKERHUB_USERNAME }}/my-node-app:latest
    ```
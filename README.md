# ☁️ CloudDeploy AI

### Intelligent Cloud Deployment Platform

CloudDeploy AI is a full-stack cloud deployment platform designed to simplify the process of deploying applications from GitHub repositories to AWS.

The platform brings together **GitHub, React, Node.js, Express.js, MongoDB, Amazon S3, Amazon EC2, AWS Systems Manager, IAM, Nginx, and PM2** into a centralized deployment workflow.

Users can create projects, connect GitHub repositories, analyze application structure, deploy frontend applications to Amazon S3, deploy backend applications to Amazon EC2 using AWS Systems Manager, configure Nginx routing, and monitor deployments and AWS resources from one dashboard.

---

## 🚀 Overview

Deploying a full-stack application manually usually involves several independent steps:

- Clone the source repository
- Identify frontend and backend components
- Install dependencies
- Build the frontend
- Create and configure an S3 bucket
- Upload frontend assets
- Deploy the backend to an EC2 instance
- Install backend dependencies
- Select an available application port
- Start and manage the backend process
- Configure reverse proxy routing
- Verify the deployed application
- Track deployment status and logs

CloudDeploy AI combines these operations into a single application-driven workflow.

---

## ✨ Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected API routes
- User profile management
- Password change
- Logout

### 📁 Project Management

- Create projects
- View projects
- Delete projects
- Store repository information
- Associate projects with authenticated users
- Track project deployment status

### 🐙 GitHub Integration

- Connect GitHub repositories
- Retrieve repository information
- Detect repository owner and name
- Detect default branch
- Detect programming language
- Identify public/private repositories
- Store repository metadata
- Analyze repository structure before deployment

### ☁️ AWS Deployment

- Frontend deployment to Amazon S3
- Backend deployment to Amazon EC2
- AWS Systems Manager Run Command integration
- IAM role-based AWS access
- Automatic backend port selection
- PM2 process management
- Automatic Nginx reverse-proxy configuration
- Backend verification after deployment

### 📊 Monitoring & Management

- Deployment dashboard
- Deployment history
- Deployment logs
- Deployment status tracking
- Failed deployment retry
- Deployment history deletion
- Project-specific deployment history
- AWS resource monitoring
- GitHub repository dashboard

### ⚙️ Settings

- Update profile information
- Change password
- Account management

---

# 🏗️ Architecture

```text
                           ┌──────────────────────┐
                           │      React + Vite    │
                           │       Frontend       │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │   Node.js / Express  │
                           │      REST API        │
                           └──────────┬───────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
                ▼                     ▼                     ▼
        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │   MongoDB    │      │    GitHub    │      │     AWS      │
        │    Atlas     │      │     API      │      │   Services   │
        └──────────────┘      └──────────────┘      └──────┬───────┘
                                                            │
                                      ┌─────────────────────┼─────────────────────┐
                                      │                     │                     │
                                      ▼                     ▼                     ▼
                               ┌────────────┐       ┌────────────┐       ┌────────────┐
                               │ Amazon S3  │       │ AWS  SSM   │       │ Amazon EC2 │
                               │  Frontend  │       │ Run Command│       │  Backend   │
                               └────────────┘       └──────┬─────┘       └─────┬──────┘
                                                            │                     │
                                                            │                     ▼
                                                            │                    PM2
                                                            │                     │
                                                            │                     ▼
                                                            │                   Nginx
                                                            │                     │
                                                            └─────────────────────┘
```

---

# 🔄 End-to-End Deployment Workflow

```text
User
 │
 ▼
CloudDeploy AI Dashboard
 │
 ├── Create / Select Project
 │
 ├── Connect GitHub Repository
 │
 └── Start Deployment
        │
        ▼
   Clone Repository
        │
        ▼
   Analyze Project
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
   Frontend Detected      Backend Detected
        │                      │
        ▼                      ▼
   npm install              AWS SSM
        │                      │
        ▼                      ▼
   npm run build           EC2 Instance
        │                      │
        ▼                      ├── Clone repository
      dist/                    ├── npm install
        │                      ├── Select port
        ▼                      ├── Start with PM2
   Create S3 Bucket            └── Verify backend
        │
        ▼
   Upload frontend
        │
        └──────────────┬───────────────┐
                       │               │
                       ▼               ▼
                 S3 Website       Nginx Routing
                       │               │
                       └───────┬───────┘
                               ▼
                         Live Application
```

---

# 🌐 Frontend Deployment to Amazon S3

When a frontend is detected, CloudDeploy AI:

1. Installs frontend dependencies.
2. Generates the deployment API URL.
3. Builds the frontend application.
4. Creates a deployment S3 bucket.
5. Configures the bucket for website hosting.
6. Configures the required bucket access.
7. Uploads the generated frontend assets.
8. Returns the S3 website URL.

### Frontend Flow

```text
React / Vite Project
        │
        ▼
   npm install
        │
        ▼
   npm run build
        │
        ▼
      dist/
        │
        ▼
   Amazon S3
        │
        ▼
 Static Website URL
```

---

# 🖥️ Backend Deployment to Amazon EC2

Backend applications are deployed to an EC2 instance through AWS Systems Manager.

The deployment workflow includes:

- Creating deployment directories
- Cloning the GitHub repository
- Copying environment configuration
- Installing backend dependencies
- Selecting an available port
- Starting the Node.js server
- Managing the process with PM2
- Saving the PM2 process configuration
- Verifying the backend
- Configuring Nginx

### Backend Flow

```text
GitHub Repository
       │
       ▼
AWS Systems Manager
       │
       ▼
Amazon EC2
       │
       ├── Clone Repository
       ├── npm install
       ├── Port Selection
       ├── PM2 Start
       └── Backend Verification
```

---

# 🔄 Dynamic Port Allocation

CloudDeploy AI supports multiple backend applications on the same EC2 instance by checking for an available port before starting the application.

Example:

```text
5001 → occupied
5002 → occupied
5003 → available
5003 → deploy backend
```

This prevents port conflicts between deployed projects.

---

# 🌐 Nginx Reverse Proxy

After the backend is deployed, CloudDeploy AI configures Nginx to route project-specific API requests to the application's assigned internal port.

Example:

```text
/clouddeploy-ai/api/
        │
        ▼
      Nginx
        │
        ▼
127.0.0.1:<DEPLOYED_PORT>/api/
        │
        ▼
  Node.js Backend
```

This allows the public API path to remain consistent while backend processes can use dynamically selected internal ports.

---

# 🔐 AWS Systems Manager

CloudDeploy AI uses AWS Systems Manager Run Command to execute deployment commands on the EC2 instance.

```text
CloudDeploy AI Backend
        │
        ▼
AWS Systems Manager
        │
        ▼
EC2 Instance
        │
        ├── Git Clone
        ├── npm install
        ├── Port Detection
        ├── PM2 Start
        └── Verification
```

This provides application-driven remote command execution without requiring the deployment workflow to depend on interactive SSH sessions.

---

# ☁️ AWS Resource Monitoring

The AWS dashboard retrieves infrastructure information through the AWS SDK.

## EC2 Information

- Instance ID
- Instance state
- Instance type
- Public IP
- Private IP
- Availability Zone
- Launch information

## S3 Information

- Deployment bucket count
- Bucket names
- Website URLs
- Deployment bucket information

CloudDeploy AI uses IAM role-based authentication for AWS access from the deployment environment.

---

# 🐙 GitHub Integration

GitHub integration allows CloudDeploy AI to work directly with application repositories.

The platform can retrieve information such as:

- Repository owner
- Repository name
- Default branch
- Programming language
- Visibility
- Repository URL

The selected repository is then cloned as part of the deployment workflow.

---

# 📝 Deployment History & Logs

Every deployment can be tracked through a deployment record.

Deployment records can include:

- Project information
- Deployment status
- Frontend details
- Backend details
- Deployment logs
- Error information
- Assigned backend port
- Deployment timestamps

### Deployment Status

```text
Created
   ↓
Deploying
   ↓
Success
```

or:

```text
Created
   ↓
Deploying
   ↓
Failed
```

### Deployment Actions

- View deployment details
- View logs
- Retry failed deployments
- Delete deployment history
- Filter deployments by project

---

# 📊 Dashboard

The dashboard provides an overview of the cloud deployment environment.

It can display:

- Total projects
- Deployment activity
- Deployment health
- AWS infrastructure information
- Recent projects
- Recent deployments
- Current system activity

---

# ⚙️ Settings

The Settings section provides account and security management.

### Account

- Update name
- Update email

### Security

- Change password

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router
- Lucide React

## Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcrypt
- simple-git

## Database

- MongoDB
- Mongoose
- MongoDB Atlas

## Cloud & DevOps

- Amazon EC2
- Amazon S3
- AWS Systems Manager
- AWS IAM
- AWS SDK
- Nginx
- PM2

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```text
clouddeploy-ai/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/Dinosh1432/clouddeploy-ai.git
cd clouddeploy-ai
```

## 2. Install backend dependencies

```bash
cd server
npm install
```

## 3. Configure environment variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GITHUB_TOKEN=your_github_token

AWS_REGION=your_aws_region

EC2_INSTANCE_ID=your_ec2_instance_id

EC2_PUBLIC_IP=your_ec2_public_ip
```

> Never commit `.env` files, tokens, passwords, or other secrets to GitHub.

## 4. Start the backend

```bash
npm start
```

## 5. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

---

# 🔑 AWS IAM Requirements

The application requires IAM permissions for the AWS operations used by its deployment and resource-monitoring workflows.

Examples include permissions for:

```text
s3:ListAllMyBuckets
ec2:DescribeInstances
AWS Systems Manager operations
S3 deployment operations
```

For production environments, IAM permissions should follow the principle of least privilege and be restricted to the actions and resources actually required by the application.

---

# 🧪 Error Handling

CloudDeploy AI tracks errors across different stages of the deployment pipeline.

Possible failure points include:

```text
GitHub repository cloning
        ↓
Frontend dependency installation
        ↓
Frontend build
        ↓
S3 bucket creation
        ↓
S3 upload
        ↓
SSM command execution
        ↓
Backend dependency installation
        ↓
Port allocation
        ↓
PM2 startup
        ↓
Backend verification
        ↓
Nginx configuration
```

Failed deployments are recorded so that users can inspect logs and retry them.

---

# 🔍 Project Highlights

### Intelligent Repository Analysis

Analyzes repository structure and identifies frontend/backend components before deployment.

### Automated Cloud Deployment

Automates the deployment of application components from GitHub to AWS.

### Multi-Service AWS Integration

Combines Amazon S3, EC2, Systems Manager, and IAM within a single application.

### Dynamic Backend Port Management

Automatically selects an available backend port on the EC2 instance.

### Automated Nginx Configuration

Generates reverse-proxy routing configuration for deployed applications.

### Centralized Deployment Monitoring

Provides deployment history, logs, project management, GitHub information, and AWS resource monitoring.

---

# 🔮 Future Enhancements

Possible future improvements include:

- Docker-based deployments
- GitHub webhook-based continuous deployment
- Deployment rollback
- Custom domains
- HTTPS / SSL automation
- CloudWatch monitoring
- CPU and memory metrics
- Load balancer integration
- Auto Scaling
- Deployment notifications
- Role-based access control
- Deployment configuration templates

---

# 🎯 Learning & Engineering Outcomes

CloudDeploy AI brings together several real-world software engineering concepts:

```text
Frontend Development
        +
Backend Development
        +
REST API Design
        +
Authentication
        +
Database Management
        +
GitHub Integration
        +
Cloud Computing
        +
AWS Automation
        +
Remote Command Execution
        +
Process Management
        +
Reverse Proxy Configuration
        +
Deployment Monitoring
        =
CloudDeploy AI
```

---

# 👨‍💻 Author

**Dinosh**

Computer Science Engineering Student  
Full-Stack Developer | Cloud & DevOps Enthusiast

GitHub:  
https://github.com/Dinosh1432

---

# 📄 License

This project is developed for educational, academic, and portfolio purposes.

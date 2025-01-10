# Green Quest Backend

## Overview  
The **Green Quest Backend** serves as the core infrastructure for the Green Quest application. It is designed to support user management, challenge tracking, CO2 savings, and gamified reward systems. The backend will eventually implement a microservices architecture with a centralized API Gateway.

## Features
- **User Management**: Create and manage user profiles.
- **Challenge System**: Deliver personalized daily challenges and track progress.
- **CO2 Tracking**: Monitor and visualize users' environmental impact.
- **Rewards System**: Track and update in-app coins for completing challenges.
- **Future Features**: Leaderboards, social interactions, and notifications.

---

## Getting Started

1. **Install Docker**  
   Make sure Docker is installed on your system. You can follow the [Docker installation guide here](https://www.docker.com/get-started).

2. **Run the Services**  
   Use the following command to start all microservices:
   ```bash
   docker-compose up

## Modules

We use ES6 module system to import and export modules.

## Variables.env

We save credentials to other services in a `variables.env` file. This file is included in this template. However, it is common use not to include it in a public repository. There are some default key value pairs included to demonstrate its working.

## Ports

You can change the ports of your server via `variables.env`

- Microservice: 
    - User Service: Running 
    - Challenge Service: Running 
    - Coin Service: Running 
- Apigateway:
1. **Challenges API**: Manages daily challenges and tracks user progress.
2. **Shop API**: Handles in-app purchases for virtual garden customization.
3. **Notification API**: Sends reminders and updates to users.

## Containers

Each microservice and the API Gateway are containerized for ease of deployment. Containers make it easy to isolate services, allowing you to maintain and scale them independently.


## Release 1.0
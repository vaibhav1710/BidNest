# Project Name

## Application Overview

The project is a REST API backend application developed using Node.js, Express, and MongoDB. It allows users to register, login, and add items for selling. These items are then auctioned for 48 hours, during which other users can bid on them. ElasticSearch is integrated for search functionality based on item title or description. BullMQ is used for processing bidding and other asynchronous operations. Redis is utilized for caching and storing session data, and cron jobs are scheduled to run every 24 hours to remove items whose auction has ended. Additionally, Cloudinary is used for storing images, and Redis and ElasticSearch are containerized for scalability and flexibility.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/vaibhav1710/BidNest.git
   ```
2.  Create a .env file in the root directory and add necessary environment variables
   ```bash
    MONGO_URI=mongodb://localhost:27017/your-database
    SECRET=your_jwt_secret
    CLOUD_NAME=your_cloud_name
    API_KEY=your_api_key
    API_SECRET=your_api_secret
    EMAIL=your_email@example.com
    PASSWORD=your_email_password
   ```
3. Tech Stack
    - Node.js
    - Express
    - MongoDB
    - ElasticSearch
    - Redis
    - Nodemailer
    - Cloudinary
    - Docker


      
   

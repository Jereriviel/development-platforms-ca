# Development Platforms Course Assignment

## Description

The goal of this project is to develop a functional news platform where users can browse and submit news articles with categories and comments by implementing an Express.js REST API backend with authentication and database integration.

## Core Functionality

### Public Access:

- Anyone can view the listings of categories, news articles, comments and users
- List endpoints support pagination using page and limit query parameters (default: page=1, limit=10)
- Articles can optionally be sorted using the sort query parameter: 'sort=category — sort by category name' and 'sort=author — sort by submitter name'

### User Authentication:

- User registration with username, email and password
- User login with email and password

### Category Management:

- Authenticated users can submit categories
- Category list endpoints support pagination

### Article Management:

- Authenticated users can submit news articles
- Authenticated users can only edit or delete their own articles
- Articles automatically tagged with submitter (logged-in user) and category information
- Article list endpoints support pagination and optional sorting as described above

### Comments Management:

- Authenticated users can submit comments
- Authenticated users can only edit or delete their own comments
- Comments automatically tagged with submitter (logged-in user) and article information
- Comments list endpoints support pagination

### Users Management:

- Authenticated users can edit or delete their own user information
- User list endpoints support pagination

## Tech stack

- Express.js with TypeScript
- MySQL database with mysql2
- JWT authentication with bcrypt password hashing
- Zod input validation
- Dotenv for environment variables
- CORS for cross-origin access
- JSDocs
- Swagger JSDocs

## Installing

### 1. Clone the repo:

```bash
git clone https://github.com/Jereriviel/development-platforms-ca.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a .env file (see .env.example for reference)

```bash
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=news_platform
PORT=3000
JWT_SECRET=your_jwt_secret
```

#### 4. Import the included SQL file ( news-platform-database.sql ) into MySQL Workbench.

### 5. Start the local dev server:

```bash
npm run dev
```

### 6. You can view API documentation for all endpoints at

```bash
http://localhost:3000/api-docs/
```

### 7. You can test the endpoints using Postman or a similar API client.

## Motivation

For this course assignment, I could choose between option 1, an Express.js API backend with authentication and database integration, or option 2, a frontend application using Supabase for backend services. I chose option 1 because I wanted to work with the server-side parts of an application.

The course material and tasks were very interesting, and I decided to slightly expand on the functionality of this assignment in order to apply everything we learned throughout the course.

Learning how APIs are built and how the different parts fit together has been very instructive, and overall it has been a fun and rewarding process.

The most challenging part of the project was figuring out how to properly relate the data to each other in a clear and logical way, as well as implementing correct validation for the different operations.

I believe the main benefit of developing a custom API, compared to using a SaaS solution like Supabase, is having full control over your data and application logic without being limited by external platform constraints. I also think that having backend competence is valuable going forward, even as a frontend developer.

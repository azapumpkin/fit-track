# FitTrack

A full-stack fitness and nutrition tracker built with React, TypeScript, Node.js, Express and PostgreSQL.

FitTrack helps users manage their personal fitness profile, calculate daily nutrition targets and track their food intake.

## Features

- User registration and authentication
- Personal profile management
- Age, height and weight tracking
- Fitness goal selection
- Activity level selection
- Automatic daily calorie calculation
- Daily protein, fat and carbohydrate targets
- Personal food database
- Custom food creation
- Food diary
- Portion-based calorie and macronutrient calculations
- Daily nutrition progress
- Diary history by date
- Food entry deletion
- Automatic synchronisation between profile and nutrition targets

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- TypeScript
- REST API
- JWT authentication

### Database

- PostgreSQL
- Prisma ORM

## Architecture

```text
FitTrack
│
├── Frontend
│   ├── React
│   ├── TypeScript
│   └── Vite
│
├── Backend
│   ├── Node.js
│   ├── Express
│   ├── REST API
│   ├── Authentication
│   └── Business logic
│
└── Database
    ├── PostgreSQL
    └── Prisma ORM

The frontend communicates with the backend through a REST API.

The backend handles authentication, user profiles, nutrition calculations and food diary operations.

PostgreSQL stores users, foods and food diary entries.

Nutrition Calculation

FitTrack calculates daily nutrition targets based on:

Gender
Age
Height
Weight
Activity level
Fitness goal

The application calculates:

Basal Metabolic Rate (BMR)
Estimated daily energy expenditure
Daily calorie target
Protein target
Fat target
Carbohydrate target
Project Structure

fit-track/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       └── services/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── database/
├── .gitignore
└── README.md

Getting Started
Requirements
Node.js
npm
PostgreSQL
Clone the repository

git clone https://github.com/azapumpkin/fit-track.git
cd fit-track

Install dependencies

Install backend dependencies:

cd backend
npm install

Install frontend dependencies:

cd ../frontend
npm install

Configure environment variables

Create a .env file in the backend directory.

Create a .env file in the frontend directory.

Environment files are intentionally excluded from the repository.

Set up the database

From the backend directory:

npx prisma migrate dev

Start the backend

npm run dev

The backend runs on:

http://localhost:3000

Start the frontend

Open another terminal:

cd /path/to/fit-track/frontend
npm run dev

The frontend runs on:

http://localhost:5173

Development Architecture

React / Vite
      │
      ▼
Express REST API
      │
      ▼
Service Layer
      │
      ▼
Repository Layer
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL

The project follows a layered backend architecture separating:

Controllers
Services
Repositories
Database access

This structure makes the application easier to maintain and extend.

Future Improvements

Possible future improvements include:

Integration with an open food database
Advanced nutrition analytics
Workout tracking
Progress charts
Mobile application
Desktop application
Cloud deployment
Improved food search and filtering

Project Status

FitTrack is a working full-stack prototype with:

Authentication
User profiles
Nutrition calculations
Food management
Food diary
Daily nutrition tracking

The project is being developed as a portfolio and interview project with a focus on practical full-stack development and clean application architecture.

Author

Aza

GitHub: https://github.com/azapumpkin
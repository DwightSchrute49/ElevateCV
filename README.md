# ElevateCV

## AI-Powered Resume Analyzer

ElevateCV is a full-stack web application that helps job seekers evaluate and improve their resumes by comparing them against target job descriptions. Leveraging Google's Gemini AI, the platform analyzes resume content, identifies skill gaps, highlights relevant keywords, and provides actionable recommendations to improve job application readiness.

---

## Overview

The application enables users to upload a resume, provide a job description, and receive an AI-generated analysis that includes:

- Resume Match Score
- Resume Summary
- Missing Skills Identification
- Suggested Skills and Technologies
- ATS-Oriented Keywords
- Resume Improvement Recommendations
- Actionable Next Steps

The goal is to help candidates tailor their resumes for specific roles and better align their profiles with employer expectations.

---

## Features

### Authentication & Security

- User Registration
- User Login & Logout
- JWT-Based Authentication
- Protected API Routes

### Resume Analysis

- PDF Resume Upload
- Resume Content Extraction
- Job Description Analysis
- AI-Powered Evaluation using Gemini 2.5 Flash

### Career Insights

- Resume Match Scoring
- Missing Skills Detection
- Suggested Technical Skills
- Keyword Analysis
- Resume Enhancement Recommendations

---

## Technology Stack

### Frontend

- React.js
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- JWT Authentication
- REST API Architecture

### Database

- MongoDB Atlas
- Mongoose

### Artificial Intelligence

- Google Gemini 2.5 Flash API

### Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---

## Project Structure

```text
ElevateCV
│
├── Frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── Backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   └── routes
│   │
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Backend

Create a `.env` file inside the `Backend` directory.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_URL=http://localhost:5173
```

### Frontend

Create a `.env` file inside the `Frontend` directory.

```env
VITE_API_URL=http://localhost:5000
```

---

## Local Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/ElevateCV.git
cd ElevateCV
```

### Install Backend Dependencies

```bash
cd Backend
npm install
```

### Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### Run the Backend

```bash
cd Backend
npm run dev
```

### Run the Frontend

```bash
cd Frontend
npm run dev
```

---

## Application Workflow

1. User uploads a resume in PDF format.
2. User enters a target job description.
3. Resume content is extracted and processed.
4. Gemini AI analyzes the resume against the provided role.
5. The application generates:
   - Resume Match Score
   - Resume Summary
   - Missing Skills
   - Suggested Skills
   - ATS Keywords
   - Resume Recommendations
   - Next Steps

---

## Future Enhancements

- Multi-Resume Comparison
- Resume Version Management
- Cover Letter Generation
- Interview Preparation Assistance
- PDF Report Export
- Role-Specific Resume Optimization
- Resume Templates and Suggestions

---

## Live Deployment

Frontend: https://elevate-cv-two.vercel.app

Backend: https://elevatecv-k0pk.onrender.com

---

## Author

**S. Siddhartha**

B.Tech Computer Science & Engineering

MERN Stack Developer | AI Enthusiast

GitHub: https://github.com/DwightSchrute49

LinkedIn: Add your LinkedIn profile link here

---

## License

This project is licensed under the MIT License.

# HR Attrition Analytics Platform

A comprehensive analytics platform for HR departments to analyze, visualize, and predict employee attrition using interactive dashboards and an AI-powered chatbot.

![Platform Overview](./preview/platform-overview.png)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Dataset Requirements](#dataset-requirements)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)

## Overview

The HR Attrition Analytics Platform helps organizations understand and reduce employee attrition through advanced data visualization and AI-assisted analysis. By leveraging machine learning and interactive dashboards, HR professionals can identify key attrition factors, detect at-risk employees, and develop targeted retention strategies.

## Features

### Interactive Analytics Dashboard
- Multi-dimensional attrition visualizations by:
  - Age groups
  - Gender
  - Departments
  - Education levels
  - Job satisfaction
  - Salary bands
  - Performance ratings

### Advanced Filtering
- Segment employee data by multiple parameters
- Create custom cohorts for analysis
- Save and share filter configurations

### AI-Powered Chatbot
- Natural language interface for data queries
- Contextual analysis of attrition factors
- Custom HR insights and recommendations
- Trend identification and prediction

### Data Management
- CSV data import functionality
- Data quality checks and validation
- Custom field mapping
- Historical data comparison

## Architecture

The platform follows a client-server architecture:

```
┌───────────────────┐      ┌───────────────────┐
│   Frontend        │      │   Backend         │
│ (React + TypeScript)◄────►(Flask + Python)   │
└───────────────────┘      └─────────┬─────────┘
                                    │
                                    ▼
                           ┌───────────────────┐
                           │  LLM Integration  │
                           │  (Groq API)       │
                           └───────────────────┘
```

## Prerequisites

- Python 3.7+
- Node.js 18+
- npm/yarn
- Groq API key

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd attrition-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file to add your GROQ_API_KEY
   ```

5. Start the Flask server:
   ```bash
   flask run --port=8000
   # Or with debug mode:
   flask run --debug --port=8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd attrition-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # Or using yarn:
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Configure API URL if needed:
   # VITE_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # Or using yarn:
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Dashboard Navigation

The platform offers several key views:

1. **Overview Dashboard**: High-level metrics and KPIs for attrition
2. **Detailed Analysis**: Deep-dive visualizations for specific metrics
3. **Employee Segmentation**: Analysis by departments, roles, and demographics
4. **Risk Assessment**: Identification of employees or groups at risk of attrition
5. **AI Assistant**: Natural language interface for custom insights

### Analyzing Attrition Data

1. Use the filters panel to focus on specific employee segments
2. Compare attrition rates across different dimensions
3. Identify correlating factors with high attrition rates
4. Export visualizations or raw data for reporting

### Using the AI Assistant

1. Ask questions in natural language about your HR data
2. Request specific analyses or comparisons
3. Get strategic recommendations for reducing attrition
4. Ask for explanations about attrition factors and trends

Sample questions:
- "What department has the highest attrition rate?"
- "Is there a correlation between overtime and attrition?"
- "What are the main factors contributing to attrition in the Sales department?"
- "Generate a summary of attrition trends by education level"

## API Documentation

### Authentication

All API endpoints require authentication via API key. Include the key in your request headers:

```
Authorization: Bearer your-api-key-here
```

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/attrition-by-age` | GET | Attrition data by age groups |
| `/api/attrition-by-gender` | GET | Attrition data by gender |
| `/api/attrition-by-department` | GET | Attrition data by department |
| `/api/attrition-by-education` | GET | Attrition data by education level |
| `/api/attrition-by-job-satisfaction` | GET | Attrition data by satisfaction level |
| `/api/attrition-by-salary` | GET | Attrition data by salary bands |
| `/api/overall-statistics` | GET | Overall attrition statistics |
| `/api/factors-correlation` | GET | Correlation between factors and attrition |
| `/api/predictive-factors` | GET | Top factors predicting attrition |
| `/api/filtered-data` | GET | Filtered attrition data |
| `/api/chat` | POST | Chat with the AI assistant |
| `/api/chat/reset` | POST | Reset chat conversation |
| `/api/dataset-metadata` | GET | Get metadata about the dataset |

Refer to the [API Documentation](./attrition-backend/API.md) for detailed endpoint specifications and response formats.

## Dataset Requirements

The platform requires HR data with the following attributes:

### Required Fields
- `Attrition`: Binary indicator (Yes/No)
- `Age`: Employee age
- `Gender`: Employee gender 
- `Department`: Department name
- `JobSatisfaction`: Satisfaction rating (1-4)
- `MonthlyIncome`: Monthly salary
- `YearsAtCompany`: Tenure at company

### Recommended Fields
- `Education`: Education level (1-5)
- `OverTime`: Overtime status (Yes/No)
- `JobLevel`: Level in organization (1-5)
- `WorkLifeBalance`: Work-life balance rating (1-4)
- `PerformanceRating`: Performance rating (1-4)
- `DistanceFromHome`: Distance from work

The default dataset is located at: `/home/Maanu/Documents/RoR Internship/Attrition-Analytics/datasets/HR-Employee-Attrition-All.csv`

## Screenshots

### Landing Page
![Landing Page](./attrition-frontend/preview/Landing.png)

### Dashboard
![Dashboard](./attrition-frontend/preview/Dash.png)

### Chat Assistant
![Chat](./attrition-frontend/preview/Chat.png)

### Upload and Data Management
![Upload](./attrition-frontend/preview/Upload.png)

## Tech Stack

### Backend
- **Python**: Core language
- **Flask**: Web framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Groq API**: LLM integration for chatbot

### Frontend
- **TypeScript**: Type-safe JavaScript
- **React**: UI library
- **Vite**: Build tool
- **shadcn/ui**: Component library
- **Tailwind CSS**: Utility-first CSS
- **Chart.js**: Data visualization
- **React Query**: Data fetching
- **Axios**: HTTP client

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

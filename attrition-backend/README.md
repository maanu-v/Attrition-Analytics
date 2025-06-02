# HR Attrition Analytics Platform

A comprehensive analytics platform for HR departments to analyze and predict employee attrition using data visualization and an AI-powered chatbot.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Chatbot Capabilities](#chatbot-capabilities)
- [Data Requirements](#data-requirements)

## Overview

The HR Attrition Analytics Platform helps organizations understand employee attrition patterns through interactive data visualizations and an AI assistant. The system analyzes HR data to identify risk factors, patterns, and trends related to employee turnover, enabling data-driven decision-making for retention strategies.

## Features

- **Interactive Dashboards**: Visualize attrition data across multiple dimensions
  - Age groups
  - Gender
  - Departments
  - Education levels
  - Job satisfaction
  - Salary bands

- **Comprehensive Filtering**: Analyze specific employee segments based on:
  - Tenure
  - Satisfaction levels
  - Performance ratings
  - Departments
  - Gender
  - Education
  - Role levels

- **Predictive Analytics**: Identify key factors that correlate with employee attrition

- **AI-Powered Assistant**: Ask questions about HR data and receive natural language insights

## Setup Instructions

### Prerequisites
- Python 3.7+
- pip package manager
- Virtual environment (recommended)
- Flask

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd attrition-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your Groq API key:
     ```
     GROQ_API_KEY=your-api-key-here
     ```

5. Configure the dataset path:
   - Default path: `/home/Maanu/Documents/RoR Internship/Attrition-Analytics/datasets/HR-Employee-Attrition-All.csv`
   - You can modify the path in the `app.py` file if needed

### Running the Application

Start the Flask server:
```bash
flask run
```

The application will be accessible at `http://127.0.0.1:5000`.

For development with debug mode:
```bash
flask run --debug
```

## API Documentation

### Authentication

All requests to the API require a valid API key. Configure your API key in the `.env` file as shown in the installation instructions.

### Endpoints

#### Data Retrieval

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/attrition-data` | GET | Retrieve attrition data | `limit` (default: 100), `offset` (default: 0) |
| `/api/attrition-by-age` | GET | Get attrition data by age groups | None |
| `/api/attrition-by-gender` | GET | Get attrition data by gender | None |
| `/api/attrition-by-department` | GET | Get attrition data by department | None |
| `/api/attrition-by-education` | GET | Get attrition data by education level | None |
| `/api/attrition-by-job-satisfaction` | GET | Get attrition data by satisfaction level | None |
| `/api/overall-statistics` | GET | Get overall attrition statistics | None |
| `/api/dataset-metadata` | GET | Get dataset metadata | None |

#### Analysis

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/filtered-data` | GET | Get filtered attrition data | Multiple filter parameters |
| `/api/factors-correlation` | GET | Get correlation between factors and attrition | None |
| `/api/predictive-factors` | GET | Get top predictive factors | None |
| `/api/quick-insights` | GET | Get quick insights for dashboard | None |

#### AI Assistant

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/chat` | POST | Send message to chatbot | JSON body with `message` field |
| `/api/chat/reset` | POST | Reset chatbot conversation | None |
| `/api/attrition-prediction` | POST | Predict attrition for employee data | JSON body with employee attributes |

### Response Formats

All API responses are in JSON format with appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Invalid or missing API key
- `500 Internal Server Error`: Server-side error

## Chatbot Capabilities

The AI-powered chatbot can assist with the following tasks:

- **Data Exploration**: Answer questions about attrition patterns and statistics
- **Segment Analysis**: Provide insights on specific employee segments
- **Risk Assessment**: Identify employees or groups at high risk of attrition
- **Strategic Recommendations**: Suggest retention strategies based on data patterns
- **Trend Analysis**: Analyze historical patterns to identify emerging trends
- **Custom Queries**: Answer ad-hoc questions about the HR dataset

## Data Requirements

To ensure accurate predictions and insights, the following data fields are recommended:

### Employee Demographics
- Age
- Gender
- Education level
- Job role
- Department
- Marital status

### Employment Details
- Tenure (years at company)
- Salary (monthly income)
- Job level
- Performance ratings
- Job satisfaction metrics
- Work-life balance indicators
- Distance from home

### Attrition Indicators
- Binary attrition status (Yes/No)
- Overtime status
- Years since last promotion
- Training times
- Relationship satisfaction

For optimal results, ensure that the dataset is complete, accurate, and includes historical data spanning at least one year.

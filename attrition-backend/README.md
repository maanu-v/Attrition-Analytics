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

- **AI-Powered Assistant**: Ask questions about your HR data and receive insights through natural language

## Setup Instructions

### Prerequisites
- Python 3.7+
- pip package manager
- Virtual environment (recommended)

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd attrition-backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your Groq API key:
     ```
     GROQ_API_KEY=your-api-key-here
     ```

5. Ensure the dataset file is in the correct location:
   - Default path: `/home/Maanu/Documents/RoR Internship/Attrition-Analytics/datasets/HR-Employee-Attrition-All.csv`
   - You can modify the path in the `app.py` file if needed

### Running the Application

Start the Flask server:
```
flask run
```

The application will be accessible at `http://127.0.0.1:5000`.

## API Documentation

### Authentication

- **API Key**: All requests to the API must include a valid API key. Set up your API key in the `.env` file as `GROQ_API_KEY=your-api-key-here`.

### Endpoints

- **GET /api/attrition-data**: Retrieve the attrition data
  - Query parameters:
    - `limit`: Number of records to return (default: 100)
    - `offset`: Offset for pagination (default: 0)
  - Response:
    - `200 OK`: Returns the requested data
    - `401 Unauthorized`: Invalid or missing API key
    - `500 Internal Server Error`: Unexpected error

- **POST /api/attrition-prediction**: Predict attrition for given employee data
  - Request body:
    - JSON object with employee attributes
  - Response:
    - `200 OK`: Returns the prediction result
    - `400 Bad Request`: Invalid input data
    - `401 Unauthorized`: Invalid or missing API key
    - `500 Internal Server Error`: Unexpected error

## Chatbot Capabilities

The AI-powered chatbot can assist with the following tasks:

- Answering questions about attrition data
- Providing insights on employee segments
- Predicting attrition risks for specific employees
- Offering recommendations for retention strategies

## Data Requirements

To ensure accurate predictions and insights, the following data is required:

- Employee demographics:
  - Age
  - Gender
  - Education level
  - Job role
  - Department

- Employment details:
  - Tenure
  - Salary
  - Performance ratings
  - Job satisfaction level

- Attrition label (for supervised learning):
  - Binary indicator of whether the employee has left the company

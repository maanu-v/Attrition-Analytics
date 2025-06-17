from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from chatbot import get_chatbot_instance

app = Flask(__name__)
CORS(app)

# Load the dataset
dataset_path = './HR-Employee-Attrition-All.csv'
df = pd.read_csv(dataset_path)

# Initialize chatbot with the dataset
chatbot = get_chatbot_instance(df)

@app.route('/api/attrition-by-age', methods=['GET'])
def attrition_by_age():
    """Return attrition data grouped by age"""
    age_groups = pd.cut(df['Age'], bins=[18, 25, 35, 45, 55, 65], labels=['18-25', '26-35', '36-45', '46-55', '56-65'])
    attrition_by_age = df.groupby([age_groups, 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_age['Total'] = attrition_by_age['Yes'] + attrition_by_age['No']
    attrition_by_age['AttritionRate'] = (attrition_by_age['Yes'] / attrition_by_age['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_age.index.tolist(),
        'yesCount': attrition_by_age['Yes'].tolist(),
        'noCount': attrition_by_age['No'].tolist(),
        'rates': attrition_by_age['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/attrition-by-gender', methods=['GET'])
def attrition_by_gender():
    """Return attrition data grouped by gender"""
    attrition_by_gender = df.groupby(['Gender', 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_gender['Total'] = attrition_by_gender['Yes'] + attrition_by_gender['No']
    attrition_by_gender['AttritionRate'] = (attrition_by_gender['Yes'] / attrition_by_gender['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_gender.index.tolist(),
        'yesCount': attrition_by_gender['Yes'].tolist(),
        'noCount': attrition_by_gender['No'].tolist(),
        'rates': attrition_by_gender['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/attrition-by-department', methods=['GET'])
def attrition_by_department():
    """Return attrition data grouped by department"""
    attrition_by_dept = df.groupby(['Department', 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_dept['Total'] = attrition_by_dept['Yes'] + attrition_by_dept['No']
    attrition_by_dept['AttritionRate'] = (attrition_by_dept['Yes'] / attrition_by_dept['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_dept.index.tolist(),
        'yesCount': attrition_by_dept['Yes'].tolist(),
        'noCount': attrition_by_dept['No'].tolist(),
        'rates': attrition_by_dept['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/attrition-by-education', methods=['GET'])
def attrition_by_education():
    """Return attrition data grouped by education level"""
    # Map numeric education levels to descriptions if needed
    education_mapping = {1: 'Below College', 2: 'College', 3: 'Bachelor', 4: 'Master', 5: 'Doctor'}
    df['EducationLevel'] = df['Education'].map(education_mapping)
    
    attrition_by_edu = df.groupby(['EducationLevel', 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_edu['Total'] = attrition_by_edu['Yes'] + attrition_by_edu['No']
    attrition_by_edu['AttritionRate'] = (attrition_by_edu['Yes'] / attrition_by_edu['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_edu.index.tolist(),
        'yesCount': attrition_by_edu['Yes'].tolist(),
        'noCount': attrition_by_edu['No'].tolist(),
        'rates': attrition_by_edu['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/attrition-by-job-satisfaction', methods=['GET'])
def attrition_by_job_satisfaction():
    """Return attrition data grouped by job satisfaction"""
    satisfaction_mapping = {1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High'}
    df['SatisfactionLevel'] = df['JobSatisfaction'].map(satisfaction_mapping)
    
    attrition_by_sat = df.groupby(['SatisfactionLevel', 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_sat['Total'] = attrition_by_sat['Yes'] + attrition_by_sat['No']
    attrition_by_sat['AttritionRate'] = (attrition_by_sat['Yes'] / attrition_by_sat['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_sat.index.tolist(),
        'yesCount': attrition_by_sat['Yes'].tolist(),
        'noCount': attrition_by_sat['No'].tolist(),
        'rates': attrition_by_sat['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/attrition-by-salary', methods=['GET'])
def attrition_by_salary():
    """Return attrition data grouped by salary bands"""
    # Convert MonthlyIncome to annual
    df['AnnualIncome'] = df['MonthlyIncome'] * 12
    
    # Create salary bands
    salary_bins = [0, 50000, 100000, 150000, 200000, float('inf')]
    salary_labels = ['<50K', '50K-100K', '100K-150K', '150K-200K', '>200K']
    df['SalaryBand'] = pd.cut(df['AnnualIncome'], bins=salary_bins, labels=salary_labels)
    
    attrition_by_salary = df.groupby(['SalaryBand', 'Attrition']).size().unstack().fillna(0)
    
    # Calculate percentages
    attrition_by_salary['Total'] = attrition_by_salary['Yes'] + attrition_by_salary['No']
    attrition_by_salary['AttritionRate'] = (attrition_by_salary['Yes'] / attrition_by_salary['Total'] * 100).round(2)
    
    result = {
        'labels': attrition_by_salary.index.tolist(),
        'yesCount': attrition_by_salary['Yes'].tolist(),
        'noCount': attrition_by_salary['No'].tolist(),
        'rates': attrition_by_salary['AttritionRate'].tolist()
    }
    return jsonify(result)

@app.route('/api/overall-statistics', methods=['GET'])
def overall_statistics():
    """Return overall attrition statistics"""
    total_employees = len(df)
    attrition_count = len(df[df['Attrition'] == 'Yes'])
    retention_count = len(df[df['Attrition'] == 'No'])
    attrition_rate = round((attrition_count / total_employees * 100), 2)
    
    result = {
        'totalEmployees': int(total_employees),
        'attritionCount': int(attrition_count),
        'retentionCount': int(retention_count),
        'attritionRate': float(attrition_rate)
    }
    return jsonify(result)

@app.route('/api/factors-correlation', methods=['GET'])
def factors_correlation():
    """Return correlation between factors and attrition"""
    # Convert categorical to numeric
    df_numeric = df.copy()
    df_numeric['AttritionBinary'] = df_numeric['Attrition'].map({'Yes': 1, 'No': 0})
    
    # Select relevant columns
    factors = [
        'Age', 'DailyRate', 'DistanceFromHome', 'Education', 
        'EnvironmentSatisfaction', 'JobSatisfaction', 'MonthlyIncome',
        'RelationshipSatisfaction', 'WorkLifeBalance', 'YearsAtCompany'
    ]
    
    # Calculate correlation
    correlations = df_numeric[factors].corrwith(df_numeric['AttritionBinary']).sort_values(ascending=False)
    
    result = {
        'factors': correlations.index.tolist(),
        'correlations': correlations.values.tolist()
    }
    return jsonify(result)

@app.route('/api/predictive-factors', methods=['GET'])
def predictive_factors():
    """Return key factors that predict attrition"""
    # Create a copy of the dataframe for processing
    df_encoded = df.copy()
    
    # Convert Attrition to binary
    df_encoded['AttritionBinary'] = df_encoded['Attrition'].map({'Yes': 1, 'No': 0})
    
    # Handle categorical variables
    # One-hot encode categorical columns
    categorical_cols = df_encoded.select_dtypes(include=['object']).columns.tolist()
    categorical_cols.remove('Attrition')  # Already handled
    
    # Select only numeric columns to avoid conversion errors
    numeric_df = df_encoded.select_dtypes(include=['number'])
    
    # Exclude columns that aren't meaningful predictors
    exclude_cols = ['EmployeeNumber', 'StandardHours', 'EmployeeCount', 'Over18']
    for col in exclude_cols:
        if col in numeric_df.columns:
            numeric_df = numeric_df.drop(col, axis=1)
    
    # Add AttritionBinary for correlation calculation
    numeric_df['AttritionBinary'] = df_encoded['AttritionBinary']
    
    # Calculate correlation with Attrition
    correlation_matrix = numeric_df.corr()
    attrition_correlations = correlation_matrix['AttritionBinary'].drop('AttritionBinary')
    
    # Sort by absolute correlation values
    abs_correlations = attrition_correlations.abs()
    sorted_correlations = abs_correlations.sort_values(ascending=False)
    
    top_factors = sorted_correlations.head(10)
    
    result = {
        'factors': top_factors.index.tolist(),
        'importance': top_factors.values.tolist()
    }
    return jsonify(result)

@app.route('/api/employee-count', methods=['GET'])
def employee_count():
    """Return employee count statistics"""
    result = {
        'total': len(df),
        'attrited': len(df[df['Attrition'] == 'Yes']),
        'active': len(df[df['Attrition'] == 'No'])
    }
    return jsonify(result)

@app.route('/api/filtered-data', methods=['GET'])
def filtered_data():
    """Return data based on applied filters"""
    # Get filter parameters from request
    tenure_min = request.args.get('tenureMin', 0, type=float)
    tenure_max = request.args.get('tenureMax', 100, type=float)
    
    satisfaction_min = request.args.get('satisfactionMin', 1, type=float)
    satisfaction_max = request.args.get('satisfactionMax', 5, type=float)
    
    performance_min = request.args.get('performanceMin', 1, type=float)
    performance_max = request.args.get('performanceMax', 5, type=float)
    
    departments = request.args.getlist('departments')
    at_risk = request.args.get('atRisk', 'false').lower() == 'true'
    
    gender = request.args.get('gender', 'all')
    education = request.args.get('education', 'all')
    role_level = request.args.get('role', 'all')
    
    # Filter the dataframe
    filtered_df = df.copy()
    
    # Apply tenure filter (YearsAtCompany)
    filtered_df = filtered_df[(filtered_df['YearsAtCompany'] >= tenure_min) & 
                             (filtered_df['YearsAtCompany'] <= tenure_max)]
    
    # Apply satisfaction filter
    filtered_df = filtered_df[(filtered_df['JobSatisfaction'] >= satisfaction_min) & 
                             (filtered_df['JobSatisfaction'] <= satisfaction_max)]
    
    # Apply performance filter (using PerformanceRating)
    filtered_df = filtered_df[(filtered_df['PerformanceRating'] >= performance_min) & 
                             (filtered_df['PerformanceRating'] <= performance_max)]
    
    # Apply department filter if specified
    if departments:
        filtered_df = filtered_df[filtered_df['Department'].isin(departments)]
    
    # Apply gender filter if not 'all'
    if gender != 'all':
        filtered_df = filtered_df[filtered_df['Gender'] == gender.capitalize()]
    
    # Apply education filter if not 'all'
    if education != 'all':
        education_mapping = {'highschool': 1, 'bachelors': 2, 'masters': 3, 'phd': 4}
        if education in education_mapping:
            filtered_df = filtered_df[filtered_df['Education'] == education_mapping[education]]
    
    # Apply role filter if not 'all'
    if role_level != 'all':
        role_mapping = {
            'entrylevel': 1, 'midlevel': 2, 'seniorlevel': 3, 
            'lead': 4, 'manager': 5, 'director': 6, 'vp': 7, 'executive': 8
        }
        if role_level in role_mapping:
            filtered_df = filtered_df[filtered_df['JobLevel'] == role_mapping[role_level]]
    
    # Apply at-risk filter if enabled
    if at_risk:
        # Define at-risk criteria (example: low satisfaction + high overtime + low performance)
        filtered_df = filtered_df[(filtered_df['JobSatisfaction'] <= 2) | 
                                 (filtered_df['WorkLifeBalance'] <= 2) |
                                 (filtered_df['OverTime'] == 'Yes')]
    
    # Calculate summary statistics
    total_employees = len(filtered_df)
    attrition_count = len(filtered_df[filtered_df['Attrition'] == 'Yes'])
    retention_count = len(filtered_df[filtered_df['Attrition'] == 'No'])
    attrition_rate = round((attrition_count / total_employees * 100), 2) if total_employees > 0 else 0
    
    # Calculate department-wise stats for filtered data
    dept_stats = filtered_df.groupby('Department').size().to_dict()
    dept_attrition = filtered_df[filtered_df['Attrition'] == 'Yes'].groupby('Department').size().to_dict()
    
    # Format department stats
    dept_data = [
        {
            'name': dept,
            'count': count,
            'attrition': dept_attrition.get(dept, 0),
            'rate': round((dept_attrition.get(dept, 0) / count * 100), 2) if count > 0 else 0
        }
        for dept, count in dept_stats.items()
    ]
    
    result = {
        'totalEmployees': int(total_employees),
        'attritionCount': int(attrition_count),
        'retentionCount': int(retention_count),
        'attritionRate': float(attrition_rate),
        'filteredData': True,
        'departmentStats': dept_data
    }
    
    return jsonify(result)

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process a chat message and return the response."""
    data = request.json
    
    if not data or 'message' not in data:
        return jsonify({"error": "Missing message parameter"}), 400
    
    message = data['message']
    
    # Process the query using the chatbot
    response = chatbot.process_query(message)
    
    return jsonify(response)

@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    """Reset the chat conversation history."""
    chatbot.clear_conversation()
    return jsonify({"status": "success", "message": "Chat conversation reset"})

@app.route('/api/dataset-metadata', methods=['GET'])
def dataset_metadata():
    """Return metadata about the loaded dataset"""
    result = {
        'name': os.path.basename(dataset_path),
        'rows': len(df),
        'columns': len(df.columns),
        'column_list': df.columns.tolist(),
        'numeric_columns': df.select_dtypes(include=['number']).columns.tolist(),
        'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
        'last_updated': os.path.getmtime(dataset_path),
    }
    
    # Get sample values for categorical columns (limited to top 5)
    categorical_preview = {}
    for col in df.select_dtypes(include=['object']).columns[:5]:
        categorical_preview[col] = df[col].value_counts().head(5).to_dict()
    
    # Get basic stats for numeric columns
    numeric_preview = {}
    for col in df.select_dtypes(include=['number']).columns[:5]:
        numeric_preview[col] = {
            'min': float(df[col].min()),
            'max': float(df[col].max()),
            'mean': float(df[col].mean()),
            'median': float(df[col].median())
        }
        
    result['categorical_preview'] = categorical_preview
    result['numeric_preview'] = numeric_preview
    
    # Evaluate data quality
    missing_values = df.isnull().sum().sum()
    result['quality'] = {
        'rating': 'Good' if missing_values == 0 else 'Fair' if missing_values < len(df) * 0.05 else 'Poor',
        'missing_values': int(missing_values),
        'missing_percentage': float(missing_values / (len(df) * len(df.columns)) * 100)
    }
    
    return jsonify(result)

@app.route('/api/quick-insights', methods=['GET'])
def quick_insights():
    """Return quick insights about the dataset for the sidebar"""
    insights = {
        'attrition_rate': float(len(df[df['Attrition'] == 'Yes']) / len(df) * 100),
        'avg_satisfaction': float(df['JobSatisfaction'].mean()),
        'avg_years': float(df['YearsAtCompany'].mean()),
        'avg_age': float(df['Age'].mean()),
        'top_department': df['Department'].value_counts().index[0],
        'overtime_percentage': float(len(df[df['OverTime'] == 'Yes']) / len(df) * 100)
    }
    
    return jsonify(insights)

@app.route('/api/debug-plot', methods=['POST'])
def debug_plot():
    """Debug endpoint to test plot generation directly."""
    data = request.json
    
    if not data:
        return jsonify({"error": "Missing request body"}), 400
    
    plot_type = data.get('type')
    x_column = data.get('x_column')
    y_column = data.get('y_column')
    title = data.get('title', '')
    hue = data.get('hue')
    
    if not plot_type or not x_column:
        return jsonify({"error": "Missing required parameters"}), 400
    
    # Try to generate the plot
    plot_image = chatbot.generate_plot(
        plot_type=plot_type,
        x_column=x_column,
        y_column=y_column,
        title=title,
        hue=hue
    )
    
    if not plot_image:
        return jsonify({
            "status": "error", 
            "message": "Failed to generate plot"
        }), 500
    
    return jsonify({
        "status": "success",
        "plot_image": plot_image
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000,host="0.0.0.0")

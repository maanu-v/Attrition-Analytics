import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# Load dataset
df = pd.read_csv("/home/Maanu/Documents/RoR Internship/Attrition-Analytics/Datasets/HR-Employee-Attrition-All.csv")

# Constants
TODAY = datetime(2025, 6, 10)
np.random.seed(42)
random.seed(42)

# Generate hire and exit dates
def generate_hire_exit_dates(years_at_company, attrition):
    total_days = int(years_at_company * 365.25)
    if total_days <= 180:
        hire_date = TODAY - timedelta(days=random.randint(30, 180))
        exit_date = hire_date if attrition == "Yes" else None
    else:
        hire_date = TODAY - timedelta(days=total_days)
        exit_date = None
        if attrition == "Yes":
            exit_days = random.randint(180, total_days)
            exit_date = hire_date + timedelta(days=exit_days)
            if exit_date > TODAY:
                exit_date = TODAY
    return hire_date.date(), exit_date.date() if exit_date else None


# Assign manager ID randomly among employees in higher job levels
def assign_manager_ids(df):
    manager_pool = df[df['JobLevel'] >= 3].sample(frac=1.0, random_state=42)
    manager_ids = manager_pool['EmployeeNumber'].tolist()
    return [random.choice(manager_ids) if level > 1 else None for level in df['JobLevel']]

# Create employees table
employees = df.copy()
employees["hire_date"], employees["exit_date"] = zip(*employees.apply(
    lambda row: generate_hire_exit_dates(row["YearsAtCompany"], row["Attrition"]), axis=1
))
employees["manager_id"] = assign_manager_ids(employees)

# Drop columns that are monthly or specific to metrics
drop_cols = ["MonthlyIncome", "PerformanceRating", "PercentSalaryHike", "EmployeeCount", "StandardHours", "Over18"]
employees.drop(columns=drop_cols, inplace=True, errors="ignore")

# Save employees table
employees.to_csv("employees.csv", index=False)

# Generate monthly metrics
metrics_data = []
for _, row in employees.iterrows():
    emp_id = row["EmployeeNumber"]
    hire_date = row["hire_date"]
    exit_date = row["exit_date"]
    start = pd.to_datetime(hire_date)
    end = pd.to_datetime(exit_date) if exit_date else TODAY
    months = pd.date_range(start=start, end=end, freq='MS')

    for date in months:
        metrics_data.append({
            "employee_id": emp_id,
            "month": date.strftime('%Y-%m-%d'),
            "monthly_income": int(np.random.normal(loc=6500, scale=2000)),
            "work_hours": int(np.random.normal(loc=160, scale=10)),
            "performance_rating": random.choice([1, 2, 3, 4]),
            "overtime": random.choice(["Yes", "No"])
        })

monthly_metrics = pd.DataFrame(metrics_data)
monthly_metrics.to_csv("monthly_metrics.csv", index=False)

# Create attrition events table
attrition_events = employees[employees["Attrition"] == "Yes"][["EmployeeNumber", "exit_date"]].copy()
attrition_events.rename(columns={"EmployeeNumber": "employee_id"}, inplace=True)
attrition_events["exit_reason"] = np.random.choice(
    ["Better Opportunity", "Work-Life Balance", "Low Compensation", "Career Change"],
    size=len(attrition_events)
)
attrition_events.to_csv("attrition_events.csv", index=False)

print("✅ Generated employees.csv, monthly_metrics.csv, attrition_events.csv")

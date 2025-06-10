#!/usr/bin/env python
"""
Test script for verifying plot generation functionality.
Run this script to test if the plotting capability works correctly without going through the LLM.
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
import json
import requests

# Load the dataset
dataset_path = '/home/Maanu/Documents/RoR Internship/Attrition-Analytics/Datasets/HR-Employee-Attrition-All.csv'
df = pd.read_csv(dataset_path)

# Test plot configurations
test_configs = [
    {
        "name": "Age Distribution",
        "type": "histogram",
        "x_column": "Age",
        "title": "Distribution of Employee Ages"
    },
    {
        "name": "Department Count",
        "type": "bar",
        "x_column": "Department",
        "title": "Employee Count by Department"
    },
    {
        "name": "Attrition by Department",
        "type": "bar",
        "x_column": "Department",
        "y_column": "Attrition Rate",
        "title": "Attrition Rate by Department"
    },
    {
        "name": "Attrition by Age Group",
        "type": "bar",
        "x_column": "Age Group",
        "y_column": "Attrition Rate",
        "title": "Attrition Rate by Age Group"
    }
]

def test_api_endpoint(config):
    """Test the API endpoint for plot generation"""
    url = "http://localhost:8000/api/debug-plot"
    
    # Send request to the debug endpoint
    try:
        response = requests.post(url, json=config)
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'success':
                print(f"✅ API endpoint test successful for {config['name']}")
            else:
                print(f"❌ API returned error for {config['name']}: {result.get('message')}")
        else:
            print(f"❌ API error {response.status_code} for {config['name']}: {response.text}")
    except Exception as e:
        print(f"❌ API request failed for {config['name']}: {str(e)}")

def main():
    print("Testing plot generation...")
    
    # Test the API endpoint
    for config in test_configs:
        print(f"\nTesting: {config['name']}")
        test_api_endpoint(config)
        
    print("\nTests completed.")

if __name__ == "__main__":
    main()
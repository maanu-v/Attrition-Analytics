import os
import json
import pandas as pd
import requests
import dotenv
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import numpy as np
from typing import Dict, Any, List, Optional, Tuple, Union

# Load environment variables
dotenv.load_dotenv()

class HRAnalyticsChatbot:
    """
    Chatbot for HR Analytics using Groq API
    """
    def __init__(self, dataframe=None):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama3-70b-8192"
        self.dataframe = dataframe
        self.conversation_history = []
        
    def _get_dataframe_info(self) -> str:
        """Get basic information about the dataframe as context for the LLM."""
        if self.dataframe is None:
            return "No dataframe is currently loaded."
            
        df_info = {
            "shape": f"{self.dataframe.shape[0]} rows, {self.dataframe.shape[1]} columns",
            "columns": list(self.dataframe.columns),
            "data_types": {col: str(dtype) for col, dtype in self.dataframe.dtypes.items()},
            "sample": self.dataframe.head(5).to_dict(orient='records')
        }
        
        # Get basic statistics for numeric columns
        numeric_columns = self.dataframe.select_dtypes(include=['number']).columns
        if not numeric_columns.empty:
            stats = self.dataframe[numeric_columns].describe().to_dict()
            df_info["numeric_stats"] = stats
            
        # Get value counts for categorical columns (limit to 5 most common values)
        categorical_columns = self.dataframe.select_dtypes(include=['object']).columns
        if not categorical_columns.empty:
            df_info["categorical_values"] = {}
            for col in categorical_columns[:5]:  # Limit to first 5 categorical columns
                df_info["categorical_values"][col] = self.dataframe[col].value_counts().head(5).to_dict()
                
        return json.dumps(df_info, indent=2)
    
    def _create_system_prompt(self) -> str:
        """Create a system prompt based on the dataframe content."""
        df_info = self._get_dataframe_info()
        
        return f"""You are an HR Analytics Assistant specialized in analyzing employee data. 
You have access to an HR dataset with the following structure and information:

{df_info}

Your capabilities include:
1. Descriptive Analysis: Summarizing and describing patterns in the data
2. Diagnostic Analysis: Finding causes of patterns and correlations
3. Predictive Analysis: Forecasting future trends based on historical data
4. Prescriptive Analysis: Recommending actions to address problems or opportunities

When answering:
- Keep responses concise and focused on HR insights
- Indicate when you're making assumptions due to limited data 
- Clearly separate facts from interpretations
- Format numerical results in a readable way
- Provide actionable recommendations when appropriate
- Use Markdown for formatting your responses with headers, bullet points, bold text, and tables
- For tables, use proper markdown table syntax with headers, dividers, and aligned columns
- For statistics and data breakdowns, use a clear hierarchical structure with headings and bullet points
- For numeric data, present numbers in a well-formatted manner with appropriate percentages in parentheses
- Dont include external links or references, focus on the data provided

Example formatting for analytics results:
```
## Analysis Results

### Employee Breakdown
- **Total Employees:** 1,470
- **Gender Distribution:**
  - Male: 882 (60.0%)
  - Female: 588 (40.0%)

### Attrition Analysis
- **Overall Attrition Rate:** 16.1%
- **Attrition by Department:**
  - Sales: 20.6%
  - Engineering: 13.2%
  - HR: 19.0%

### Department Comparison Table
| Department | Employees | Attrition | Rate (%) |
| ---------- | --------- | --------- | -------- |
| Sales      | 450       | 93        | 20.6     |
| Engineering| 420       | 55        | 13.2     |
| HR         | 100       | 19        | 19.0     |
| R&D        | 500       | 78        | 15.6     |
```

If a user asks for analysis or calculations that would normally require code execution,
describe the approach and provide sample results based on the dataset information above.
"""
    
    def _create_derived_dataframe(self, plot_request: Dict[str, Any]) -> Tuple[pd.DataFrame, Dict[str, str]]:
        """
        Create a dataframe with derived columns based on the plot request.
        
        Args:
            plot_request: Dictionary containing plot request parameters
            
        Returns:
            Tuple of (derived dataframe, column mappings)
        """
        df = self.dataframe.copy()
        column_mapping = {}
        
        # Handle age groups if requested
        if plot_request.get("x_column") == "Age Group" or plot_request.get("y_column") == "Age Group":
            # Create age groups
            bins = [18, 25, 30, 35, 40, 45, 50, 55, 60, 100]
            labels = ['18-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60+']
            df['Age Group'] = pd.cut(df['Age'], bins=bins, labels=labels, right=False)
            column_mapping["Age Group"] = "Age Group"
        
        # Handle attrition rate if requested
        if plot_request.get("x_column") == "Attrition Rate" or plot_request.get("y_column") == "Attrition Rate":
            # We'll need to aggregate data to calculate attrition rate
            group_by_col = plot_request.get("x_column") if plot_request.get("y_column") == "Attrition Rate" else plot_request.get("y_column")
            
            if group_by_col in df.columns or group_by_col in column_mapping:
                # Convert Attrition to binary
                df['AttritionBinary'] = df['Attrition'].map({'Yes': 1, 'No': 0})
                
                # Group by the specified column and calculate attrition rate
                attrition_data = df.groupby(group_by_col)['AttritionBinary'].agg(['mean', 'count']).reset_index()
                attrition_data['Attrition Rate'] = attrition_data['mean'] * 100
                
                # Use this aggregated dataframe instead
                df = attrition_data
                
                # Update column mapping
                column_mapping["Attrition Rate"] = "Attrition Rate"
        
        return df, column_mapping
    
    def generate_plot(self, plot_type: str, x_column: str, y_column: Optional[str] = None, 
                      title: str = "", hue: Optional[str] = None, figsize: Tuple[int, int] = (10, 6)) -> Optional[str]:
        """
        Generate a plot based on the dataframe and return it as a base64 encoded string.
        
        Args:
            plot_type: Type of plot ('bar', 'histogram', 'scatter', 'pie', 'box', etc.)
            x_column: Column name for x-axis
            y_column: Column name for y-axis (optional for some plots)
            title: Plot title
            hue: Column name for color grouping (optional)
            figsize: Figure size as (width, height) tuple
            
        Returns:
            Base64 encoded string of the plot image or None if an error occurs
        """
        if self.dataframe is None:
            return None
        
        # Check if we need to handle derived columns (like Age Group or Attrition Rate)
        derived_columns = ["Age Group", "Attrition Rate"]
        needs_derived_df = (x_column in derived_columns or 
                           (y_column and y_column in derived_columns) or 
                           (hue and hue in derived_columns))
        
        plot_request = {
            "type": plot_type,
            "x_column": x_column,
            "y_column": y_column,
            "title": title,
            "hue": hue
        }
        
        if needs_derived_df:
            df, column_mapping = self._create_derived_dataframe(plot_request)
            # Update columns based on mappings
            if x_column in column_mapping:
                x_column = column_mapping[x_column]
            if y_column and y_column in column_mapping:
                y_column = column_mapping[y_column]
            if hue and hue in column_mapping:
                hue = column_mapping[hue]
        else:
            df = self.dataframe
            # Check if basic columns exist
            if x_column not in df.columns:
                return None
            if y_column and y_column not in df.columns:
                return None
            if hue and hue not in df.columns:
                return None
        
        try:
            # Create a figure with the specified size
            plt.figure(figsize=figsize)
            
            # Generate the appropriate plot based on plot_type
            if plot_type == 'bar':
                if y_column:
                    sns.barplot(x=x_column, y=y_column, hue=hue, data=df)
                else:
                    # Count plot if no y-column is provided
                    sns.countplot(x=x_column, hue=hue, data=df)
                    
            elif plot_type == 'histogram':
                sns.histplot(df[x_column], kde=True)
                
            elif plot_type == 'scatter':
                if y_column:
                    sns.scatterplot(x=x_column, y=y_column, hue=hue, data=df)
                else:
                    return None  # Scatter plot requires y-column
                    
            elif plot_type == 'pie':
                # For pie charts, we need value counts
                value_counts = df[x_column].value_counts()
                plt.pie(value_counts, labels=value_counts.index, autopct='%1.1f%%')
                
            elif plot_type == 'box':
                sns.boxplot(x=x_column, y=y_column, hue=hue, data=df)
                
            elif plot_type == 'violin':
                sns.violinplot(x=x_column, y=y_column, hue=hue, data=df)
                
            elif plot_type == 'heatmap':
                # For heatmaps, we typically need correlation data
                if x_column == 'correlation':
                    corr_matrix = df.corr()
                    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
                else:
                    return None
            else:
                return None  # Unsupported plot type
            
            # Add title if provided
            if title:
                plt.title(title)
                
            # Make layout tight
            plt.tight_layout()
            
            # Save plot to a bytes buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            
            # Encode the bytes as base64
            plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
            
            # Close the plot to free memory
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            print(f"Error generating plot: {str(e)}")
            return None
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a user query and get a response from the Groq API.
        
        Args:
            query: The user's question or request
            
        Returns:
            Dict containing the response and any additional data including plots if generated
        """
        # Add user message to conversation history
        self.conversation_history.append({"role": "user", "content": query})
        
        # Prepare messages for API request
        messages = [
            {"role": "system", "content": self._create_system_prompt()},
        ]
        
        # Add a specific instruction for plot generation
        plot_instruction = f"""
ALWAYS GENERATE A VISUALIZATION when the user asks for:
- Any analysis related to attrition, demographics, or HR metrics
- Any comparison or correlation between factors
- Any request containing words like "show", "visualize", "plot", "chart", or "graph"

When generating visualizations, follow these steps:
1. Choose the appropriate visualization type based on the data:
   - bar: For comparing categories (e.g., attrition by department)
   - histogram: For distribution of numeric values (e.g., age distribution)
   - scatter: For relationships between two numeric variables
   - pie: For showing composition of a whole
   - box: For showing distribution with quartiles
   - heatmap: For correlation matrices

2. Choose the correct columns from the dataset. Available columns include:
   {", ".join(self.dataframe.columns.tolist() if self.dataframe is not None else ["No columns available"])}

3. ALWAYS include a plot request JSON block at the end of your message using this format:
```plot_request
{{
  "type": "plot_type",  // bar, histogram, scatter, pie, box, heatmap
  "x_column": "column_name",  // must be an exact column name from the dataset
  "y_column": "column_name",  // optional for some plots
  "title": "Plot Title",
  "hue": "column_name"  // optional for grouping
}}
```

For derived analytics:
- Use "Age Group" as column name to automatically bin ages into groups
- Use "Attrition Rate" as y_column and a category column as x_column to show attrition rates

EXAMPLES:

1. For age distribution:
```plot_request
{{
  "type": "histogram",
  "x_column": "Age",
  "title": "Distribution of Employee Ages"
}}
```

2. For attrition by age groups:
```plot_request
{{
  "type": "bar",
  "x_column": "Age Group",
  "y_column": "Attrition Rate",
  "title": "Attrition Rate by Age Group"
}}
```

3. For attrition by department:
```plot_request
{{
  "type": "bar",
  "x_column": "Department",
  "y_column": "Attrition Rate", 
  "title": "Attrition Rate by Department"
}}
```

4. For salary distribution:
```plot_request
{{
  "type": "histogram",
  "x_column": "MonthlyIncome",
  "title": "Distribution of Monthly Income"
}}
```
"""
        messages.append({"role": "system", "content": plot_instruction})
        
        # Add conversation history (limiting to last 10 messages to avoid context length issues)
        messages.extend(self.conversation_history[-10:])
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024
            }
            
            response = requests.post(self.api_url, headers=headers, json=data)
            response.raise_for_status()
            
            response_data = response.json()
            assistant_message = response_data["choices"][0]["message"]["content"]
            
            # Check if response contains a plot request
            plot_data = None
            plot_image = None
            
            # Check for plot request in several possible formats
            plot_markers = ["```plot_request", "```json", "{\"type\":", "{ \"type\":", "{\n  \"type\":"]
            found_plot_request = False
            
            for marker in plot_markers:
                if marker in assistant_message:
                    found_plot_request = True
                    try:
                        # Extract the JSON plot request
                        if marker.startswith("```"):
                            plot_start = assistant_message.find(marker)
                            marker_len = len(marker)
                            plot_end = assistant_message.find("```", plot_start + marker_len)
                            
                            if plot_end != -1:
                                plot_json_str = assistant_message[plot_start + marker_len:plot_end].strip()
                        else:
                            # Find the opening brace for JSON
                            plot_start = assistant_message.find(marker[0])
                            # Find the last closing brace
                            plot_end = assistant_message.rfind('}') + 1
                            if plot_end > plot_start:
                                plot_json_str = assistant_message[plot_start:plot_end].strip()
                        
                        # Clean up the JSON string - remove any non-JSON content
                        plot_json_str = plot_json_str.replace('\\', '')
                        
                        print(f"Extracted plot JSON string: {plot_json_str}")
                        plot_request = json.loads(plot_json_str)
                        
                        print(f"Processing plot request: {plot_request}")
                        
                        # Generate the plot
                        plot_image = self.generate_plot(
                            plot_type=plot_request.get("type"),
                            x_column=plot_request.get("x_column"),
                            y_column=plot_request.get("y_column"),
                            title=plot_request.get("title", ""),
                            hue=plot_request.get("hue")
                        )
                        
                        # If plot was successfully generated
                        if plot_image:
                            print(f"Plot successfully generated")
                            # Remove the plot request from the message
                            assistant_message = assistant_message[:plot_start].rstrip()
                            
                            # Store plot request data
                            plot_data = plot_request
                        else:
                            print(f"Failed to generate plot for request: {plot_request}")
                    except Exception as e:
                        print(f"Error processing plot request: {str(e)}")
            
            # Add assistant response to conversation history
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            result = {
                "response": assistant_message,
                "status": "success"
            }
            
            # Add plot data and image if available
            if plot_data:
                result["plot_data"] = plot_data
                print("Added plot data to response")
            if plot_image:
                result["plot_image"] = plot_image
                print("Added plot image to response")
            else:
                print("No plot image was generated")
                
            # If the request seems to need a plot but none was generated, try to force generation
            if found_plot_request and not plot_image:
                print("Attempting to create a plot based on the query...")
                if "age" in query.lower() and "attrition" in query.lower():
                    # Try to create age group vs attrition plot
                    plot_image = self.generate_plot(
                        plot_type="bar",
                        x_column="Age Group",
                        y_column="Attrition Rate",
                        title="Attrition Rate by Age Group"
                    )
                    if plot_image:
                        result["plot_image"] = plot_image
                        result["plot_data"] = {
                            "type": "bar",
                            "x_column": "Age Group",
                            "y_column": "Attrition Rate",
                            "title": "Attrition Rate by Age Group"
                        }
                        print("Generated fallback age-attrition plot")
                
            return result
            
        except requests.exceptions.RequestException as e:
            error_message = f"API request error: {str(e)}"
            return {
                "response": error_message,
                "status": "error"
            }
        except Exception as e:
            error_message = f"Error processing query: {str(e)}"
            return {
                "response": error_message,
                "status": "error"
            }
    
    def clear_conversation(self) -> None:
        """Clear the conversation history."""
        self.conversation_history = []

# Utility function to be used by app.py
def get_chatbot_instance(dataframe=None):
    """Create and return a chatbot instance with the provided dataframe."""
    return HRAnalyticsChatbot(dataframe)

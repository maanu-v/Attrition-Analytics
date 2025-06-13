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
import warnings
warnings.filterwarnings('ignore')

# Load environment variables
dotenv.load_dotenv()

class HRAnalyticsChatbot:
    """
    Enhanced Chatbot for HR Analytics using Groq API with improved plotting functionality
    """
    def __init__(self, dataframe=None):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama3-70b-8192"
        self.dataframe = dataframe
        self.conversation_history = []
        
        # Set matplotlib backend for better compatibility
        plt.switch_backend('Agg')
        
        # Preprocess dataframe if provided
        if self.dataframe is not None:
            self._preprocess_dataframe()
        
    def _preprocess_dataframe(self):
        """Preprocess the dataframe to handle common data issues."""
        if self.dataframe is None:
            return
            
        # Convert categorical columns to appropriate types
        for col in self.dataframe.columns:
            if self.dataframe[col].dtype == 'object':
                # Check if it's a binary column
                unique_vals = self.dataframe[col].dropna().unique()
                if len(unique_vals) == 2 and set(map(str, unique_vals)) == {'Yes', 'No'}:
                    self.dataframe[col + '_Binary'] = self.dataframe[col].map({'Yes': 1, 'No': 0})
        
        print(f"Dataframe preprocessed. Shape: {self.dataframe.shape}")
        
    def _get_dataframe_info(self) -> str:
        """Get comprehensive information about the dataframe as context for the LLM."""
        if self.dataframe is None:
            return "No dataframe is currently loaded."
            
        df_info = {
            "shape": f"{self.dataframe.shape[0]} rows, {self.dataframe.shape[1]} columns",
            "columns": list(self.dataframe.columns),
            "data_types": {col: str(dtype) for col, dtype in self.dataframe.dtypes.items()},
            "sample": self.dataframe.head(3).to_dict(orient='records')
        }
        
        # Get basic statistics for numeric columns
        numeric_columns = self.dataframe.select_dtypes(include=['number']).columns
        if len(numeric_columns) > 0:
            stats = self.dataframe[numeric_columns].describe().to_dict()
            df_info["numeric_stats"] = {col: {k: round(v, 2) if isinstance(v, float) else v 
                                            for k, v in stats[col].items()} for col in stats}
            
        # Get value counts for categorical columns (limit to top 5 values)
        categorical_columns = self.dataframe.select_dtypes(include=['object']).columns
        if len(categorical_columns) > 0:
            df_info["categorical_values"] = {}
            for col in categorical_columns[:5]:  # Limit to first 5 categorical columns
                value_counts = self.dataframe[col].value_counts().head(5)
                df_info["categorical_values"][col] = value_counts.to_dict()
                
        return json.dumps(df_info, indent=2)
    
    def _create_derived_features(self) -> pd.DataFrame:
        """Create a dataframe with derived features for analysis."""
        if self.dataframe is None:
            return pd.DataFrame()
            
        df = self.dataframe.copy()
        
        # Create age groups if Age column exists
        if 'Age' in df.columns:
            bins = [18, 25, 30, 35, 40, 45, 50, 55, 60, 100]
            labels = ['18-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60+']
            df['AgeGroup'] = pd.cut(df['Age'], bins=bins, labels=labels, right=False)
        
        # Create salary bands if salary-related columns exist
        salary_cols = [col for col in df.columns if 'salary' in col.lower() or 'income' in col.lower()]
        for col in salary_cols:
            if df[col].dtype in ['int64', 'float64']:
                df[f'{col}_Band'] = pd.qcut(df[col], q=4, labels=['Low', 'Medium', 'High', 'Very High'])
        
        # Create tenure groups if relevant columns exist
        tenure_cols = [col for col in df.columns if 'year' in col.lower() and 'company' in col.lower()]
        for col in tenure_cols:
            if df[col].dtype in ['int64', 'float64']:
                df[f'{col}_Group'] = pd.cut(df[col], bins=[0, 2, 5, 10, float('inf')], 
                                          labels=['0-2 years', '2-5 years', '5-10 years', '10+ years'])
        
        return df
    
    def _validate_plot_params(self, plot_type: str, x_column: str, y_column: str = None, 
                             df: pd.DataFrame = None) -> Tuple[bool, str]:
        """Validate plot parameters and return validation status with error message."""
        if df is None or df.empty:
            return False, "Dataframe is empty or None"
        
        # Check if x_column exists
        if x_column and x_column not in df.columns:
            available_cols = ', '.join(df.columns.tolist()[:10])
            return False, f"Column '{x_column}' not found. Available columns: {available_cols}..."
        
        # Check if y_column exists (when required)
        if y_column and y_column not in df.columns:
            available_cols = ', '.join(df.columns.tolist()[:10])
            return False, f"Column '{y_column}' not found. Available columns: {available_cols}..."
        
        # Plot-specific validations
        if plot_type in ['scatter', 'line'] and not y_column:
            return False, f"Plot type '{plot_type}' requires both x and y columns"
        
        if plot_type == 'heatmap' and x_column:
            numeric_cols = df.select_dtypes(include=['number']).columns
            if len(numeric_cols) < 2:
                return False, "Heatmap requires at least 2 numeric columns"
        
        return True, "Valid"
    
    def _prepare_data_for_plot(self, plot_type: str, x_column: str, y_column: str = None, 
                              df: pd.DataFrame = None) -> pd.DataFrame:
        """Prepare data specifically for the requested plot type."""
        if df is None:
            df = self._create_derived_features()
        
        plot_df = df.copy()
        
        # Handle attrition rate calculations
        if y_column and ('rate' in y_column.lower() or y_column == 'Attrition Rate'):
            print(f"Calculating attrition rates for {x_column}")
            if 'Attrition' in plot_df.columns and x_column in plot_df.columns:
                # Group by x_column and calculate attrition statistics
                attrition_stats = plot_df.groupby(x_column)['Attrition'].agg([
                    lambda x: (x == 'Yes').sum(),  # Count of Yes
                    'count'  # Total count
                ]).reset_index()
                
                # Rename columns for clarity
                attrition_stats.columns = [x_column, 'Attritions', 'Total']
                attrition_stats['AttritionRate'] = (attrition_stats['Attritions'] / attrition_stats['Total']) * 100
                
                print(f"Attrition rates calculated: {attrition_stats[['Attritions', 'Total', 'AttritionRate']].to_dict('records')}")
                
                plot_df = attrition_stats
            else:
                print(f"Missing required columns for attrition rate calculation. Available: {plot_df.columns.tolist()}")
        
        # Handle correlation analysis
        elif (x_column and 'factor' in x_column.lower()) or (y_column and 'correlation' in y_column.lower()):
            print("Calculating correlation factors")
            numeric_df = df.select_dtypes(include=['number']).copy()
            
            # Add binary encoded categorical variables
            if 'Attrition' in df.columns:
                numeric_df['Attrition_Binary'] = df['Attrition'].map({'Yes': 1, 'No': 0})
            
            if 'Attrition_Binary' in numeric_df.columns:
                correlations = numeric_df.corr()['Attrition_Binary'].drop('Attrition_Binary').abs()
                correlations = correlations.sort_values(ascending=False).head(10)
                
                plot_df = pd.DataFrame({
                    'Factor': correlations.index,
                    'CorrelationCoefficient': correlations.values
                })
                print(f"Correlation factors calculated: {len(plot_df)} factors")
        
        return plot_df
    
    def generate_plot(self, plot_type: str, x_column: str = None, y_column: str = None, 
                      title: str = "", hue: str = None, figsize: Tuple[int, int] = (12, 8),
                      columns: List[str] = None) -> Optional[str]:
        """
        Generate a plot with improved error handling and data preparation.
        """
        try:
            if self.dataframe is None:
                print("No dataframe available for plotting")
                return None
            
            # Prepare the data
            df = self._prepare_data_for_plot(plot_type, x_column, y_column)
            
            # Handle special column name mappings
            column_mappings = {
                'Age Group': 'AgeGroup',
                'Attrition Rate': 'AttritionRate',
                'Correlation Coefficient': 'CorrelationCoefficient'
            }
            
            # Apply mappings
            if x_column in column_mappings:
                x_column = column_mappings[x_column]
            if y_column in column_mappings:
                y_column = column_mappings[y_column]
            if hue in column_mappings:
                hue = column_mappings[hue]
            
            # Validate parameters
            is_valid, error_msg = self._validate_plot_params(plot_type, x_column, y_column, df)
            if not is_valid:
                print(f"Plot validation failed: {error_msg}")
                return None
            
            # Set style
            plt.style.use('default')
            sns.set_palette("husl")
            
            # Create figure
            fig, ax = plt.subplots(figsize=figsize)
            
            # Generate plot based on type
            if plot_type == 'bar':
                if y_column and y_column in df.columns:
                    sns.barplot(data=df, x=x_column, y=y_column, hue=hue, ax=ax)
                else:
                    # Count plot
                    sns.countplot(data=df, x=x_column, hue=hue, ax=ax)
                    ax.set_ylabel('Count')
                
                # Rotate x-axis labels if needed
                if len(df[x_column].unique()) > 5:
                    plt.xticks(rotation=45, ha='right')
            
            elif plot_type == 'histogram':
                df[x_column].hist(bins=20, ax=ax, alpha=0.7, edgecolor='black')
                ax.set_xlabel(x_column)
                ax.set_ylabel('Frequency')
            
            elif plot_type == 'scatter':
                sns.scatterplot(data=df, x=x_column, y=y_column, hue=hue, ax=ax, s=60, alpha=0.7)
            
            elif plot_type == 'pie':
                value_counts = df[x_column].value_counts()
                colors = plt.cm.Set3(np.linspace(0, 1, len(value_counts)))
                wedges, texts, autotexts = ax.pie(value_counts.values, labels=value_counts.index, 
                                                autopct='%1.1f%%', colors=colors, startangle=90)
                ax.set_aspect('equal')
            
            elif plot_type == 'box':
                if y_column:
                    sns.boxplot(data=df, x=x_column, y=y_column, hue=hue, ax=ax)
                else:
                    sns.boxplot(data=df, y=x_column, ax=ax)
                
                if len(df[x_column].unique()) > 5:
                    plt.xticks(rotation=45, ha='right')
            
            elif plot_type == 'violin':
                if y_column:
                    sns.violinplot(data=df, x=x_column, y=y_column, hue=hue, ax=ax)
                else:
                    sns.violinplot(data=df, y=x_column, ax=ax)
            
            elif plot_type == 'heatmap':
                if columns:
                    # Use specified columns
                    heatmap_cols = [col for col in columns if col in df.columns]
                    if not heatmap_cols:
                        print(f"None of the specified columns found: {columns}")
                        return None
                    heatmap_df = df[heatmap_cols]
                else:
                    # Use all numeric columns
                    heatmap_df = df.select_dtypes(include=['number'])
                
                # Ensure we have numeric data
                for col in heatmap_df.columns:
                    if heatmap_df[col].dtype == 'object':
                        # Try to convert to numeric
                        heatmap_df[col] = pd.to_numeric(heatmap_df[col], errors='coerce')
                
                # Create correlation matrix
                corr_matrix = heatmap_df.corr()
                
                # Create heatmap
                sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, 
                           square=True, ax=ax, fmt='.2f')
            
            elif plot_type == 'line':
                if y_column:
                    sns.lineplot(data=df, x=x_column, y=y_column, hue=hue, ax=ax, marker='o')
                else:
                    df[x_column].plot(kind='line', ax=ax, marker='o')
            
            else:
                print(f"Unsupported plot type: {plot_type}")
                plt.close(fig)
                return None
            
            # Customize plot
            if title:
                ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
            
            # Improve layout
            plt.tight_layout()
            
            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            
            plot_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            
            # Clean up
            plt.close(fig)
            buffer.close()
            
            print(f"Successfully generated {plot_type} plot")
            return plot_base64
            
        except Exception as e:
            print(f"Error generating plot: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Clean up on error
            plt.close('all')
            return None
    
    def _extract_plot_request(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract plot request from assistant response with improved parsing."""
        try:
            import re
            
            # Look for JSON blocks with various patterns
            patterns = [
                r'```plot_request\s*\n(.*?)\n```',
                r'```json\s*\n(.*?)\n```',
                r'```\s*\n(\{.*?"type".*?\})\s*\n```',
                r'(\{[^{}]*"type"[^{}]*\})',  # Simple JSON object with type
                r'```\s*(\{.*?\})\s*```'  # Any JSON in code blocks
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
                if matches:
                    for match in matches:
                        json_str = match.strip()
                        
                        # Clean the JSON string
                        json_str = re.sub(r'//.*?\n', '\n', json_str)  # Remove comments
                        json_str = re.sub(r'\n\s*\n', '\n', json_str)  # Remove empty lines
                        json_str = json_str.replace('\n', ' ').strip()  # Remove newlines
                        
                        try:
                            plot_request = json.loads(json_str)
                            if isinstance(plot_request, dict) and 'type' in plot_request:
                                print(f"Successfully extracted plot request: {plot_request}")
                                return plot_request
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error for: {json_str[:100]}... Error: {e}")
                            continue
            
            # If no JSON found, look for key-value pairs in the text
            if '"type":' in text:
                print("Found type field, attempting manual parsing")
                # Try to extract individual fields
                type_match = re.search(r'"type":\s*"([^"]+)"', text)
                x_match = re.search(r'"x_column":\s*"([^"]+)"', text)
                y_match = re.search(r'"y_column":\s*"([^"]+)"', text)
                title_match = re.search(r'"title":\s*"([^"]+)"', text)
                
                if type_match:
                    plot_request = {
                        "type": type_match.group(1),
                        "x_column": x_match.group(1) if x_match else None,
                        "y_column": y_match.group(1) if y_match else None,
                        "title": title_match.group(1) if title_match else ""
                    }
                    print(f"Manually parsed plot request: {plot_request}")
                    return plot_request
            
            print("No valid plot request found in response")
            return None
            
        except Exception as e:
            print(f"Error extracting plot request: {str(e)}")
            return None
    
    def _create_system_prompt(self) -> str:
        """Create an enhanced system prompt with better plot generation instructions."""
        df_info = self._get_dataframe_info()
        
        available_columns = list(self.dataframe.columns) if self.dataframe is not None else []
        
        return f"""You are an expert HR Analytics Assistant with advanced data visualization capabilities.

Dataset Information:
{df_info}

VISUALIZATION GUIDELINES:
You MUST create visualizations for analytical requests. When the user asks for analysis, comparisons, or insights, always include a plot request.

Available plot types:
- bar: Compare categories (e.g., attrition by department)
- histogram: Show distribution of numeric values
- scatter: Show relationship between two numeric variables
- pie: Show composition/proportions
- box: Show distribution with quartiles and outliers
- heatmap: Show correlations between variables
- line: Show trends over time or ordered categories

CRITICAL: Use EXACT column names from this list:
{', '.join(available_columns)}

Special derived columns you can use:
- "Age Group": Automatically creates age ranges (18-24, 25-29, etc.)
- "Attrition Rate": Calculates attrition percentage by category
- "Factor": For correlation analysis with attrition

ALWAYS end your response with a plot request in this exact format:
```plot_request
{{
  "type": "plot_type",
  "x_column": "exact_column_name",
  "y_column": "exact_column_name_or_null",
  "title": "Descriptive Title",
  "hue": "grouping_column_or_null"
}}
```

Examples:
1. Age distribution:
```plot_request
{{"type": "histogram", "x_column": "Age", "title": "Employee Age Distribution"}}
```

2. Attrition by department:
```plot_request
{{"type": "bar", "x_column": "Department", "y_column": "Attrition Rate", "title": "Attrition Rate by Department"}}
```

3. Salary vs Age relationship:
```plot_request
{{"type": "scatter", "x_column": "Age", "y_column": "MonthlyIncome", "title": "Age vs Monthly Income"}}
```

Format your analysis with:
- Clear markdown headers (##, ###)
- Bullet points for key insights
- Tables for comparative data
- Bold text for important findings
- Always conclude with actionable recommendations
"""
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Process user query with enhanced plot generation."""
        try:
            # Add user message to conversation history
            self.conversation_history.append({"role": "user", "content": query})
            
            # Prepare messages for API
            messages = [
                {"role": "system", "content": self._create_system_prompt()},
                *self.conversation_history[-10:]  # Last 10 messages for context
            ]
            
            # Make API request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.3,  # Lower temperature for more consistent responses
                "max_tokens": 1500
            }
            
            response = requests.post(self.api_url, headers=headers, json=data)
            response.raise_for_status()
            
            response_data = response.json()
            assistant_message = response_data["choices"][0]["message"]["content"]
            
            print(f"Assistant response length: {len(assistant_message)}")
            print(f"Looking for plot request in: {assistant_message[-200:]}")  # Last 200 chars
            
            # Extract plot request
            plot_request = self._extract_plot_request(assistant_message)
            plot_image = None
            
            if plot_request:
                print(f"Found plot request: {plot_request}")
                
                # Generate plot
                plot_image = self.generate_plot(
                    plot_type=plot_request.get("type"),
                    x_column=plot_request.get("x_column"),
                    y_column=plot_request.get("y_column"),
                    title=plot_request.get("title", ""),
                    hue=plot_request.get("hue")
                )
                
                if plot_image:
                    print("Plot successfully generated!")
                    # Remove plot request from message
                    import re
                    assistant_message = re.sub(r'```[^`]*\{[^}]*"type"[^}]*\}[^`]*```', '', assistant_message, flags=re.DOTALL)
                    assistant_message = re.sub(r'\{[^}]*"type"[^}]*\}', '', assistant_message)
                    assistant_message = assistant_message.strip()
                else:
                    print("Failed to generate plot")
            else:
                print("No plot request found, checking if we should generate one automatically")
                # Try to generate a plot based on common patterns in the query
                if any(keyword in query.lower() for keyword in ['attrition', 'department', 'compare', 'analyze']):
                    print("Query suggests need for visualization, attempting automatic plot generation")
                    if 'department' in query.lower() and 'attrition' in query.lower():
                        auto_plot_request = {
                            "type": "bar",
                            "x_column": "Department",
                            "y_column": "Attrition Rate",
                            "title": "Attrition Rate by Department"
                        }
                        plot_image = self.generate_plot(**auto_plot_request)
                        if plot_image:
                            plot_request = auto_plot_request
                            print("Auto-generated department attrition plot")
            
            # Add to conversation history
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            # Prepare result
            result = {
                "response": assistant_message,
                "status": "success"
            }
            
            if plot_request:
                result["plot_data"] = plot_request
                print("Added plot_data to result")
            if plot_image:
                result["plot_image"] = plot_image
                print("Added plot_image to result")
            else:
                print("No plot image in final result")
                
            return result
            
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            print(error_msg)
            import traceback
            traceback.print_exc()
            return {
                "response": error_msg,
                "status": "error"
            }
    
    def clear_conversation(self):
        """Clear conversation history."""
        self.conversation_history = []
    
    def get_available_columns(self) -> List[str]:
        """Get list of available columns in the dataframe."""
        if self.dataframe is not None:
            return list(self.dataframe.columns)
        return []


# Utility function for external use
def get_chatbot_instance(dataframe=None):
    """Create and return a chatbot instance."""
    return HRAnalyticsChatbot(dataframe)

# Test function to debug plotting issues
def test_plot_generation(dataframe, plot_type="bar", x_col="Department", y_col="Attrition Rate"):
    """Test plot generation directly without LLM interaction."""
    try:
        chatbot = HRAnalyticsChatbot(dataframe)
        
        print(f"Testing plot generation:")
        print(f"- DataFrame shape: {dataframe.shape}")
        print(f"- Columns: {list(dataframe.columns)}")
        print(f"- Plot type: {plot_type}")
        print(f"- X column: {x_col}")
        print(f"- Y column: {y_col}")
        
        # Check if Attrition column exists
        if 'Attrition' in dataframe.columns:
            print(f"- Attrition values: {dataframe['Attrition'].value_counts().to_dict()}")
        
        if x_col in dataframe.columns:
            print(f"- {x_col} values: {dataframe[x_col].value_counts().to_dict()}")
        
        plot_image = chatbot.generate_plot(
            plot_type=plot_type,
            x_column=x_col,
            y_column=y_col,
            title=f"{y_col} by {x_col}" if y_col else f"Distribution of {x_col}"
        )
        
        if plot_image:
            print("✅ Plot generated successfully!")
            return plot_image
        else:
            print("❌ Plot generation failed")
            return None
            
    except Exception as e:
        print(f"❌ Error in test: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
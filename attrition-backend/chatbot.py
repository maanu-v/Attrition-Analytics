import os
import json
import pandas as pd
import requests
import dotenv
from typing import Dict, Any, List, Optional

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
- For statistics and data breakdowns, use a clear hierarchical structure with headings and bullet points
- For numeric data, present numbers in a well-formatted manner with appropriate percentages in parentheses

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
```

If a user asks for analysis or calculations that would normally require code execution,
describe the approach and provide sample results based on the dataset information above.
"""
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a user query and get a response from the Groq API.
        
        Args:
            query: The user's question or request
            
        Returns:
            Dict containing the response and any additional data
        """
        # Add user message to conversation history
        self.conversation_history.append({"role": "user", "content": query})
        
        # Prepare messages for API request
        messages = [
            {"role": "system", "content": self._create_system_prompt()},
        ]
        
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
            
            # Add assistant response to conversation history
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            return {
                "response": assistant_message,
                "status": "success"
            }
            
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

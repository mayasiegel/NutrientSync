import pandas as pd
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Build the full paths
men_csv_path = os.path.join(current_dir, 'src', 'data', 'men_calories.csv')
women_csv_path = os.path.join(current_dir, 'src', 'data', 'women_calories.csv')

# Read CSV files
men_data = pd.read_csv(men_csv_path)
women_data = pd.read_csv(women_csv_path)

# Save JSON files
men_json_path = os.path.join(current_dir, 'src', 'data', 'men_calories.json')
women_json_path = os.path.join(current_dir, 'src', 'data', 'women_calories.json')

men_data.to_json(men_json_path, orient='records')
women_data.to_json(women_json_path, orient='records')

print("Conversion complete! JSON files created in src/data/") 
import os
import sys
import pandas as pd

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.gsheets import fetch_sheet_data

def find_duplicates():
    print("Fetching Google Sheet data (Buildings)...")
    df = fetch_sheet_data("Buildings")
    print(f"Total rows in Sheet: {len(df)}")
    
    seen = {}
    dupes = []
    
    for i, row in df.iterrows():
        comp_parts = [
            str(row.get('Asset Number', '')).strip().lower(),
            str(row.get('Asset Description', '')).strip().lower(),
            str(row.get('Location', '')).strip().lower(),
            str(row.get('Photos', '')).strip()
        ]
        key = "|".join(comp_parts)
        
        if key in seen:
            dupes.append({
                "key": key,
                "first_row": seen[key] + 2,
                "duplicate_row": i + 2,
                "asset_number": row.get('Asset Number'),
                "description": row.get('Asset Description'),
                "location": row.get('Location')
            })
        else:
            seen[key] = i
            
    print(f"\nFound {len(dupes)} duplicate records that are being collapsed:")
    for d in dupes:
        print(f"Row {d['duplicate_row']} is a duplicate of {d['first_row']} (Asset: {d['asset_number']}, Desc: {d['description']}, Loc: {d['location']})")

if __name__ == "__main__":
    find_duplicates()

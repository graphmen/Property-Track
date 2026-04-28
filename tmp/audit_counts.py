import os
import sys
import pandas as pd

# Add the project root to sys.path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.gsheets import fetch_sheet_data, get_supabase_client

def audit_buildings():
    print("Fetching Google Sheet data (Buildings)...")
    df = fetch_sheet_data("Buildings")
    print(f"Total rows in Sheet: {len(df)}")
    
    # Simulate current deduplication logic in gsheets.py
    print("Simulating deduplication logic...")
    deduped = {}
    for _, row in df.iterrows():
        comp_parts = [
            str(row.get('Asset Number', '')).strip().lower(),
            str(row.get('Asset Description', '')).strip().lower(),
            str(row.get('Location', '')).strip().lower(),
            str(row.get('Photos', '')).strip()
        ]
        comp_key = "|".join(comp_parts)
        deduped[comp_key] = row
    
    print(f"Total unique records after deduplication: {len(deduped)}")
    
    # Check Supabase count
    print("Checking Supabase count...")
    supabase = get_supabase_client()
    resp = supabase.table('buildings').select('*', count='exact').execute()
    db_count = resp.count if hasattr(resp, 'count') else len(resp.data)
    print(f"Total records in Supabase 'buildings' table: {db_count}")
    
    return {
        "sheet_count": len(df),
        "deduped_count": len(deduped),
        "db_count": db_count
    }

if __name__ == "__main__":
    audit_buildings()

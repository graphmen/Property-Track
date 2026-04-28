import os
import sys
import pandas as pd
import json

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.gsheets import fetch_sheet_data, get_supabase_client

def detailed_audit():
    print("Fetching Google Sheet data (Buildings)...")
    df = fetch_sheet_data("Buildings")
    total_sheet_rows = len(df)
    
    # Track duplicates
    seen_keys = {}
    duplicates = []
    
    for i, row in df.iterrows():
        # Composite key: ID + Description + Location + Photo
        # Using exact same logic as gsheets.py
        comp_parts = [
            str(row.get('Asset Number', '')).strip().lower(),
            str(row.get('Asset Description', '')).strip().lower(),
            str(row.get('Location', '')).strip().lower(),
            str(row.get('Photos', '')).strip()
        ]
        comp_key = "|".join(comp_parts)
        
        if comp_key in seen_keys:
            duplicates.append({
                "row_index": i + 2, # +2 for 1-based sheet row index (header is 1)
                "asset_number": row.get('Asset Number'),
                "description": row.get('Asset Description'),
                "original_row": seen_keys[comp_key] + 2
            })
        else:
            seen_keys[comp_key] = i
    
    unique_count = len(seen_keys)
    
    print(f"Total rows in Sheet: {total_sheet_rows}")
    print(f"Duplicates found: {len(duplicates)}")
    print(f"Unique records: {unique_count}")
    
    # Check Supabase
    supabase = get_supabase_client()
    # Explicitly ask for 2000 records to confirm actual count in DB
    resp = supabase.table('buildings').select('*', count='exact').limit(2000).execute()
    db_count = resp.count if hasattr(resp, 'count') else len(resp.data)
    actual_data_len = len(resp.data)
    
    print(f"Total in Supabase (exact count): {db_count}")
    print(f"Total fetched in query (with limit 2000): {actual_data_len}")
    
    results = {
        "sheet_rows": total_sheet_rows,
        "duplicates_count": len(duplicates),
        "unique_count": unique_count,
        "supabase_exact_count": db_count,
        "supabase_fetched_limit_2000": actual_data_len,
        "first_5_duplicates": duplicates[:5]
    }
    
    with open('tmp/audit_detailed.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    detailed_audit()

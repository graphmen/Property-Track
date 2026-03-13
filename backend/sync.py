import os
import pandas as pd
from supabase import create_client, Client
from .config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def sync_depots(excel_path: str):
    """Sync depots and regions from the provided Excel file with hierarchical structure."""
    supabase = get_supabase_client()
    # Read without headers to handle hierarchical rows
    df = pd.read_excel(excel_path, header=None)
    
    current_region_id = None
    regions = ['HEAD OFFICE', 'NORTHERN REGION', 'SOUTHERN REGION', 'EASTERN REGION']
    
    # Create or get regions first
    for r_name in regions:
        supabase.table('regions').upsert({'name': r_name}, on_conflict='name').execute()
    
    region_map = {r['name']: r['id'] for r in supabase.table('regions').select('id, name').execute().data}
    
    # Iterate through rows to find regions and depots
    for index, row in df.iterrows():
        val = str(row[1]).strip() if pd.notna(row[1]) else ""
        
        # Check if the row is a region
        match_region = next((r for r in regions if r in val.upper()), None)
        if match_region:
            current_region_id = region_map.get(match_region)
            continue
        
        # If it has a number in the first column, it's likely a depot
        if pd.notna(row[0]) and current_region_id:
            depot_name = val.upper()
            if depot_name and depot_name != 'DEPOTS':
                try:
                    supabase.table('depots').upsert({
                        'name': depot_name,
                        'region_id': current_region_id
                    }, on_conflict='name').execute()
                    print(f"Synced Depot: {depot_name}")
                except Exception as e:
                    print(f"Error syncing depot {depot_name}: {e}")

if __name__ == "__main__":
    # Use relative path for portability
    base_dir = os.path.dirname(os.path.dirname(__file__))
    depot_excel = os.path.join(base_dir, "regmbassets", "DEPOTS.xlsx")
    if os.path.exists(depot_excel):
        sync_depots(depot_excel)

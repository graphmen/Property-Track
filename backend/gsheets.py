from googleapiclient.discovery import build
from google.oauth2 import service_account
from .config import settings
from .sync import get_supabase_client
import pandas as pd
import re

def get_gsheet_service():
    if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
        import json
        info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
        creds = service_account.Credentials.from_service_account_info(
            info, 
            scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
    else:
        creds = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_FILE, 
            scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
    return build('sheets', 'v4', credentials=creds)

def fetch_sheet_data(sheet_name: str, range_name: str = "A:Z"):
    service = get_gsheet_service()
    sheet = service.spreadsheets()
    result = sheet.values().get(
        spreadsheetId=settings.GOOGLE_SHEET_ID,
        range=f"'{sheet_name}'!{range_name}"
    ).execute()
    values = result.get('values', [])
    if not values:
        return pd.DataFrame()
    return pd.DataFrame(values[1:], columns=values[0])

def clean_numeric(val):
    if pd.isna(val) or val == '': return 0
    if isinstance(val, (int, float)): return val
    # Remove characters that aren't digits, dots or minus signs
    cleaned = re.sub(r'[^\d\.-]', '', str(val))
    try:
        return float(cleaned)
    except ValueError:
        return 0

def sync_all_assets():
    mappings = {
        "Furniture & Fittings": {
            "table": "furniture",
            "fields": {
                "Timestamp": "timestamp",
                "Location": "location",
                "Asset Description": "asset_description",
                "Asset Number": "asset_number",
                "Serial Number": "serial_number",
                "Qty": "qty",
                "Plinth Area": "plinth_area",
                "Rate": "rate",
                "ERC": "erc",
                "Depreciation %": "depreciation_pct",
                "DRC": "drc",
                "Fair Value": "fair_value"
            }
        },
        "Motor Vehicles": {
            "table": "vehicles",
            "fields": {
                "Timestamp": "timestamp",
                "Make": "make",
                "Model": "model",
                "Registration Number": "registration_number",
                "Year of Manufacture": "year_of_manufacture",
                "Mileage": "mileage",
                "Engine Number": "engine_number",
                "Chassis Number": "chassis_number",
                "Condition": "condition",
                "GRC": "grc",
                "Depreciation %": "depreciation_pct",
                "Fair Value": "fair_value",
                "ERUL": "erul"
            }
        },
        "Plant & Machinery": {
            "table": "machinery",
            "fields": {
                "Timestamp": "timestamp",
                "Location": "location",
                "Asset Description": "asset_description",
                "Asset Number": "asset_number",
                "Serial Number": "serial_number",
                "Qty": "qty",
                "Plinth Area": "plinth_area",
                "Rate": "rate",
                "ERC": "erc",
                "Depreciation %": "depreciation_pct",
                "DRC": "drc",
                "Fair Value": "fair_value",
                "ERUL": "erul"
            }
        },
        "Buildings": {
            "table": "buildings",
            "fields": {
                "Timestamp": "timestamp",
                "Location": "location",
                "Asset Description": "asset_description",
                "Asset Number": "asset_number",
                "Qty": "qty",
                "Plinth Area": "plinth_area",
                "Rate": "rate",
                "ERC": "erc",
                "Depreciation %": "depreciation_pct",
                "DRC": "drc",
                "Fair Value": "fair_value",
                "ERUL": "erul",
                "Notes": "notes"
            }
        },
        "Land": {
            "table": "land",
            "fields": {
                "Timestamp": "timestamp",
                "Location": "location",
                "Asset Description": "asset_description",
                "Land size": "land_size",
                "Rate": "rate",
                "ERC": "erc",
                "Depreciation %": "depreciation_pct",
                "Fair Value": "fair_value",
                "Notes": "notes"
            }
        }
    }
    
    supabase = get_supabase_client()
    
    # Fetch depot mapping for foreign key lookups
    depots_resp = supabase.table('depots').select('id, name').execute()
    depot_map = {d['name'].strip().upper(): d['id'] for d in depots_resp.data}
    
    sync_results = {}

    for sheet_name, config in mappings.items():
        df = fetch_sheet_data(sheet_name)
        if df.empty:
            sync_results[sheet_name] = 0
            continue
        
        table_name = config['table']
        field_map = config['fields']
        
        to_upsert = []
        for _, row in df.iterrows():
            station_name = str(row.get('Station', '')).strip().upper()
            depot_id = depot_map.get(station_name)
            
            if not depot_id: continue
            
            payload = {'depot_id': depot_id}
            for sheet_col, db_col in field_map.items():
                val = row.get(sheet_col)
                if db_col in ['qty', 'plinth_area', 'rate', 'erc', 'depreciation_pct', 'drc', 'fair_value', 'mileage', 'grc', 'erul', 'land_size']:
                    payload[db_col] = clean_numeric(val)
                elif db_col == 'year_of_manufacture':
                    try:
                        payload[db_col] = int(clean_numeric(val))
                    except:
                        payload[db_col] = 0
                else:
                    payload[db_col] = str(val) if val else None
            
            to_upsert.append(payload)
        
        if to_upsert:
            supabase.table(table_name).upsert(to_upsert).execute()
            sync_results[sheet_name] = len(to_upsert)
            
    return sync_results

if __name__ == "__main__":
    results = sync_all_assets()
    print("Sync Results:", results)

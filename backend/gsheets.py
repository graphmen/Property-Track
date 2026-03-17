from googleapiclient.discovery import build
from google.oauth2 import service_account
from .config import settings
from .sync import get_supabase_client
import pandas as pd
import re
from datetime import datetime

def clean_date(val):
    if pd.isna(val) or val == '': return None
    try:
        # Try parsing with pandas which handles multiple formats
        dt = pd.to_datetime(val, dayfirst=True)
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return None

def convert_drive_link(url: str):
    """Converts a Google Drive viewer URL into a direct image thumbnail link."""
    if not isinstance(url, str) or not url:
        return None
    # Handle "FILENAME: URL" format if present
    if ': http' in url:
        url = url.split(': http')[-1]
        url = 'http' + url
    
    # Extract the file ID from various formats
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', url) or re.search(r'id=([a-zA-Z0-9_-]+)', url)
    if match:
        file_id = match.group(1)
        # Using the lh3 format which is extremely reliable for direct embedding
        return f"https://lh3.googleusercontent.com/d/{file_id}=w1000"
    return url

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
    if not values or len(values) < 1:
        return pd.DataFrame()
    
    headers = values[0]
    data = values[1:]
    
    # Pad rows that are shorter than the headers to avoid DataFrame construction errors
    padded_data = []
    for row in data:
        if len(row) < len(headers):
            row.extend([''] * (len(headers) - len(row)))
        padded_data.append(row[:len(headers)])
        
    return pd.DataFrame(padded_data, columns=headers)

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
                "Region": "region",
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
                "ERUL": "erul",
                "Notes": "notes"
            }
        },
        "Motor Vehicles": {
            "table": "vehicles",
            "fields": {
                "Timestamp": "timestamp",
                "Region": "region",
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
                "ERUL": "erul",
                "Notes": "notes"
            }
        },
        "Plant & Machinery": {
            "table": "machinery",
            "fields": {
                "Timestamp": "timestamp",
                "Region": "region",
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
                "ERUL": "erul",
                "Notes": "notes"
            }
        },
        "Buildings": {
            "table": "buildings",
            "fields": {
                "Timestamp": "timestamp",
                "Region": "region",
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
                "Notes": "notes",
                "Photos": "photo_url",
                "Location X": "location_x",
                "Location Y": "location_y",
                "Accuracy": "accuracy"
            }
        },
        "Computer": {
            "table": "computers",
            "fields": {
                "Timestamp": "timestamp",
                "Region": "region",
                "Location": "location",
                "Asset Description": "asset_description",
                "Asset Number": "asset_number",
                "Serial Number": "serial_number",
                "Qty": "qty",
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
                "Region": "region",
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
            
            payload = {}
            if depot_id:
                payload['depot_id'] = depot_id
            for sheet_col, db_col in field_map.items():
                val = row.get(sheet_col)
                if db_col in ['qty', 'plinth_area', 'rate', 'erc', 'depreciation_pct', 'drc', 'fair_value', 'mileage', 'grc', 'erul', 'land_size', 'location_x', 'location_y', 'accuracy']:
                    payload[db_col] = clean_numeric(val)
                elif db_col == 'year_of_manufacture':
                    try:
                        payload[db_col] = int(clean_numeric(val))
                    except:
                        payload[db_col] = 0
                elif db_col == 'timestamp':
                    payload[db_col] = clean_date(val)
                elif db_col == 'photo_url':
                    payload[db_col] = convert_drive_link(val)
                else:
                    payload[db_col] = str(val) if val else None
            
            to_upsert.append(payload)
        
        if to_upsert:
            # Deduplicate using a composite key to preserve distinct assets sharing placeholder IDs
            deduped = {}
            for item in to_upsert:
                # Composite key: ID + Description + Location + Photo
                # This ensures two different buildings with ID "0" stay separate
                # we strip and lower to avoid whitespace/case issues
                comp_parts = [
                    str(item.get('asset_number', '')).strip().lower(),
                    str(item.get('asset_description', '')).strip().lower(),
                    str(item.get('location', '')).strip().lower(),
                    str(item.get('registration_number', '')).strip().lower(), # for vehicles
                    str(item.get('photo_url', '')).strip()
                ]
                comp_key = "|".join(comp_parts)
                
                # Keep the last seen entry (latest timestamp/row)
                deduped[comp_key] = item
            
            final_data = list(deduped.values())
            
            # Clear existing data to ensure "Ground Truth" sync
            supabase.table(table_name).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            
            # Insert fresh, precisely deduplicated data
            supabase.table(table_name).insert(final_data).execute()
            sync_results[sheet_name] = len(final_data)
            
    return sync_results

if __name__ == "__main__":
    results = sync_all_assets()
    print("Sync Results:", results)

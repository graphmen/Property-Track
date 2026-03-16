import backend.gsheets as gsheets
import pandas as pd

def check_stations():
    supabase = gsheets.get_supabase_client()
    depots_resp = supabase.table('depots').select('id, name').execute()
    valid_stations = {d['name'].strip().upper() for d in depots_resp.data}
    
    print("Valid Stations in Database:", valid_stations)
    print("\n--- Checking Sheets for Typos ---")
    
    sheets = ["Buildings", "Land", "Motor Vehicles", "Plant & Machinery", "Furniture & Fittings"]
    mismatches = set()
    
    for s in sheets:
        try:
            df = gsheets.fetch_sheet_data(s)
            if df.empty: continue
            
            for _, row in df.iterrows():
                station = str(row.get('Station', '')).strip()
                if station and station.upper() not in valid_stations:
                    mismatches.add((s, station))
        except Exception as e:
            pass
            
    if mismatches:
        print("\nFound the following Unrecognized Stations in Google Sheets:")
        for sheet, station in mismatches:
            print(f"- Sheet '{sheet}': Station '{station}'")
    else:
        print("\nAll stations perfectly match!")

if __name__ == '__main__':
    check_stations()

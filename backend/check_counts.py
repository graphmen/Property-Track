import backend.gsheets as gsheets

def check_counts():
    supabase = gsheets.get_supabase_client()
    sheets = [
        ("Buildings", "buildings"),
        ("Land", "land"),
        ("Motor Vehicles", "vehicles"),
        ("Plant & Machinery", "machinery"),
        ("Furniture & Fittings", "furniture")
    ]
    
    print(f"{'Sheet Name':<25} | {'GSheet Rows':<12} | {'Supabase Rows'}")
    print("-" * 60)
    
    for sheet_name, table in sheets:
        try:
            df = gsheets.fetch_sheet_data(sheet_name)
            gsheet_count = len(df)
            
            resp = supabase.table(table).select('id', count='exact').execute()
            supa_count = resp.count if resp.count is not None else 0
            
            print(f"{sheet_name:<25} | {gsheet_count:<12} | {supa_count}")
        except Exception as e:
            print(f"Error checking {sheet_name}: {e}")

if __name__ == '__main__':
    check_counts()

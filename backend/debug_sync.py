from gsheets import fetch_sheet_data, get_supabase_client
df = fetch_sheet_data('Buildings')
print('Found Rows:', len(df))
row = df.iloc[0] if not df.empty else None
print('First Row:')
print(row)
print('Station value:', row.get('Station'))
supabase = get_supabase_client()
deps = supabase.table('depots').select('id, name').execute()
depot_map = {d['name'].strip().upper(): d['id'] for d in deps.data}
station_name = str(row.get('Station', '')).strip().upper() if row is not None else ''
print('Extracted Station Name:', station_name)
print('In Depot Map?', station_name in depot_map)
print('Depot Map Keys:', list(depot_map.keys())[:5])

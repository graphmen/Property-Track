from fastapi import FastAPI, Depends, Query
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from .sync import sync_depots
import os

app = FastAPI(title="GMB Property Track API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GMB Property Track API is online"}

@app.get("/inventory/{table}")
async def get_inventory(table: str, depot_id: Optional[str] = Query(None)):
    from .sync import get_supabase_client
    supabase = get_supabase_client()
    try:
        # Fetch data with depot details
        query = supabase.table(table).select('*, depots(name)')
        
        # Apply filtering if depot_id is provided
        if depot_id:
            query = query.eq('depot_id', depot_id)
            
        result = query.execute()
        return result.data
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/depots")
async def get_depots():
    from .sync import get_supabase_client
    supabase = get_supabase_client()
    try:
        # Fetch all depots sorted by name
        result = supabase.table('depots').select('id, name').order('name').execute()
        return result.data
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/stats")
async def get_dashboard_stats():
    from .sync import get_supabase_client
    supabase = get_supabase_client()
    try:
        land_count = supabase.table('land').select('id', count='exact').execute().count
        building_count = supabase.table('buildings').select('id', count='exact').execute().count
        vehicle_count = supabase.table('vehicles').select('id', count='exact').execute().count
        machinery_count = supabase.table('machinery').select('id', count='exact').execute().count
        
        return {
            "land": land_count,
            "buildings": building_count,
            "vehicles": vehicle_count,
            "machinery": machinery_count
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/sync/depots")
async def trigger_depot_sync():
    # Use relative path for cloud portability
    base_dir = os.path.dirname(os.path.dirname(__file__))
    depot_excel = os.path.join(base_dir, "regmbassets", "DEPOTS.xlsx")
    if os.path.exists(depot_excel):
        sync_depots(depot_excel)
        return {"status": "success", "message": "Depots synced from local file"}
    return {"status": "error", "message": "DEPOTS.xlsx not found"}

@app.post("/sync/google-sheets")
async def trigger_gsheets_sync():
    from .gsheets import sync_all_assets
    try:
        results = sync_all_assets()
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

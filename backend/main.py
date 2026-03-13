from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Added StaticFiles import
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

@app.get("/api")
async def root():
    return {"message": "GMB Property Track API is online"}

@app.get("/api/health/static")
async def health_static():
    static_path = os.path.join(os.path.dirname(__file__), "static")
    exists = os.path.exists(static_path)
    files = []
    if exists:
        files = os.listdir(static_path)
    
    # Using a safer slice for linter
    example_files = files[:min(len(files), 5)]
    
    return {
        "static_dir_exists": exists,
        "static_dir_path": static_path,
        "files_found": len(files),
        "example_files": example_files
    }

@app.get("/api/inventory/{table}")
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

@app.get("/api/depots")
async def get_depots():
    from .sync import get_supabase_client
    supabase = get_supabase_client()
    try:
        # Fetch all depots sorted by name
        result = supabase.table('depots').select('id, name').order('name').execute()
        return result.data
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/stats")
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

@app.post("/api/sync/depots")
async def trigger_depot_sync():
    # Use relative path for cloud portability
    base_dir = os.path.dirname(os.path.dirname(__file__))
    depot_excel = os.path.join(base_dir, "regmbassets", "DEPOTS.xlsx")
    if os.path.exists(depot_excel):
        sync_depots(depot_excel)
        return {"status": "success", "message": "Depots synced from local file"}
    return {"status": "error", "message": "DEPOTS.xlsx not found"}

@app.post("/api/sync/google-sheets")
async def trigger_gsheets_sync():
    from .gsheets import sync_all_assets
    try:
        results = sync_all_assets()
        return {"status": "success", "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Mount static files (will be present in Docker)
static_path = os.path.join(os.path.dirname(__file__), "static")

# Add SPA fallback for React Router (must be ABOVE the mount to catch 404s properly)
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    # API 404s
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"status": "error", "message": "API endpoint not found"})
    
    # Frontend SPA fallback
    index_file = os.path.join(static_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return JSONResponse(status_code=404, content={"status": "error", "message": "Static assets missing"})

if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

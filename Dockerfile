# Single stage build - uses pre-built frontend from backend/static
FROM python:3.11-slim
LABEL build_version="1.4.4-COMPACT-GALLERY-PORTAL-LIGHTBOX"
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and assets
COPY backend /app/backend
COPY regmbassets /app/regmbassets

# NOTE: frontend is pre-built and committed to backend/static
# No npm build needed - static files are already in backend/static

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["gunicorn", "backend.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]

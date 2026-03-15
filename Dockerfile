# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
LABEL build_version="1.0.9-STATS-FIX"
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Serve
FROM python:3.11-slim
WORKDIR /app

# Install dependencies (system level)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and assets
COPY backend /app/backend
COPY regmbassets /app/regmbassets

# Copy frontend build from Stage 1 to a specific static folder
RUN mkdir -p /app/backend/static
COPY --from=frontend-builder /app/frontend/dist /app/backend/static/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application using Gunicorn for better stability on Railway
CMD ["gunicorn", "backend.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]

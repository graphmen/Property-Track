-- GMB Property Inventory Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Regions Table
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Depots Table
CREATE TABLE depots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Common Fields: timestamp, location, asset_description, asset_number, qty, plinth_area, rate, erc, depreciation, drc, fair_value, erul, notes

-- Furniture & Fittings
CREATE TABLE furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    depot_id UUID REFERENCES depots(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE,
    location TEXT,
    asset_description TEXT,
    asset_number TEXT,
    serial_number TEXT,
    qty NUMERIC,
    plinth_area NUMERIC,
    rate NUMERIC,
    erc NUMERIC,
    depreciation_pct NUMERIC,
    drc NUMERIC,
    fair_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motor Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    depot_id UUID REFERENCES depots(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE,
    make TEXT,
    model TEXT,
    registration_number TEXT,
    year_of_manufacture INTEGER,
    mileage NUMERIC,
    engine_number TEXT,
    chassis_number TEXT,
    condition TEXT,
    grc NUMERIC,
    depreciation_pct NUMERIC,
    fair_value NUMERIC,
    erul NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant & Machinery
CREATE TABLE machinery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    depot_id UUID REFERENCES depots(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE,
    location TEXT,
    asset_description TEXT,
    asset_number TEXT,
    serial_number TEXT,
    qty NUMERIC,
    plinth_area NUMERIC,
    rate NUMERIC,
    erc NUMERIC,
    depreciation_pct NUMERIC,
    drc NUMERIC,
    fair_value NUMERIC,
    erul NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    depot_id UUID REFERENCES depots(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE,
    location TEXT,
    asset_description TEXT,
    asset_number TEXT,
    qty NUMERIC,
    plinth_area NUMERIC,
    rate NUMERIC,
    erc NUMERIC,
    depreciation_pct NUMERIC,
    drc NUMERIC,
    fair_value NUMERIC,
    erul NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Land
CREATE TABLE land (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    depot_id UUID REFERENCES depots(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE,
    location TEXT,
    asset_description TEXT,
    land_size NUMERIC,
    rate NUMERIC,
    erc NUMERIC,
    depreciation_pct NUMERIC,
    fair_value NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial regions
INSERT INTO regions (name) VALUES ('EASTERN REGION'), ('SOUTHERN REGION'), ('NORTHERN REGION'), ('HEAD OFFICE') ON CONFLICT DO NOTHING;

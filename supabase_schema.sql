-- Models table
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL, -- Changed to match TS interface roughly, assuming string UUID in TS
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_format TEXT NOT NULL,
  model_type TEXT DEFAULT 'limb',
  patient_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Measurements table
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  length_cm DECIMAL,
  width_cm DECIMAL,
  depth_cm DECIMAL,
  surface_area_cm2 DECIMAL,
  volume_cm3 DECIMAL,
  circumferences JSONB,
  mesh_info JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unwrapped patterns table
CREATE TABLE unwrapped_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  method TEXT DEFAULT 'cylindrical',
  vertices_2d JSONB,
  indices JSONB,
  seam_vertices JSONB,
  flat_width_cm DECIMAL,
  flat_height_cm DECIMAL,
  flat_perimeter_cm DECIMAL,
  flat_area_cm2 DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE unwrapped_patterns ENABLE ROW LEVEL SECURITY;

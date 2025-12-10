# Analysis Page - Complete File Structure

This document maps all files related to the Analysis page (`/analysis/[modelId]`) and their internal workings.

---

## 📄 Main Page Component

### `/src/app/analysis/[modelId]/page.tsx` (355 lines)
**Main analysis page component** - The entry point for the analysis feature.

**Key Responsibilities:**
- Loads 3D model data from Supabase or demo data
- Manages state for measurements, unwrapped patterns, and visualization modes
- Handles geometry loading and measurement calculations
- Provides UI for 3D/Flat pattern tabs, algorithm selection, and export options
- Integrates all viewer and measurement components

**Key Functions:**
- `handleGeometryLoaded()` - Processes loaded geometry, calculates measurements, saves to DB
- `handleUnwrap()` - Generates unwrapped pattern using selected algorithm
- `handleDownloadPDF()` - Exports analysis report as PDF

**State Management:**
- `model` - Model3D data
- `measurements` - Calculated 3D measurements
- `pattern` - Unwrapped flat pattern
- `geometry` - THREE.BufferGeometry instance
- `activeTab` - '3d' or 'flat' view
- `algorithm` - 'cylindrical' or 'professional' unwrap method
- `showDistortion` - Toggle distortion visualization
- `showUVTexture` - Toggle UV checkerboard texture

---

## 🎨 UI Components

### Viewer Components (`/src/components/viewer/`)

#### 1. `ModelViewer3D.tsx` (237 lines)
**3D model viewer with Three.js/React Three Fiber**

**Features:**
- Loads and displays 3D models (STL, OBJ, GLB)
- Supports distortion visualization (color-coded)
- UV texture checkerboard overlay
- Orbit controls, grid, and environment lighting
- Error handling and loading states

**Key Props:**
- `fileUrl` - Path to 3D model file
- `onGeometryLoaded` - Callback when geometry is parsed
- `distortionValues` - Per-vertex distortion data
- `showDistortion` - Enable distortion color mapping
- `uvCoordinates` - 2D UV coordinates
- `showUVTexture` - Enable checkerboard texture

**Components:**
- `Scene` - Main Three.js scene with model rendering
- `loadModel()` - Async function to parse model file

#### 2. `CrossSectionSlider.tsx` (118 lines)
**Interactive cross-section analysis tool**

**Features:**
- Slider to select height along Z-axis (0-100%)
- Calculates circumference at selected height
- Real-time updates with visual feedback

**Key Functions:**
- `calculatePerimeter()` - Computes perimeter from intersection points
- Uses tolerance-based slicing for performance

**Output:**
- Height (cm)
- Circumference (cm)

---

### Measurement Components (`/src/components/measurements/`)

#### 3. `MeasurementPanel.tsx` (155 lines)
**Displays all calculated measurements**

**Sections:**
1. **Dimensions** - Length, Width, Depth
2. **Surface & Volume** - Surface area, Volume
3. **Circumferences** - Up to 5 key circumference measurements
4. **Mesh Quality** - Vertex count, face count, watertight status

**Features:**
- Loading skeleton UI
- Formatted metric cards
- Color-coded quality indicators

---

### Unwrap Components (`/src/components/unwrap/`)

#### 4. `FlatPatternCanvas.tsx` (185 lines)
**Canvas-based 2D flat pattern visualization**

**Features:**
- Renders unwrapped pattern on HTML5 canvas
- Grid overlay (5cm spacing)
- Seam line visualization (red dashed)
- Dimension labels
- Auto-scaling to fit canvas

**Helper Functions:**
- `drawGrid()` - Draws measurement grid
- `drawMeasurements()` - Adds dimension annotations

**Displays:**
- Width, Height, Perimeter, Area

#### 5. `SVGExportButton.tsx` (75 lines)
**Export flat pattern as SVG**

**Features:**
- Generates SVG from pattern data
- Includes seam lines
- Proper viewBox and dimensions
- Downloads as `.svg` file

**SVG Structure:**
- Path data for all triangles
- Red dashed lines for seams
- Metadata in `<desc>` tag

---

## 🧮 Geometry Libraries

### Core Geometry (`/src/lib/geometry/`)

#### 6. `measurements.ts` (270 lines)
**All measurement calculation algorithms**

**Functions:**

1. **`calculateAllMeasurements()`** - Main entry point
   - Returns complete `Measurements3D` object
   - Calls all sub-calculation functions

2. **`calculateSurfaceArea()`**
   - Sums area of all triangles
   - Uses cross product for triangle area

3. **`calculateVolume()`**
   - Signed tetrahedron method
   - Assumes closed, watertight mesh

4. **`calculateCircumferences()`**
   - Samples at multiple heights (default: 10 samples)
   - Finds intersection points at each height
   - Calculates perimeter, diameter, and cross-section area

5. **`calculatePolygonPerimeter()`**
   - Sorts points by angle
   - Sums edge lengths

6. **`calculateMeshInfo()`**
   - Counts vertices and faces
   - Checks if watertight
   - Computes bounding box

---

#### 7. `unwrap.ts` (274 lines)
**UV unwrapping algorithms**

**Functions:**

1. **`cylindricalUnwrap()`** - Main cylindrical unwrap
   - Projects vertices onto cylinder
   - Converts to 2D using angle and height
   - Handles seam crossing triangles
   - Returns `UnwrappedPattern`

2. **`professionalUnwrap()`** - Advanced unwrap (LSCM placeholder)
   - Currently uses cylindrical method
   - TODO: Complete LSCM implementation

3. **`calculateCylindricalDistortion()`**
   - Compares 3D vs 2D triangle areas
   - Returns per-vertex distortion values (0-1+ range)

4. **`calculateFlatArea()`**
   - Sums 2D triangle areas

5. **`fixSeamCrossing()`**
   - Detects triangles crossing seam (angle wrap)
   - Duplicates vertices to prevent visual artifacts

---

#### 8. `utils.ts` (29 lines)
**Geometry utility functions**

**Functions:**

1. **`mergeVertices()`**
   - Merges duplicate vertices
   - Creates indexed geometry
   - Needed for unwrapping algorithms

---

#### 9. `parsers.ts` (172 lines)
**3D file format parsers**

**Supported Formats:**
- STL (binary and ASCII)
- OBJ
- GLTF/GLB (placeholder)

**Functions:**

1. **`parseModelFile()`** - Main entry point
   - Detects file type by extension
   - Routes to appropriate parser

2. **`parseSTL()`** - STL parser
   - Auto-detects binary vs ASCII
   - Returns `THREE.BufferGeometry`

3. **`parseSTLBinary()`** - Binary STL
   - Reads triangle count from header
   - Parses normals and vertices

4. **`parseSTLASCII()`** - ASCII STL
   - Regex-based parsing
   - Extracts facets and vertices

5. **`parseOBJ()`** - Wavefront OBJ
   - Parses vertices (`v`) and faces (`f`)
   - Triangulates quads

6. **`parseGLTF()`** - GLTF/GLB (not implemented)

---

### UV Mapping System (`/src/lib/geometry/uv-mapping/`)

Advanced UV mapping implementation (professional unwrap feature).

#### 10. `index.ts` (4275 bytes)
**Main UV mapping orchestrator**

#### 11. `lscm.ts` (6650 bytes)
**Least Squares Conformal Maps (LSCM) algorithm**
- Advanced unwrapping with minimal distortion
- Solves linear system for optimal UV coordinates

#### 12. `seams.ts` (4517 bytes)
**Seam detection and placement**
- Finds optimal seam locations
- Minimizes visual impact

#### 13. `analysis.ts` (6135 bytes)
**UV quality analysis**
- Distortion metrics
- Stretch analysis
- Quality validation

#### 14. `optimization.ts` (877 bytes)
**UV layout optimization**
- Packing efficiency
- Rotation and scaling

#### 15. `validation.ts` (3315 bytes)
**UV coordinate validation**
- Checks for overlaps
- Validates bounds
- Quality assurance

#### 16. `types.ts` (1509 bytes)
**TypeScript types for UV mapping**

---

## 📊 PDF Export

### `/src/lib/pdf/generateReport.ts` (106 lines)
**PDF report generation using jsPDF**

**Functions:**

1. **`generateAnalysisReport()`**
   - Creates multi-section PDF
   - Includes model info, dimensions, surface/volume, circumferences, flat pattern
   - Returns `jsPDF` instance

2. **`downloadReport()`**
   - Generates and downloads PDF
   - Filename: `seismora_report_{model_id}.pdf`

**Report Sections:**
- Title and branding
- Model information
- Dimensions
- Surface & Volume
- Circumferences (top 6)
- Flat Pattern (if available)
- Footer with timestamp

---

## 🗂️ Type Definitions

### `/src/types/index.ts` (103 lines)
**All TypeScript interfaces**

**Key Types:**

1. **`Model3D`**
   - Database model for uploaded 3D files
   - Fields: id, filename, file_url, model_type, status, etc.

2. **`Measurements3D`**
   - Complete measurement data
   - Dimensions, surface area, volume, circumferences, mesh info

3. **`CircumferenceData`**
   - Single circumference measurement
   - Height, circumference, diameter, area

4. **`MeshInfo`**
   - Mesh quality metrics
   - Vertex/face count, watertight status, bounding box

5. **`UnwrappedPattern`**
   - 2D unwrapped pattern data
   - vertices_2d, indices, seam_vertices, flat measurements
   - Optional distortion values

6. **`AnalysisReport`**
   - Combined report data structure

---

## 🔄 Data Flow

```
1. User navigates to /analysis/[modelId]
   ↓
2. page.tsx loads Model3D from Supabase
   ↓
3. ModelViewer3D loads and parses 3D file (parsers.ts)
   ↓
4. Geometry passed to handleGeometryLoaded()
   ↓
5. measurements.ts calculates all measurements
   ↓
6. Measurements saved to Supabase and displayed in MeasurementPanel
   ↓
7. User clicks "Unwrap Model"
   ↓
8. unwrap.ts generates UnwrappedPattern
   ↓
9. Pattern displayed in FlatPatternCanvas
   ↓
10. User exports PDF (generateReport.ts) or SVG (SVGExportButton)
```

---

## 📦 External Dependencies

- **Three.js** - 3D rendering and geometry
- **@react-three/fiber** - React bindings for Three.js
- **@react-three/drei** - Three.js helpers (OrbitControls, Grid, Environment)
- **jsPDF** - PDF generation
- **Supabase** - Database and storage

---

## 🎯 Key Features Summary

### 3D View Tab
- Interactive 3D model viewer
- Orbit controls (rotate, zoom, pan)
- Cross-section slider for circumference analysis
- Visualization modes:
  - Normal (solid color)
  - UV Checkerboard (texture mapping preview)
  - Distortion Map (color-coded stretch visualization)

### Flat Pattern Tab
- 2D unwrapped pattern visualization
- Grid overlay for measurements
- Seam line highlighting
- Dimension annotations
- SVG export capability

### Measurements Panel
- Real-time calculation display
- Organized by category
- Loading states
- Quality indicators

### Export Options
- **PDF Report** - Complete analysis with all measurements
- **SVG Pattern** - Vector format for cutting/manufacturing

### Algorithms
- **Standard (Cylindrical)** - Fast, simple projection
- **Professional (LSCM)** - Advanced, minimal distortion (in development)

---

## 🔧 Technical Notes

### Coordinate System
- Units assumed to be meters in raw geometry
- All measurements converted to centimeters (×100)
- Z-axis is "up" direction for height measurements

### Performance Optimizations
- Geometry merging for indexed buffers
- Memoized bounds calculations
- Canvas-based 2D rendering (not WebGL)
- Tolerance-based cross-section slicing

### Error Handling
- Fallback to demo model if DB fails
- Loading states for async operations
- Disabled buttons when data unavailable
- Error boundaries in viewer components

---

## 📝 Future Enhancements (TODOs in code)

1. Complete LSCM implementation in `professionalUnwrap()`
2. Integrate WASM solver for UV optimization
3. Add GLTF/GLB parser support
4. Improve seam placement algorithm
5. Add texture baking for distortion visualization
6. Support for multiple unwrap islands
7. Interactive seam editing

---

## 🗺️ File Tree

```
SEISMORA-main/
├── src/
│   ├── app/
│   │   └── analysis/
│   │       └── [modelId]/
│   │           └── page.tsx ..................... Main analysis page
│   ├── components/
│   │   ├── viewer/
│   │   │   ├── ModelViewer3D.tsx ............... 3D model viewer
│   │   │   └── CrossSectionSlider.tsx .......... Cross-section tool
│   │   ├── measurements/
│   │   │   └── MeasurementPanel.tsx ............ Measurement display
│   │   └── unwrap/
│   │       ├── FlatPatternCanvas.tsx ........... 2D pattern canvas
│   │       └── SVGExportButton.tsx ............. SVG export
│   ├── lib/
│   │   ├── geometry/
│   │   │   ├── measurements.ts ................. Measurement algorithms
│   │   │   ├── unwrap.ts ....................... Unwrapping algorithms
│   │   │   ├── utils.ts ........................ Geometry utilities
│   │   │   ├── parsers.ts ...................... File format parsers
│   │   │   └── uv-mapping/
│   │   │       ├── index.ts .................... UV mapping orchestrator
│   │   │       ├── lscm.ts ..................... LSCM algorithm
│   │   │       ├── seams.ts .................... Seam detection
│   │   │       ├── analysis.ts ................. UV quality analysis
│   │   │       ├── optimization.ts ............. UV optimization
│   │   │       ├── validation.ts ............... UV validation
│   │   │       └── types.ts .................... UV mapping types
│   │   └── pdf/
│   │       └── generateReport.ts ............... PDF generation
│   └── types/
│       └── index.ts ............................ TypeScript interfaces
```

---

**Total Files: 16 core files + 7 UV mapping files = 23 files**

**Total Lines of Code: ~2,500+ lines**

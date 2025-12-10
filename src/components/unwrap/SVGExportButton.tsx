'use client';

import { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import type { UnwrappedPattern, ExportOptions, ExportFormat, ExportTemplate } from '@/types';

interface SVGExportButtonProps {
    pattern: UnwrappedPattern | null;
    onExportStart?: () => void;
    onExportComplete?: (format: ExportFormat, blob: Blob) => void;
    onExportError?: (error: string) => void;
}

interface ExportPreset {
    id: string;
    name: string;
    description: string;
    formats: ExportFormat[];
    template: ExportTemplate;
    settings: Partial<ExportOptions>;
    icon: string;
}

export default function SVGExportButton({
    pattern,
    onExportStart,
    onExportComplete,
    onExportError
}: SVGExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('svg');
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'svg',
        quality: 'high',
        includeSeamLines: true,
        includeManufacturingGuides: true,
        includeDistortionMap: false,
        includeMetadata: true,
        paperSize: 'A4',
        orientation: 'portrait',
        scale: 1,
        resolution: 300,
        template: 'professional'
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Professional export presets
    const exportPresets: ExportPreset[] = [
        {
            id: 'manufacturing',
            name: 'Manufacturing Ready',
            description: 'Complete package for production with all guides',
            formats: ['pdf', 'dxf', 'svg'],
            template: 'manufacturing',
            settings: {
                includeSeamLines: true,
                includeManufacturingGuides: true,
                includeMetadata: true,
                quality: 'high'
            },
            icon: '🏭'
        },
        {
            id: 'cutting',
            name: 'Laser Cutting',
            description: 'Optimized for CNC and laser cutting machines',
            formats: ['dxf', 'svg'],
            template: 'cutting',
            settings: {
                includeSeamLines: false,
                includeManufacturingGuides: false,
                quality: 'high',
                scale: 1
            },
            icon: '⚡'
        },
        {
            id: 'presentation',
            name: 'Client Presentation',
            description: 'High-quality visuals for client review',
            formats: ['pdf', 'png'],
            template: 'presentation',
            settings: {
                includeDistortionMap: true,
                includeMetadata: true,
                quality: 'ultra',
                resolution: 600
            },
            icon: '📋'
        },
        {
            id: 'archive',
            name: 'Archive Package',
            description: 'Complete documentation for long-term storage',
            formats: ['pdf', 'svg', 'json'],
            template: 'archive',
            settings: {
                includeSeamLines: true,
                includeManufacturingGuides: true,
                includeDistortionMap: true,
                includeMetadata: true,
                quality: 'high'
            },
            icon: '📁'
        }
    ];

    // Enhanced SVG generation with professional features
    const generateSVG = useCallback((options: ExportOptions): string => {
        if (!pattern) return '';

        const { flat_width_cm: width, flat_height_cm: height, vertices_2d: vertices, indices } = pattern;
        const padding = options.template === 'manufacturing' ? 20 : 5;

        // Calculate bounds
        const minX = Math.min(...vertices.filter((_, i) => i % 2 === 0));
        const maxX = Math.max(...vertices.filter((_, i) => i % 2 === 0));
        const minY = Math.min(...vertices.filter((_, i) => i % 2 === 1));
        const maxY = Math.max(...vertices.filter((_, i) => i % 2 === 1));

        const viewBoxWidth = (maxX - minX) + padding * 2;
        const viewBoxHeight = (maxY - minY) + padding * 2;

        let svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="${minX - padding} ${minY - padding} ${viewBoxWidth} ${viewBoxHeight}" 
                 width="${width}cm" height="${height}cm">
                <title>SEISMORA Flat Pattern - ${pattern.model_id}</title>
                <desc>Generated on ${new Date().toISOString()}</desc>
                
                <!-- Definitions -->
                <defs>
                    <!-- Professional Grid Pattern -->
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
                    </pattern>
                    
                    <!-- Major Grid Pattern -->
                    <pattern id="majorGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d1d5db" stroke-width="1"/>
                    </pattern>
                    
                    <!-- Seam Line Pattern -->
                    <pattern id="seamDash" patternUnits="userSpaceOnUse" width="4" height="1">
                        <rect width="2" height="1" fill="#dc2626"/>
                        <rect x="2" width="2" height="1" fill="none"/>
                    </pattern>
                    
                    <!-- Distortion Color Gradients -->
                    <linearGradient id="distortionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
                        <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:0.6" />
                        <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.6" />
                    </linearGradient>
                    
                    <!-- Arrow Markers -->
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="3" 
                            markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#374151"/>
                    </marker>
                </defs>`;

        // Background and Grid (if manufacturing template)
        if (options.template === 'manufacturing' || options.template === 'archive') {
            svgContent += `
                <!-- Background -->
                <rect x="${minX - padding}" y="${minY - padding}" 
                      width="${viewBoxWidth}" height="${viewBoxHeight}" 
                      fill="white" stroke="none"/>
                      
                <!-- Grid -->
                <rect x="${minX - padding}" y="${minY - padding}" 
                      width="${viewBoxWidth}" height="${viewBoxHeight}" 
                      fill="url(#grid)" opacity="0.3"/>
                      
                <!-- Major Grid -->
                <rect x="${minX - padding}" y="${minY - padding}" 
                      width="${viewBoxWidth}" height="${viewBoxHeight}" 
                      fill="url(#majorGrid)" opacity="0.5"/>`;
        }

        // Main pattern with distortion coloring if requested
        if (options.includeDistortionMap && pattern.distortion_values) {
            // Render triangles with distortion colors
            for (let i = 0; i < indices.length; i += 3) {
                const a = indices[i] * 2;
                const b = indices[i + 1] * 2;
                const c = indices[i + 2] * 2;

                const distA = pattern.distortion_values[indices[i]] || 0;
                const distB = pattern.distortion_values[indices[i + 1]] || 0;
                const distC = pattern.distortion_values[indices[i + 2]] || 0;
                const avgDistortion = (distA + distB + distC) / 3;

                const color = avgDistortion < 0.1 ? '#10b981' :
                    avgDistortion < 0.3 ? '#f59e0b' : '#ef4444';

                svgContent += `
                    <path d="M ${vertices[a]} ${vertices[a + 1]} 
                             L ${vertices[b]} ${vertices[b + 1]} 
                             L ${vertices[c]} ${vertices[c + 1]} Z" 
                          fill="${color}" fill-opacity="0.3" 
                          stroke="#2563eb" stroke-width="0.2"/>`;
            }
        } else {
            // Standard wireframe rendering
            let pathData = '';
            for (let i = 0; i < indices.length; i += 3) {
                const a = indices[i] * 2;
                const b = indices[i + 1] * 2;
                const c = indices[i + 2] * 2;
                pathData += `M ${vertices[a]} ${vertices[a + 1]} L ${vertices[b]} ${vertices[b + 1]} L ${vertices[c]} ${vertices[c + 1]} Z `;
            }

            svgContent += `
                <path d="${pathData}" 
                      fill="none" 
                      stroke="${options.template === 'cutting' ? '#000000' : '#2563eb'}" 
                      stroke-width="${options.template === 'cutting' ? '0.05' : '0.1'}"/>`;
        }

        // Seam lines
        if (options.includeSeamLines && pattern.seam_edges && pattern.seam_edges.length > 0) {
            svgContent += `
                <g id="seamLines">`;

            pattern.seam_edges.forEach(edge => {
                const vertices_edge = edge.split('-').map(Number);
                if (vertices_edge.length >= 2) {
                    const x1 = vertices[vertices_edge[0] * 2];
                    const y1 = vertices[vertices_edge[0] * 2 + 1];
                    const x2 = vertices[vertices_edge[1] * 2];
                    const y2 = vertices[vertices_edge[1] * 2 + 1];

                    svgContent += `
                        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                              stroke="#dc2626" stroke-width="0.3" 
                              stroke-dasharray="2,1" opacity="0.8"/>`;
                }
            });

            svgContent += `</g>`;
        }

        // Manufacturing guides
        if (options.includeManufacturingGuides && options.template !== 'cutting') {
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            svgContent += `
                <g id="manufacturingGuides">
                    <!-- Grain Line -->
                    <line x1="${centerX}" y1="${centerY - 30}" 
                          x2="${centerX}" y2="${centerY + 30}" 
                          stroke="#dc2626" stroke-width="1" 
                          stroke-dasharray="8,4" marker-end="url(#arrow)"/>
                    
                    <!-- Grain Line Label -->
                    <text x="${centerX + 5}" y="${centerY}" 
                          font-family="Arial, sans-serif" font-size="8" 
                          fill="#dc2626" text-anchor="start">GRAIN</text>
                    
                    <!-- Seam Allowance Guides -->
                    <rect x="${minX - 5}" y="${minY - 5}" 
                          width="${maxX - minX + 10}" height="${maxY - minY + 10}" 
                          fill="none" stroke="#9333ea" stroke-width="0.5" 
                          stroke-dasharray="3,2" opacity="0.6"/>
                    
                    <!-- Notches -->
                    <g id="notches">`;

            // Add notches at key points
            const notchPositions = [0.25, 0.5, 0.75];
            notchPositions.forEach(pos => {
                const notchX = minX + (maxX - minX) * pos;
                const notchY = minY - 2;

                svgContent += `
                    <path d="M ${notchX - 1} ${notchY} L ${notchX + 1} ${notchY} 
                             M ${notchX} ${notchY - 1} L ${notchX} ${notchY + 1}" 
                          stroke="#dc2626" stroke-width="0.5"/>`;
            });

            svgContent += `
                    </g>
                </g>`;
        }

        // Dimensions and labels
        if (options.template === 'manufacturing' || options.template === 'presentation') {
            svgContent += `
                <g id="dimensions">
                    <!-- Width Dimension -->
                    <line x1="${minX}" y1="${maxY + 10}" 
                          x2="${maxX}" y2="${maxY + 10}" 
                          stroke="#6b7280" stroke-width="0.5" 
                          marker-start="url(#arrow)" marker-end="url(#arrow)"/>
                    <text x="${(minX + maxX) / 2}" y="${maxY + 15}" 
                          font-family="Arial, sans-serif" font-size="6" 
                          text-anchor="middle" fill="#6b7280">
                        ${width.toFixed(1)} cm
                    </text>
                    
                    <!-- Height Dimension -->
                    <line x1="${minX - 10}" y1="${minY}" 
                          x2="${minX - 10}" y2="${maxY}" 
                          stroke="#6b7280" stroke-width="0.5" 
                          marker-start="url(#arrow)" marker-end="url(#arrow)"/>
                    <text x="${minX - 12}" y="${(minY + maxY) / 2}" 
                          font-family="Arial, sans-serif" font-size="6" 
                          text-anchor="middle" fill="#6b7280" 
                          transform="rotate(-90 ${minX - 12} ${(minY + maxY) / 2})">
                        ${height.toFixed(1)} cm
                    </text>
                </g>`;
        }

        // Metadata and title block
        if (options.includeMetadata && options.template !== 'cutting') {
            const titleBlockY = minY - padding + 5;

            svgContent += `
                <g id="titleBlock">
                    <rect x="${minX - padding + 5}" y="${titleBlockY}" 
                          width="120" height="40" 
                          fill="white" stroke="#d1d5db" stroke-width="0.5"/>
                    
                    <text x="${minX - padding + 10}" y="${titleBlockY + 12}" 
                          font-family="Arial, sans-serif" font-size="10" 
                          font-weight="bold" fill="#1f2937">
                        SEISMORA Pattern
                    </text>
                    
                    <text x="${minX - padding + 10}" y="${titleBlockY + 24}" 
                          font-family="Arial, sans-serif" font-size="6" 
                          fill="#4b5563">
                        Model: ${pattern.model_id || 'Unknown'}
                    </text>
                    
                    <text x="${minX - padding + 10}" y="${titleBlockY + 32}" 
                          font-family="Arial, sans-serif" font-size="6" 
                          fill="#4b5563">
                        Generated: ${new Date().toLocaleDateString()}
                    </text>
                    
                    <!-- Quality Info -->
                    ${pattern.distortion_metrics ? `
                        <text x="${minX - padding + 70}" y="${titleBlockY + 20}" 
                              font-family="Arial, sans-serif" font-size="6" 
                              fill="#4b5563">
                            Quality: ${(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}% avg
                        </text>
                        <text x="${minX - padding + 70}" y="${titleBlockY + 28}" 
                              font-family="Arial, sans-serif" font-size="6" 
                              fill="#4b5563">
                            Max: ${(pattern.distortion_metrics.max_area_distortion * 100).toFixed(1)}%
                        </text>
                    ` : ''}
                </g>`;
        }

        // Quality legend for distortion maps
        if (options.includeDistortionMap && pattern.distortion_values) {
            svgContent += `
                <g id="distortionLegend">
                    <rect x="${maxX - 60}" y="${minY - padding + 50}" 
                          width="55" height="30" 
                          fill="white" stroke="#d1d5db" stroke-width="0.5"/>
                    
                    <text x="${maxX - 57}" y="${minY - padding + 58}" 
                          font-family="Arial, sans-serif" font-size="6" 
                          font-weight="bold" fill="#1f2937">
                        Distortion Map
                    </text>
                    
                    <rect x="${maxX - 55}" y="${minY - padding + 62}" width="10" height="5" fill="#10b981"/>
                    <text x="${maxX - 43}" y="${minY - padding + 66}" 
                          font-family="Arial, sans-serif" font-size="4" fill="#4b5563">Low (&lt;10%)</text>
                    
                    <rect x="${maxX - 55}" y="${minY - padding + 68}" width="10" height="5" fill="#f59e0b"/>
                    <text x="${maxX - 43}" y="${minY - padding + 72}" 
                          font-family="Arial, sans-serif" font-size="4" fill="#4b5563">Med (10-30%)</text>
                    
                    <rect x="${maxX - 55}" y="${minY - padding + 74}" width="10" height="5" fill="#ef4444"/>
                    <text x="${maxX - 43}" y="${minY - padding + 78}" 
                          font-family="Arial, sans-serif" font-size="4" fill="#4b5563">High (&gt;30%)</text>
                </g>`;
        }

        svgContent += '</svg>';

        return svgContent;
    }, [pattern]);

    // PDF Generation
    const generatePDF = useCallback(async (options: ExportOptions): Promise<Blob> => {
        if (!pattern) throw new Error('No pattern available');

        const pdf = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'cm',
            format: options.paperSize || 'a4'
        });

        // Add title
        pdf.setFontSize(16);
        pdf.text('SEISMORA Flat Pattern', 2, 2);

        // Add metadata
        pdf.setFontSize(10);
        pdf.text(`Model ID: ${pattern.model_id}`, 2, 3);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 2, 3.5);
        pdf.text(`Dimensions: ${pattern.flat_width_cm.toFixed(1)} x ${pattern.flat_height_cm.toFixed(1)} cm`, 2, 4);

        if (pattern.distortion_metrics) {
            pdf.text(`Quality: ${(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}% avg distortion`, 2, 4.5);
        }

        // Generate SVG and convert to PDF
        const svgString = generateSVG(options);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create image from SVG
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = svgUrl;
        });

        // Add to PDF with proper scaling
        const imgWidth = pdf.internal.pageSize.getWidth() - 4;
        const imgHeight = (img.height * imgWidth) / img.width;

        pdf.addImage(img, 'PNG', 2, 5.5, imgWidth, imgHeight);

        // Add additional pages for manufacturing info if needed
        if (options.template === 'manufacturing' || options.template === 'archive') {
            pdf.addPage();
            pdf.setFontSize(14);
            pdf.text('Manufacturing Instructions', 2, 2);

            pdf.setFontSize(10);
            let yPos = 3;

            if (options.includeSeamLines) {
                pdf.text('• Red dashed lines indicate seam allowances', 2, yPos);
                yPos += 0.5;
            }

            if (options.includeManufacturingGuides) {
                pdf.text('• Follow grain line arrows for proper material alignment', 2, yPos);
                yPos += 0.5;
                pdf.text('• Notches indicate alignment points during assembly', 2, yPos);
                yPos += 0.5;
            }

            if (pattern.distortion_metrics) {
                yPos += 0.5;
                pdf.text('Quality Metrics:', 2, yPos);
                yPos += 0.5;
                pdf.text(`• Average distortion: ${(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}%`, 2, yPos);
                yPos += 0.5;
                pdf.text(`• Maximum distortion: ${(pattern.distortion_metrics.max_area_distortion * 100).toFixed(1)}%`, 2, yPos);
                yPos += 0.5;
                pdf.text(`• Packing efficiency: ${pattern.packing_efficiency ? (pattern.packing_efficiency * 100).toFixed(1) + '%' : 'N/A'}`, 2, yPos);
            }
        }

        URL.revokeObjectURL(svgUrl);

        return new Promise(resolve => {
            const pdfBlob = pdf.output('blob');
            resolve(pdfBlob);
        });
    }, [pattern, generateSVG]);

    // DXF Generation (simplified version)
    const generateDXF = useCallback((options: ExportOptions): string => {
        if (!pattern) return '';

        let dxfContent = `
0
SECTION
2
HEADER
9
\$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
`;

        // Add pattern lines
        const { vertices_2d: vertices, indices } = pattern;

        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 2;
            const b = indices[i + 1] * 2;
            const c = indices[i + 2] * 2;

            // Triangle edges as lines
            const edges = [
                [a, b], [b, c], [c, a]
            ];

            edges.forEach(([start, end]) => {
                dxfContent += `
0
LINE
8
PATTERN
10
${vertices[start]}
20
${vertices[start + 1]}
30
0.0
11
${vertices[end]}
21
${vertices[end + 1]}
31
0.0
`;
            });
        }

        // Add seam lines on different layer
        if (options.includeSeamLines && pattern.seam_edges) {
            pattern.seam_edges.forEach(edge => {
                const vertices_edge = edge.split('-').map(Number);
                if (vertices_edge.length >= 2) {
                    const x1 = vertices[vertices_edge[0] * 2];
                    const y1 = vertices[vertices_edge[0] * 2 + 1];
                    const x2 = vertices[vertices_edge[1] * 2];
                    const y2 = vertices[vertices_edge[1] * 2 + 1];

                    dxfContent += `
0
LINE
8
SEAMS
62
1
10
${x1}
20
${y1}
30
0.0
11
${x2}
21
${y2}
31
0.0
`;
                }
            });
        }

        dxfContent += `
0
ENDSEC
0
EOF
`;

        return dxfContent;
    }, [pattern]);

    // Main export function
    const handleExport = useCallback(async (format: ExportFormat, options: ExportOptions) => {
        if (!pattern) return;

        setIsExporting(true);
        setExportProgress(0);
        onExportStart?.();

        try {
            let blob: Blob;
            let filename = `seismora_pattern_${pattern.model_id}`;

            setExportProgress(25);

            switch (format) {
                case 'svg':
                    const svgContent = generateSVG(options);
                    blob = new Blob([svgContent], { type: 'image/svg+xml' });
                    filename += '.svg';
                    break;

                case 'pdf':
                    setExportProgress(50);
                    blob = await generatePDF(options);
                    filename += '.pdf';
                    break;

                case 'dxf':
                    const dxfContent = generateDXF(options);
                    blob = new Blob([dxfContent], { type: 'application/dxf' });
                    filename += '.dxf';
                    break;

                case 'png':
                case 'jpeg':
                    setExportProgress(50);
                    // Generate high-resolution raster image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Canvas not supported');

                    const scale = options.resolution / 96; // 96 DPI base
                    canvas.width = pattern.flat_width_cm * 37.8 * scale; // cm to pixels
                    canvas.height = pattern.flat_height_cm * 37.8 * scale;

                    // Render pattern to canvas (simplified)
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 2 * scale;

                    const vertices = pattern.vertices_2d;
                    const indices = pattern.indices;

                    for (let i = 0; i < indices.length; i += 3) {
                        const a = indices[i] * 2;
                        const b = indices[i + 1] * 2;
                        const c = indices[i + 2] * 2;

                        ctx.beginPath();
                        ctx.moveTo(vertices[a] * 37.8 * scale, vertices[a + 1] * 37.8 * scale);
                        ctx.lineTo(vertices[b] * 37.8 * scale, vertices[b + 1] * 37.8 * scale);
                        ctx.lineTo(vertices[c] * 37.8 * scale, vertices[c + 1] * 37.8 * scale);
                        ctx.closePath();
                        ctx.stroke();
                    }

                    blob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob((b) => resolve(b!), `image/${format}`, 0.95);
                    });
                    filename += `.${format}`;
                    break;

                case 'json':
                    // Export complete pattern data
                    const jsonData = {
                        ...pattern,
                        exportOptions: options,
                        exportDate: new Date().toISOString(),
                        version: '1.0'
                    };
                    blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                    filename += '.json';
                    break;

                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            setExportProgress(90);

            // Download file
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportProgress(100);
            onExportComplete?.(format, blob);

        } catch (error) {
            console.error('Export error:', error);
            onExportError?.(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportProgress(0), 1000);
        }
    }, [pattern, generateSVG, generatePDF, generateDXF, onExportStart, onExportComplete, onExportError]);

    // Batch export function
    const handleBatchExport = useCallback(async (formats: ExportFormat[]) => {
        if (!pattern) return;

        setIsExporting(true);
        const totalFormats = formats.length;

        try {
            for (let i = 0; i < formats.length; i++) {
                setExportProgress((i / totalFormats) * 100);
                await handleExport(formats[i], exportOptions);
                // Small delay between exports
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            onExportError?.(error instanceof Error ? error.message : 'Batch export failed');
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    }, [pattern, exportOptions, handleExport, onExportError]);

    // Apply preset
    const applyPreset = useCallback((preset: ExportPreset) => {
        setExportOptions(prev => ({
            ...prev,
            ...preset.settings,
            template: preset.template
        }));
        setSelectedFormat(preset.formats[0]);
    }, []);

    if (!pattern) {
        return (
            <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                No Pattern
            </button>
        );
    }

    return (
        <div className="relative">
            {/* Main Export Button */}
            <button
                onClick={() => setIsOpen(true)}
                disabled={isExporting}
                className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors ${isExporting ? 'cursor-not-allowed' : 'hover:shadow-lg'
                    }`}
            >
                {isExporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Exporting... {Math.round(exportProgress)}%
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Pattern
                    </>
                )}
            </button>

            {/* Export Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <div>
                                <h2 className="text-xl font-semibold">Export Pattern</h2>
                                <p className="text-purple-100 text-sm">Choose format and options for your flat pattern</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex h-[600px]">
                            {/* Left Panel - Options */}
                            <div className="w-1/2 p-6 border-r overflow-y-auto">
                                {/* Export Presets */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">🎯 Quick Presets</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {exportPresets.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => applyPreset(preset)}
                                                className="p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{preset.icon}</span>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800 group-hover:text-purple-700">
                                                            {preset.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">{preset.description}</p>
                                                        <div className="flex gap-1 mt-1">
                                                            {preset.formats.map(format => (
                                                                <span key={format} className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">
                                                                    {format}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Format Selection */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">📁 Export Format</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['svg', 'pdf', 'dxf', 'png', 'jpeg', 'json'] as ExportFormat[]).map(format => (
                                            <button
                                                key={format}
                                                onClick={() => setSelectedFormat(format)}
                                                className={`p-3 border rounded-lg text-sm transition-colors ${selectedFormat === format
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-medium uppercase">{format}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {format === 'svg' && 'Vector graphics'}
                                                    {format === 'pdf' && 'Print ready'}
                                                    {format === 'dxf' && 'CAD/CNC'}
                                                    {format === 'png' && 'Raster image'}
                                                    {format === 'jpeg' && 'Compressed'}
                                                    {format === 'json' && 'Pattern data'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Template Selection */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">🎨 Template</h3>
                                    <select
                                        value={exportOptions.template}
                                        onChange={(e) => setExportOptions(prev => ({ ...prev, template: e.target.value as ExportTemplate }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="minimal">Minimal - Pattern only</option>
                                        <option value="professional">Professional - With guides</option>
                                        <option value="manufacturing">Manufacturing - Complete</option>
                                        <option value="presentation">Presentation - High quality</option>
                                        <option value="cutting">Cutting - CNC optimized</option>
                                        <option value="archive">Archive - Full documentation</option>
                                    </select>
                                </div>

                                {/* Export Options */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800">⚙️ Options</h3>

                                    {/* Quality */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                                        <select
                                            value={exportOptions.quality}
                                            onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value as any }))}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="low">Low - Fast export</option>
                                            <option value="medium">Medium - Balanced</option>
                                            <option value="high">High - Best quality</option>
                                            <option value="ultra">Ultra - Maximum detail</option>
                                        </select>
                                    </div>

                                    {/* Resolution for raster formats */}
                                    {(selectedFormat === 'png' || selectedFormat === 'jpeg') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Resolution: {exportOptions.resolution} DPI
                                            </label>
                                            <input
                                                type="range"
                                                min="150"
                                                max="600"
                                                step="150"
                                                value={exportOptions.resolution}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, resolution: parseInt(e.target.value) }))}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>150 DPI</span>
                                                <span>300 DPI</span>
                                                <span>450 DPI</span>
                                                <span>600 DPI</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Paper size for PDF */}
                                    {selectedFormat === 'pdf' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                                            <select
                                                value={exportOptions.paperSize}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, paperSize: e.target.value as any }))}
                                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                                            >
                                                <option value="A4">A4 (21.0 × 29.7 cm)</option>
                                                <option value="A3">A3 (29.7 × 42.0 cm)</option>
                                                <option value="A2">A2 (42.0 × 59.4 cm)</option>
                                                <option value="letter">Letter (21.6 × 27.9 cm)</option>
                                                <option value="legal">Legal (21.6 × 35.6 cm)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Checkboxes */}
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeSeamLines}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeSeamLines: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Include seam lines</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeManufacturingGuides}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeManufacturingGuides: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Manufacturing guides</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeDistortionMap}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDistortionMap: e.target.checked }))}
                                                className="mr-2"
                                                disabled={!pattern.distortion_values}
                                            />
                                            <span className={`text-sm ${!pattern.distortion_values ? 'text-gray-400' : ''}`}>
                                                Distortion visualization
                                            </span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.includeMetadata}
                                                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Pattern information</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Preview */}
                            <div className="w-1/2 p-6">
                                <h3 className="font-semibold text-gray-800 mb-3">👁️ Preview</h3>

                                {/* Preview Canvas/SVG */}
                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-80 flex items-center justify-center mb-4">
                                    {selectedFormat === 'svg' ? (
                                        <div
                                            className="w-full h-full p-4 overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: generateSVG(exportOptions) }}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                            <p className="uppercase text-sm font-medium">{selectedFormat}</p>
                                            <p className="text-xs">Preview available after export</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pattern Info */}
                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dimensions:</span>
                                        <span>{pattern.flat_width_cm.toFixed(1)} × {pattern.flat_height_cm.toFixed(1)} cm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Area:</span>
                                        <span>{pattern.flat_area_cm2.toFixed(1)} cm²</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Triangles:</span>
                                        <span>{pattern.indices.length / 3}</span>
                                    </div>
                                    {pattern.distortion_metrics && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Quality:</span>
                                            <span className={
                                                pattern.distortion_metrics.average_area_distortion < 0.1 ? 'text-green-600' :
                                                    pattern.distortion_metrics.average_area_distortion < 0.3 ? 'text-yellow-600' : 'text-red-600'
                                            }>
                                                {(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}% avg
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                            <div className="flex gap-2">
                                {/* Batch Export */}
                                <button
                                    onClick={() => handleBatchExport(['svg', 'pdf', 'dxf'])}
                                    disabled={isExporting}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                    📦 Export Bundle
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleExport(selectedFormat, exportOptions);
                                        setIsOpen(false);
                                    }}
                                    disabled={isExporting}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {isExporting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Export {selectedFormat.toUpperCase()}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {isExporting && exportProgress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0">
                                <div className="w-full bg-gray-200 h-1">
                                    <div
                                        className="bg-purple-600 h-1 transition-all duration-300"
                                        style={{ width: `${exportProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import type { UnwrappedPattern } from '@/types';

interface SVGExportButtonProps {
    pattern: UnwrappedPattern | null;
}

export default function SVGExportButton({ pattern }: SVGExportButtonProps) {
    const handleExport = () => {
        if (!pattern) return;

        // Create SVG content
        const width = pattern.flat_width_cm; // unitless for SVG viewbox
        const height = pattern.flat_height_cm;
        const padding = 2; // slight padding

        const minX = Math.min(...pattern.vertices_2d.filter((_, i) => i % 2 === 0));
        const minY = Math.min(...pattern.vertices_2d.filter((_, i) => i % 2 === 1));

        // Generate Path
        let pathData = '';
        const indices = pattern.indices;
        const vertices = pattern.vertices_2d;

        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 2;
            const b = indices[i + 1] * 2;
            const c = indices[i + 2] * 2;

            pathData += `M ${vertices[a]} ${vertices[a + 1]} L ${vertices[b]} ${vertices[b + 1]} L ${vertices[c]} ${vertices[c + 1]} Z `;
        }

        const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}" width="${width}cm" height="${height}cm">
        <desc>SEISMORA Flat Pattern</desc>
        <path d="${pathData}" fill="none" stroke="black" stroke-width="0.1" />
        <!-- Seam Line -->
        ${pattern.seam_vertices.map((idx, i) => {
            if (i === 0) return '';
            const prevIdx = pattern.seam_vertices[i - 1];
            const x1 = vertices[prevIdx * 2];
            const y1 = vertices[prevIdx * 2 + 1];
            const x2 = vertices[idx * 2];
            const y2 = vertices[idx * 2 + 1];
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="red" stroke-width="0.2" stroke-dasharray="0.5,0.5" />`;
        }).join('')}
      </svg>
    `;

        // Trigger download
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `seismora_pattern_${pattern.model_id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            disabled={!pattern}
            className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export SVG
        </button>
    );
}

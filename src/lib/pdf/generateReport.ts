import jsPDF from 'jspdf';
import type { Model3D, Measurements3D, UnwrappedPattern } from '@/types';

export function generateAnalysisReport(
    model: Model3D,
    measurements: Measurements3D,
    pattern?: UnwrappedPattern
): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);
    doc.text('SEISMORA', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('3D Model Analysis Report', pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Model Info Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('MODEL INFORMATION', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Filename: ${model.filename}`, 25, y); y += 6;
    doc.text(`Upload Date: ${new Date(model.created_at).toLocaleDateString()}`, 25, y); y += 6;
    doc.text(`Model Type: ${model.model_type}`, 25, y); y += 15;

    // Dimensions Section
    doc.setFontSize(12);
    doc.text('DIMENSIONS', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Length: ${measurements.length_cm.toFixed(2)} cm`, 25, y); y += 6;
    doc.text(`Width: ${measurements.width_cm.toFixed(2)} cm`, 25, y); y += 6;
    doc.text(`Depth: ${measurements.depth_cm.toFixed(2)} cm`, 25, y); y += 15;

    // Surface & Volume Section
    doc.setFontSize(12);
    doc.text('SURFACE & VOLUME', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Surface Area: ${measurements.surface_area_cm2.toFixed(2)} cm²`, 25, y); y += 6;
    doc.text(`Volume: ${measurements.volume_cm3.toFixed(2)} cm³`, 25, y); y += 15;

    // Circumferences Section
    doc.setFontSize(12);
    doc.text('CIRCUMFERENCES', 20, y);
    y += 8;

    doc.setFontSize(10);
    measurements.circumferences.forEach((circ, index) => {
        if (index < 6) {
            doc.text(
                `Height ${circ.height_cm.toFixed(1)} cm: ${circ.circumference_cm.toFixed(2)} cm`,
                25,
                y
            );
            y += 6;
        }
    });
    y += 10;

    // Flat Pattern Section (if available)
    if (pattern) {
        doc.setFontSize(12);
        doc.text('FLAT PATTERN', 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.text(`Flat Width: ${pattern.flat_width_cm.toFixed(2)} cm`, 25, y); y += 6;
        doc.text(`Flat Height: ${pattern.flat_height_cm.toFixed(2)} cm`, 25, y); y += 6;
        doc.text(`Perimeter: ${pattern.flat_perimeter_cm.toFixed(2)} cm`, 25, y); y += 6;
        doc.text(`Flat Area: ${pattern.flat_area_cm2.toFixed(2)} cm²`, 25, y); y += 15;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Generated: ${new Date().toLocaleString()} | SEISMORA v1.0`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
    );

    return doc;
}

export function downloadReport(
    model: Model3D,
    measurements: Measurements3D,
    pattern?: UnwrappedPattern
) {
    const doc = generateAnalysisReport(model, measurements, pattern);
    doc.save(`seismora_report_${model.id}.pdf`);
}

import type { UnwrappedPattern, ValidationResult } from '@/types';

/**
 * Validates the quality of an unwrapped pattern
 * @param pattern - The unwrapped pattern to validate
 * @returns Validation result with pass/fail status and detailed issues
 */
export function validateUnwrapQuality(pattern: UnwrappedPattern): ValidationResult {
    const issues: Array<{ severity: 'critical' | 'warning' | 'info'; description: string; suggested_fix: string }> = [];
    const warnings: string[] = [];

    // Check for critical issues
    if (!pattern.vertices_2d || pattern.vertices_2d.length === 0) {
        issues.push({
            severity: 'critical',
            description: 'No 2D vertices found in unwrapped pattern',
            suggested_fix: 'Re-run the unwrapping process with a different algorithm'
        });
    }

    if (!pattern.indices || pattern.indices.length === 0) {
        issues.push({
            severity: 'critical',
            description: 'No face indices found in unwrapped pattern',
            suggested_fix: 'Ensure the input model has valid face data'
        });
    }

    // Check distortion metrics
    if (pattern.distortion_metrics) {
        const { average_area_distortion, average_angle_distortion, max_area_distortion, max_angle_distortion } = pattern.distortion_metrics;

        if (average_area_distortion > 0.3) {
            issues.push({
                severity: 'warning',
                description: `High average area distortion: ${(average_area_distortion * 100).toFixed(1)}%`,
                suggested_fix: 'Consider using a different unwrapping method (e.g., conformal or LSCM)'
            });
        }

        if (average_angle_distortion > 15) {
            issues.push({
                severity: 'warning',
                description: `High average angle distortion: ${average_angle_distortion.toFixed(1)}°`,
                suggested_fix: 'Try angle-based or conformal unwrapping for better angle preservation'
            });
        }

        if (max_area_distortion > 2.0) {
            issues.push({
                severity: 'critical',
                description: `Extreme area distortion detected: ${(max_area_distortion * 100).toFixed(1)}%`,
                suggested_fix: 'The pattern may be unusable. Try hybrid unwrapping or manual seam placement'
            });
        }

        if (max_angle_distortion > 45) {
            issues.push({
                severity: 'warning',
                description: `Extreme angle distortion detected: ${max_angle_distortion.toFixed(1)}°`,
                suggested_fix: 'Consider adding more seams to reduce distortion'
            });
        }
    }

    // Check packing efficiency
    if (pattern.packing_efficiency !== undefined && pattern.packing_efficiency < 0.6) {
        issues.push({
            severity: 'info',
            description: `Low packing efficiency: ${(pattern.packing_efficiency * 100).toFixed(1)}%`,
            suggested_fix: 'Material waste is high. Consider optimizing pattern layout or using nested packing'
        });
    }

    // Check seam quality
    if (pattern.seam_to_surface_ratio !== undefined && pattern.seam_to_surface_ratio > 0.5) {
        issues.push({
            severity: 'warning',
            description: `High seam-to-surface ratio: ${(pattern.seam_to_surface_ratio * 100).toFixed(1)}%`,
            suggested_fix: 'Too many seams may complicate manufacturing. Try reducing seam count'
        });
    }

    // Check UV islands
    if (pattern.uv_islands && pattern.uv_islands.length > 5) {
        warnings.push(`Pattern has ${pattern.uv_islands.length} separate pieces. This may complicate assembly.`);
    }

    // Determine overall validation status
    const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');

    // Convert issues to errors and warnings
    const errors = issues
        .filter(i => i.severity === 'critical' || i.severity === 'warning')
        .map(issue => ({
            code: `UNWRAP_${issue.severity.toUpperCase()}`,
            message: issue.description,
            severity: issue.severity as 'critical' | 'error' | 'warning',
            affected_components: ['unwrap_pattern']
        }));

    const validationWarnings = warnings.map(warning => ({
        code: 'UNWRAP_INFO',
        message: warning,
        suggestion: 'Review pattern complexity',
        impact: 'medium' as const
    }));

    const qualityScore = calculateQualityScore(pattern, issues);
    const quality = qualityScore > 0.8 ? 'excellent' : qualityScore > 0.6 ? 'good' : qualityScore > 0.4 ? 'acceptable' : 'poor';

    return {
        is_valid: !hasCriticalIssues,
        quality_score: qualityScore,
        quality,
        errors,
        warnings: validationWarnings
    };
}

/**
 * Calculates an overall quality score based on various metrics
 */
function calculateQualityScore(pattern: UnwrappedPattern, issues: any[]): number {
    let score = 1.0;

    // Penalize based on issues
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    score -= criticalCount * 0.3;
    score -= warningCount * 0.1;

    // Factor in distortion metrics
    if (pattern.distortion_metrics?.average_area_distortion !== undefined) {
        const distortionPenalty = Math.min(0.3, pattern.distortion_metrics.average_area_distortion);
        score -= distortionPenalty;
    }


    // Factor in packing efficiency
    if (pattern.packing_efficiency !== undefined) {
        score *= pattern.packing_efficiency;
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
}

/**
 * Generates actionable recommendations based on validation results
 */
function generateRecommendations(pattern: UnwrappedPattern, issues: any[]): string[] {
    const recommendations: string[] = [];

    // If there are critical issues, recommend re-unwrapping
    if (issues.some(i => i.severity === 'critical')) {
        recommendations.push('Critical issues detected. Consider re-unwrapping with different settings.');
    }

    // Recommend based on unwrap method
    if (pattern.unwrap_method === 'cylindrical' && (pattern.distortion_metrics?.average_area_distortion ?? 0) > 0.2) {
        recommendations.push('Cylindrical unwrapping may not be optimal for this geometry. Try conformal or LSCM methods.');
    }

    // Recommend based on quality assessment
    if (pattern.quality_assessment) {
        if (pattern.quality_assessment.overall_score < 0.6) {
            recommendations.push('Overall quality is below acceptable threshold. Review distortion map and consider manual adjustments.');
        }

        if (pattern.quality_assessment.manufacturability_score < 0.7) {
            recommendations.push('Manufacturing may be challenging. Consult with production team before proceeding.');
        }
    }

    // Recommend based on seam placement
    if (pattern.seam_edges && pattern.seam_edges.length === 0) {
        recommendations.push('No seams detected. For complex geometries, strategic seam placement can improve quality.');
    }

    return recommendations;
}

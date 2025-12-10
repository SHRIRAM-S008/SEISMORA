'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { uploadModelFile } from '@/lib/supabase/storage';

export default function FileUploadCard() {
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const supportedFormats = ['.stl', '.obj', '.glb', '.gltf'];
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    const validateFile = (file: File): string | null => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!supportedFormats.includes(extension)) {
            return `Unsupported format. Please use: ${supportedFormats.join(', ')}`;
        }

        if (file.size > maxFileSize) {
            return 'File too large. Maximum size is 50MB.';
        }

        return null;
    };

    const handleUpload = async (file: File) => {
        setError(null);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // Create model record in database
            const modelId = crypto.randomUUID();
            const hospitalId = 'demo-hospital'; // Get from auth in real app

            setUploadProgress(30);

            // Upload file to storage
            const fileUrl = await uploadModelFile(file, hospitalId, modelId);

            setUploadProgress(60);

            // Save model metadata to database
            const { error: dbError } = await supabase
                .from('models')
                .insert({
                    id: modelId,
                    hospital_id: hospitalId,
                    filename: file.name,
                    file_url: fileUrl,
                    file_size: file.size,
                    file_format: file.name.split('.').pop()?.toLowerCase(),
                    status: 'processing'
                });

            if (dbError) throw dbError;

            setUploadProgress(100);

            // Redirect to analysis page
            router.push(`/analysis/${modelId}`);

        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Upload 3D Limb Model
                </h1>
                <p className="text-gray-600 mb-6">
                    Upload a 3D scan to analyze measurements and generate fabrication patterns
                </p>

                {/* Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
            border-2 border-dashed rounded-xl p-12
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
                >
                    {isUploading ? (
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-700 font-medium">Uploading...</p>
                            <div className="w-48 h-2 bg-gray-200 rounded-full mt-4">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-medium mb-2">
                                Drop your 3D file here
                            </p>
                            <p className="text-gray-500 text-sm mb-4">
                                or click to browse
                            </p>
                            <input
                                type="file"
                                accept=".stl,.obj,.glb,.gltf"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                            >
                                Select File
                            </label>
                        </>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Supported Formats */}
                <div className="mt-6 flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span>Supported:</span>
                        {supportedFormats.map(format => (
                            <span key={format} className="px-2 py-1 bg-gray-100 rounded">
                                {format}
                            </span>
                        ))}
                    </div>

                    <div className="w-full border-t border-gray-200" />

                    <button
                        onClick={() => router.push('/analysis/demo-model')}
                        disabled={isUploading}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline disabled:opacity-50"
                    >
                        Try with Demo Model (Grand Migelo-Wluff)
                    </button>
                </div>
            </div>
        </div>
    );
}

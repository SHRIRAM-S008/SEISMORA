import FileUploadCard from '@/components/upload/FileUploadCard';

export default function UploadPage() {
    return (
        <main className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SEISMORA 3D Analysis
                    </h1>
                    <p className="text-gray-600">
                        Upload a 3D scan for measurement and pattern generation
                    </p>
                </div>

                <FileUploadCard />
            </div>
        </main>
    );
}

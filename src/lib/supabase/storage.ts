import { supabase } from './client';

export async function uploadModelFile(
    file: File,
    hospitalId: string,
    modelId: string
): Promise<string> {
    const filePath = `${hospitalId}/${modelId}/${file.name}`;

    const { data, error } = await supabase.storage
        .from('models')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('models')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

export async function getModelFileUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
        .from('models')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

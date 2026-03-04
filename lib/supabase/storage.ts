import { createClient } from "./client"

export async function uploadImage(file: File, bucket: string) {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

    if (uploadError) {
        throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return publicUrl
}

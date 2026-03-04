"use client"

import { useState } from "react"
import { uploadImage } from "@/lib/supabase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, Loader2 } from "lucide-react"

import Image from "next/image"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    bucket: string
}

export function ImageUpload({ value, onChange, bucket }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const { toast } = useToast()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const url = await uploadImage(file, bucket)
            onChange(url)
            toast({
                title: "Success",
                description: "Image uploaded successfully.",
            })
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error instanceof Error ? error.message : "An unknown error occurred",
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-lg border">
                        <Image
                            src={value}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <Button
                            className="absolute top-2 right-2"
                            variant="destructive"
                            size="sm"
                            onClick={() => onChange("")}
                        >
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="flex aspect-video w-full max-w-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No image selected</p>
                    </div>
                )}
            </div>
            <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <Button type="button" variant="outline" asChild disabled={uploading}>
                            <span>
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        Upload Image
                                    </>
                                )}
                            </span>
                        </Button>
                    </div>
                </Label>
            </div>
        </div>
    )
}

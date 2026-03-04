"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import nextDynamic from "next/dynamic"
const TipTapEditor = nextDynamic(() => import("@/components/editor/TipTapEditor").then(mod => mod.TipTapEditor), { ssr: false })
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import slugify from "slugify"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { type JSONContent } from "@tiptap/react"

export default function NewPostPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState<JSONContent | null>(null)
    const [contentHTML, setContentHTML] = useState("")
    const [published, setPublished] = useState(false)
    const [coverImage, setCoverImage] = useState("")
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !content) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please provide a title and content.",
            })
            return
        }

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push("/login")
            return
        }

        const slug = slugify(title, { lower: true, strict: true })

        const { error } = await supabase.from("posts").insert({
            title,
            slug,
            content,
            content_html: contentHTML,
            published,
            cover_image: coverImage || null,
            author_id: user.id,
        })

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
            setLoading(false)
            return
        }

        toast({
            title: "Success",
            description: "Post created successfully.",
        })
        router.push("/dashboard")
        router.refresh()
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container max-w-4xl py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
                        <p className="text-muted-foreground">
                            Share your thoughts with the world.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-semibold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <ImageUpload
                                value={coverImage}
                                onChange={setCoverImage}
                                bucket="covers"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Content</Label>
                            <TipTapEditor
                                content={content}
                                onChange={setContent}
                                onChangeHTML={setContentHTML}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="published"
                                checked={published}
                                onCheckedChange={setPublished}
                            />
                            <Label htmlFor="published">Publish immediately</Label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Post"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}

"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState<JSONContent | null>(null)
    const [contentHTML, setContentHTML] = useState("")
    const [published, setPublished] = useState(false)
    const [coverImage, setCoverImage] = useState("")
    const supabase = createClient()

    useEffect(() => {
        async function fetchPost() {
            const { data: post, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", params.id)
                .single()

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch post.",
                })
                router.push("/dashboard")
                return
            }

            setTitle(post.title)
            setContent(post.content)
            setContentHTML(post.content_html || "")
            setPublished(post.published)
            setCoverImage(post.cover_image || "")
            setFetching(false)
        }

        fetchPost()
    }, [params.id, supabase, toast, router])

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

        const slug = slugify(title, { lower: true, strict: true })

        const { error } = await supabase
            .from("posts")
            .update({
                title,
                slug,
                content,
                content_html: contentHTML,
                published,
                cover_image: coverImage || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", params.id)

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
            description: "Post updated successfully.",
        })
        router.push("/dashboard")
        router.refresh()
    }

    if (fetching) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading post...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container max-w-4xl py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                        <p className="text-muted-foreground">
                            Update your story.
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
                            <Label htmlFor="published">Published</Label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
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

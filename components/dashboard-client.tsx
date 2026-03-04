"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { format } from "date-fns"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Post } from "@/types/database"

export default function DashboardClient({ initialPosts }: { initialPosts: Post[] }) {
    const router = useRouter()
    const { toast } = useToast()
    const [posts, setPosts] = useState(initialPosts)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const supabase = createClient()

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return

        setDeletingId(id)
        const { error } = await supabase.from("posts").delete().eq("id", id)

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
            setDeletingId(null)
            return
        }

        toast({
            title: "Success",
            description: "Post deleted successfully.",
        })
        setPosts(posts.filter((post) => post.id !== id))
        setDeletingId(null)
        router.refresh()
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container flex-1 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Manage your blog posts and drafts.
                        </p>
                    </div>
                    <Link href="/dashboard/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Post
                        </Button>
                    </Link>
                </div>

                {posts && posts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                    <CardDescription>
                                        {format(new Date(post.created_at), "PPP")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${post.published
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                            }`}>
                                            {post.published ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Link href={`/dashboard/edit/${post.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(post.id)}
                                        disabled={deletingId === post.id}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {deletingId === post.id ? "Deleting..." : "Delete"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                        <p className="text-lg font-medium">No posts yet</p>
                        <p className="text-muted-foreground mb-4">
                            Write your first amazing blog post!
                        </p>
                        <Link href="/dashboard/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Post
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}

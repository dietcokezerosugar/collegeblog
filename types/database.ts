export interface Profile {
    id: string
    email: string
    username: string | null
    avatar_url: string | null
    created_at: string
}

export interface Post {
    id: string
    title: string
    slug: string
    content: any
    content_html: string | null
    cover_image: string | null
    author_id: string
    published: boolean
    created_at: string
    updated_at: string
    author?: Profile
}

export interface UserItems {
    email: string
    display_name: string
    role: string
    permissions: 'read' | 'read-write'
    projects: string[]
    uid?: string
    image?: string
}
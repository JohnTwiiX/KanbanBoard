export interface Task {
    title: string,
    description: string,
    category: string,
    priority: string,
    staff: {
        name: string,
        image: string
    },
    status: string,
    deadline: string,
    id?: string
}
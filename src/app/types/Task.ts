import { SubTasks } from "./SubTasks"

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
    createdAt: string
    deadline?: string,
    id?: string
    closedAt?: string
    project?: string
    subTasks?: SubTasks[]
}
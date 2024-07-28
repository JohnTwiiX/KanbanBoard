export interface Settings {
    columns: string[]
    categories: string[]
    priorities: Priorities
    projects: string[]
}

export interface Priorities {
    'low': string
    'medium': string
    'high': string
}
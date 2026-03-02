export interface CodeEntry {
    readonly id: string;
    readonly parentId: string;
    readonly code: string;
    readonly done: boolean;
    readonly timestamp: number;
}

export type CodeList = CodeEntry[]
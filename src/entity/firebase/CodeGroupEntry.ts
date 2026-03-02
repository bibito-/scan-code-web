import type {CodeList} from "./CodeEntry.ts";

export interface CodeGroupEntry {
    readonly id: string;
    readonly name: string;
    readonly codes: CodeList
}
export type CodeGroupEntryList = CodeGroupEntry[]
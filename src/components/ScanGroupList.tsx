import type {CodeGroupEntryList} from "../entity/CodeGroupEntry.ts";
import ScanHistory from "./ScanHistory.tsx";

// シグネチャーを宣言してるだけ
export interface CodeGroupProps {
    groups: CodeGroupEntryList;
    onCodeEntryChecked: (groupID: string, codeID: string, checked: boolean) => void;
    onCodeEntryDeleted: (groupID: string, codeID: string) => void;
}

const ScanGroupList = ({groups, onCodeEntryChecked, onCodeEntryDeleted}: CodeGroupProps) => {
    return (
        <ul className="grid lg:grid-cols-4 md:grid-cols-4 gap-10 items-start">
            {groups.map((group) => (
                <li key={group.id} className="px-2 col-span-2  rounded relative min-h-30 flex items-center justify-center">
                    {/*<div className="py-2 px-3 flex flex-col gap-1 rounded-b bg-gray-100 shadow-sm w-4/5 w-fit">*/}
                    <div className="py-2 px-3 flex flex-col gap-1 rounded-b bg-gray-100 shadow-sm w-full">
                        <p className="text-black font-bold text-[11px] mb-1 border-b w-full text-center">
                            {group.name}
                        </p>
                        <ScanHistory groupID={group.id} items={group.codes} onChecked={onCodeEntryChecked} onDelete={onCodeEntryDeleted}/>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default ScanGroupList
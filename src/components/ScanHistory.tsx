import {Trash2} from "lucide-react";
import type {CodeList} from "../entity/CodeEntry.ts";

export interface ScanHistoryProps {
    groupID: string;
    items: CodeList;
    onChecked?: (groupID: string, codeID: string, checked: boolean) => void;
    onDelete?: (groupID: string, codeID: string) => void;
}

const ScanHistory = ({groupID, items, onChecked, onDelete}: ScanHistoryProps) => {
    return (
        <ul className="flex flex-col gap-1">
            {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-10">
                    {/*情報前部のチェックボックとコード情報部分*/}
                    <div className="flex-1 justify-start items-center">
                        <input id={`check-${item.id}`} className="mr-3" type="checkbox" checked={item.done} onChange={(e) => {
                            onChecked?.(groupID, item.id, e.target.checked)
                        }
                        }/>
                        <label htmlFor={`check-${item.id}`} className="text-[16px] text-gray-500 break-all">{item.code}</label>
                    </div>
                    {/*情報後部の追加情報（日付）と削除ボタン*/}
                    <div className="col-span-2 flex justify-end items-center gap-2">
                        {/* tabular-numsにより表示状の日付の桁数を揃える */}
                        <span className="text-[16px] text-gray-700 tabular-nums">
                            {new Date(item.timestamp).toLocaleString("ja-JP")}
                        </span>
                        <button onClick={
                            () => {
                                onDelete?.(groupID, item.id)
                            }
                        } className="rounded-2xl bg-gray-200 transition-colors hover:bg-gray-300">
                            <Trash2 className="size-5 text-gray-500"/>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default ScanHistory
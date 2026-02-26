import {useEffect, useMemo, useState} from "react";
import type {CodeGroupEntryList} from "../entity/CodeGroupEntry.ts";
import scannedCodeRepository from "../repository/scannedCodeRepository.ts";
import {produce} from "immer";
import type {CodeList} from "../entity/CodeEntry.ts";

export const useScanData = () => {
    // 監視対象となる二つのリスト。combine予定。
    const [groups, setGroups] = useState<CodeGroupEntryList>([]);
    const [allCodes, setAllCodes] = useState<CodeList>([]);

    // ローデインング制御
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // 親コレクションとなるscanned_code_groupの変更を監視
        const unsubscribeGroups = scannedCodeRepository.subscribeGroups((newGroup) => {
            setGroups(newGroup);
            setLoading(false);
        });
        // 子コレクションとなるscanned_codeの変更を監視
        const unsubscribeCodes = scannedCodeRepository.subscribeAllCodes((newCodes) => {
            setAllCodes(newCodes);
            setLoading(false);
        })

        return () => {
            unsubscribeGroups()
            unsubscribeCodes()
        }
    }, [])

    // memorizedとcombine
    const synchronizedData = useMemo(() => {
        return groups.map((group) => {
            return {
                ...group,
                codes: allCodes.filter((code) => code.parentId === group.id)
            }
            })
        }, [groups, allCodes])

    const onDeleteCodeLine = (groupID: string, codeID: string) =>{
        console.log(`${groupID} の ${codeID} を消しましたよ。`)
        const newGroupEntries = groups.map((group) => {
            if (group.id === groupID) {
                return {
                    ...group,
                    codes: group.codes.filter((code) => code.id !== codeID)
                }
            } else {
                return group
            }
        })
        setGroups(newGroupEntries)
    }
    const toggleCodeLineCheck = async (groupID: string, codeID: string, checked: boolean) => {
         const newEntries = produce(groups, (draft) => {
            const group = draft.find((group) => group.id === groupID);
            if (group) {
                const code = group.codes.find((code) => code.id === codeID);
                if (code) {
                    code.done = checked;
                }
            }
        })
        setGroups(newEntries)
        try {
            await scannedCodeRepository.updateCodeStatus(groupID, codeID, checked);
        } catch (e) {
             // エラー時は手戻り
            setGroups(groups)
        }

    }
    return {synchronizedData, loading, onDeleteCodeLine, toggleCodeLineCheck}

}
import {useEffect, useState} from "react";
import {useScanData} from "../hooks/useScanData.ts";
import ScanGroupList from "../components/ScanGroupList.tsx";
import Loading from "../components/Loading.tsx";
import scannedCodeRepositorySupabase from "../repository/scannedCodeRepositorySupabase.ts";
import type { CodeGroupEntryList } from "../entity/supabase/CodeGroupEntry.ts";

const Home = () => {
    const { synchronizedData, loading, onDeleteCodeLine, toggleCodeLineCheck } = useScanData()
    const [title] = useState("スキャン履歴")

    const [group, setGroup] = useState<CodeGroupEntryList | null>(null);
        
    useEffect(() => {
        scannedCodeRepositorySupabase.getCodeGroupList().then((data) => {
            setGroup(data);
        }).catch((error) => {
            console.error("Error fetching code group list:", error);
        });
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <main className="bg-amber-300  min-h-screen py-10 px-4 sm:px-16">
            <div className="py-10">
                <div className="text-center mb-8">
                    <h2 className="text-[20px] sm:text-[30px] text-center mb-5">{title}</h2>
                </div>
            </div>
            <p className="text-center mb-5">スパベース</p>
            <ul className="flex justify-center mb-10">
                {group?.map((entry) => (
                    <li key={entry.id} className="mx-2 px-4 py-2 bg-white rounded shadow">
                        {entry.name}
                    </li>
                ))}
            </ul>

            <div className="py-8 px-4 sm:py-16 sm:px-12 bg-gray-50">
                <ScanGroupList groups={synchronizedData} onCodeEntryChecked= {toggleCodeLineCheck} onCodeEntryDeleted={onDeleteCodeLine} />
            </div>
        </main>
    )
}

export default Home
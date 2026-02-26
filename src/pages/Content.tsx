// import {CodeList} from "../components/ScanHistory.tsx";
// import {produce} from "immer";
import {useScanData} from "../hooks/useScanData.ts";
// import type {CodeGroupEntryList} from "../entity/CodeGroupEntry.ts";
import ScanGroupList from "../components/ScanGroupList.tsx";
import Loading from "../components/Loading.tsx";

const Home = () => {
    const { synchronizedData, loading, onDeleteCodeLine, toggleCodeLineCheck } = useScanData()
    if (loading) {
        return <Loading />
    }

    return (
        <main className="bg-amber-300  min-h-screen py-10 px-16">
            <div className="py-10">
                <div className="text-center mb-8">
                    <h2 className="lg:text-[30px] text-[20px] text-center mb-5">スキャン履歴</h2>
                </div>
            </div>
            <div className="py-16 px-12 bg-gray-50">
                <ScanGroupList groups={synchronizedData} onCodeEntryChecked= {toggleCodeLineCheck} onCodeEntryDeleted={onDeleteCodeLine} />
            </div>
        </main>
    )
}

export default Home
import {collection, collectionGroup, doc, getDocs, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import {db} from "../firebase.ts";
import type {CodeGroupEntry, CodeGroupEntryList} from "../entity/firebase/CodeGroupEntry.ts";
import type {CodeList} from "../entity/firebase/CodeEntry.ts";

const scannedCodeRepository = {
    /**
     * firestore内のコレクション"scanned_code_group の変更を監視
     *
     * @param onUpdate 変更があった際のコールバック
     */
    subscribeGroups(onUpdate: (groups: CodeGroupEntryList) => void) {
        const q = query(collection(db, "scanned_code_group"), orderBy("timestamp", "desc"));
        return onSnapshot(q, (snapshot) => {
                const groups = snapshot.docs.map((doc): CodeGroupEntry => {
                    return {id: doc.id, name: doc.data().name, codes: []}
                })
                onUpdate(groups);
            }
        );
    },
    /**
     * codeを全域スキャン
     *
     * @param onUpdate
     */
    subscribeAllCodes(onUpdate: (codes: CodeList) => void) {
        const allCodeQuery = query(
            collectionGroup(db, "scanned_code"),
            orderBy("timestamp", "desc")
        )
        return onSnapshot(allCodeQuery, (snapshot) => {
            const codes = snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    parentId: doc.ref.parent?.parent?.id ?? "undefined", // doc.ref.parentはそのドキュメントが所属するコレクションにアクセスするので2回parentを辿る必要がある
                    code: doc.data().code,
                    done: doc.data().done,
                    timestamp: doc.data().timestamp ?? 0
                }
            })
            onUpdate(codes)
        })
    }
    ,
    /**
     * 非同期でのFirestoreからのデータの一発取り
     * ↑に監視を適用したコードを書いてます。
     */
    async fetchAllGroups(): Promise<CodeGroupEntryList> {
        const groupSnapshot = await getDocs(collection(db, "scanned_code_group"));
        return Promise.all(groupSnapshot.docs.map(async (groupDoc) => {
                    const codesSnapshot = await getDocs(
                        collection(db, "scanned_code_group", groupDoc.id, "scanned_code")
                    );
                    return {
                        id: groupDoc.id,
                        name: groupDoc.data().name,
                        codes: codesSnapshot.docs.map((codeDoc) => {
                            return {
                                id: codeDoc.id,
                                parentId: groupDoc.id,
                                code: codeDoc.data().code,
                                done: codeDoc.data().done,
                                timestamp: codeDoc.data().timestamp ?? 0
                            }
                        })
                    }
                }
            )
        )
    },
    /**
     *  groupIDとサブコレクションとなるcodeIDに一致する、doneの値を更新する
     *
     * @param groupID
     * @param codeID sub collections
     * @param done
     */
    async updateCodeStatus(groupID: string, codeID: string, done: boolean) {
        try {
            const codeRef = doc(db, "scanned_code_group", groupID, "scanned_code", codeID);
            await updateDoc(codeRef, {done: done}); // updateDocによりドキュメントの一部（doneのみ）を更新
        } catch (error) {
            console.error("Firestore更新エラー:", error);
            throw error;
        }
    }
}
export default scannedCodeRepository
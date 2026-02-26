import {auth} from "../firebase.ts";
import { signInAnonymously } from "firebase/auth"

const Login = () => {

    const loginAnonymously = async () => {
        try {
            await signInAnonymously(auth);
            console.log("匿名ユーザーでログインしました")
        } catch (error) {
            console.error("匿名ユーザーでのログインに失敗しました。", error)
        }
    }

    return (
        <main className="bg-amber-300 min-h-screen pt-10">
            <div className="container mx-auto">
                <div className="bg-gray-100 shadow-md rounded-lg py-12 flex flex-col items-center">
                    <p className="mb-5 text-center">ログインを行なってください</p>
                    <button onClick={loginAnonymously} className="bg-white w-max border border-black py-2 px-4 rounded">
                        匿名ユーザーでログイン
                    </button>
                </div>
            </div>
        </main>
    )
}
export default Login
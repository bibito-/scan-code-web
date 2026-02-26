import type {User} from "@firebase/auth";
import {auth} from "../firebase.ts";
import {signOut} from "firebase/auth";

export interface HeaderProps {
    authenticatedUser: User | null;
}
const Header = ({authenticatedUser}: HeaderProps) => {
    const logout = async () => {
        try {
            await signOut(auth);
            console.log("ログアウトに成功しました。")
        } catch (error) {
            console.error("ログアウトに失敗しました。", error)
        }
    }
    return (
        <header>
            <div className="container flex justify-between items-center mx-auto px-2 h-20">
                <h1><a href="/" className="md:text-4xl text-3xl">QR Scanner</a></h1>
                <nav className="flex items-center gap-2">
                    <ul className="flex items-center gap-2">
                        {authenticatedUser ?
                            <button onClick={logout} className="bg-white w-max border border-black py-2 px-4 rounded">ログアウト</button>  : <li className="hidden lg:block">プレースホルダー</li>}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header;
import './App.css'
import Header from './components/Header'
import Home from "./pages/Content.tsx";
import Login from "./components/Login.tsx";
import {BrowserRouter, Route, Routes} from "react-router";
import NotFound from "./components/NotFound.tsx";
import {useEffect, useState} from "react";
import {onAuthStateChanged, type User} from "@firebase/auth"
import {auth} from "./firebase.ts";
import Loading from "./components/Loading.tsx";
import scannedCodeRepository from "./repository/scannedCodeRepository.ts";

function App() {
    const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            console.log("Firestore Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
            console.log("Auth User ID:", auth.currentUser?.uid);
            console.log("Is Anonymous:", auth.currentUser?.isAnonymous);
            // force push
            setUserAuthenticated(user)
            setIsLoading(false);
            scannedCodeRepository.fetchAllGroups()
                .then((result) => {
                    console.log("Success! Data:", result);
                    if (result && result.length === 0) {
                        console.warn("通信は成功しましたが、データが0件です。コレクション名や権限（ルール）を確認してください。");
                    }
                })
                .catch((error) => {
                    // もしドメイン制限や権限エラーがあれば、ここで捕まえられます
                    console.error("Firestore Fetch Error:", error.code, error.message);
                });
        })
    }, [])
    if (isLoading) {
        return <Loading/>
    }
    return (
        <BrowserRouter basename={"/scan-code-web"}>
            <Header authenticatedUser={userAuthenticated}/>
            <Routes>
                <Route path="/" element={userAuthenticated ? <Home/> : <Login/>}/>
                <Route path="/login" element={userAuthenticated ? <Home/> : <Login/>}/>
                <Route path="/*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App

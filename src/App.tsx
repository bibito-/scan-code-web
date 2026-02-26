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

function App() {
    const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            console.log("Firestore Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
            console.log("Auth User ID:", auth.currentUser?.uid);
            console.log("Is Anonymous:", auth.currentUser?.isAnonymous);
            setUserAuthenticated(user)
            setIsLoading(false);
        })
    }, [])
    if (isLoading) {
        console.log("userAuthenticated");
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

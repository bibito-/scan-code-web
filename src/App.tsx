import { onAuthStateChanged, type User } from "@firebase/auth";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import './App.css';
import Header from './components/Header';
import Loading from "./components/Loading.tsx";
import Login from "./components/Login.tsx";
import NotFound from "./components/NotFound.tsx";
import { auth } from "./firebase.ts";
import Home from "./pages/Content.tsx";

function App() {
    const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setUserAuthenticated(user)
            setIsLoading(false);
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

import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Admin } from "./features/admin/admin";
import { Loader } from "./features/loading/loader";
import { StyleLabeler } from "./features/style-labeler/StyleLabeler";
const Labeler = React.lazy(() => import("./features/labeler/Labeler"));
const Login = React.lazy(() => import("./features/login/Login"));
const Notfound = React.lazy(() => import("./features/notfound/Notfound"));

function App() {
    console.log(window.innerWidth, window.innerHeight);
    if (window.innerWidth < 600) {
        return (
            <div
                className="App"
                onContextMenu={(e) => {
                    e.preventDefault();
                    // console.log('stop default')
                    return false;
                }}
            >
                <div style={{ textAlign: "left", padding: '20px', boxSizing: 'border-box' }}>
                    <h1>注意</h1>
                    <p style={{fontSize: '20px'}}>请使用平板或者PC访问本页面，带来的不便敬请谅解。</p>
                    <div style={{width: '100%', height: '1px', backgroundColor: '#333'}}></div>
                    <p>如一定要使用手机标注请在Chrome/Firefox等浏览器中打开本页面，点击菜单栏选择<strong>“桌面版网站”</strong>再继续访问。</p>
                </div>
            </div>
        );
    }
    return (
        <div
            className="App"
            onContextMenu={(e) => {
                e.preventDefault();
                // console.log('stop default')
                return false;
            }}
        >
            <Routes>
                <Route
                    path="/"
                    element={
                        <React.Suspense fallback={<Loader />}>
                            <Labeler />
                        </React.Suspense>
                    }
                ></Route>
                <Route
                    path="/login"
                    element={
                        <React.Suspense fallback={<Loader />}>
                            <Login />
                        </React.Suspense>
                    }
                ></Route>
                <Route
                    path="/style"
                    element={
                        <React.Suspense fallback={<Loader />}>
                            <StyleLabeler />
                        </React.Suspense>
                    }
                ></Route>
                <Route
                    path="/admin"
                    element={
                        <React.Suspense fallback={<Loader />}>
                            <Admin />
                        </React.Suspense>
                    }
                ></Route>
                <Route
                    path="*"
                    element={
                        <React.Suspense fallback={<Loader />}>
                            <Notfound></Notfound>
                        </React.Suspense>
                    }
                ></Route>
            </Routes>
        </div>
    );
}

export default App;

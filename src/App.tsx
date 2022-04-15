import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Admin } from "./features/admin/admin";
import { Loader } from "./features/loading/loader";
const Labeler = React.lazy(() => import("./features/labeler/Labeler"));
const Login = React.lazy(() => import("./features/login/Login"));
const Notfound = React.lazy(() => import("./features/notfound/Notfound"));

function App() {
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

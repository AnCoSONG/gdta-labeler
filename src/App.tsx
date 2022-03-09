import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Labeler } from "./features/labeler/Labeler";
import { Login } from "./features/login/Login";
import { Notfound } from "./features/notfound/Notfound";

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
                <Route path="/" element={<Labeler />}></Route>
                <Route path="/login" element={<Login></Login>}></Route>
                <Route path="*" element={<Notfound />}></Route>
            </Routes>
        </div>
    );
}

export default App;

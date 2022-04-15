import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { error } from "../../utils/notify";

export const Admin = () => {
    const userState = useAppSelector((state) => state.user);
    const navigate = useNavigate();
    useEffect(() => {
        console.log(userState.role);
        if (userState.role !== "admin") {
            error("非管理员无法访问");
            navigate("/");
        }
    }, []);
    return (
        <div>
            <h1>Admin</h1>
        </div>
    );
};

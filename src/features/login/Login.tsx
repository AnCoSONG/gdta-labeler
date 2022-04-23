import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAppDispatch } from "../../app/hooks";
import { axios, checkInviteCode } from "../../utils";
import styles from "./Login.module.css";
import loader from "../../assets/loader.gif";
import { checkChar } from "../../utils";
import { error } from "../../utils/notify";
import { cryptolize } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export const Login = () => {
    // const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [invitecode, setInvitecode] = useState("");
    const [oddImg, setOddImg] = useState("");
    const [evenImg, setEvenImg] = useState("");
    const [showOdd, setShowOdd] = useState(true);
    const oddStatus = useRef(true);

    document.title = "Login";
    // 第一次载入时
    useEffect(() => {
        // on mount
        // const height = document.querySelector("#right")!.clientHeight;
        // const width = document.querySelector("#right")!.clientWidth;
        axios.get("/sample", { params: { count: 2 } }).then((res) => {
            setEvenImg(res.data[0].src);
            setOddImg(res.data[1].src);
        });

        if (localStorage.getItem("token")) {
            axios.get("/checkToken").then((res) => {
                if (res.data.auth.status === 0 || res.data.auth.status === 1) {
                    navigate("/");
                } else {
                    // 返回其他值说明refreshToken也过期了
                    localStorage.removeItem("token");
                    error("令牌已失效，请重新登录");
                }
            });
        }
    }, [navigate]);

    // 动态设置新图像
    useEffect(() => {
        if (window.innerWidth < 1100) return;
        // on showOdd changed
        // const height = document.querySelector("#right")!.clientHeight;
        // const width = document.querySelector("#right")!.clientWidth;
        let timeoutId: NodeJS.Timeout | null = null;
        axios.get("/sample", { params: { count: 1 } }).then((res) => {
            timeoutId = setTimeout(() => {
                // change src after transition done!
                if (showOdd) {
                    setEvenImg(res.data[0].src);
                } else {
                    setOddImg(res.data[0].src);
                }
            }, 501);
        });
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [showOdd]);
    // 定时切换odd/even图像
    useEffect(() => {
        if (window.innerWidth < 1100) return;
        const timer = setInterval(() => {
            setShowOdd(!oddStatus.current);
            oddStatus.current = !oddStatus.current;
            console.log(oddStatus.current);
        }, 10000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    const [isOddLoaded, setOddLoaded] = useState(false);
    const [isEvenLoaded, setEvenLoaded] = useState(false);

    // 登录 ========================
    const login = async () => {
        if (!checkChar(username)) {
            error("用户名格式有误");
            return;
        } else if (!checkChar(password)) {
            error("密码格式有误");
            return;
        } else if (!checkInviteCode(invitecode)) {
            error("邀请码格式有误");
            return;
        }

        try {
            const res = await axios.post("/login", {
                username,
                password: cryptolize(password),
                invitecode,
            });
            if (res.status === 200 || res.status === 201) {
                console.log("Login success");
                localStorage.setItem("token", res.data.data.access_token);
                localStorage.setItem("uid", res.data.auth._id);
                navigate("/");
            } else {
                console.log(res.status);
            }
        } catch (err) {
            console.error(err);
            error("登录失败, 请检查用户名密码和邀请码");
            setUsername("");
            setPassword("");
            setInvitecode("");
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const loginProcess = async () => {
        setIsLoading(true);
        await login();
        setIsLoading(false);
    };
    const onEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            await loginProcess();
        }
    };

    // 登录 ========================

    return (
        <div className={styles.wrapper} onKeyDown={onEnter}>
            <div className={styles.left}>
                <div className={styles.left_box}>
                    <div className={styles.left_box_title}>
                        <div className={styles.left_box_title_main}>Login</div>
                        <div className={styles.left_box_title_desc}>
                            登录分配给您的预置账号以方便统计您的打标数据。
                        </div>
                    </div>
                    <div className={styles.left_box_form}>
                        <input
                            className={styles.left_box_form_input}
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            className={styles.left_box_form_input}
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            className={styles.left_box_form_input}
                            placeholder="invitecode"
                            value={invitecode}
                            onChange={(e) => setInvitecode(e.target.value)}
                        />
                        <button
                            className={styles.left_box_form_btn}
                            onClick={async () => {
                                // 访问api查询是否正确
                                await loginProcess();
                            }}
                        >
                            {isLoading ? (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    spin
                                ></FontAwesomeIcon>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>
                    <div className={styles.left_box_footer}>GDTA@inlab</div>
                </div>
            </div>
            <div className={styles.right} id="right" data-showed="true">
                <img
                    className={styles.right_odd}
                    id="right_odd"
                    data-show={showOdd && isOddLoaded}
                    alt="random odd"
                    src={oddImg}
                    onLoadStart={() => setOddLoaded(false)}
                    onLoad={() => {
                        setOddLoaded(true);
                    }}
                />
                <img
                    className={styles.right_even}
                    id="right_even"
                    data-show={!showOdd && isEvenLoaded}
                    alt="random even"
                    src={evenImg}
                    onLoadStart={() => setEvenLoaded(false)}
                    onLoad={() => setEvenLoaded(true)}
                />
                <img
                    className={styles.right_loading}
                    style={{ opacity: isEvenLoaded && isOddLoaded ? 0 : 1 }}
                    alt="loader"
                    src={loader}
                    width="32"
                    height="32"
                />
            </div>
        </div>
    );
};

export default Login;

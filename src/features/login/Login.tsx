import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAppDispatch } from "../../app/hooks";
import { axios, seed } from "../../utils";
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
        const height = document.querySelector("#right")!.clientHeight;
        const width = document.querySelector("#right")!.clientWidth;
        setEvenImg(
            `https://picsum.photos/seed/${seed(100000)}/${width}/${height}`
        );
        setOddImg(
            `https://picsum.photos/seed/${seed(100000)}/${width}/${height}`
        );

        if (localStorage.getItem("token")) {
            axios.get('/checkToken').then(res => {
                if (res.data.auth.status === 0 || res.data.auth.status === 1){
                    navigate('/');
                } else {
                    // 返回其他值说明refreshToken也过期了
                    localStorage.removeItem('token');
                    error('令牌已失效，请重新登录')
                }
            })
        }
        
    }, [navigate]);

    // 动态设置新图像
    useEffect(() => {
        // on showOdd changed
        const height = document.querySelector("#right")!.clientHeight;
        const width = document.querySelector("#right")!.clientWidth;
        if (showOdd)
            setEvenImg(
                `https://picsum.photos/seed/${seed(100000)}/${width}/${height}`
            );
        else
            setOddImg(
                `https://picsum.photos/seed/${seed(100000)}/${width}/${height}`
            );
    }, [showOdd]);
    // 定时切换odd/even图像
    useEffect(() => {
        const timer = setInterval(() => {
            setShowOdd(!oddStatus.current);
            oddStatus.current = !oddStatus.current;
            console.log("showing odd:", oddStatus.current);
        }, 5000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    const [isOddLoaded, setOddLoaded] = useState(false);
    const [isEvenLoaded, setEvenLoaded] = useState(false);
    // odd图像加载判断
    useEffect(() => {
        const right_odd = document.getElementById("right_odd")!;
        right_odd.dataset.show = (showOdd && isOddLoaded).toString();
        console.log(`showing odd: ${showOdd}, is odd loaded: ${isOddLoaded}`);
    }, [isOddLoaded, showOdd]);

    // even图像加载判断
    useEffect(() => {
        const right_even = document.getElementById("right_even")!;
        right_even.dataset.show = (!showOdd && isEvenLoaded).toString();
        console.log(
            `showing event: ${!showOdd}, is even loaded: ${isEvenLoaded}`
        );
    }, [isEvenLoaded, showOdd]);

    // 登录 ========================
    const login = async () => {
        if (!checkChar(username)) {
            error("用户名不能为空且不能包含特殊符号");
            return;
        }
        else if (!checkChar(password)) {
            error("密码不能为空且不能包含特殊符号");
            return ;
        }
        else if (!checkChar(invitecode)) {
            error("邀请码不能为空且不能包含特殊符号");
            return ;
        }

        try {
            const res = await axios.post("/login", {
                username,
                password: cryptolize(password),
                invitecode,
            })
            if (res.status === 200 || res.status === 201) {
                console.log('Login success')
                localStorage.setItem('token', res.data.data.access_token)
                localStorage.setItem('uid', res.data.auth._id)
                navigate('/')
            } else {
                console.log(res.status)
            }
        }catch(err) {
            console.error(err)
            error('登录失败, 请检查用户名密码和邀请码')
            setUsername('')
            setPassword('')
            setInvitecode('')
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const loginProcess = async () => {
        setIsLoading(true);
        await login();
        setIsLoading(false);
    }
    const onEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            await loginProcess();
        }
    }


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
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin></FontAwesomeIcon> : "Login"}
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
                    onLoadStart={() => setEvenLoaded(false)}
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

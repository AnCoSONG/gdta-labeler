import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { seed } from "../../utils";
import { setLogin } from "../user/userSlice";
import styles from './Login.module.css';

export const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [invitecode, setInvitecode] = useState("")
    const [oddImg, setOddImg] = useState("")
    const [evenImg, setEvenImg] = useState("")
    const [showOdd, setShowOdd] = useState(true)
    const oddStatus = useRef(true)

    document.title = 'Login'
    useEffect(() => {
        // on mount
        const height = document.querySelector('#right')!.clientHeight
        const width = document.querySelector('#right')!.clientWidth
        setEvenImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
        setOddImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
    }, [])

    useEffect(() => {
        // on showOdd changed
        const height = document.querySelector('#right')!.clientHeight
        const width = document.querySelector('#right')!.clientWidth
        if(showOdd) setEvenImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
        else setOddImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
    }, [showOdd])
    useEffect(() => {
        const timer = setInterval(() => {
            setShowOdd(!oddStatus.current)
            oddStatus.current = !oddStatus.current
            console.log(oddStatus.current)
        }, 5000)
        return () => {
            clearInterval(timer)
        }
    }, [])
    return (
        <div className={styles.wrapper}>
            {/* <h1
                onClick={() => {
                    dispatch(setLogin({ id: "123", username: "anco" }));
                    navigate('/')
                    console.log('navigate back to /')
                }}
            >
                Login
            </h1> */}
            <div className={styles.left}>
                <div className={styles.left_box}>
                    <div className={styles.left_box_title}>
                        <div className={styles.left_box_title_main}>Login</div>
                        <div className={styles.left_box_title_desc}>登录分配给您的预置账号以方便统计您的打标数据。</div>
                        </div>    
                    <div className={styles.left_box_form}>
                        <input className={styles.left_box_form_input} placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                        <input type="password" className={styles.left_box_form_input} placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                        <input className={styles.left_box_form_input} placeholder="invitecode" value={invitecode} onChange={(e)=>setInvitecode(e.target.value)}/>
                        <button className={styles.left_box_form_btn}
                            onClick={() => {
                                // 访问api查询是否正确
                                dispatch(setLogin({ id: "", username: username, password: password, invitecode: invitecode }));
                                navigate('/')
                                console.log('navigate back to /')
                            }}
                        >Login</button>
                    </div>    
                    <div className={styles.left_box_footer}>GDTA@inlab</div>    
                </div>
            </div>
            <div className={styles.right} id="right">
                <img className={styles.right_odd} data-show={showOdd}
                alt="random odd" src={oddImg}/>
                <img className={styles.right_even} data-show={!showOdd}
                alt="random even" src={evenImg}
                />
            </div>
        </div>
    );
};

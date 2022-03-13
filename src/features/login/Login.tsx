import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { seed } from "../../utils";
import { setLogin } from "../user/userSlice";
import styles from './Login.module.css';
import loader from '../../assets/loader.gif'

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
    // 第一次载入时
    useEffect(() => {
        // on mount
        const height = document.querySelector('#right')!.clientHeight
        const width = document.querySelector('#right')!.clientWidth
        setEvenImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
        setOddImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)

        // 右侧渐入动画: 有点low
        // const timer = setTimeout(() => {
        //     const right = document.getElementById('right')!
        //     right.dataset.showed = true.toString()
        // }, 500)
        // console.log('123')
        // return () => {
        //     clearTimeout(timer)
        // }
    }, [])

    // 动态设置新图像
    useEffect(() => {
        // on showOdd changed
        const height = document.querySelector('#right')!.clientHeight
        const width = document.querySelector('#right')!.clientWidth
        if(showOdd) setEvenImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
        else setOddImg(`https://picsum.photos/seed/${seed(100000)}/${width}/${height}`)
    }, [showOdd])
    // 定时切换odd/even图像
    useEffect(() => {
        const timer = setInterval(() => {
            setShowOdd(!oddStatus.current)
            oddStatus.current = !oddStatus.current
            console.log('showing odd:', oddStatus.current)
        }, 5000)
        return () => {
            clearInterval(timer)
        }
    }, [])

    const [isOddLoaded, setOddLoaded]= useState(false)
    const [isEvenLoaded, setEvenLoaded] = useState(false)
    // odd图像加载判断
    useEffect(() => {
        const right_odd = document.getElementById('right_odd')!
        right_odd.dataset.show = (showOdd && isOddLoaded).toString()
        console.log(`showing odd: ${showOdd}, is odd loaded: ${isOddLoaded}`)
    }, [isOddLoaded, showOdd])

    // even图像加载判断
    useEffect(() => {
        const right_even = document.getElementById('right_even')!
        right_even.dataset.show = (!showOdd && isEvenLoaded).toString()
        console.log(`showing event: ${!showOdd}, is even loaded: ${isEvenLoaded}`)
    }, [isEvenLoaded, showOdd])
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
            <div className={styles.right} id="right" data-showed="true">
                <img className={styles.right_odd} id="right_odd" data-show={showOdd && isOddLoaded}
                        alt="random odd" src={oddImg} onLoadStart={() => setEvenLoaded(false)} onLoad={() => {setOddLoaded(true)}}/>
                <img className={styles.right_even} id="right_even" data-show={!showOdd && isEvenLoaded}
                    alt="random even" src={evenImg} onLoadStart={() => setEvenLoaded(false)} onLoad={() => setEvenLoaded(true)}/>
                <img className={styles.right_loading} style={{opacity: isEvenLoaded && isOddLoaded ? 0: 1}} alt="loader" 
                    src={loader} width="32" height="32"/>
                
            </div>
        </div>
    );
};

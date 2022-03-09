import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { setLogout } from "../user/userSlice"
import styles from './Labeler.module.css'
export const Labeler = () => {
    const userState = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    document.title = 'Label'

    useEffect(() => {
        // on mount
        if (userState.login === false) {
            console.log('Labeler: user is not logged in')
            navigate("/login")
        }
    }, [navigate, userState.login])
    return (
        <div className={styles.wrapper}>
            <h1 onClick={() => dispatch(setLogout())}>Labeler</h1>
        </div>
    )
}
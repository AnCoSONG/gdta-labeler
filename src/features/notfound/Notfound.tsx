import { useNavigate } from 'react-router-dom';
import styles from './Notfound.module.css'
export const Notfound = () => {
    const navigate = useNavigate()
    return (
        <div className={styles.wrapper}>
            <p className={styles.mark} onClick={
                () => {
                    navigate('/')
                }
            }>🛰️</p>
            <p>Lost in the universe<br/>click the icon to get back.</p>
        </div>
    );
}

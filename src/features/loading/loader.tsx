import styles from "./loader.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFan } from "@fortawesome/free-solid-svg-icons";
export const Loader = () => {
    return <div className={styles.loader_wrapper}>
        <FontAwesomeIcon icon={faFan} spin></FontAwesomeIcon>
    </div>;
};

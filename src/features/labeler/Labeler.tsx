import React, { useEffect, useState, createRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setLogout } from "../user/userSlice";
import styles from "./Labeler.module.scss";
import { getDataUrl, seed } from "../../utils";
import { Menu } from "../../comps/Menu";
import { HistoryItem } from "./HistoryItem";
import { Q1, Q2, Q3, Q4 } from "./Questions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import throttle from "lodash.throttle";
import { setLabelData } from './LabelSlice'
import { Tag, Dropdown } from "element-react";
import {
    faAngleLeft,
    faAngleRight,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faUserFriends,
    faClock,
    faAtom,
    faTags,
    faIdCard,
    faClose,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const getTransform = (DOM: Element) => {
    let arr = getComputedStyle(DOM).transform.split(",");
    return {
        transX: isNaN(+arr[arr.length - 2]) ? 0 : +arr[arr.length - 2], // 获取translateX
        transY: isNaN(+arr[arr.length - 1].split(")")[0])
            ? 0
            : +arr[arr.length - 1].split(")")[0], // 获取translateX
        multiple: +arr[3], // 获取图片缩放比例
    };
};

export const Labeler = () => {
    document.title = "Label";
    const userState = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // 支持历史记录 =========================
    const historyState = useAppSelector((state) => state.labeler.history);
    const [historyOn, setHistoryOn] = useState(false);
    const [page, setPage] = useState(1);
    const count = 10;
    const pageSize = 1;
    // 支持历史记录 =========================

    // 登录态验证 =========================
    useEffect(() => {
        // on mount
        if (userState.login === false) {
            console.log("Labeler: user is not logged in");
            navigate("/login");
        }
    }, [navigate, userState.login]);
    // 登录态验证 =========================

    // 支持图像动态加载和初始化 =========================
    const imgRef = createRef<HTMLImageElement>();
    const contentRef = createRef<HTMLDivElement>();
    const [imgLoaded, setImgLoaded] = useState(false);
    // 支持图像的放大查看
    const imgShowerBox = createRef<HTMLDivElement>();
    const imgShower = createRef<HTMLImageElement>();
    useEffect(() => {
        if (!imgLoaded) {
            console.log("Labeler: img is not loaded");
        } else {
            // 初始化时调整图像
            // 图像过大时，缩放至正常可显示大小
            // 图像过小时，通过变换把img放在content中心
            console.log("Labeler: img is loaded");
            const imgWidth = imgRef.current!.clientWidth;
            const imgHeight = imgRef.current!.clientHeight;
            const contentWidth = contentRef.current!.clientWidth;
            const contentHeight = contentRef.current!.clientHeight;
            const scaleW = imgWidth / contentWidth;
            const scaleH = imgHeight / contentHeight;
            const maxScale = Math.max(Math.max(scaleH, scaleW), 0.95) + 0.05;
            const newWidth = imgWidth / maxScale;
            const newHeight = imgHeight / maxScale;
            // 不论过大过小，都需要将图像放到content中心
            const imgLeft = (contentWidth - newWidth) / 2;
            const imgTop = (contentHeight - newHeight) / 2;
            imgRef.current!.style.width = `${newWidth}px`;
            imgRef.current!.style.height = `${newHeight}px`;
            imgRef.current!.style.left = `${imgLeft}px`;
            imgRef.current!.style.top = `${imgTop}px`;
            imgRef.current!.style.opacity = "1";
            console.log("init pos");
            imgShower.current!.src = imgRef.current!.src; //将图像src赋值给放大器
        }
        return () => {};
    }, [imgRef, imgLoaded, contentRef, imgShower]);
    // 支持图像动态加载和初始化 =========================

    // 支持图像操作 ==========================================================
    const dragging = useRef(false);
    const oldLeft = useRef(0);
    const oldTop = useRef(0);
    const onMousemovestart = (e: React.MouseEvent) => {
        // console.log("start", e);
        dragging.current = true;
        // 获取新的便=偏移中心
        oldLeft.current = e.clientX - getTransform(imgRef.current!).transX;
        oldTop.current = e.clientY - getTransform(imgRef.current!).transY;
    };
    const onMouseMoveover = throttle((e: React.MouseEvent) => {
        // console.log(e.clientX, e.clientY);
        if (dragging.current === true) {
            // console.log("moving", e);
            const newLeft = e.clientX;
            const newTop = e.clientY;
            const lastTransform = getTransform(imgRef.current!);
            // console.log(123, lastTransform)
            imgRef.current!.style.transform = `matrix(${
                lastTransform.multiple
            }, 0, 0, ${lastTransform.multiple}, ${newLeft - oldLeft.current}, ${
                newTop - oldTop.current
            })`;
            // console.log(imgRef.current!.style.transform);
        }
    }, 1000 / 90);

    const onMouseMoveend = (e: React.MouseEvent) => {
        if (dragging.current === true) {
            dragging.current = false;
            // console.log("up", e);
            oldLeft.current = 0;
            oldTop.current = 0;
            // imgRef.current!.style.left = `${currentLeft + lastTransform.transX}px`;
            // imgRef.current!.style.top = `${currentTop + lastTransform.transY}px`;
        }
    };

    const onMouseWheel = (e: React.WheelEvent) => {
        // console.log(e.deltaX, e.deltaY);

        const lastTransform = getTransform(imgRef.current!);
        if (e.deltaY > 0) {
            lastTransform.multiple *= 1.02;
        } else {
            lastTransform.multiple /= 1.02;
        }
        // console.log(lastTransform);
        imgRef.current!.style.transform = `matrix(${lastTransform.multiple}, 0, 0, ${lastTransform.multiple}, ${lastTransform.transX}, ${lastTransform.transY})`;
    };

    // 关闭展示器
    const toggleImgShower = (show: Boolean) => {
        if (show) {
            imgShowerBox.current!.style.zIndex = "1001";
            imgShowerBox.current!.style.opacity = "1";
        } else {
            imgShowerBox.current!.style.zIndex = "-1001";
            imgShowerBox.current!.style.opacity = "0";
        }
    };
    // 双击打开展示器
    const onDoubleClicked = (e: React.BaseSyntheticEvent) => {
        console.log("double clicked");
        toggleImgShower(true);
    };
    // 支持图像操作 ==========================================================

    // 支持纵向滚动（因为flex：1导致无法滚动） ======================================
    //! 新方案：为grid box设定高度！
    //！ flex：1导致高度无法精确计算，需要每层parent的高度都可计算才可以实现overflow-y:auto
    // const calcedHeight = useRef(0);
    // const innerBox = createRef<HTMLDivElement>();
    // const confirmBar = createRef<HTMLDivElement>();
    // useEffect(() => {
    //     const boxHeight = getComputedStyle(innerBox.current!).height;
    //     const confirmBarHeight = getComputedStyle(confirmBar.current!).height;
    //     confirmBar.current!.style.height = boxHeight + "px";
    //     calcedHeight.current =
    //         parseInt(boxHeight) - parseInt(confirmBarHeight) - 15 - 10;
    //     console.log(calcedHeight.current, boxHeight, confirmBarHeight);
    // }, [calcedHeight, innerBox, confirmBar]);
    // 支持纵向滚动（因为flex：1导致无法滚动） ======================================

    // 支持状态跟踪 status: still, loading, done
    const [status, setStatus] = useState<string>("still");

    // 打标数据记录
    const labelState = useAppSelector((state) => state.labeler.labelData);

    return (
        <div className={styles.wrapper}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <Menu on={historyOn} setOn={setHistoryOn}></Menu>
                    <div className={styles.logo}>GDTA Labeler</div>
                </div>
                <div className={styles.right}>
                    <div className={styles.btn}>DOC</div>
                    <div className={styles.btn}>HELP</div>
                    <Dropdown
                    onCommand={(e) => {
                        switch (e) {
                            case 'exit':
                                dispatch(setLogout())
                                break
                            default:
                                break
                        }
                    }}
                        menu={
                            <Dropdown.Menu
                                style={{ width: "150px", fontSize:'0.9rem', fontWeight: '400' }}
                            >
                                <Dropdown.Item>当前已完成999条</Dropdown.Item>
                                <Dropdown.Item command="exit" divided>退出</Dropdown.Item>
                            </Dropdown.Menu>
                        }
                    >
                        <div className={styles.user}>
                            <img
                                src={`https://avatars.dicebear.com/api/personas/123.svg`}
                                alt="avatar"
                                width={32}
                                height={32}
                            />
                        </div>
                    </Dropdown>
                </div>
            </nav>
            <main className={styles.main}>
                {/* Grid Layout */}
                <div className={styles.main_board_wrapper}>
                    <div className={styles.main_board_inner}>
                        <div className={styles.main_board_inner_title_wrapper}>
                            <div
                                className={
                                    styles.main_board_inner_title_wrapper_title
                                }
                            >
                                Image Title
                            </div>
                            <div
                                className={
                                    styles.main_board_inner_title_wrapper_infos
                                }
                            >
                                <div>
                                    <FontAwesomeIcon
                                        icon={faIdCard}
                                    ></FontAwesomeIcon>
                                    <span>123</span>
                                </div>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faUserFriends}
                                    ></FontAwesomeIcon>
                                    <span>Mark.Twin</span>
                                </div>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faClock}
                                    ></FontAwesomeIcon>
                                    <span>2020.02.04</span>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faAtom} />
                                    <span>Behance</span>
                                </div>
                                <div
                                    className={
                                        styles.main_board_inner_title_wrapper_infos_tags
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faTags}
                                    ></FontAwesomeIcon>
                                    {/* 这里根据后端数据 */}
                                    <span>
                                        <Tag type="primary">Abstract</Tag>
                                    </span>
                                    <span>
                                        <Tag type="primary">Modern Design</Tag>
                                    </span>
                                    <span>
                                        <Tag type="primary">
                                            Some thing else...
                                        </Tag>
                                    </span>
                                    <span>
                                        <Tag type="primary">Posters</Tag>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.main_board_inner_process}>
                            <div
                                id="content"
                                className={
                                    styles.main_board_inner_process_content
                                }
                                ref={contentRef}
                                onChange={(e) => console.log("content", e)}
                                draggable={false}
                                onMouseDown={(e) => onMousemovestart(e)}
                                onMouseMove={(e) => onMouseMoveover(e)}
                                onMouseUp={(e) => onMouseMoveend(e)}
                                onWheel={(e) => onMouseWheel(e)}
                            >
                                <img
                                    ref={imgRef}
                                    src="https://picsum.photos/800/500"
                                    alt=""
                                    onLoadStart={() => setImgLoaded(false)}
                                    onLoad={() => setImgLoaded(true)}
                                    draggable={false}
                                    onDoubleClick={(e) => onDoubleClicked(e)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.label_wrapper}>
                    <div className={styles.label_inner}>
                        <div
                            className={styles.label_cards_wrapper}
                            // style={{ height: `${calcedHeight.current}px` }}
                        >
                            <Q1/>
                            <Q2></Q2>
                            <Q3></Q3>
                            <Q4></Q4>
                        </div>
                        <div className={styles.label_confirm}>
                            <div className={styles.label_confirm_skip}>
                                跳过
                            </div>
                            <div
                                className={styles.label_confirm_confirm}
                                onClick={() => {
                                    switch (status) {
                                        case "still":
                                            // 检查是否填写完成
                                            // 或者未完成无法填写
                                            setStatus("loading");
                                            setTimeout(() => {
                                                setStatus("done");
                                            }, 1000);
                                            break;
                                        case "loading":
                                            // 加载时无法点击
                                            break;
                                        case "done":
                                            // 切换到下一个图像
                                            // 重新展示确认
                                            setStatus('still');
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                            >
                                {(() => {
                                    switch (status) {
                                        case "still":
                                            return "确认";
                                        case "loading":
                                            return (
                                                <FontAwesomeIcon
                                                    icon={faSpinner}
                                                    spin
                                                ></FontAwesomeIcon>
                                            );
                                        case "done":
                                            return "下一个";
                                        default:
                                            return "确认";
                                    }
                                })()}
                            </div>
                        </div>
                        {/* <div className={styles.}></div> */}
                    </div>
                </div>
            </main>
            <footer className={styles.footer}>GDTA@inlab</footer>
            <div
                className={styles.imgShower}
                ref={imgShowerBox}
                onClick={(e) => toggleImgShower(false)}
            >
                {/* 图像展示器，覆盖在最上层 */}
                <img alt="large view of pic" ref={imgShower} />
                <div
                    className={styles.imgShowerController}
                    onClick={(e) => {
                        toggleImgShower(false);
                    }}
                >
                    <FontAwesomeIcon icon={faClose}></FontAwesomeIcon>
                </div>
            </div>
            <div
                className={styles.shadow}
                data-on={historyOn}
                onClick={() => setHistoryOn(false)}
            ></div>
            <div className={styles.sidebar} data-on={historyOn}>
                <div className={styles.sidebar_title}>
                    <Menu on={historyOn} setOn={setHistoryOn}></Menu>
                    <div className={styles.sidebar_title_main}>History</div>
                </div>
                <div className={styles.sidebar_flexbox}>
                    {historyState.map((item) => {
                        return (
                            <HistoryItem
                                title={item.title}
                                id={item.id}
                                imgsrc={item.imgsrc}
                            />
                        );
                    })}
                </div>
                <div className={styles.pager}>
                    <div className={styles.pager_btn}>
                        <FontAwesomeIcon
                            icon={faAngleDoubleLeft}
                        ></FontAwesomeIcon>
                    </div>
                    <div className={styles.pager_btn}>
                        <FontAwesomeIcon icon={faAngleLeft}></FontAwesomeIcon>
                    </div>
                    <div className={styles.pager_btn}>
                        <input
                            className={styles.pager_input}
                            type="number"
                            value={page}
                            readOnly
                            onChange={(e) => setPage(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.pager_btn}>
                        <FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon>
                    </div>
                    <div className={styles.pager_btn}>
                        <FontAwesomeIcon
                            icon={faAngleDoubleRight}
                        ></FontAwesomeIcon>
                    </div>
                </div>
                <div className={styles.page_count}>
                    共 {count} 条记录, 共 {pageSize} 页
                </div>
            </div>
        </div>
    );
};

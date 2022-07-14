import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "../labeler/Labeler.module.scss";
// import { getDataUrl, seed } from "../../utils";
import { axios, navigateTo } from "../../utils";
import { Menu } from "../../comps/Menu";
import { HistoryItem } from "./HistoryItem";
import Q2 from "./Question";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import throttle from "lodash.throttle";
import { Tag, Dropdown, Checkbox } from "element-react/next";
import {
    faUserFriends,
    faClock,
    faAtom,
    faTags,
    faIdCard,
    faClose,
    faSpinner,
    faCaretDown,
    faFlag,
    faShare,
    faEdit,
    faAngleLeft,
    faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { error, messageAlert, success, warn } from "../../utils/notify";
import { setUserInfo, initUserState } from "../user/userSlice";
import {
    fetchHistoryAsync,
    fetchImageDataAsync,
    initLabelerState,
    LabelHistory,
    setLabelImageLoadedStatus,
    stylesMapping,
    updateHistoryStateAtIdx,
} from "./StyleLabelerSlice";
import { Loader } from "../loading/loader";
import { Button, Dialog, Pagination, Popover } from "element-react";

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

export const StyleLabeler = () => {
    document.title = "风格打标";
    const userState = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const labelCardsWrapperRef = useRef<HTMLDivElement>(null);

    const smoothScrollback = () => {
        if (labelCardsWrapperRef.current) {
            labelCardsWrapperRef.current!.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        } else {
            console.log("labelCardsWrapperRef.current is null");
        }
    };

    // 登录态验证 =========================
    // 检测本地是否有token，无则一定重定向到登录页
    useEffect(() => {
        console.log("登录态验证");
        const token = localStorage.getItem("token");
        if (token === null) {
            console.log("Labeler: token is not found");
            error("请先登录");
            // Message.error({message: "请先登录", customClass: "message", duration: 3000});
            navigate("/login");
        } else {
            // 如果有token 通过请求后端接口检测token是否过期，没过期则刷新token
            const uid = localStorage.getItem("uid")!;
            axios
                .get(`/labeler/${uid}`)
                .then(async (res) => {
                    // console.log(res)
                    await dispatch(
                        setUserInfo({
                            username: res.data.data.username,
                            id: res.data.data._id,
                            avatar: res.data.data.avatar,
                            invitecode: res.data.data.invitecode,
                            role: res.data.data.role,
                        })
                    );
                    // console.log(userState);
                    if (res.status === 200) {
                        // console.log('登录态验证完成', userState.id, localStorage.getItem("uid"));
                        // state无法立即生效，估计是在下个tick更新
                        if (res.data.auth.status === 1) {
                            console.log("Token Refreshed");
                            success(
                                res.data.data.username +
                                    ", 欢迎回来(令牌已刷新)."
                            );
                            // 加载图像
                            await dispatch(fetchImageDataAsync(uid));
                            smoothScrollback();
                        } else if (res.data.auth.status === 0) {
                            console.log("Labeler: token is valid");
                            success(res.data.data.username + ", 欢迎回来");
                            dispatch(fetchImageDataAsync(uid));
                            smoothScrollback();
                        } else {
                            console.log("Labeler: token is invalid");
                            localStorage.removeItem("token");
                            error(res.data.auth.msg);
                            navigate("/login");
                        }
                    } else {
                        // 这段代码进不来，不是20x,30x会直接throw error
                        console.log("Labeler: token is invalid");
                        localStorage.removeItem("token");
                        error("登录失效，请重新登录");
                        navigate("/login");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    error("登录失效，请重新登录");
                    localStorage.removeItem("token");
                    navigate("/login");
                });
        }
    }, [dispatch, navigate]);
    // 登录态验证 =========================

    // 支持图像动态加载和初始化 =========================
    // const imgRef = createRef<HTMLImageElement>();
    const imgRef = useRef<HTMLImageElement>(null);
    // const contentRef = createRef<HTMLDivElement>();
    const contentRef = useRef<HTMLDivElement>(null);
    // 支持图像的放大查看
    const imgShowerBox = useRef<HTMLDivElement>(null);
    const imgShower = useRef<HTMLImageElement>(null);
    const labelImage = useAppSelector((state) => state.styleLabeler.labelImage);
    const imgLoaded = useAppSelector(
        (state) => state.styleLabeler.labelImageLoaded
    );
    useEffect(() => {
        if (!imgLoaded) {
            console.log("Labeler: img is not loaded");
        } else {
            console.log("Labeler: img is loaded");
            const imgWidth = labelImage.width;
            const imgHeight = labelImage.height;
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
            console.log("pos inited");
            // console.log("img size", imgWidth, imgHeight, imgWidth/imgHeight);
            // console.log("browser viewport", window.innerWidth, window.innerHeight, window.innerWidth/window.innerHeight);
            const imgWHRatio = imgWidth / imgHeight;
            const viewportWHRatio = window.innerWidth / window.innerHeight;
            if (imgWHRatio > viewportWHRatio) {
                imgShowerBox.current!.dataset.mode = "horizontal";
            } else {
                imgShowerBox.current!.dataset.mode = "vertical";
            }
            // console.log(imgShower.current!.dataset);
            imgShower.current!.src = imgRef.current!.src; //将图像src赋值给放大器
        }
    }, [imgLoaded, labelImage.height, labelImage.width]);
    // 支持图像动态加载和初始化 =========================

    // 支持图像操作 ==========================================================
    const dragging = useRef(false);
    const oldLeft = useRef(0);
    const oldTop = useRef(0);
    const onMousemovestart = (e: React.MouseEvent) => {
        // console.log("start", e);
        dragging.current = true;
        // 获取新的偏移中心
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
        // console.log("double clicked");
        const imgWHRatio = labelImage.width / labelImage.height;
        const viewportWHRatio = window.innerWidth / window.innerHeight;
        if (imgWHRatio > viewportWHRatio) {
            imgShowerBox.current!.dataset.mode = "horizontal";
        } else {
            imgShowerBox.current!.dataset.mode = "vertical";
        }
        toggleImgShower(true);
    };
    // 支持图像操作 ==========================================================

    // 支持打标状态跟踪
    // 确认 status: still, loading
    const [confirmBtnStatus, setConfirmBtnStatus] = useState<string>("still");
    // 跳过 status: still, loading
    const [skipBtnStatus, setSkipBtnStatus] = useState<string>("still");
    const labelData = useAppSelector((state) => state.styleLabeler.labelData);
    const foribidden = useMemo(() => {
        return labelImage.title === "All Done";
    }, [labelImage.title]);
    const onConfirmClick = async (e: React.MouseEvent) => {
        if (foribidden) {
            error(
                "您已完成全部标注任务，您仍可以选择历史记录里的条目修改以往的打标"
            );
            return;
        }
        if (!imgLoaded) {
            error("请等待图像加载完成");
            return;
        }
        if (skipBtnStatus === "loading") {
            error("请等待跳过操作完成");
            return;
        }
        if (confirmBtnStatus === "still") {
            setConfirmBtnStatus("loading");
            // check if the image is already labeled
            // 如果其他元素都是false，则说明没有标注过
            const isQ2Filled = labelData.some((item) => item === true);
            // const result = isQ2Filled && isQ3Filled && isQ4Filled;
            const result = isQ2Filled;
            console.log(result, isQ2Filled);
            if (!result) {
                error("请至少选择一个风格");
                setConfirmBtnStatus("still");
                return;
            }
            // 上传打标记录
            const res = await axios
                .post(`/valid-tasks/finish`, {
                    img_id: labelImage._id,
                    img_src: labelImage.src,
                    img_title: labelImage.title,
                    labeler_id: userState.id,
                    styles: labelData,
                    created_time: labelImage.created_time,
                    finished: true,
                })
                .catch((err) => {
                    setConfirmBtnStatus("still");
                    error(err.name);
                });
            if (res) {
                if (res.status === 200 || res.status === 201) {
                    success("标注信息已上传");
                    localStorage.getItem("currentImg") &&
                        localStorage.removeItem("currentImg");
                    console.log("上传成功，已清除currentImg");
                    await dispatch(fetchImageDataAsync(userState.id));
                    setConfirmBtnStatus("still");
                    smoothScrollback();
                } else {
                    error("上传失败 " + res.statusText);
                    setConfirmBtnStatus("still");
                    throw new Error("失败");
                }
            }
        } else if (confirmBtnStatus === "loading") {
            warn("请等待确认操作完成");
            return false;
        } else {
            throw new Error("Unknow confirBtnStatus: " + confirmBtnStatus);
        }
    };

    // 跳过时
    async function onSkipClick(
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) {
        if (foribidden) {
            error(
                "您已完成全部标注任务，您仍可以选择历史记录里的条目修改以往的打标"
            );
            return;
        }
        if (!imgLoaded) {
            error("请等待图像加载完成");
            return;
        }

        if (confirmBtnStatus === "still") {
            if (skipBtnStatus === "still") {
                // 跳过表示打标人不太确定这张海报的标签
                setSkipBtnStatus("loading");
                // 先清除当前的currentImg记录
                localStorage.getItem("currentImg") &&
                    localStorage.removeItem("currentImg");
                //* finished: false 实现
                //* 这种skip会把当前没有打标好的数据也上传，但会标记为unfinished
                const create_unfinished_res = await axios
                    .post(`/valid-tasks/finish`, {
                        img_id: labelImage._id,
                        img_src: labelImage.src,
                        img_title: labelImage.title,
                        labeler_id: userState.id,
                        styles: labelData,
                        created_time: labelImage.created_time,
                        finished: false,
                    })
                    .catch((err) => {
                        setSkipBtnStatus("still");
                        error(err.name);
                    });
                if (create_unfinished_res) {
                    if (
                        create_unfinished_res.status === 200 ||
                        create_unfinished_res.status === 201
                    ) {
                        success("已跳过，标注内容已缓存");
                        // 获取下一张
                        await dispatch(fetchImageDataAsync(userState.id));
                        setSkipBtnStatus("still");
                        smoothScrollback();
                    } else {
                        error("跳过失败 " + create_unfinished_res.statusText);
                        setConfirmBtnStatus("still");
                        throw new Error("失败");
                    }
                }
            }
        } else {
            error("您已选择确认，请完成确认操作");
        }
    }

    //? 打标完成禁止页面再进行交互
    // 通过forbidden || !imgLoaded 来判断

    //? 已标注 / 全部, 跳过待完成 信息获取和展示 ===========================
    const [imgCount, setImgCount] = useState(0);
    const [labeledCount, setLabeledCount] = useState(0);
    const [unfinishedCount, setUnfinishedCount] = useState(0);
    const [currentTaskData, setCurrentTaskData] = useState({
        range: [0, 0],
        progress: 0,
    });
    const currentTaskImgCount = useMemo(
        () => currentTaskData.range[1] - currentTaskData.range[0],
        [currentTaskData]
    );
    const toBeLabeledCount = useMemo(
        () => imgCount - labeledCount - unfinishedCount,
        [imgCount, labeledCount, unfinishedCount]
    );
    const currentTaskToBeLabeledCount = useMemo(
        () => currentTaskImgCount - currentTaskData.progress,
        [currentTaskData.progress, currentTaskImgCount]
    );

    const onDropdownHoverGetData = async (e: boolean) => {
        // console.log(e);
        if (e) {
            const [
                imgCountRes,
                labeledCountRes,
                unfinishedCountRes,
                currentTask,
            ] = await Promise.all([
                axios.get("/valid-imgs/count").catch((e) => {
                    error(e.name);
                    console.error(e);
                    return null;
                }),
                axios
                    .get("/valid-records/count", {
                        params: {
                            labeler_id: userState.id,
                            finished: true,
                        },
                    })
                    .catch((e) => {
                        error(e.name);
                        console.error(e);
                        return null;
                    }),
                axios
                    .get("/valid-records/count", {
                        params: {
                            labeler_id: userState.id,
                            finished: false,
                        },
                    })
                    .catch((e) => {
                        error(e.name);
                        console.error(e);
                        return null;
                    }),
                axios
                    .get("/valid-tasks/getCurrentTask", {
                        params: {
                            labeler_id: userState.id,
                        },
                    })
                    .catch((e) => {
                        error(e.name);
                        console.error(e);
                        return null;
                    }),
            ]);
            if (imgCountRes) {
                setImgCount(imgCountRes.data.data);
            }
            if (labeledCountRes) {
                setLabeledCount(labeledCountRes.data.data);
            }
            if (unfinishedCountRes) {
                setUnfinishedCount(unfinishedCountRes.data.data);
            }

            if (currentTask) {
                if (currentTask.data.data) {
                    setCurrentTaskData({
                        range: currentTask.data.data.range,
                        progress: currentTask.data.data.progress,
                    });
                }
            }
        }
    };
    //? 已标注 / 全部, 已跳过 信息获取和展示 ====================

    //? 历史记录 =================
    const historyState = useAppSelector((state) => state.styleLabeler.history);
    const [historyOn, setHistoryOn] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const countState = useAppSelector((state) => state.styleLabeler.count);
    const [finishedSelected, setFinishedSelected] = useState(true);
    const [skippedSelected, setSkippedSelected] = useState(true);
    const query_type = useMemo(() => {
        if (finishedSelected && skippedSelected) {
            return "all";
        } else if (finishedSelected) {
            return "finished";
        } else if (skippedSelected) {
            return "skipped";
        } else {
            return "none";
        }
    }, [finishedSelected, skippedSelected]);

    useEffect(() => {
        if (historyOn) {
            const refreshHistory = async () => {
                setHistoryLoading(true);
                console.log(query_type);
                await dispatch(
                    fetchHistoryAsync({
                        labeler_id: userState.id,
                        page,
                        limit,
                        query_type: query_type,
                    })
                ).catch((e) => {
                    error(e.name);
                    console.error(e);
                    setHistoryLoading(false);
                });
                setHistoryLoading(false);
            };
            refreshHistory();
        }
    }, [dispatch, query_type, historyOn, limit, page, userState.id]);

    useEffect(() => {
        if (historyOn) {
            setPage(1); // 设到第一页
        }
    }, [historyOn]);

    //? 历史记录 =================

    //? 打开dialog ====================
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogCurrentDataIndex, setDialogCurrentDataIndex] = useState(0);
    const [dialogCurrentData, setDialogCurrentData] = useState<LabelHistory>();
    const [dialogConfirmLoading, setDialogConfirmLoading] = useState(false);
    useEffect(() => {
        // console.log(dialogCurrentDataIndex);
        setDialogCurrentData(historyState[dialogCurrentDataIndex]);
    }, [dialogCurrentDataIndex, historyState]);
    const dialogTitle = useMemo(() => {
        if (dialogCurrentData) {
            return `"${dialogCurrentData.img_title}"的标注记录`;
        } else {
            return "未知标注记录";
        }
    }, [dialogCurrentData]);

    const checkboxStyles = useMemo(() => {
        const checked: string[] = [];
        if (dialogCurrentData) {
            dialogCurrentData.styles.forEach((item, index) => {
                if (item) {
                    checked.push(index.toString());
                }
            });
        }
        return checked;
    }, [dialogCurrentData]);

    const done = useAppSelector((state) => state.styleLabeler.done);

    // todo: 优化至labelerSlice
    const [finishedTasks, setFinishedTasks] = useState<
        {
            _id: string;
            range: [number, number];
            progress: number;
            finished: boolean;
        }[]
    >([]);
    useEffect(() => {
        if (done) {
            axios
                .get("/valid-tasks/getFinishedTask", {
                    params: {
                        labeler_id: userState.id,
                    },
                })
                .then((res) => {
                    if (res) {
                        setFinishedTasks(res.data.data);
                    }
                })
                .catch((e) => {
                    error(e.name);
                    console.error(e);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [done, userState.id]);

    // 申请
    function applyNewTask(
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void {
        e.preventDefault();
        messageAlert("请联系工具人钉钉或微信申请", "提示");
    }

    // 对话框内编辑

    const handleEditSave = async (finished = false) => {
        if (dialogCurrentData) {
            // 如果有变化
            const res = await axios
                .post(`/valid-tasks/updateRecord`, {
                    img_id: dialogCurrentData.img_id,
                    labeler_id: userState.id,
                    styles: dialogCurrentData.styles,
                    finished,
                })
                .catch((err) => {
                    error(err.name);
                    return null;
                });
            if (res) {
                console.log("updateRecord", res);
                // 更新history state里面的值
                dispatch(
                    updateHistoryStateAtIdx({
                        idx: dialogCurrentDataIndex,
                        styles: dialogCurrentData.styles,
                        finished,
                    })
                );
                setTimeout(() => {
                    console.log(
                        dialogCurrentDataIndex,
                        dialogCurrentData,
                        historyState[dialogCurrentDataIndex]
                    );
                }, 0);
            }
        }
    };

    const [saveBtnText, setSaveBtnText] = useState("保存编辑");

    return (
        <div className={styles.wrapper}>
            <nav className={styles.nav}>
                <div className={styles.left}>
                    <Menu
                        on={historyOn}
                        onClick={(e) => {
                            setHistoryOn(true);
                        }}
                    ></Menu>
                    <div className={styles.logo}>GDTA 风格打标工具</div>
                    <div
                        className={styles.btn}
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        切换至：有效性打标
                    </div>
                </div>
                <div className={styles.right}>
                    <Dropdown
                        onCommand={(command) => {
                            switch (command) {
                                case "0":
                                    navigateTo(
                                        "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a#tCfuc"
                                    );
                                    break;
                                case "1":
                                    navigateTo(
                                        "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a#PRJSc"
                                    );
                                    break;
                                case "2":
                                    navigateTo(
                                        "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a#bahrq"
                                    );
                                    break;
                                case "3":
                                    navigateTo(
                                        "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a#omA7s"
                                    );
                                    break;
                                case "4":
                                    navigateTo(
                                        "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a#llon8"
                                    );
                                    break;
                                default:
                                    break;
                            }
                        }}
                        menu={
                            <Dropdown.Menu
                                style={{
                                    width: "200px",
                                    fontSize: "0.9rem",
                                    fontWeight: "400",
                                }}
                            >
                                <Dropdown.Item command="0">
                                    界面与交互
                                </Dropdown.Item>
                                <Dropdown.Item command="1">
                                    有效性判断
                                </Dropdown.Item>
                                <Dropdown.Item command="2">
                                    风格标注
                                </Dropdown.Item>
                                <Dropdown.Item command="3">
                                    受众年龄标注
                                </Dropdown.Item>
                                <Dropdown.Item command="4">
                                    受众性别标注
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        }
                    >
                        <div
                            className={styles.btn}
                            onClick={() =>
                                navigateTo(
                                    "https://ai-design.yuque.com/docs/share/48d867b0-246f-46ae-ab44-dc1e8fc2c00a?#"
                                )
                            }
                            style={{ color: "black" }}
                        >
                            Doc
                        </div>
                    </Dropdown>
                    <div
                        className={styles.btn}
                        onClick={() => {
                            messageAlert(
                                "暂不支持, 请私信工具人钉钉。如因图像标注问题, 私信时请提供图像的ID",
                                "提示"
                            );
                        }}
                    >
                        Feedback
                    </div>
                    <Dropdown
                        onCommand={async (e) => {
                            switch (e) {
                                case "exit":
                                    localStorage.getItem("token") &&
                                        localStorage.removeItem("token");
                                    localStorage.getItem("uid") &&
                                        localStorage.removeItem("uid");
                                    localStorage.getItem("currentImg") &&
                                        localStorage.removeItem("currentImg");
                                    await dispatch(initLabelerState());
                                    await dispatch(initUserState());
                                    // todo: 优化实现
                                    setFinishedTasks([]);
                                    navigate("/login");
                                    break;
                                case "admin":
                                    navigate("/admin");
                                    break;
                                default:
                                    break;
                            }
                        }}
                        // @ts-ignore
                        onVisibleChange={onDropdownHoverGetData}
                        menu={
                            <Dropdown.Menu
                                style={{
                                    width: "240px",
                                    fontSize: "0.9rem",
                                    fontWeight: "400",
                                }}
                            >
                                <Dropdown.Item>
                                    用户名: {userState.username}
                                </Dropdown.Item>
                                {userState.role === "admin" && (
                                    <Dropdown.Item command="admin">
                                        管理面板
                                    </Dropdown.Item>
                                )}
                                {currentTaskImgCount != null &&
                                    currentTaskImgCount > 0 && (
                                        <>
                                            <Dropdown.Item divided>
                                                当前任务范围 [
                                                {currentTaskData.range[0]},{" "}
                                                {currentTaskData.range[1]})
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                当前任务共完成/跳过{" "}
                                                {currentTaskData.progress} 张
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                当前任务共 {currentTaskImgCount}{" "}
                                                张
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                当前任务还有{" "}
                                                {currentTaskToBeLabeledCount}张
                                                待标注
                                            </Dropdown.Item>
                                        </>
                                    )}
                                <Dropdown.Item divided>
                                    共完成 {labeledCount} 张
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    共跳过 {unfinishedCount} 张
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    共还有 {toBeLabeledCount} 张可标注
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    总共 {imgCount} 张
                                </Dropdown.Item>

                                <Dropdown.Item command="exit" divided>
                                    退出登录
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        }
                    >
                        <div className={styles.user}>
                            <img
                                src={userState.avatar}
                                alt="avatar"
                                width={32}
                                height={32}
                            />
                        </div>
                    </Dropdown>
                </div>
            </nav>
            {!done ? (
                <main className={styles.main}>
                    {/* Grid Layout */}
                    <div className={styles.main_board_wrapper}>
                        <div className={styles.main_board_inner}>
                            <div
                                className={
                                    styles.main_board_inner_title_wrapper
                                }
                            >
                                <div
                                    className={
                                        styles.main_board_inner_title_wrapper_title
                                    }
                                >
                                    {imgLoaded
                                        ? labelImage.title
                                        : "Loading..."}
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
                                        <Popover
                                            trigger="hover"
                                            content={"ID: " + labelImage._id}
                                            width="auto"
                                        >
                                            <span
                                                style={{
                                                    color: "white",
                                                    borderRadius: "4px",
                                                    backgroundColor: "#5e5e5e",
                                                    padding: "2px 4px",
                                                }}
                                            >
                                                {imgLoaded
                                                    ? labelImage._id.slice(
                                                          16,
                                                          24
                                                      )
                                                    : "Unknown"}
                                            </span>
                                        </Popover>
                                    </div>
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faUserFriends}
                                        ></FontAwesomeIcon>
                                        <span
                                            style={{
                                                maxWidth: "100px",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {imgLoaded
                                                ? labelImage.author
                                                : "Unknown"}
                                        </span>
                                    </div>
                                    <div>
                                        <FontAwesomeIcon
                                            icon={faClock}
                                        ></FontAwesomeIcon>
                                        <span
                                            style={{
                                                maxWidth: "100px",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {imgLoaded
                                                ? labelImage.created_time
                                                : "Unknown"}
                                        </span>
                                    </div>
                                    <div>
                                        <FontAwesomeIcon icon={faAtom} />
                                        <a
                                            target="_blank"
                                            href={labelImage.project_url}
                                            rel="noreferrer"
                                        >
                                            {imgLoaded
                                                ? labelImage.source
                                                : "Unknown"}
                                        </a>
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
                                        {labelImage.tags &&
                                            labelImage.tags.map(
                                                (tag, index) => {
                                                    return (
                                                        <span key={tag + index}>
                                                            <Tag type="primary">
                                                                {tag}
                                                            </Tag>
                                                        </span>
                                                    );
                                                }
                                            )}
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
                                        src={labelImage.src}
                                        alt=""
                                        onLoad={() => {
                                            console.log("onload");
                                            // setImgLoaded(true)
                                            dispatch(
                                                setLabelImageLoadedStatus(true)
                                            );
                                        }}
                                        draggable={false}
                                        onDoubleClick={(e) =>
                                            onDoubleClicked(e)
                                        }
                                    />
                                    {!imgLoaded && <Loader />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.label_wrapper}>
                        <div className={styles.label_inner}>
                            <div
                                className={styles.label_cards_wrapper}
                                ref={labelCardsWrapperRef}
                                // style={{ height: `${calcedHeight.current}px` }}
                            >
                                {/* <Q1
                                    onDoubleClick={(e: React.MouseEvent) => {
                                        if (stage === STAGE.ONLY_VALID) {
                                            onConfirmClick(e);
                                        }
                                    }}
                                /> */}
                                <Q2 no={1}></Q2>
                            </div>
                            <div className={styles.label_confirm}>
                                <div
                                    className={styles.label_confirm_skip}
                                    data-forbidden={foribidden || !imgLoaded}
                                    onClick={(e) => onSkipClick(e)}
                                >
                                    {(() => {
                                        switch (skipBtnStatus) {
                                            case "still":
                                                return "跳过";
                                            case "loading":
                                                return (
                                                    <FontAwesomeIcon
                                                        icon={faSpinner}
                                                        spin
                                                    ></FontAwesomeIcon>
                                                );
                                            default:
                                                return "跳过";
                                        }
                                    })()}
                                </div>
                                <div
                                    className={styles.label_confirm_confirm}
                                    data-forbidden={foribidden || !imgLoaded}
                                    onClick={(e) => {
                                        onConfirmClick(e);
                                    }}
                                >
                                    {(() => {
                                        switch (confirmBtnStatus) {
                                            case "still":
                                                return "确认";
                                            case "loading":
                                                return (
                                                    <FontAwesomeIcon
                                                        icon={faSpinner}
                                                        spin
                                                    ></FontAwesomeIcon>
                                                );
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
            ) : (
                <main className={styles.main_done}>
                    <div className={styles.main_done_wrapper}>
                        <div className={styles.main_done_wrapper_title}>
                            <div
                                className={styles.main_done_wrapper_title_text}
                            >
                                GDTA 打标工具
                            </div>
                            <div
                                className={styles.main_done_wrapper_title_desc}
                            >
                                {finishedTasks.length > 0
                                    ? `您已完成${finishedTasks.length}项任务`
                                    : "您暂无打标任务"}
                            </div>
                        </div>
                        <div className={styles.main_done_wrapper_content}>
                            <div
                                className={
                                    styles.main_done_wrapper_content_column
                                }
                            >
                                <div
                                    className={
                                        styles.main_done_wrapper_content_column_title
                                    }
                                >
                                    操作
                                </div>
                                <div
                                    className={
                                        styles.main_done_wrapper_content_item
                                    }
                                    onClick={(e) => applyNewTask(e)}
                                >
                                    <div
                                        className={
                                            styles.main_done_wrapper_content_item_icon
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faShare}
                                        ></FontAwesomeIcon>
                                    </div>
                                    <div
                                        className={
                                            styles.main_done_wrapper_content_item_right
                                        }
                                    >
                                        <div
                                            className={
                                                styles.main_done_wrapper_content_item_right_title
                                            }
                                        >
                                            申请新打标任务
                                        </div>
                                        <div
                                            className={
                                                styles.main_done_wrapper_content_item_right_desc
                                            }
                                        >
                                            您也可以直接联系工具人
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles.main_done_wrapper_content_item
                                    }
                                    onClick={(e) => {
                                        setHistoryOn(true);
                                    }}
                                >
                                    <div
                                        className={
                                            styles.main_done_wrapper_content_item_icon
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                        ></FontAwesomeIcon>
                                    </div>
                                    <div
                                        className={
                                            styles.main_done_wrapper_content_item_right
                                        }
                                    >
                                        <div
                                            className={
                                                styles.main_done_wrapper_content_item_right_title
                                            }
                                        >
                                            编辑已完成内容
                                        </div>
                                        <div
                                            className={
                                                styles.main_done_wrapper_content_item_right_desc
                                            }
                                        >
                                            您也可以点击左上角按钮进行编辑
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={
                                    styles.main_done_wrapper_content_column
                                }
                            >
                                <div
                                    className={
                                        styles.main_done_wrapper_content_column_title
                                    }
                                >
                                    已完成
                                </div>
                                <div
                                    className={
                                        styles.main_done_wrapper_content_column_scrollview
                                    }
                                >
                                    {finishedTasks.length > 0 ? (
                                        finishedTasks.map((item) => {
                                            return (
                                                <div
                                                    key={item._id}
                                                    className={
                                                        styles.main_done_wrapper_content_item2
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.main_done_wrapper_content_item2_text
                                                        }
                                                    >
                                                        <b>打标任务 ID</b>:{" "}
                                                        {item._id
                                                            .split("")
                                                            .slice(16, 24)
                                                            .join("")}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.main_done_wrapper_content_item2_text
                                                        }
                                                    >
                                                        <b>范围</b>:{" "}
                                                        {item.range[0] +
                                                            " - " +
                                                            item.range[1]}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ textAlign: "left" }}>
                                            暂无已完成的打标任务
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
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
            <Dialog
                visible={dialogVisible}
                title={dialogTitle}
                size="small"
                top="0"
                onCancel={() => {
                    setDialogVisible(false);
                }}
            >
                <Dialog.Body>
                    <div className={styles.dialog_content}>
                        {!dialogCurrentData ? (
                            <div className={styles.dialog_content_nodata}>
                                NOT AVAILABLE
                            </div>
                        ) : (
                            <>
                                <div
                                    className={styles.dialog_content_left_right}
                                >
                                    <FontAwesomeIcon
                                        icon={faAngleLeft}
                                        onClick={() => {
                                            if (dialogCurrentDataIndex === 0) {
                                                return;
                                            }
                                            setDialogCurrentDataIndex(
                                                dialogCurrentDataIndex - 1
                                            );
                                            // setDialogCurrentData(
                                            //     historyState[
                                            //         dialogCurrentDataIndex
                                            //     ]
                                            // );
                                        }}
                                        className={
                                            styles.dialog_content_cover_left
                                        }
                                        style={{
                                            color:
                                                dialogCurrentDataIndex === 0
                                                    ? "#ccc"
                                                    : "#000",
                                        }}
                                    ></FontAwesomeIcon>
                                    <FontAwesomeIcon
                                        icon={faAngleRight}
                                        onClick={() => {
                                            if (
                                                dialogCurrentDataIndex ===
                                                historyState.length - 1
                                            ) {
                                                return;
                                            }
                                            setDialogCurrentDataIndex(
                                                dialogCurrentDataIndex + 1
                                            );
                                            // setDialogCurrentData(
                                            //     historyState[
                                            //         dialogCurrentDataIndex
                                            //     ]
                                            // );
                                        }}
                                        className={
                                            styles.dialog_content_cover_right
                                        }
                                        style={{
                                            color:
                                                dialogCurrentDataIndex ===
                                                historyState.length - 1
                                                    ? "#ccc"
                                                    : "#000",
                                        }}
                                    ></FontAwesomeIcon>
                                </div>
                                <div className={styles.dialog_content_cover}>
                                    <img
                                        src={dialogCurrentData.img_src}
                                        alt={dialogCurrentData.img_title}
                                    />
                                </div>
                                <div className={styles.dialog_content_info}>
                                    <div
                                        className={
                                            styles.dialog_content_info_wrapper
                                        }
                                    >
                                        <div
                                            className={
                                                styles.dialog_conntent_info_name
                                            }
                                        >
                                            Image ID
                                        </div>
                                        <div
                                            className={
                                                styles.dialog_conntent_info_data
                                            }
                                        >
                                            {dialogCurrentData.img_id}
                                        </div>
                                    </div>
                                    <div
                                        className={
                                            styles.dialog_content_info_wrapper
                                        }
                                    >
                                        <div
                                            className={
                                                styles.dialog_conntent_info_name
                                            }
                                        >
                                            风格
                                        </div>
                                        <div
                                            className={
                                                styles.dialog_conntent_info_data
                                            }
                                        >
                                            <Checkbox.Group
                                                value={checkboxStyles}
                                                onChange={(value) => {
                                                    console.log(value);
                                                    const numberValue: number[] =
                                                        value.map(
                                                            (item: string) =>
                                                                parseInt(item)
                                                        );
                                                    const newStyles = new Array(
                                                        8
                                                    )
                                                        .fill(false)
                                                        .map((item, index) => {
                                                            return numberValue.includes(
                                                                index
                                                            );
                                                        });
                                                    setDialogCurrentData({
                                                        ...dialogCurrentData,
                                                        styles: newStyles,
                                                    });
                                                }}
                                            >
                                                {stylesMapping.map(
                                                    (item, index) => {
                                                        return (
                                                            <Checkbox
                                                                label={index.toString()}
                                                            >
                                                                {item}
                                                            </Checkbox>
                                                        );
                                                    }
                                                )}
                                            </Checkbox.Group>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button onClick={() => setDialogVisible(false)}>
                        取消
                    </Button>
                    <Button
                        type={
                            saveBtnText === "保存编辑" ? "primary" : "success"
                        }
                        onClick={async () => {
                            if (saveBtnText === "保存编辑") {
                                setDialogConfirmLoading(true);
                                await handleEditSave(true);
                                setDialogConfirmLoading(false);
                                setSaveBtnText("已保存!");
                                setTimeout(() => {
                                    setSaveBtnText("保存编辑");
                                }, 1000);
                            }
                        }}
                    >
                        {dialogConfirmLoading ? (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                            ></FontAwesomeIcon>
                        ) : (
                            saveBtnText
                        )}
                    </Button>
                </Dialog.Footer>
            </Dialog>
            <div className={styles.sidebar} data-on={historyOn}>
                {/* 完成新的设计稿和后端交互方案 */}
                <div className={styles.sidebar_title}>
                    <Menu
                        on={historyOn}
                        onClick={(e) => setHistoryOn(false)}
                    ></Menu>
                    <div className={styles.sidebar_title_main}>
                        <div>风格打标历史记录</div>
                        <Dropdown
                            hideOnClick={false}
                            menu={
                                <Dropdown.Menu>
                                    <Dropdown.Item>
                                        <Checkbox
                                            checked={finishedSelected}
                                            onChange={async (e) => {
                                                // 修改显示类型时自动回到第一页
                                                setPage(1);
                                                setFinishedSelected(e);
                                            }}
                                        >
                                            已完成
                                        </Checkbox>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <Checkbox
                                            checked={skippedSelected}
                                            onChange={async (e) => {
                                                setPage(1);
                                                setSkippedSelected(e);
                                            }}
                                        >
                                            已跳过
                                        </Checkbox>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            }
                        >
                            <div className={styles.sidebar_title_query_control}>
                                <span>
                                    Query type{" "}
                                    <FontAwesomeIcon
                                        icon={faCaretDown}
                                    ></FontAwesomeIcon>
                                </span>
                            </div>
                        </Dropdown>
                    </div>
                </div>
                <div className={styles.sidebar_flexbox}>
                    {historyLoading ? (
                        <Loader />
                    ) : historyState.length > 0 ? (
                        historyState.map((item, index) => {
                            return (
                                <HistoryItem
                                    onClick={(e) => {
                                        setDialogCurrentDataIndex(index);
                                        // setDialogCurrentData(item);
                                        setDialogVisible(true);
                                    }}
                                    key={item._id}
                                    _id={item._id}
                                    finished={item.finished}
                                    img_id={item.img_id}
                                    img_title={item.img_title}
                                    img_src={item.img_src}
                                    styles={item.styles}
                                />
                            );
                        })
                    ) : (
                        <div className={styles.sidebar_nodata}>
                            <div className={styles.sidebar_nodata_icon}>
                                <FontAwesomeIcon
                                    icon={faFlag}
                                ></FontAwesomeIcon>
                            </div>
                            <div className={styles.sidebar_nodata_text}>
                                Nothing Found
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.pager}>
                    <Pagination
                        layout="sizes, prev, pager, next"
                        total={countState}
                        small={false}
                        pageSizes={[
                            1, 2, 5, 10, 15, 25, 50, 100, 200, 500, 1000,
                        ]}
                        currentPage={page}
                        onCurrentChange={(page) => {
                            if (page) {
                                setPage(page);
                            } else {
                                error("error when set page");
                            }
                        }}
                        pageSize={limit}
                        onSizeChange={(size) => {
                            if (size) {
                                setPage(1);
                                setLimit(size);
                            } else {
                                error("error when set limit");
                            }
                        }}
                    />
                    <div className={styles.page_count}>共 {countState} 条</div>
                </div>
            </div>
        </div>
    );
};

export default StyleLabeler;

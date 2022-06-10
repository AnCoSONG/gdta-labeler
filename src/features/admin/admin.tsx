import {
    faAdd,
    faAsterisk,
    faCode,
    faHomeAlt,
    faIdBadge,
    faIdCardAlt,
    faLifeRing,
    faSync,
    faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Button,
    Dialog,
    Form,
    Input,
    InputNumber,
    Progress,
    Select,
} from "element-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    axios,
    checkChar,
    checkInviteCode,
    checkUsername,
    cryptolize,
} from "../../utils";
import { error, messageConfirm, notification } from "../../utils/notify";
import styles from "./admin.module.scss";
import {
    fetchGlobalProgress,
    fetchTasks,
    fetchUsers,
    fetchValidGlobalProgress,
    fetchValidTasks,
} from "./adminSlice";

export const Admin = () => {
    document.title = "管理面板";
    const userState = useAppSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const tasks = useAppSelector((state) => state.admin.tasks);
    const validTasks = useAppSelector((state) => state.admin.validTasks);
    const labelers = useAppSelector((state) => state.admin.users);

    useEffect(() => {
        console.log(userState.role);
        if (userState.role !== "admin") {
            error("非管理员无法访问");
            navigate("/");
        }
        // 拿数据
        dispatch(fetchTasks());
        dispatch(fetchUsers());
        dispatch(fetchGlobalProgress());
        dispatch(fetchValidTasks());
        dispatch(fetchValidGlobalProgress());
    }, [userState.role, dispatch, navigate]);

    // 添加用户的dialog =========================================================
    const [addUserDialogVisible, setAddUserDialogVisible] = useState(false);
    const [addUserDialogLoading, setAddUserDialogLoading] = useState(false);
    const [addUserDialogUser, setAddUserDialogUser] = useState({
        username: "",
        password: "",
        invitecode: "",
        role: "labeler",
    });

    const addUser = async () => {
        if (
            addUserDialogUser.username !== "" &&
            addUserDialogUser.password !== "" &&
            addUserDialogUser.invitecode !== ""
        ) {
            setAddUserDialogLoading(true);
            const res = await axios
                .post("/labeler", {
                    username: addUserDialogUser.username,
                    password: cryptolize(addUserDialogUser.password),
                    invitecode: addUserDialogUser.invitecode,
                    role: addUserDialogUser.role,
                    avatar: `https://avatars.dicebear.com/api/avataaars/${addUserDialogUser.username}.svg`,
                })
                .catch((err) => {
                    setAddUserDialogLoading(false);
                    error(err);
                });
            if (res) {
                if (res.status === 201 || res.status === 200) {
                    notification("成功", "已添加", 2000, "success");
                    await dispatch(fetchUsers());
                    setAddUserDialogLoading(false);
                    setAddUserDialogVisible(false);
                } else {
                    setAddUserDialogLoading(false);
                    error("" + res.status);
                }
            }
        } else {
            error("请填写完整信息");
            return;
        }
    };

    const [passwordVisible, setPasswordVisible] = useState(false);

    // 添加用户的dialog =========================================================

    // 删除用户 =========================================================
    const deleteUser = (id: string, username: string) => {
        messageConfirm("警告", `确认删除${username}吗？`, "warning")
            .then(() => {
                axios
                    .delete(`/labeler/${id}`)
                    .then((res) => {
                        if (res.status === 200) {
                            notification("成功", "已删除", 2000, "success");
                            dispatch(fetchUsers());
                        } else {
                            error("" + res.status);
                        }
                    })
                    .catch((err) => {
                        error(err);
                    });
            })
            .catch(() => {
                console.log("cancel");
            });
    };

    // 删除用户 =========================================================

    // 添加任务 =========================================================
    const [addTaskDialogVisible, setAddTaskDialogVisible] = useState(false);
    const [addTaskDialogLoading, setAddTaskDialogLoading] = useState(false);
    const [addTaskDialogTask, setAddTaskDialogTask] = useState({
        start: 0,
        count: 100,
        labeler_id: "",
    });

    const addTask = () => {
        if (
            /^[0-9]+$/.test(addTaskDialogTask.start + "") &&
            addTaskDialogTask.count !== 0 &&
            addTaskDialogTask.labeler_id !== ""
        ) {
            console.log("adding task", addTaskDialogTask);
            setAddTaskDialogLoading(true);
            axios
                .post("/task", {
                    range: [
                        addTaskDialogTask.start,
                        addTaskDialogTask.start + addTaskDialogTask.count,
                    ],
                    labeler_id: addTaskDialogTask.labeler_id,
                    progress: 0,
                    finished: false,
                })
                .then(async (res) => {
                    if (res.status === 201 || res.status === 200) {
                        notification("成功", "已添加", 2000, "success");
                        await dispatch(fetchTasks());
                        await dispatch(fetchGlobalProgress());
                        setAddTaskDialogLoading(false);
                        setAddTaskDialogVisible(false);
                        setAddTaskDialogTask({
                            start: 0,
                            count: 100,
                            labeler_id: "",
                        });
                    } else {
                        setAddTaskDialogLoading(false);
                        error("" + res.status);
                    }
                })
                .catch((err) => {
                    setAddTaskDialogLoading(false);
                    error(err);
                });
        } else {
            console.log(addTaskDialogTask);
            error("请填写完整信息");
            return;
        }
    };
    // 添加任务 =========================================================

    // 删除任务 =========================================================
    const deleteTask = (task_id: string) => {
        messageConfirm("警告", `确认删除吗？`, "warning")
            .then(() => {
                axios
                    .delete(`/task/${task_id}`)
                    .then((res) => {
                        if (res.status === 200 || res.status === 201) {
                            notification("成功", "已删除", 2000, "success");
                            dispatch(fetchTasks());
                            dispatch(fetchGlobalProgress());
                        } else {
                            error("" + res.status);
                        }
                    })
                    .catch((err) => {
                        error(err);
                    });
            })
            .catch(() => {
                console.log("cancel");
            });
    };
    // 删除任务 =========================================================

    // 展示有效性任务
    const [taskDetailVisible, setTaskDetailVisible] = useState(false);
    const [taskIdxToShow, setTaskIdxToShow] = useState(-1);

    // 全局进度条
    const globalProgress = useAppSelector(
        (state) => state.admin.globalProgress
    );
    const validGlobalProgress = useAppSelector(
        (state) => state.admin.validGlobalProgress
    );

    const globalProgressText = useMemo(() => {
        if (globalProgress.imgCount === 0) {
            return 0;
        } else {
            return Number(
                (
                    (globalProgress.labeled_count /
                        globalProgress.allocated_count) *
                    100
                ).toFixed(2)
            );
        }
    }, [globalProgress]);

    const validGlobalProgressText = useMemo(() => {
        if (validGlobalProgress.imgCount === 0) {
            return 0;
        } else {
            return Number(
                (
                    (validGlobalProgress.labeled_count /
                        validGlobalProgress.allocated_count) *
                    100
                ).toFixed(2)
            );
        }
    }, [validGlobalProgress]);

    // 全局进度条 =========================================================

    // 添加风格任务
    const [addStyleTaskDialogVisible, setAddStyleTaskDialogVisible] =
        useState(false);
    const [addStyleTaskDialogLoading, setAddStyleTaskDialogLoading] =
        useState(false);
    const [addStyleTaskDialogTask, setAddStyleTaskDialogTask] = useState({
        start: 0,
        count: 100,
        labeler_id: "",
    });
    const addStyleTask = () => {
        if (
            /^[0-9]+$/.test(addStyleTaskDialogTask.start + "") &&
            addStyleTaskDialogTask.count !== 0 &&
            addStyleTaskDialogTask.labeler_id !== ""
        ) {
            console.log("adding valid task", addStyleTaskDialogTask);
            setAddStyleTaskDialogLoading(true);
            axios
                .post("/valid-tasks", {
                    range: [
                        addStyleTaskDialogTask.start,
                        addStyleTaskDialogTask.start +
                            addStyleTaskDialogTask.count,
                    ],
                    labeler_id: addStyleTaskDialogTask.labeler_id,
                    progress: 0,
                    finished: false,
                })
                .then(async (res) => {
                    if (res.status === 201 || res.status === 200) {
                        notification("成功", "已添加", 2000, "success");
                        await dispatch(fetchValidTasks());
                        await dispatch(fetchValidGlobalProgress());
                        setAddStyleTaskDialogLoading(false);
                        setAddStyleTaskDialogVisible(false);
                        setAddStyleTaskDialogTask({
                            start: 0,
                            count: 100,
                            labeler_id: "",
                        });
                    } else {
                        setAddStyleTaskDialogLoading(false);
                        error("" + res.status);
                    }
                })
                .catch((err) => {
                    setAddStyleTaskDialogLoading(false);
                    error(err);
                });
        } else {
            console.log(addStyleTaskDialogTask);
            error("请填写完整信息");
            return;
        }
    };
    // 添加风格任务 =========================================================

    // 删除风格任务 =========================================================
    const deleteStyleTask = (task_id: string) => {
        messageConfirm("警告", `确认删除吗？`, "warning")
            .then(() => {
                axios
                    .delete(`/valid-tasks/${task_id}`)
                    .then((res) => {
                        if (res.status === 200 || res.status === 201) {
                            notification("成功", "已删除", 2000, "success");
                            dispatch(fetchValidTasks());
                            dispatch(fetchValidGlobalProgress());
                        } else {
                            error("" + res.status);
                        }
                    })
                    .catch((err) => {
                        error(err);
                    });
            })
            .catch(() => {
                console.log("cancel");
            });
    };
    // 展示风格任务
    const [styleTaskDetailVisible, setStyleTaskDetailVisible] = useState(false);
    const [styleTaskIdxToShow, setStyleTaskIdxToShow] = useState(-1);

    // 刷新
    const [fetching, setFetching] = useState(false);
    const refresh = async () => {
        setFetching(true);
        await Promise.all([
            dispatch(fetchUsers()),
            dispatch(fetchTasks()),
            dispatch(fetchValidGlobalProgress()),
            dispatch(fetchValidTasks()),
            dispatch(fetchGlobalProgress()),
        ]);
        setFetching(false);
    };

    return (
        <div className={styles.admin_wrapper}>
            <div className={styles.admin_wrapper_content}>
                <header className={styles.admin_wrapper_content_header}>
                    <div
                        style={{
                            fontSize: "2rem",
                            color: "#aaa",
                            cursor: "pointer",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faHomeAlt}
                            onClick={(e) => {
                                navigate("/");
                            }}
                        ></FontAwesomeIcon>
                        <FontAwesomeIcon
                            icon={faSync}
                            className={fetching ? "fa-spin" : ""}
                            onClick={() => {
                                refresh();
                            }}
                        ></FontAwesomeIcon>
                    </div>
                    <div className={styles.admin_wrapper_content_header_title}>
                        管理员页面 (WIP)
                    </div>
                    <div className={styles.admin_wrapper_content_header_desc}>
                        欢迎来到管理员页面，这里可以对用户、打标任务进行管理
                    </div>
                </header>
                <main className={styles.admin_wrapper_content_main}>
                    <div className={styles.admin_wrapper_content_main_item}>
                        <div
                            className={
                                styles.admin_wrapper_content_main_item_title
                            }
                        >
                            用户管理
                        </div>
                        <div
                            className={
                                styles.admin_warpper_content_main_item_controls
                            }
                        >
                            <Button
                                type="primary"
                                onClick={(e) => setAddUserDialogVisible(true)}
                            >
                                添加用户
                            </Button>
                        </div>
                        <div
                            className={styles.admin_wrapper_content_main_cards}
                        >
                            {/* 循环 */}
                            {labelers.length > 0
                                ? labelers.map((labeler) => {
                                      return (
                                          <div
                                              className={
                                                  styles.admin_wrapper_content_main_card
                                              }
                                              key={labeler._id}
                                          >
                                              <div
                                                  className={
                                                      styles.admin_wrapper_content_main_card_box
                                                  }
                                              >
                                                  <img
                                                      className={
                                                          styles.admin_wrapper_content_main_card_img
                                                      }
                                                      src={labeler.avatar}
                                                      aria-label="Avatar"
                                                  />
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_text
                                                      }
                                                  >
                                                      {" "}
                                                      <FontAwesomeIcon
                                                          icon={faIdCardAlt}
                                                      ></FontAwesomeIcon>
                                                      &nbsp;&nbsp;
                                                      {labeler.username}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_text
                                                      }
                                                  >
                                                      {" "}
                                                      <FontAwesomeIcon
                                                          icon={faIdBadge}
                                                      ></FontAwesomeIcon>
                                                      &nbsp;&nbsp;
                                                      {labeler._id}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_text
                                                      }
                                                  >
                                                      {" "}
                                                      <FontAwesomeIcon
                                                          icon={faCode}
                                                      ></FontAwesomeIcon>
                                                      &nbsp;&nbsp;
                                                      {labeler.invitecode}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_text
                                                      }
                                                  >
                                                      {" "}
                                                      <FontAwesomeIcon
                                                          icon={faUserAlt}
                                                      ></FontAwesomeIcon>
                                                      &nbsp;&nbsp;{labeler.role}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_text
                                                      }
                                                  >
                                                      {" "}
                                                      <FontAwesomeIcon
                                                          icon={faAdd}
                                                      ></FontAwesomeIcon>
                                                      &nbsp;&nbsp;
                                                      {labeler.count} 张
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_card_btns
                                                      }
                                                  >
                                                      <Button
                                                          className={
                                                              styles.admin_wrapper_content_main_card_btn
                                                          }
                                                          type="text"
                                                          disabled={
                                                              labeler.role ===
                                                              "admin"
                                                          }
                                                          onClick={(e) =>
                                                              deleteUser(
                                                                  labeler._id,
                                                                  labeler.username
                                                              )
                                                          }
                                                      >
                                                          删除
                                                      </Button>
                                                      {/* <Button
                                                          className={
                                                              styles.admin_wrapper_content_main_card_btn
                                                          }
                                                          type="primary"
                                                          onClick={(e) =>
                                                              messageAlert(
                                                                  "暂不支持",
                                                                  "警告"
                                                              )
                                                          }
                                                      >
                                                          编辑
                                                      </Button> */}
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })
                                : "暂无用户"}
                        </div>
                    </div>

                    <div className={styles.admin_wrapper_content_main_item}>
                        <div
                            className={
                                styles.admin_wrapper_content_main_item_title
                            }
                        >
                            有效性打标任务管理
                        </div>
                        <div
                            className={
                                styles.admin_wrapper_content_main_item_global_progress
                            }
                        >
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                目前，共有 {globalProgress.imgCount} 张，共分配{" "}
                                {globalProgress.allocated_count} 张，标注{" "}
                                {globalProgress.labeled_count} 张
                            </div>
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                目前已分配的标注任务进度
                            </div>
                            <Progress
                                strokeWidth={24}
                                percentage={globalProgressText}
                                textInside
                            ></Progress>
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                全进度{" "}
                                {(
                                    (globalProgress.labeled_count /
                                        globalProgress.imgCount) *
                                    100
                                ).toFixed(2)}
                                % /{" "}
                                {(
                                    (globalProgress.allocated_count /
                                        globalProgress.imgCount) *
                                    100
                                ).toFixed(2)}
                                %
                                <div className={styles.custom_progress}>
                                    <div
                                        className={styles.custom_progress_main}
                                    >
                                        {tasks.map((task, index) => {
                                            return (
                                                <div
                                                    className={styles.task}
                                                    key={task._id}
                                                    onClick={() => {
                                                        setTaskIdxToShow(index);
                                                        setTaskDetailVisible(
                                                            true
                                                        );
                                                    }}
                                                    style={{
                                                        left: `${
                                                            (100 *
                                                                task.range[0]) /
                                                            globalProgress.imgCount
                                                        }%`,
                                                        width: `${
                                                            (100 *
                                                                (task.range[1] -
                                                                    task
                                                                        .range[0])) /
                                                            globalProgress.imgCount
                                                        }%`,
                                                    }}
                                                >
                                                    {/* <div
                                                        className={
                                                            styles.task_info
                                                        }
                                                    >
                                                        {task.range[0] -
                                                            task.range[1]}
                                                    </div> */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Dialog
                                    title="有效性任务详细信息"
                                    visible={taskDetailVisible}
                                    onCancel={() => {
                                        setTaskIdxToShow(-1);
                                        setTaskDetailVisible(false);
                                    }}
                                >
                                    <Dialog.Body>
                                        {taskIdxToShow !== -1 &&
                                            Object.keys(
                                                tasks[taskIdxToShow]
                                            ).map((item) => {
                                                // console.log(item, tasks[taskIdxToShow][item]);
                                                return (
                                                    <div
                                                        className={
                                                            styles.dialog_table
                                                        }
                                                        key={item}
                                                    >
                                                        <span
                                                            className={
                                                                styles.dialog_key
                                                            }
                                                        >
                                                            {item}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.dialog_value
                                                            }
                                                        >
                                                            {
                                                                // @ts-ignore
                                                                tasks[
                                                                    taskIdxToShow
                                                                ][
                                                                    item
                                                                ].toString()
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </Dialog.Body>
                                    <Dialog.Footer className="dialog-footer">
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                setTaskIdxToShow(-1);
                                                setTaskDetailVisible(false);
                                            }}
                                        >
                                            确定
                                        </Button>
                                    </Dialog.Footer>
                                </Dialog>
                            </div>
                        </div>
                        <div
                            className={
                                styles.admin_warpper_content_main_item_controls
                            }
                        >
                            <Button
                                type="primary"
                                onClick={() => setAddTaskDialogVisible(true)}
                            >
                                添加任务
                            </Button>
                        </div>
                        <div
                            className={styles.admin_wrapper_content_main_tasks}
                        >
                            {tasks.length > 0
                                ? tasks.map((task, index) => {
                                      return (
                                          <div
                                              className={
                                                  styles.admin_wrapper_content_main_task
                                              }
                                              key={task._id}
                                          >
                                              <div
                                                  className={
                                                      styles.admin_wrapper_content_main_task_box
                                                  }
                                              >
                                                  {/* 打标任务ID, 打标人，范围，进度 */}
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faAsterisk}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task._id}
                                                      </span>
                                                  </div>
                                                  {/* <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faUserAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task.labeler_username}
                                                      </span>
                                                  </div> */}
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faIdCardAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task.labeler_id}
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faIdCardAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {
                                                              task.labeler_username
                                                          }
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faLifeRing}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {`从第 ${task.range[0]} 张到第 ${task.range[1]} 张`}
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      {!task.finished ? (
                                                          <Progress
                                                              strokeWidth={24}
                                                              percentage={Number(
                                                                  (
                                                                      (task.progress /
                                                                          (task
                                                                              .range[1] -
                                                                              task
                                                                                  .range[0])) *
                                                                      100
                                                                  ).toFixed(2)
                                                              )}
                                                              textInside
                                                          />
                                                      ) : (
                                                          <Progress
                                                              strokeWidth={24}
                                                              percentage={100}
                                                              status="success"
                                                              textInside
                                                          />
                                                      )}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <Button
                                                          type="text"
                                                          onClick={(e) =>
                                                              deleteTask(
                                                                  task._id
                                                              )
                                                          }
                                                      >
                                                          删除
                                                      </Button>
                                                      <Button
                                                          type="text"
                                                          onClick={(e) => {
                                                              setTaskIdxToShow(
                                                                  index
                                                              );
                                                              setTaskDetailVisible(
                                                                  true
                                                              );
                                                          }}
                                                      >
                                                          详情
                                                      </Button>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })
                                : "暂无任务"}
                        </div>
                    </div>
                    <div className={styles.admin_wrapper_content_main_item}>
                        <div
                            className={
                                styles.admin_wrapper_content_main_item_title
                            }
                        >
                            风格打标任务管理
                        </div>
                        <div
                            className={
                                styles.admin_wrapper_content_main_item_global_progress
                            }
                        >
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                目前，共有 {validGlobalProgress.imgCount}{" "}
                                张，共分配 {validGlobalProgress.allocated_count}{" "}
                                张，标注 {validGlobalProgress.labeled_count} 张
                            </div>
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                目前已分配的标注任务进度
                            </div>
                            <Progress
                                strokeWidth={24}
                                percentage={validGlobalProgressText}
                                textInside
                            ></Progress>
                            <div
                                className={
                                    styles.admin_wrapper_content_main_item_global_progress_title
                                }
                            >
                                全进度{" "}
                                {(
                                    (validGlobalProgress.labeled_count /
                                        validGlobalProgress.imgCount) *
                                    100
                                ).toFixed(2)}
                                % /{" "}
                                {(
                                    (validGlobalProgress.allocated_count /
                                        validGlobalProgress.imgCount) *
                                    100
                                ).toFixed(2)}
                                %
                                <div className={styles.custom_progress}>
                                    <div
                                        className={styles.custom_progress_main}
                                    >
                                        {validTasks.map((task, index) => {
                                            return (
                                                <div
                                                    className={styles.task}
                                                    key={task._id}
                                                    onClick={() => {
                                                        setTaskIdxToShow(index);
                                                        setTaskDetailVisible(
                                                            true
                                                        );
                                                    }}
                                                    style={{
                                                        left: `${
                                                            (100 *
                                                                task.range[0]) /
                                                            validGlobalProgress.imgCount
                                                        }%`,
                                                        width: `${
                                                            (100 *
                                                                (task.range[1] -
                                                                    task
                                                                        .range[0])) /
                                                            validGlobalProgress.imgCount
                                                        }%`,
                                                    }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Dialog
                                    title="风格任务详细信息"
                                    visible={styleTaskDetailVisible}
                                    onCancel={() => {
                                        setStyleTaskIdxToShow(-1);
                                        setStyleTaskDetailVisible(false);
                                    }}
                                >
                                    <Dialog.Body>
                                        {styleTaskIdxToShow !== -1 &&
                                            Object.keys(
                                                validTasks[styleTaskIdxToShow]
                                            ).map((item) => {
                                                // console.log(item, tasks[taskIdxToShow][item]);
                                                return (
                                                    <div
                                                        className={
                                                            styles.dialog_table
                                                        }
                                                        key={item}
                                                    >
                                                        <span
                                                            className={
                                                                styles.dialog_key
                                                            }
                                                        >
                                                            {item}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.dialog_value
                                                            }
                                                        >
                                                            {
                                                                // @ts-ignore
                                                                validTasks[
                                                                    styleTaskIdxToShow
                                                                ][
                                                                    item
                                                                ].toString()
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </Dialog.Body>
                                    <Dialog.Footer className="dialog-footer">
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                setStyleTaskIdxToShow(-1);
                                                setStyleTaskDetailVisible(
                                                    false
                                                );
                                            }}
                                        >
                                            确定
                                        </Button>
                                    </Dialog.Footer>
                                </Dialog>
                            </div>
                        </div>
                        <div
                            className={
                                styles.admin_warpper_content_main_item_controls
                            }
                        >
                            <Button
                                type="primary"
                                onClick={() =>
                                    setAddStyleTaskDialogVisible(true)
                                }
                            >
                                添加任务
                            </Button>
                        </div>
                        <div
                            className={styles.admin_wrapper_content_main_tasks}
                        >
                            {validTasks.length > 0
                                ? validTasks.map((task, index) => {
                                      return (
                                          <div
                                              className={
                                                  styles.admin_wrapper_content_main_task
                                              }
                                              key={task._id}
                                          >
                                              <div
                                                  className={
                                                      styles.admin_wrapper_content_main_task_box
                                                  }
                                              >
                                                  {/* 打标任务ID, 打标人，范围，进度 */}
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faAsterisk}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task._id}
                                                      </span>
                                                  </div>
                                                  {/* <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faUserAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task.labeler_username}
                                                      </span>
                                                  </div> */}
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faIdCardAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {task.labeler_id}
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faIdCardAlt}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {
                                                              task.labeler_username
                                                          }
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <FontAwesomeIcon
                                                          icon={faLifeRing}
                                                      ></FontAwesomeIcon>
                                                      <span
                                                          style={{
                                                              marginLeft:
                                                                  "10px",
                                                          }}
                                                      >
                                                          {`从第 ${task.range[0]} 张到第 ${task.range[1]} 张`}
                                                      </span>
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      {!task.finished ? (
                                                          <Progress
                                                              strokeWidth={24}
                                                              percentage={Number(
                                                                  (
                                                                      (task.progress /
                                                                          (task
                                                                              .range[1] -
                                                                              task
                                                                                  .range[0])) *
                                                                      100
                                                                  ).toFixed(2)
                                                              )}
                                                              textInside
                                                          />
                                                      ) : (
                                                          <Progress
                                                              strokeWidth={24}
                                                              percentage={100}
                                                              status="success"
                                                              textInside
                                                          />
                                                      )}
                                                  </div>
                                                  <div
                                                      className={
                                                          styles.admin_wrapper_content_main_task_line
                                                      }
                                                  >
                                                      <Button
                                                          type="text"
                                                          onClick={(e) =>
                                                              deleteStyleTask(
                                                                  task._id
                                                              )
                                                          }
                                                      >
                                                          删除
                                                      </Button>
                                                      <Button
                                                          type="text"
                                                          onClick={(e) => {
                                                              setStyleTaskIdxToShow(
                                                                  index
                                                              );
                                                              setStyleTaskDetailVisible(
                                                                  true
                                                              );
                                                          }}
                                                      >
                                                          详情
                                                      </Button>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })
                                : "暂无任务"}
                        </div>
                    </div>
                </main>
            </div>
            <Dialog
                visible={addUserDialogVisible}
                title="添加用户"
                size="small"
                onCancel={() => {
                    setAddUserDialogVisible(false);
                }}
                closeOnClickModal={false}
            >
                <Dialog.Body>
                    <Form
                        model={addUserDialogUser}
                        labelWidth="80"
                        labelPosition="left"
                        rules={{
                            username: [
                                {
                                    required: true,
                                    message: "请输入用户名",
                                    trigger: "blur",
                                },
                                {
                                    //@ts-ignore
                                    validator: (rule, value, callback) => {
                                        if (!checkUsername(value)) {
                                            callback(
                                                "用户名必须为字母或数字或者中文"
                                            );
                                        }
                                        if (
                                            labelers
                                                .map(
                                                    (labeler) =>
                                                        labeler.username
                                                )
                                                .indexOf(value) !== -1
                                        ) {
                                            callback("用户名已存在");
                                        }
                                        callback();
                                    },
                                },
                            ],
                            password: [
                                {
                                    required: true,
                                    message: "请输入密码",
                                    trigger: "blur",
                                },
                                {
                                    //@ts-ignore
                                    validator: (rule, value, callback) => {
                                        if (!checkChar(value)) {
                                            callback("密码必须仅包括字母或@._");
                                        }
                                        callback();
                                    },
                                },
                            ],
                            invitecode: [
                                {
                                    required: true,
                                    message: "请输入邀请码",
                                    trigger: "blur",
                                },
                                {
                                    //@ts-ignore
                                    validator: (rule, value, callback) => {
                                        if (!checkInviteCode(value)) {
                                            callback("邀请码必须为emoji表情");
                                        }
                                        callback();
                                    },
                                },
                            ],
                            role: [
                                {
                                    required: true,
                                    message: "请选择角色",
                                    trigger: "blur",
                                },
                            ],
                        }}
                    >
                        <Form.Item label="用户名" prop="username">
                            <Input
                                value={addUserDialogUser.username}
                                onChange={(e) => {
                                    // console.log(e);
                                    setAddUserDialogUser({
                                        ...addUserDialogUser,
                                        // @ts-ignore
                                        username: e,
                                    });
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="密码" prop="password">
                            <Input
                                type={passwordVisible ? "text" : "password"}
                                onIconClick={() => {
                                    setPasswordVisible(!passwordVisible);
                                }}
                                icon={passwordVisible ? "star-on" : "star-off"}
                                value={addUserDialogUser.password}
                                onChange={(e) => {
                                    // console.log(e);
                                    setAddUserDialogUser({
                                        ...addUserDialogUser,
                                        // @ts-ignore
                                        password: e,
                                    });
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="邀请码" prop="invitecode">
                            <Input
                                value={addUserDialogUser.invitecode}
                                onChange={(e) => {
                                    console.log(e);
                                    setAddUserDialogUser({
                                        ...addUserDialogUser,
                                        // @ts-ignore
                                        invitecode: e,
                                    });
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="身份" prop="role">
                            <Select
                                style={{ width: "100%" }}
                                value={addUserDialogUser.role}
                                onChange={(e) => {
                                    // console.log(e);
                                    setAddUserDialogUser({
                                        ...addUserDialogUser,
                                        // @ts-ignore
                                        role: e,
                                    });
                                }}
                            >
                                <Select.Option value="admin">
                                    管理员
                                </Select.Option>
                                <Select.Option value="labeler">
                                    标注员
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button
                        type="primary"
                        onClick={() => setAddUserDialogVisible(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => addUser()}
                        loading={addUserDialogLoading}
                    >
                        确定
                    </Button>
                </Dialog.Footer>
            </Dialog>
            <Dialog
                visible={addTaskDialogVisible}
                title="添加有效性任务"
                size="small"
                onCancel={() => {
                    setAddTaskDialogVisible(false);
                }}
                closeOnClickModal={false}
            >
                <Dialog.Body>
                    <Form
                        model={addTaskDialogTask}
                        labelWidth="80"
                        labelPosition="left"
                        rules={{
                            start: [
                                {
                                    required: true,
                                    message: "需设定任务起点",
                                    trigger: "blur",
                                    type: "number",
                                },
                            ],
                            count: [
                                {
                                    required: true,
                                    message: "需设定任务数量",
                                    trigger: "blur",
                                    type: "number",
                                },
                            ],
                            labeler_id: [
                                {
                                    required: true,
                                    message: "需确定打标人",
                                    trigger: "blur",
                                    type: "string",
                                },
                            ],
                        }}
                    >
                        <Form.Item label="起点" prop="start">
                            <InputNumber
                                style={{ width: "100%" }}
                                defaultValue={addTaskDialogTask.start}
                                value={addTaskDialogTask.start}
                                min={0}
                                step={100}
                                onChange={(e) => {
                                    if (e) {
                                        setAddTaskDialogTask({
                                            ...addTaskDialogTask,
                                            start: e,
                                        });
                                    }
                                    console.log(addTaskDialogTask);
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="标注数量" prop="count">
                            <InputNumber
                                defaultValue={addTaskDialogTask.count}
                                style={{ width: "100%" }}
                                value={addTaskDialogTask.count}
                                min={1}
                                step={100}
                                onChange={(e) => {
                                    if (e) {
                                        setAddTaskDialogTask({
                                            ...addTaskDialogTask,
                                            count: e,
                                        });
                                    }
                                    console.log(addTaskDialogTask);
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="标注人" prop="labeler_id">
                            <Select
                                style={{ width: "100%" }}
                                value={addTaskDialogTask.labeler_id}
                                onChange={(e) => {
                                    setAddTaskDialogTask({
                                        ...addTaskDialogTask,
                                        labeler_id: e,
                                    });
                                    console.log(addTaskDialogTask);
                                }}
                            >
                                {labelers.map((labeler) => {
                                    return (
                                        <Select.Option
                                            value={labeler._id}
                                            key={labeler._id}
                                        >
                                            {labeler.username}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button
                        type="primary"
                        onClick={(e) => setAddTaskDialogVisible(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={(e) => addTask()}
                        loading={addTaskDialogLoading}
                    >
                        确定
                    </Button>
                </Dialog.Footer>
            </Dialog>
            <Dialog
                visible={addStyleTaskDialogVisible}
                title="添加风格任务"
                size="small"
                onCancel={() => {
                    setAddStyleTaskDialogVisible(false);
                }}
                closeOnClickModal={false}
            >
                <Dialog.Body>
                    <Form
                        model={addStyleTaskDialogTask}
                        labelWidth="80"
                        labelPosition="left"
                        rules={{
                            start: [
                                {
                                    required: true,
                                    message: "需设定任务起点",
                                    trigger: "blur",
                                    type: "number",
                                },
                            ],
                            count: [
                                {
                                    required: true,
                                    message: "需设定任务数量",
                                    trigger: "blur",
                                    type: "number",
                                },
                            ],
                            labeler_id: [
                                {
                                    required: true,
                                    message: "需确定打标人",
                                    trigger: "blur",
                                    type: "string",
                                },
                            ],
                        }}
                    >
                        <Form.Item label="起点" prop="start">
                            <InputNumber
                                style={{ width: "100%" }}
                                defaultValue={addStyleTaskDialogTask.start}
                                value={addStyleTaskDialogTask.start}
                                min={0}
                                step={100}
                                onChange={(e) => {
                                    if (e) {
                                        console.log(e);
                                        setAddStyleTaskDialogTask({
                                            ...addStyleTaskDialogTask,
                                            start: e,
                                        });
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="标注数量" prop="count">
                            <InputNumber
                                defaultValue={addStyleTaskDialogTask.count}
                                style={{ width: "100%" }}
                                value={addStyleTaskDialogTask.count}
                                min={1}
                                step={100}
                                onChange={(e) => {
                                    if (e) {
                                        console.log(e);
                                        setAddStyleTaskDialogTask({
                                            ...addStyleTaskDialogTask,
                                            count: e,
                                        });
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="标注人" prop="labeler_id">
                            <Select
                                style={{ width: "100%" }}
                                value={addStyleTaskDialogTask.labeler_id}
                                onChange={(e) => {
                                    console.log(e);
                                    setAddStyleTaskDialogTask({
                                        ...addStyleTaskDialogTask,
                                        labeler_id: e,
                                    });
                                }}
                            >
                                {labelers.map((labeler) => {
                                    return (
                                        <Select.Option
                                            value={labeler._id}
                                            key={labeler._id}
                                        >
                                            {labeler.username}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button
                        type="primary"
                        onClick={(e) => setAddStyleTaskDialogVisible(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={(e) => addStyleTask()}
                        loading={addStyleTaskDialogLoading}
                    >
                        确定
                    </Button>
                </Dialog.Footer>
            </Dialog>
        </div>
    );
};

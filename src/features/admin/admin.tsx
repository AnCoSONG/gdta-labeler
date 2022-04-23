import {
    faAsterisk,
    faCode,
    faHomeAlt,
    faIdBadge,
    faIdCardAlt,
    faLifeRing,
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
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { axios, checkChar, cryptolize } from "../../utils";
import { error, messageConfirm, notification } from "../../utils/notify";
import styles from "./admin.module.scss";
import { fetchGlobalProgress, fetchTasks, fetchUsers } from "./adminSlice";

export const Admin = () => {
    const userState = useAppSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const tasks = useAppSelector((state) => state.admin.tasks);
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

    // 全局进度条
    const globalProgress = useAppSelector(
        (state) => state.admin.globalProgress
    );

    const globalProgressText = useMemo(() => {
        if (globalProgress.imgCount === 0) {
            return 0;
        } else {
            return Number(
                (
                    ((globalProgress.right - globalProgress.left) /
                        globalProgress.imgCount) *
                    100
                ).toFixed(2)
            );
        }
    }, [globalProgress]);

    return (
        <div className={styles.admin_wrapper}>
            <div className={styles.admin_wrapper_content}>
                <header className={styles.admin_wrapper_content_header}>
                    <div
                        style={{
                            fontSize: "2rem",
                            color: "#aaa",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            navigate("/");
                        }}
                    >
                        <FontAwesomeIcon icon={faHomeAlt}></FontAwesomeIcon>
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
                            打标任务管理
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
                                目前进度: 从 {globalProgress.left} 至{" "}
                                {globalProgress.right}, 共{" "}
                                {globalProgress.imgCount} 张
                            </div>
                            <Progress
                                strokeWidth={24}
                                percentage={globalProgressText}
                                textInside
                            ></Progress>
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
                                ? tasks.map((task) => {
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
                                        if (!/^[a-zA-Z0-9]+$/.test(value)) {
                                            callback("用户名必须为字母或数字");
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
                                            callback("密码必须为纯字母");
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
                                        if (!/^[0-9]+$/.test(value)) {
                                            callback(
                                                "邀请码必须为纯字母或数字"
                                            );
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
                title="添加任务"
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
                                    console.log(addTaskDialogTask);
                                    if (e) {
                                        setAddTaskDialogTask({
                                            ...addTaskDialogTask,
                                            start: e,
                                        });
                                    }
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
                                    console.log(addTaskDialogTask);
                                    if (e) {
                                        setAddTaskDialogTask({
                                            ...addTaskDialogTask,
                                            count: e,
                                        });
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item label="标注人" prop="labeler_id">
                            <Select
                                style={{ width: "100%" }}
                                value={addTaskDialogTask.labeler_id}
                                onChange={(e) => {
                                    console.log(addTaskDialogTask);
                                    setAddTaskDialogTask({
                                        ...addTaskDialogTask,
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
        </div>
    );
};

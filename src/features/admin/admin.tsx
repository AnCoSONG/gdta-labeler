import {
    faAsterisk,
    faIdBadge,
    faIdCardAlt,
    faLifeRing,
    faUserAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dialog, Form, Input, Progress, Select } from "element-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { error, messageAlert } from "../../utils/notify";
import styles from "./admin.module.scss";
import { fetchTasks, fetchUsers } from "./adminSlice";

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
    }, []);

    // 添加用户的dialog =========================================================
    const [addUserDialogVisible, setAddUserDialogVisible] = useState(false);
    const [addUserDialogLoading, setAddUserDialogLoading] = useState(false);
    const [addUserDialogUser, setAddUserDialogUser] = useState({
        username: "",
        password: "",
        invitecode: "",
        role: "labeler",
    });

    // 添加用户的dialog =========================================================
    return (
        <div className={styles.admin_wrapper}>
            <div className={styles.admin_wrapper_content}>
                <header className={styles.admin_wrapper_content_header}>
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
                                                          type="danger"
                                                          disabled={
                                                              labeler.role ===
                                                              "admin"
                                                          }
                                                          onClick={(e) =>
                                                              messageAlert(
                                                                  "暂不支持",
                                                                  "警告"
                                                              )
                                                          }
                                                      >
                                                          删除
                                                      </Button>
                                                      <Button
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
                                                      </Button>
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
                                styles.admin_warpper_content_main_item_controls
                            }
                        >
                            <Button type="primary">添加任务</Button>
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
                                                              percentage={
                                                                  (task.progress /
                                                                      (task
                                                                          .range[1] -
                                                                          task
                                                                              .range[0])) *
                                                                  100
                                                              }
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
                    >
                        <Form.Item label="用户名" prop="username">
                            <Input
                                value={addUserDialogUser.username}
                                onChange={(e) => {
                                    console.log(e);
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
                                type="password"
                                value={addUserDialogUser.password}
                                onChange={(e) => {
                                    console.log(e);
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
                                value={addUserDialogUser.role}
                                onChange={(e) => {
                                    console.log(e);
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
            </Dialog>
        </div>
    );
};

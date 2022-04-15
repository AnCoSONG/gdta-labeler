import { Notification, Message } from "element-react";
import { MessageBox } from "element-react";

export const error = (msg: string, duration = 1000) => {
    Message.error({
        message: msg,
        customClass: "message",
        duration,
    });
};

export const notification = (title: string, msg: string, duration = 1000, type: 'success' | 'info' | 'warning' | 'error') => {
    Notification({
        title: title,
        message: msg,
        type: type,
        duration,
    });
}

export const warn = (msg: string, duration = 1000) => {
    Message.warning({
        message: msg,
        customClass: "message",
        duration,
    });
};

export const success = (msg: string, duration = 1000) => {
    Message.success({
        message: msg,
        customClass: "message",
        duration,
    });
};

export const alert = (title: string, msg: string) => {
    return MessageBox.alert(msg, title);
};

export const confirm = (
    title: string,
    msg: string,
    type: "success" | "error" | "info" | "warning"
) => {
    return MessageBox.confirm(msg, title, { type });
};

export const messageAlert = (msg: string, title: string) => {
    MessageBox.alert(msg, title);
} 

// export const success = (options: ElementReact.MessageOptions) => {
//     Message.success(options)
// }

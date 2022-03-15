import { Message } from "element-react";

export const error = (msg: string, duration=1000) => {
    Message.error({
        message: msg,
        customClass: 'message',
        duration
    })
}

export const warn = (msg: string, duration=1000) => {
    Message.warning({
        message: msg,
        customClass: 'message',
        duration
    })
}

export const success = (msg: string, duration=1000) => {
    Message.success({
        message: msg,
        customClass: 'message',
        duration
    })
}

// export const success = (options: ElementReact.MessageOptions) => {
//     Message.success(options)
// }
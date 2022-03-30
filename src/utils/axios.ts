import axios from "axios";
import { error } from "../utils/notify";
const _axios = axios.create({
    timeout: 10000,
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

_axios.interceptors.request.use(
    (req) => {
        req.data = JSON.stringify(req.data);
        req.headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        };
        // console.log('request', req);
        return req;
    },
    (err) => {
        console.log('error', err);
        return Promise.reject(err)
    }
);

_axios.interceptors.response.use(
    (response) => {
        // console.log('response', response);
        if (response.data.auth && response.data.auth.access_token) {
            console.log('自动设置token');
            localStorage.setItem("token", response.data.auth.access_token);
        }
        return response;
    },
    (err) => {
        console.log("error", err);
        return Promise.reject(err)
    }
);

export default _axios

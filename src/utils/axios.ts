import axios from "axios";

const _axios = axios.create({
    timeout: 10000,
    baseURL: "http://localhost:5001",
    withCredentials: true
})

_axios.interceptors.request.use(
    (req) => {
        req.data = JSON.stringify(req.data);
        req.headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        };
        console.log('req', req);
        return req;
    },
    (error) => {
        console.log('error', error);
        return Promise.reject(error)
    }
);

_axios.interceptors.response.use(
    (response) => {
        console.log('response', response);
        if (response.data.auth.access_token) {
            console.log('自动设置token');
            localStorage.setItem("token", response.data.auth.access_token);
        }
        return response;
    },
    (error) => {
        console.log("error", error);
        return Promise.reject(error)
    }
);

export default _axios

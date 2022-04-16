import _axios from "./axios";
import crypto from 'crypto-js'
export const seed = (upper: number) => {
    return Number(Math.random() * upper).toFixed(0)
}

export function getDataUrl(img:HTMLImageElement) {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    // Set width and height
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw the image
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

export const axios = _axios

export const checkChar = (str: string) => {
    return /^[a-zA-Z0-9_@]+$/.test(str)
} 

export const cryptolize = (str: string) => {
    // console.log(crypto.SHA256(str).toString())
    return crypto.SHA256(str).toString()
}

export const range = (start: number, end:number, gap:number) => {
    const result = [];
    for (let i = start; i <= end; i+=gap) {
        result.push(i);
    }
    return result;
}
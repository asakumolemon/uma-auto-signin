// signin.js
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// ==== 配置区域 ==== //
const COOKIE = process.env.KOMOE_COOKIE;
if (!COOKIE) {
    console.error("❌ 缺少 COOKIE");
    process.exit(1);
}


// ==== 工具函数 ==== //

// 生成 nonce = 当前时间戳 + 10位随机字符
function generateNonce() {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let str = "";
    for (let i = 0; i < 10; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return Date.now() + str;
}

// MD5 加密（hex 输出）
function md5Hex(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}

// 生成 sign
function generateSign(params) {
    const secret = "+RIq/MaHJf9h23eOdjyXB6lkXL0LjcTGuPiNRyTtZX4=";

    // 补全参数
    params = Object.assign({}, params, {
        nonce: generateNonce(),
        lang: "zh",
        ts: Date.now(),
        appkey: "7200bfa761c94eae9ceb168bf4b129d0"
    });
    if (params.sign) delete params.sign;

    // key排序 & 拼接
    const keys = Object.keys(params).sort();
    const str = keys.map(k => {
        let val = params[k];
        if (typeof val === "object") val = JSON.stringify(val);
        return `${k}=${val}`;
    }).join("&") + `&secret=${secret}`;

    // md5 加密生成 sign
    const sign = md5Hex(str);
    return { ...params, sign };
}

// ==== 执行签到 ==== //
async function signIn() {
    const url = "https://l11-activity-web-hk.komoejoy.com/activity/sign/v2/in";

    // 初始化参数
    const params = {
        activity_group_id: "1755595320481626",
        activity_id: "10000244",
        app_id: "6829"
    };

    // 生成带 sign 的请求参数
    const signedParams = generateSign(params);

    // 转成 form-urlencoded
    const body = new URLSearchParams(signedParams);

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "cookie": COOKIE,
                "Referer": "https://uma.komoejoy.com/"
            },
            body
        });
        const data = await res.json();
        console.log("✅ 签到结果:", data);
    } catch (err) {
        console.error("❌ 签到失败:", err);
    }
}

// ==== 执行脚本 ==== //
signIn();



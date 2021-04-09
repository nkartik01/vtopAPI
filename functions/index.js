const functions = require("firebase-functions");
// const request = require("request");
const session = require("express-session");
var express = require("express");
const axios = require("axios").default;
var qs = require("qs");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
var Jimp = require("jimp");
const cors = require("cors");
const { getPixelColor } = require("jimp");
const captcha1 = require("async-captcha");
const { createCanvas, registerFont, loadImage } = require("canvas");
const bitmap = require("./bitmap.json");
var https = require("https");
var FormData = require("form-data");
const cheerio = require("cheerio");
const { _refWithOptions } = require("firebase-functions/lib/providers/database");
require("https").globalAgent.options.ca = require("ssl-root-cas").create();
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
function match(a, b) {
  score = 0;
  // console.log(a.length, b.length);
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 30; j++) {
      if (a[i][j] === b[i][j]) {
        score = score + 1;
      }
    }
  }
  return score;
}
var app = express();
app.use(cors());
axios.defaults.withCredentials = true;
// app.use(session({ secret: "abc" }));
app.get("/", async (req, res) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  var moodleUrl = "https://lms.vit.ac.in/";
  axiosCookieJarSupport(axios);
  // var agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15";
  const cookieJar = new tough.CookieJar();
  var username = "18bce1199";
  var password = "Fall@4576";
  var params = new FormData();
  params.append("username", username);
  params.append("password", password);
  params.append("anchor", "");
  const loginResponse = await axios.get("https://lms.vit.ac.in/login/index.php", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36", ...params.getHeaders() },
    jar: cookieJar,
    httpsAgent: agent,
    withCredentials: true,
  });
  console.log(cookieJar);
  const logintoken = cheerio.load(loginResponse.data)('input[name="logintoken"]').first().val();
  console.log(logintoken);
  params.append("logintoken", logintoken);
  const firstResponse = await axios.post("https://lms.vit.ac.in/login/index.php", params, {
    headers: {
      ...params.getHeaders(),
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    },
    jar: cookieJar,
    httpsAgent: agent,
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: () => true, // axios thinks HTTP 303 is an error --> its not!
  });

  const secondResponse = await axios.get("https://lms.vit.ac.in/course/view.php?id=54#section-0", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    },
    jar: cookieJar,
    httpsAgent: agent,
    withCredentials: true,
    validateStatus: () => true, // axios thinks HTTP 303 is an error --> its not!
  });
  console.log(secondResponse.status);
  res.send(secondResponse.data);
});
app.post("/", async (request, response) => {
  axiosCookieJarSupport(axios);

  const cookieJar = new tough.CookieJar();
  var res;
  res = await axios.get("https://vtopcc.vit.ac.in/vtop/initialProcess", {
    jar: cookieJar,
    withCredentials: true,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    },
  });

  res = await axios.get("https://vtopcc.vit.ac.in/vtop/", {
    jar: cookieJar,
    withCredentials: true,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    },
  });
  // return response.send(res.data);
  // res = await axios.get("https://vtopcc.vit.ac.in/vtop/initialProcess", {
  //   jar: cookieJar,
  //   withCredentials: true,
  //   headers: {
  //     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
  //   },
  // });
  // return response.send(res.data);
  // var sessionID = res.headers["set-cookie"][0].split(";")[0].split("=")[0];
  //   config = {
  //     method: "post",
  //     url: "https://vtopcc.vit.ac.in/vtop",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "User-Agent":
  //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
  // Cookie: "loginUserType=vtopuser; JSESSIONID=" + sessionID,
  //     },
  //     // data: request.data,
  //   };
  //   res = await axios(config);
  //   console.log(res.headers);
  // while (1) {
  try {
    res = await axios.post(
      "https://vtopcc.vit.ac.in/vtop/vtopLogin",
      {},
      {
        jar: cookieJar,
        withCredentials: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
          // Cookie: "JSESSIONID=" + sessionID,
        },
      }
    );
    // return response.send(res.data);
    // console.log()
    //   console.log(res.headers);
    var captcha = res.data;
    //   console.log(captcha);
    var alt_index = captcha.indexOf('src="data:image/png;base64,');
    var alt_text = captcha.slice(alt_index + 28);
    var end_index = alt_text.indexOf('"');
    var captcha_src = alt_text.slice(0, end_index);
    const options = {
      case: true,
      minLength: 6,
      maxLength: 6,
    };
    // console.log(captcha_src);
    // response.writeHead(200, { "Content-Type": "image/png" });
    // response.end(Buffer.from(captcha_src, "base64"));
    // console.log(Buffer.from(captcha_src, "base64"));
    // var img = Buffer.from(captcha_src, "base64");

    var img = await (await Jimp.read(Buffer.from(captcha_src, "base64"))).write("a.png");
    var a = new Uint8Array(img.bitmap.data).filter((_, i) => {
      return i % 4 == 0;
    });
    for (_ = 0; _ < 2; _++)
      for (var i = 1; i < 44; i++) {
        for (var j = 1; j < 179; j++) {
          if (a[i * 180 + j] !== 0) {
            a[i * 180 + j] = 255;
          }
          if (a[(i - 1) * 180 + j] === 255 && a[(i + 1) * 180 + j] === 255) {
            a[i * 180 + j] = 255;
          }
          if (a[i * 180 + j - 1] === 255 && a[i * 180 + j + 1] === 255) {
            a[i * 180 + j] = 255;
          }
          // x = [...x, a[i * 180 + j]];
        }
      }
    var x = [];
    var y = [[], [], [], [], [], []];
    for (var k = 0; k < 6; k++)
      for (var i = 12; i < 44; i++) {
        x = [];
        for (var j = 0; j < 30; j++) {
          x = [...x, a[i * 180 + k * 30 + j]];
        }
        y[k] = [...y[k], x];
      }
    x = Object.keys(bitmap);
    var captchaCheck = "";
    for (var i = 0; i < 6; i++) {
      var c = 0;
      var cap = "";
      x.map((b, ind) => {
        var z = match(bitmap[b], y[i]);
        if (z > c) {
          c = z;
          cap = b;
        }
      });
      captchaCheck = captchaCheck + cap;
    }
    console.log(captchaCheck, qs.stringify({ ...request.body, captchaCheck: captchaCheck }));
    // return response.send(res.data);
    res = await axios.post("https://vtopcc.vit.ac.in/vtop/doLogin", qs.stringify({ ...request.body, captchaCheck: captchaCheck }), {
      jar: cookieJar,
      withCredentials: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
        // Cookie: "JSESSIONID=" + sessionID + " ;loginUserType=vtopuser",
      },
    });
    console.log(res.status);
    // break;
  } catch (err) {
    console.log(err);
  }
  // }
  return response.send(res.data);
  //   res = await fetch("https://vtopcc.vit.ac.in/vtop/vtopLogin", {
  //     method: "post",
  //     headers: { ...b, ...a },
  //   });
  //   var a = res.data;

  //   //   console.log(a);
  //   res = await fetch("https://vtopcc.vit.ac.in/vtop/doLogin", {
  //     data: { uname: "18bce1199", passwd: "@Momforme1", captchaCheck: "" },
  //     method: "post",
  //     headers: { ...a, ...b },
  //   });

  response.send(res.data);
});
exports.helloWorld = functions.https.onRequest(app);

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzk5OTkyNTQsImV4cCI6MTY4MDA4NTY1NH0.EIiIuflDZCoNpM_a6KeyMtCUmZOu9Qz0wAWpKfOBR9Y';
// const SERVER_SECRET = "hsgijfkoksmrnebnhrvsmj";
// // 生成加密密碼
// // const hashedPassword = bcrypt.hashSync(password, 10);
// // console.log(hashedPassword);
// // 比較原始密碼與加密密碼
// const isPasswordMatch = jwt.verify(token, SERVER_SECRET);

// console.log(isPasswordMatch); // tru

const data = {"id":"play1","type":"round-robin","time_limit":3,"status":"prepare","create_time":"2021-06-15T12:34:03.823Z"}
JSON.parse(data).forEach((row) =>
    console.log(row)
);
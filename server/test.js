const bcrypt = require("bcrypt");

const password = '109321052';

// 生成加密密碼
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);
// 比較原始密碼與加密密碼
const isPasswordMatch = bcrypt.compareSync(password, hashedPassword);

console.log(isPasswordMatch); // tru
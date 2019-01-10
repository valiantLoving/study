var fs = require("fs");

const file = fs.readFileSync("./test.js", "utf8");
console.log(`file:${JSON.stringify(file)}`)

//  var re = /var\s+\w+?\s*=\s*require\s*\(\s*['"](.+?)['"]\s*\)\s*[;]?/gm;

/**
 *  . 除了换行符之外的任意字符
 *  \s 匹配一个空白字符，包括\n,\r,\f,\t,\v等
 *  + 匹配前面元字符1次或多次
 *  \w 匹配一个可以组成单词的字符(alphanumeric，这是我的意译，含数字)，包括下划线，如[\w]匹配"$5.98"中的5，等于[a-zA-Z0-9] 
 *  ? 匹配前面元字符0次或1次
 *  * 匹配前面元字符0次或多次
 */
// const _ = __importStar(require("underscore"));

var re = /(var|const|let)\s+\w+?\s*=\s*\w*\(?require\s*\(\s*[`'"](.+?)[`'"]\s*\)\)?\s*[;]?/gm;

var res = null;
do{
    res = re.exec(file);
    //不为空，而且是以 . 开头的路径，为了去掉比如 wind util 等没有相对路径.和..的系统库
    // if (res != null && res[1].substr(0,1) === "." ) {
    //     includeFileAry.push(res[1]);
    // }
    console.log(`parse:${JSON.stringify(res)}`)
}while(res != null)
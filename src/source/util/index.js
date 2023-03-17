/**
 * 这个文件主要是用来分析0分问题
 * 
 */
// const logsArr = ["./logs/AIBrowser_20201116-115336_4e12cec6-27bf-11eb-805c-e45e3760ad05/JavaScript_2020-11-15_11-08-30.log"];


/**
 * 检查日志中是否存在时间异常，有时间异常的时候（Phoenix运行期间将时间调整为以前的时间，比如现在是2020.05.29 19:13， 调整为2020.05.29 18:00），学生端会卡死。
 * 出现这种问题的场景很少，但是有时候很难分析出来的卡死，可以用这个脚本跑一下试试看。
 * 
 * @author yangxinxiang
 * @date 2020.11.22
 * @version 0.1
 * 
 * 使用说明： 
 * 1，在index.js的同级建一个文件夹rst存放检查结果。
 * 2，在index.js的同级建一个log文件夹，将要检查的日志文件拷贝进去
 * 3，node .\check-log-time\index.js 运行即可
 * 4, 运行之后，到rst目录的check__XXXXXXXXX.txt中检查日志输出，如果日志中有： 类似下面的输出，说明时间有问题，操作系统的时间调整过：
 * Warning!!! Time issue
{"fileName":"d:\\ProjectSpace\\Practice\\tools\\check-log-time\\log\\phoenix_2019-11-22_18-47-09.log","status":"failed","issueTime":1851,"issueLine":2765}
 
 * 无其他模块依赖。

 */
/***/
const fs = require('fs');
const readline = require('readline');
const path = require("path");
const request = require('request');
const { mkdir,ls, cd, exec, rm, find, sed, test, ShellString } = require('shelljs');

let checkTime = new Date().getTime();
let rstFileName = path.resolve(__dirname,`./rst/check__${checkTime}.txt`);
let logRelativePath = path.resolve(__dirname,"./logs/");
let logFiles = ["AIBrowser_20201116-115336_4e12cec6-27bf-11eb-805c-e45e3760ad05/JavaScript_2020-11-15_11-08-30.log"];

const scoreInfoReg = /(\{{3}.*\}{3}).*(\:{4}\{.*\})/; // 匹配一行中同时有组件信息，评分信息等内容的日志行，并且把组件信息、评测信息提取出来
const downloadInfoReg = /(\{.*\})/; // 从日志中匹配下载信息的正则
const storeMap = new Map(); // 总的结果存储，以日志文件名来存储

let lineStream$

/**
 * 从日志行中获取打印该行的时间字符串
 * @param {string} line 
 */
function getLineTimeStr(line){
    const tempTimeStr = line.substr(1,12);
    return tempTimeStr
}

function startParseLogFile(fReadName, callback){
    console.log(`startParseLogFile :: enter, fReadName = ${fReadName}`);
    recordResult(`startParseLogFile :: enter, fReadName = ${fReadName}`);
    var fRead = fs.createReadStream(fReadName);
    var objReadline = readline.createInterface({
        input:fRead
    });
    

    
    objReadline.on('line',function (line) {
           
    });
    
    objReadline.on('close',function () {
        console.log( `startParseLogFile :: File closed ,file = ${fReadName} `);       
          if(logFiles.length>0){
            //删除第一个
            logFiles.shift();
            //setTimeout(()=>{
                startCheck(`closed file = ${fReadName}`);
            //},500)            
        }
    });
}



// 去掉audioUrl 中的垃圾数据
function clearnAudioURL(url){
    // 'https://px4lesson.oss-cn-beijing.aliyuncs.com/%7B7bb1917c-f8c7-47fe-98c4-b4dc3ee494bb%7D223011178_20201115_111502371_1605410102371.mp3?Expires=316965410106&OSSAccessKeyId=LTAIN1HaNw5qdGoX&Signature=AASLw34gWqgcA8255Bmj8255FetGMgoMNPswebpack-internal:///158D'
    const endStr = "webpack-internal";
    const endIndex = url.indexOf(endStr);
    if(endIndex>=0){
        return url.substr(0,endIndex);
    }
    return url
}


function recordResult(info){
    console.log(`recordResult :: enter, info = ${info}`);
    let infoStr = "";
    if(typeof info === "string"){
        infoStr = info+ "\r\n";
    }else{
        infoStr = JSON.stringify(info) + "\r\n";
    }
    fs.appendFile(rstFileName,infoStr,"utf8",(error)=>{
        if(error){
            console.log(`recordResultfail,infoStr = ${infoStr}`);
        }else{
            console.log(`recordResult success, infoStr = ${infoStr}`);
        }
    })
}


function startCheck(from){
    console.log(`startCheck :: enter, from = ${from}`);
    if(logFiles.length>0){
        startParseLogFile(path.resolve(path.join(logRelativePath,logFiles[0])));
    }else{
        recordResult(`startCheck :: end, no more file to check.`);
    }
}


function run(){
    getLogFiles();
    //testtest();
    //generateFolder("./mp3","ajfag3/123");
}

run();

// const audioURL = "https://px4lesson.oss-cn-beijing.aliyuncs.com/%7Bfc5d22f5-929d-4b1c-bf5b-ee62b6ae2812%7D2042224935_20201115_111502371_1605410102371.mp3?Expires=316965410106&OSSAccessKeyId=LTAIN1HaNw5qdGoX&Signature=Eq3xIGfsCbiuH4tLsmlTRFzn8255B0I"
 const audioURL = "https://px4lesson.oss-cn-beijing.aliyuncs.com/%7B72bb332f-0def-4abd-b759-90754e04af35%7D2042224935_20201115_111828949_1605410308949.mp3?OSSAccessKeyId=LTAIN1HaNw5qdGoX&Expires=1606484568&Signature=DopuGdbTLXlg8Jl9qAoNcPG6nfI%3D"
//downloadMp3(audioURL);

function testtest(){
    const courseDetailLine = `[11:08:53:545] [9356] [info] "接收pad课程信息{\"code\":0,\"command\":\"COURSE_DETAIL\",\"content\":{\"lessonNum\":3,\"courseAbsolutePath\":\"C:/phoenix/courseware\",\"leftAIPoint\":0,\"coursewareVersionStatus\":1,\"isMatchClientVersion\":0,\"endDate\":\"1605412800000\",\"maxLessonStudentNum\":20,\"subject\":\"英语\",\"lessonStudentNum\":7,\"className\":\"【AI英语-爆品课】|超能音标-线下版周日上午10点半\",\"targetCoursewareVersion\":4,\"classCategory\":0,\"deviceId\":\"83ae9864-daf0-11ea-b77e-e45e3760ad05\",\"roomId\":\"6717b778b24944608c618ba7df100544\",\"platform\":0,\"mainTeacherName\":\"赵倩Ching\",\"lessonName\":\"第3讲\",\"audioRelativePath\":\"/5006_a86e36e84eb0712c694eb1e0c6ca3573/5d024b22758711e9918810e04c3bef8f/\",\"coursewareId\":\"3a0b53c985554b3e9ea6c9e9c960c301\",\"classroomName\":\"AI教室0002\",\"mockTime\":0,\"courseDownloadStatus\":1,\"courseRelativePath\":\"/3a0b53c985554b3e9ea6c9e9c960c301/4/\",\"classTimeNames\":\"10:30-12:00\",\"endDateStr\":\"2020-11-15 12:00:0    ==>>()`
    const classInfo = parseClassInfo(courseDetailLine);
    console.log(`testtest :: enter.`);
    console.log(classInfo);
}
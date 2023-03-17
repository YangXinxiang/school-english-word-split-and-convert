const readline = require('readline');
const path = require('path')
const fs = require('fs')
const fullFileName = path.resolve(__dirname, 'data/all.txt')
const rstFileName =  path.resolve(__dirname, 'data/rst.json')


const rstFileNameAll =  path.resolve(__dirname, 'data/rst-all.json')
const {httpGet} = require('./util/request.js');

console.log('fullFileName :: ',fullFileName)
console.log('rstFileName :: ',rstFileName)

const dataSet = [];
const lineSet = [];
let currentGrade = '三年级' // 当前的年级
let currentSchoolTerm = '下学期' // 当前的学期
let currentUnit = 'Unit 1' // 当前的单元

/**
 * recordResult, 工具方法，将数据记录到本地文件中，主要是写json数据。
 * @param {*} info 
 * @param {*} filePath 
 */
function recordResult(info, filePath = rstFileName){
    console.log(`recordResult :: enter`);
    try {
        let infoStr =  JSON.stringify(info);
        fs.writeFileSync(filePath, infoStr, "utf8");
    }catch(e) {
        console.log('eeeee, ',e)
    }
}

/**
 * splitLine, 核心解析单词文本行的方法，将一行单词数据拆分解析成单词、音标、中文含义，同时补充上该单词属于的年级、学期、单元等信息
 * 一行单词数据可能是
 * 一年级上册单词表
 * Unit 1
 * book    /bʊk/    书，书本
 * teacher    /'tiːtʃə/    教师
 * I 我
 * have 有
 * shopping centre 购物中心
 * 
 * @param {*} __line 
 * @param {*} currentGrade 
 * @param {*} currentSchoolTerm 
 * @param {*} currentUnit 
 * @returns {Promise <{{
            word,
            yinbiao,
            chinese,
            type,
            yinbiaoSource,
            currentGrade, currentSchoolTerm, currentUnit,
        }}>}
 */
function splitLine(__line, currentGrade = '', currentSchoolTerm = '', currentUnit = '') {
    console.log('splitLine :: enter, ',__line, currentGrade, currentSchoolTerm, currentUnit);
    return new Promise((resolve, reject) => {
        const firstIndex = __line.indexOf('/')
        let word = '';
        let yinbiao = '';
        let chinese = '';
        let type = '单词'
        
        const yinbiaoSource = '';
        const hasYinbiao = firstIndex >=0;
        if(hasYinbiao) {
            word = __line.substring(0,firstIndex).trim()
            const rest1 = __line.substr(firstIndex+1)
            const lastIndex = rest1.indexOf('/')
            yinbiao = ('/'+rest1.substring(0,lastIndex+1)).trim()
            chinese = rest1.substr(lastIndex+1).trim()
        } else {
            const chineseReg = /[\u4e00-\u9fa5]/;
            const chineseStartChar = /\p{Unified_Ideograph}+/u.exec(__line);
            let chineseStartIndex = __line.indexOf(chineseStartChar)
            
            word = __line.substring(0,chineseStartIndex).trim() 
            const kuohaoIndex = word.indexOf('（') // 有括号的时候，解析会有错，比如 started to speak （过去式）开始说话
            if (kuohaoIndex >= 0) {
                word = __line.substring(0,kuohaoIndex).trim() 
                chinese = __line.substr(kuohaoIndex).trim()
            } else {
                chinese = __line.substr(chineseStartIndex).trim()
            }
            
            
        }
        // 检查是否有一样中有两个单词的
        if(/\w+/.test(chinese)) {
            console.log('splitLine 注意：： 该行可能有两个单词 :: ' ,chinese, __line, currentGrade, currentSchoolTerm, currentUnit)
        }
        // 判断是单词还是短语
        if(word.indexOf(' ') >=0) {
            type = '短语'
        }
        const splitedWordObj = {
            word,
            yinbiao,
            chinese,
            type,
            yinbiaoSource,
            currentGrade, currentSchoolTerm, currentUnit,
        }
        // 如果是单词，提供的内容中没有音标
        if(!hasYinbiao && type === '单词') {
            queryYinbiao(word).then((result)=> {              
                splitedWordObj.yinbiaoSource = '金山词霸';
                splitedWordObj.yinbiao =  `/${result}/`;                
                setTimeout(()=> {
                    resolve(splitedWordObj)
                },4000)
            })
        } else {
            resolve(splitedWordObj)
        }        
        
    })
    
}

/**
 * 从金山词霸拿到的dom字符串中解析出音标
 * @param {string} str 金山词霸整个页面的dom字符串
 * @returns {string} yinbiaoStr 提取出来的音标
 */
function parseYinbiaoFromDomStr(str) {
    let yinbiaoStr = ''
    try {
        const tempArr = str.split('<ul class="Mean_symbols__fpCmS"><li>英<!-- -->[')
        if(tempArr.length === 2) {
            const endIndex = tempArr[1].indexOf(']')
            yinbiaoStr = tempArr[1].substring(0, endIndex)

        }
        return yinbiaoStr;
    }catch(e) {
        console.log('parseYinbiaoFromDomStr :: error , ',e)
    }
    
}
/**
 * 从文本中读取单词行，工具方法
 */
function startParse() {
    //创建readline接口实例
    const fRead = fs.createReadStream(fullFileName);
    let r1 = readline.createInterface({
        input:fRead
    });
    //注册line事件
    r1.on('line',function (line){
        const _line = line.trim()
        if(_line) {
            lineSet.push(_line)
        }        
    });
    //close事件监听
    r1.on('close',function (){
        console.log('----end----');        
        startBatchSplit(lineSet)
    });
}

/**
 * getGradeInfo 解析一行文本，主要解析出年级，学期信息
 * @param {*} str 
 * @returns 
 */
function getGradeInfo (str) {
    if(str.indexOf('册单词表') >=0) {
        const grade = str.substr(0,3)
        const schoolTerm = str.substr(3,2)
        return {
            grade,
            schoolTerm,
        }
    } else {
        return null
    }
}

/**
 * getUnitInfo 解析一行文本，主要解析出单元信息
 * @param {*} str 
 * @returns 
 */
function getUnitInfo (str) {
    const reg = /^Unit{1}\s\d{1}/
    if (reg.test(str)) {
        return str
    } else {
        return ''
    }

}
async function startBatchSplit(lineSet) {
    for(const line of lineSet) {
        const gradeInfo = getGradeInfo(line)
        const unitInfo = getUnitInfo(line)
        if(gradeInfo) {
            currentGrade = gradeInfo.grade
            currentSchoolTerm = gradeInfo.schoolTerm
        } else if(unitInfo) {
            currentUnit = unitInfo
        } else {
            const rst = await splitLine(line, currentGrade, currentSchoolTerm, currentUnit)
            dataSet.push(rst);
        }
        
    }
    // console.log('startBatchSplit :: end, ', dataSet)
    recordResult(dataSet, rstFileName)
}

/**
 * queryYinbiao 去金山词霸查单词音标
 * @param {*} word 
 * @returns 
 */
function queryYinbiao(word) {
    
    try {
        return httpGet(word).then((dom)=> {
            // console.log('queryYinbiao :: got it ', word)
            return parseYinbiaoFromDomStr(dom.data)
        })
    }catch(ee) {
        console.error('queryYinbiao :: error, word = ', word, ',eeeee = '+ee.message)
    }
   
}



function awaitGetYinbiao(word, duration = 4000) {
    return new Promise((resolve, reject) => {
        queryYinbiao(word).then((__yinbiao)=> {
            const yinbiao = __yinbiao.replace("&#x27;", "'")
            // console.log('awaitGetYinbiao :: word = ',word,', yinbiao = ', yinbiao)
            setTimeout(()=> {
                resolve({
                        word,
                        yinbiao,
                        yinbiaoSource: '金山词霸',                    
                })
            }, duration)
        })
    })
}

async function startParsePhrase(phrase, stagedRst = []) {
    console.log('startParsePhrase :: enter, phrase = ', phrase)
    const wordList = phrase.trim().split(/\s+/);
    const yinbiaoList = [];
    try {
        for(const word of wordList) {
            const yinbiaoInfo = await awaitGetYinbiao(word, 4000)
            yinbiaoList.push(`/${yinbiaoInfo.yinbiao}/`)
        }
        const yinbiaoListStr =  yinbiaoList.join(' ')
        console.log('startParsePhrase :: end, phrase = ', phrase, ', yinbiaoListStr = ', yinbiaoListStr)
        return yinbiaoListStr
    }catch(e) {
        console.log('startParsePhrase :: error, phrase = ', phrase, ', error = ', e.message)
        recordResult(stagedRst, rstFileNameAll)
    }
    
}

async function batchParsePhrase() {
    const stagedRst = require(rstFileName)
    console.log('batchParsePhrase :: len = ', stagedRst.length);
    try{
        for(const item of stagedRst) {
            if(item.type === '短语') {
                const yinbiao = await startParsePhrase(item.word);
                item.yinbiao = yinbiao;
                item.yinbiaoSource = "金山词霸";
            }            
        }
        recordResult(stagedRst, rstFileNameAll)
    }catch(e) {
        console.log('batchParsePhrase :: error = ', e.message);
    }
    
}


// 步骤一 数据准备： 从 data/all.txt 文本中读取单词行内容，解析单词文本行，生成json数据
// startParse() // 这一步已经完成了，就先注释了

// 步骤二， 进一步完善上一步生成的json数据，上一步的数据中，没有短语音标，本步骤讲短语音标补齐
batchParsePhrase()
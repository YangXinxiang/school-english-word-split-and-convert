# school-english-word-split-and-convert
从单词txt文本中分离出单词、音标、中文含义，并将没有音标的从金山词霸查询后补充，然后生成单词json文件，渲染到页面中。

# 原始数据来源

result/人教版新起点小学英文1-6年级英语-单词表含音标,按课时.docx

# 最终转换出来的表格数据

result/人教版新起点小学英文1-6年级英语-单词表含音标,按课时v1.0-20230317.xlsx

# 如果node运行的时候遇到错误 node Cannot find module 'core-js/fn/promise'
请安装：

"core-js": "^2.5.7"

# 实现逻辑说明：

1，本程序通过node js 解析 单词内容
cd 进入src\source\ 目录，
安装依赖
然后node index.js运行

主程序逻辑步骤：

1），打开result/人教版新起点小学英文1-6年级英语-单词表含音标,按课时.docx, 全选所有内容，粘贴到文本，生成all.txt

2）， src\source\index.js 解析 src\source\data\all.txt, 同时检查每个单词是否有音标，如果没有，用axios发请求到金山词霸查询，然后用解析返回的dom字符串，提取音标。
生成 rst.json

3），步骤一生成的  rst.json 中，短语部分没有音标。再遍历短语部分，将每一个短语中的单词拿出来到金山词霸查询，提取音标，最后组成短语音标。更新rst.json数据，生成
rst-all.json

4），在项目的跟目录， npm install，安装依赖之后

5）， npm run serve，启动 vue项目，vue项目加载rst-all.json数据，将其渲染在html表格中


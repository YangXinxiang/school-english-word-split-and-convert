<template>
  <div id="app">
    
    <!-- HelloWorld :src="m3u8src" /-->
    <div>
      <table>
        <tr>
          <td>年级</td>
          <td>学期</td>
          <td>单元</td>
          <td>单词</td>
           <td>音标</td>
          <td>中文</td>
          <td>音标来源</td>   
          <td>类型</td>   
          <td>备注</td>     
        </tr>
        <tr v-for="item in data" :key="item.word + item.currentGrade + item.currentSchoolTerm+item.currentUnit+item.chinese">
          <td>{{item.currentGrade}}</td>
          <td>{{item.currentSchoolTerm}}</td>
          <td>{{item.currentUnit}}</td>
          <td>{{item.word}}</td>
           <td>{{item.yinbiao}}</td>
          <td>{{item.chinese}}</td>
          <td>{{item.yinbiaoSource}}</td>   
          <td>{{item.type}}</td>    
          <td>{{item.remark || ''}}</td>        
        </tr>
      </table>
    </div>
  </div>
</template>

<script>


import dataSet from './source/data/rst-all.json'

export default {
  name: 'App',
  data() {
    return {    
      mmmm : 'mmmmmmm'  ,
      data:[],
    }    
  },
  components: {
  },
  mounted() {
    this.startTest()
    console.log(dataSet)
    this.data = dataSet
  },
  methods: {
    startTest() {
   
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
td {
  border: 1px solid black;
}
</style>

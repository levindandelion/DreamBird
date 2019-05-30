//app.js
const http = require('./utils/http.js');
const api = require('./utils/api.js');
App({
  data:{
    
  },
  globalData: {
    http,
    api,
    allCity:[]
  },
  onLaunch: function (option) {
    // console.log(option,'option');
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env:'test-39055c',
        traceUser: true,
      })
      this.globalData.db=wx.cloud.database();
    }
  }
})

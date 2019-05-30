const http = require('./http.js');
const constant = require('./constant.js');
const config = require('./config.js');
// 引入SDK核心类
const QQMapWX = require('../lib/qqmap-wx-jssdk.min.js');
// 实例化API核心类
const qqMapSdk = new QQMapWX({
  key: config.mapKey
});

//获取综合天气
const getMultipleWeather = option => {
  const preset = {
    url: constant.GET_MULTIPLE_WEATHER,
    data: {
      location: 'auto_ip',
      key: config.key
    }
  };
  return http(preset, option);
}


//获取定位经纬度
const getLocation = () => {
  return new Promise(function (resolve, reject) {
    wx.getLocation({
      type: 'gcj02 ',
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject(err);
      }
    })
  })
}
// 根据经纬度获取城市,无经纬度默认获取当前城市
const getCityByLocation = (option) => {
  let location = '';

  option && (location = { longitude: option.lng, latitude: option.lat })
  return new Promise(function (resolve, reject) {
    qqMapSdk.reverseGeocoder({
      location,
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject(err);
      },
    })
  })
}

//获取城市列表
const getCityList = () => {
  return new Promise(function (resolve, reject) {
    qqMapSdk.getCityList({
      success(res) {
        resolve(res);
      },
      fail(err) {
        reject(err);
      }
    })
  })
}

module.exports = {
  getMultipleWeather,
  getCityByLocation,
  getLocation,
  getCityList,

}
//index.js
import regeneratorRuntime from '../../lib/regenerator'
const app = getApp()
const {
  api,
  db,
  allCity
} = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cities: [],
    weather: [],
    lifeType: {
      comf: '舒适度指数',
      cw: '洗车指数',
      drsg: '穿衣指数',
      flu: '感冒指数',
      sport: '运动指数',
      trav: '旅游指数',
      uv: '紫外线指数',
      air: '空气污染扩散条件指数'
    },
    siderAnchor: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    userCityChange: false,//cities数据是否改变,其他页面控制
    nickName: '',
    nickNameChange: false,
    scopeUserInfo: false,
    codeImg: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const USERCITY = wx.getStorageSync('USERCITY');
    if (USERCITY) {
      this.setData({ cities: USERCITY });
    } else {
      const result = await db.collection('user').get();
      if (result.length && result[0].city.length) {
        this.setData({
          cities: result[0].city
        });

      } else {
        const { result: { ad_info: { city } } } = await this.getLocation();
        this.setData({ cities: [city] });

        wx.cloud.callFunction({ name: 'updatecity', data: { city: [city] } }).
          catch(err => {
            wx.showToast({
              title: '城市上传失败',
              icon: 'none',
              duration: 2000
            })
          });
      }
      wx.setStorageSync('USERCITY', this.data.cities);
    }

    this.getAllWeather(this.data.cities, this.getWeatherData);

    this.checkSetting();
  },
  async onShow(options) {
    //如何用户城市数据改变，更新天气/缓存/数据库
    if (this.data.userCityChange) {
      this.data.userCityChange = false;
      this.data.weather = [];

      this.getAllWeather(this.data.cities, this.getWeatherData);
      wx.setStorageSync('USERCITY', this.data.cities);
      wx.cloud.callFunction({ name: 'updatecity', data: { city: this.data.cities } }).catch(err => {
        wx.showToast({
          title: '城市上传失败',
          icon: 'none',
          duration: 2000
        })
      });
    }

  },
  //展示小程序码
  showCodeImg() {
    wx.showLoading({
      title: '请稍等',
    })
    const codeImg = wx.getStorageSync('codeImg');
    wx.previewImage({
      urls: [codeImg],
      complete() {
        wx.hideLoading();
      }
    });
  },
  //获取用户信息授权
  async bindGetUserInfo(e) {
    if (e.detail.userInfo) {
      await this.getUserInfo();
      this.showCodeImg();
    }
  },
  checkSetting() {
    // 查看是否授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          this.getUserInfo();
        }
      }
    })
  },
  //获取用户信息并处理小程序码
  getUserInfo() {
    return new Promise(resolve => {
      wx.getUserInfo({
        success: res => {
          this.setData({
            scopeUserInfo: true,
          });
          this.data.nickName = wx.getStorageSync('nickName');
          if (res.userInfo.nickName != this.data.nickName) {
            this.data.nickName = res.userInfo.nickName;
            this.data.nickNameChange = true;
            wx.setStorage({
              key: 'nickName',
              data: this.data.nickName
            });

            wx.cloud.callFunction({
              name: 'getcodeimg',
              data: { nickName: this.data.nickName }
            }).then(res => {

              this.data.codeImg = res.result;
              wx.setStorageSync('codeImg', this.data.codeImg);
              resolve();
            })

          }
        }
      })
    })

  },
  goToConfig() {
    wx.navigateTo({
      url: '../config/config',
    })
  },
  //天气多任务
  getAllWeather(taskArr, process) {
    const processArr = [];
    taskArr.forEach(item => {
      const thing = new Promise(function (resolve, reject) {
        process(item, resolve, reject);
      });
      processArr.push(thing);
      Promise.all(processArr).then(res => {
        this.setData({ weather: res });
      }).catch(err => {
        console.log(err);
        wx.showToast({
          title: '天气获取失败，请下拉刷新',
          icon: 'none',
          duration: 2000
        });
      });
    })
  },
  //获取天气
  async getWeatherData(location, resolve, reject) {
    const result = await api.getMultipleWeather({
      data: {
        location
      }
    });
    const {
      data: {
        HeWeather6: data
      }
    } = result;
    if (data[0].status == 'ok') {
      data[0].now.imgUrl = `/images/weather-icon/${data[0].now.cond_code}.png`;
      data[0].hourly.forEach(item => {
        item.hour = item.time.split(' ')[1];
        item.imgUrl = `/images/weather-icon/${item.cond_code}.png`;
      })
      data[0].daily_forecast.forEach(item => {
        item.imgUrl_d = `/images/weather-icon/${item.cond_code_d}.png`;
        item.imgUrl_n = `/images/weather-icon/${item.cond_code_n}.png`;
      })
      data[0].lifestyle.forEach(item => {
        item.typeTxt = this.data.lifeType[item.type];
        item.imgUrl = `/images/life/${item.type}.png`;
      });
      resolve(data[0]);
    } else {
      reject(result);
    }
  },
  // 根据经纬度获取城市,无经纬度默认获取当前城市
  getLocation(option) {
    return new Promise(function (resolve, reject) {
      api.getCityByLocation(option).then(res => {
        resolve(res);
      }).catch(err => {
        wx.showToast({
          title: '定位失败，请手动添加',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      })
    })

  },
  //获取城市列表
  getCityList() {
    //console.time()
    api.getCityList().then(res => {
      let cityArr = res.result[0].concat(res.result[1]);
      this.arrayChunk(this.data.siderAnchor.slice(), cityArr, this.handleCity);
    }).catch(err => {
      wx.showToast({
        title: '城市列表获取失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })

  },
  //处理城市数据
  handleCity(anchor, cityArr) {
    let obj = { anchor, cityList: [] };
    for (let i = 0; i < cityArr.length; i++) {
      if (anchor == cityArr[i].pinyin[0].charAt(0).toUpperCase()) {
        obj.cityList.push(cityArr.splice(i, 1)[0]);
        i -= 1;
      }
    }
    if (obj.cityList.length) {
      allCity.push(obj);
    }
  },
  //任务分割
  arrayChunk(arr, cityArr, process) {
    let that = this;
    setTimeout(function self() {
      let anchor = arr.shift();
      process(anchor, cityArr);
      if (arr.length) {
        setTimeout(self, 50)
      } else {

        wx.setStorageSync('ALLCITY', allCity);

      }
    }, 50)
  },
  onHide: function () {
    //离开时初始化城市列表
    if (!allCity.length) {
      let ALLCITY = wx.getStorageSync('ALLCITY');
      if (ALLCITY) {
        Object.assign(allCity, ALLCITY);
      } else {
        this.getCityList();
      }
    }

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getAllWeather(this.data.cities, this.getWeatherData);
    setTimeout(wx.stopPullDownRefresh, 1000);
  },

  onShareAppMessage(option) {

    return {
      imageUrl: '../../images/codeImg.jpg',
    };

  }

})
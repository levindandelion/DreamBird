import regeneratorRuntime from '../../lib/regenerator'
const app = getApp();
const { api, db, allCity } = app.globalData;
import pinyin from '../../lib/pinyin';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFocus: false,
    cities: [],
    history: [],
    curtAnchor: null,
    firstInput: '',
    showCancel: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ cities: allCity });
    this.handleHistory('get');

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.handleHistory('set');
  },
  clearInput() {
    console.log('c')
    this.setData({
      firstInput: ''
    })
  },
  cancel() {
    this.setData({
      showCancel: false,
      firstInput: ''
    })
  },
  bindInput(e) {

    const inputValue = e.detail.value;
    if (inputValue && inputValue[0] != this.data.firstInput) {
      this.data.firstInput = inputValue[0];
      const result = pinyin.go(this.data.firstInput, 1)[0].toUpperCase();
      console.log(e.detail.value, 'e', result);
      if (/[A-Za-z]/.test(result)) {
        this.setData({
          curtAnchor: result,
        });

        setTimeout(() => {
          this.setData({
            curtAnchor: null,
          });
        }, 400);
      }

    }

  },
  aa() {

  },
  tapHistoryItem(e) {
    const pages = getCurrentPages();
    const homePage = pages[pages.length - 3];
    homePage.data.cities.forEach((item, index) => {
      if (item.indexOf(e.target.dataset.name) > -1 || e.target.dataset.name.indexOf(item) > -1) {
        homePage.data.cities.splice(index, 1);
      }
    })
    if (homePage.data.cities.length > 2) {
      homePage.data.cities.pop();
    }
    homePage.data.cities.unshift(e.target.dataset.name);
    homePage.data.userCityChange = true;
    wx.navigateBack({
      delta: 2,
    })
  },
  tapCityItem(e) {
    this.data.history.forEach((item, index) => {
      if (item.indexOf(e.target.dataset.name) > -1) {
        this.data.history.splice(index, 1);
      }
    })
    if (this.data.history.length > 4) {
      this.data.history.pop();
    }

    this.data.history.unshift(e.target.dataset.name);
    this.setData({ history: this.data.history });
    const pages = getCurrentPages();
    const homePage = pages[pages.length - 3];
    homePage.data.cities.forEach((item, index) => {
      if (item.indexOf(e.target.dataset.name) > -1) {
        homePage.data.cities.splice(index, 1);
      }
    })
    if (homePage.data.cities.length > 2) {
      homePage.data.cities.pop();
    }
    homePage.data.cities.unshift(e.target.dataset.name);
    homePage.data.userCityChange = true;
    wx.navigateBack({
      delta: 2,
      success() {

      }
    })
  },
  //获取/设置历史数据
  handleHistory(type) {
    if (type == 'get') {
      this.setData({ history: wx.getStorageSync('HISTORY') || [] });
    } else if ('set') {
      wx.setStorageSync('HISTORY', this.data.history);
    }
  },
  getLocation() {
    api.getCityByLocation().then(res => {
      const { city, city_code } = res.result.ad_info;
      this.data.history.forEach((item, index) => {
        if (city.indexOf(item) > -1) {
          this.data.history.splice(index, 1);
        }
      })
      if (this.data.history.length > 4) {
        this.data.history.pop();
      }
      this.data.history.unshift(city);
      this.setData({ history: this.data.history });
      const pages = getCurrentPages();
      const homePage = pages[pages.length - 3];
      homePage.data.cities.forEach((item, index) => {
        if (city.indexOf(item) > -1) {
          homePage.data.cities.splice(index, 1);
        }
      })
      if (homePage.data.cities.length > 2) {
        homePage.data.cities.pop();
      }
      homePage.data.cities.unshift(city);
      homePage.data.userCityChange = true;
      wx.navigateBack({
        delta: 2,
      })
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: '定位失败，请重试并检查定位授权是否开启',
        icon: 'none',
        duration: 2000
      })
    })

  },

  focus() {
    this.setData({ isFocus: true, showCancel: true })
  },
  blur() {
    this.setData({ isFocus: false })
  },
  touchStartAnchor(e) {

    this.setData({ curtAnchor: e.target.dataset.anchor })
  },
  touchMoveAnchor(e) {
    //console.log(e.currentTarget.dataset.anchor,e)
  },
  touchEndAnchor(e) {
    setTimeout(() => {
      this.setData({
        curtAnchor: null,
      });
    }, 300);
  },


})

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: true,
    y: 0,
    curtIndex: null,
    abs: 0,
    cities: [],
    userCityChange: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const pages = getCurrentPages();
    const homePage = pages[pages.length - 2];
    this.setData({ cities: homePage.data.cities });
    wx.getSystemInfo({
      success: (res) => {
        this.setData({ rate: 750 / res.windowWidth })
      }
    })

  },
  onHide() {
    if (this.data.userCityChange) {
      this.data.userCityChange = false;
      wx.setStorageSync('USERCITY', this.data.cities);
      wx.cloud.callFunction({ name: 'updatecity', data: { city: this.data.cities } }).
        catch(err => {
          wx.showToast({
            title: '城市上传失败',
            icon: 'none',
            duration: 2000
          })
        });
    }

  },
  delCityItem(e) {
    if (this.data.flag) {
      console.log(e, e.target.dataset.index)
      this.data.cities.splice(e.currentTarget.dataset.index, 1);
      this.setData({ cities: this.data.cities });
      const pages = getCurrentPages();
      const homePage = pages[pages.length - 2];
      homePage.data.cities = [...this.data.cities];
      homePage.data.userCityChange = true;
      this.data.userCityChange = true;
    }
  },
  goToSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  longTap(e) {
    if (this.data.flag) {
      this.setData({
        curtIndex: e.currentTarget.dataset.index,
        y: e.currentTarget.offsetTop * this.data.rate,
        flag: false
      })
    }

  },
  touchMove(e) {
    if (!this.data.flag) {
      if (Math.abs(e.changedTouches[0].pageY - this.data.abs) > 10) {
        this.setData({
          abs: e.changedTouches[0].pageY,
          y: e.changedTouches[0].pageY * this.data.rate - 70
        })
      }

    }
  },
  touchEnd(e) {
    if (!this.data.flag) {
      let maxIndex = this.data.cities.length - 1;
      let curtItem = this.data.cities.splice(this.data.curtIndex, 1);
      let endY = e.changedTouches[0].pageY * this.data.rate;
      let index = Math.floor(endY / 140);
      if (endY < 0) {
        index = 0;
      } else if (index > maxIndex) {
        index = maxIndex;
      }
      this.data.cities.splice(index, 0, curtItem[0]);
      this.setData({
        curtIndex: null,
        cities: this.data.cities,
        flag: true
      });
      const pages = getCurrentPages();
      const homePage = pages[pages.length - 2];
      homePage.data.cities = [...this.data.cities];
      homePage.data.userCityChange = true;
      this.data.userCityChange = true;
    }
  }
})


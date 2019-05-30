//const config=require('./config.js');

function combine(a, b) {
  for (let key in b) {
    if (typeof b[key] == 'object') {
      if (a[key]) {
        Object.assign(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    } else {
      a[key] = b[key];
    }
  }
}

function handleOption(preset, option, resolve, reject) {
  const defaultOption = {
    showLoading: true,
    loadingOption: {
      title: '加载中',
      mask: true
    },
    url: '',
    data: {

    },
    success(res) {
      resolve(res)
    },
    fail(err) {
      console.log(err);
      reject(err);
    }
  }
  if (option && preset) {
    combine(preset, option)
    combine(defaultOption, preset)
  } else if (preset) {
    combine(defaultOption, preset)
  } else if (option) {
    combine(defaultOption, option)
  }
  if (defaultOption.showLoading) {
    wx.showLoading(defaultOption.loadingOption);
    Object.assign(defaultOption, {
      complete() {
        wx.hideLoading();
      }
    }
    )
  }
  return defaultOption;
}

function http(preset, option) {
  return new Promise(function (resolve, reject) {
    wx.request(handleOption(preset, option, resolve, reject))
  })
}

module.exports = http;
// 云函数入口文件
const cloud = require('wx-server-sdk');
const rp = require('request-promise');

// cloud.init({ env: 'test-xxxx' });
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext();
  try {


    const tk = await rp({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential',
      qs: {
        appid: 'xxxxx',
        secret: 'xxxxx'
      },
      json: true
    });

    const result = await rp({
      method: 'POST',
      url: `https://api.weixin.qq.com/wxa/getwxacode?access_token=${tk.access_token}`,
      body: {
        path: `/pages/index/index?nickName=${event.nickName}`,
        auto_color: true
      },
      json: true,
      encoding: null
    });
    const upload = await cloud.uploadFile({
      cloudPath: `codeImg/${OPENID}.png`,
      fileContent: result,
    });
    await db.collection('user').where({
      _openid: OPENID
    })
      .update({
        data: {
          codeImg: upload.fileID
        }
      });
    return upload.fileID;
  } catch (err) {
    console.error(err)
  }
}
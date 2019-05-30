// 云函数入口文件
const cloud = require('wx-server-sdk')

// cloud.init({ env: 'test-xxxx'});
cloud.init();
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  try {
    const { data } = await db.collection('user').where({ _openid: OPENID }).get();

    if (data.length) {
      return await db.collection('user').where({ _openid: OPENID }).update({
        data: { city: event.city }
      });
    } else {
      return await db.collection('user').add({
        data: { _openid: OPENID, city: event.city, codeImg: '' }
      })
    }
  } catch (e) {
    console.error(e);
  }
}
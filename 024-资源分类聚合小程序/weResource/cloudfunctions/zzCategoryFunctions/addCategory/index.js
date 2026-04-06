const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  let category = event.category
  category._openid = wxContext.OPENID

  return await db.collection("zz_category").add({
    data:category,
    success:res=>{
      return {
        _id: category._id
      }
    }
  })

};

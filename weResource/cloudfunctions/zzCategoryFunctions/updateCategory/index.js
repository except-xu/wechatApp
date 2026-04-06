
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  
  // 获取基础信息
  let category = event.category

  return await db.collection("zz_category").doc(category.id).update({
    data:category,
    success:res=>{
      return {
        _id: category._id
      }
    }
  })
  
};

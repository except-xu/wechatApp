const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()

const addCategory = require('./addCategory/index');
const updateCategory = require('./updateCategory/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'addCategory':
            return await addCategory.main(event, context);
        case 'updateCategory':
            return await updateCategory.main(event, context);
    }
};
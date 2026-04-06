const db = wx.cloud.database()
const app = getApp()
let util = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    recommendArray:[
      {name:"1",id:1},
      {name:"2",id:2},
      {name:"3",id:3},
      {name:"4",id:4},
      {name:"5",id:5},
      {name:"6",id:6},
      {name:"7",id:7},
      {name:"8",id:8},
      {name:"9",id:9},
      {name:"10",id:10}
    ],
    recommend:1,
    recommendName:"1",
    
    statusArray:[
      {name:"发布",id:1},
      {name:"草稿",id:0}
    ],
    status:1,
    statusName:"发布"
  },

  onLoad: function(options){
    this.setData({
      categoryId:options.id
    })
    db.collection("zz_category").doc(options.id).get({
      success:res=>{
        let category = res.data
        this.setData({
          category:category,
          categoryImg: category.img,

          recommend:category.recommend,
          recommendName:category.recommendName,
          status:category.status,
          statusName:category.statusName
        })
      }
    })
  },

  //修改状态
  changeStatus:function(e){
    let item = this.data.statusArray[e.detail.value];
    this.setData({
      status: item.id,
      statusName: item.name
    })
  },

  //是否推荐
  changeRecommend:function(e){
    let item = this.data.recommendArray[e.detail.value];
    this.setData({
      recommend: item.id,
      recommendName: item.name
    })
  },

  insertImage: function (e) {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {

        //上传到云平台
        let imgFile = res.tempFilePaths[0]
        let filename = imgFile.substring(imgFile.lastIndexOf("."));
        filename = new Date().getTime() + filename

        wx.showLoading({
          title: '图片上传中',
        })

        wx.cloud.uploadFile({
          filePath: res.tempFilePaths[0],
          cloudPath: filename,
          success: cloudRes => {
            that.editorContext.insertImage({
              src: cloudRes.fileID, //可以换成云函数的 fileid
              data: {
                id: filename
              },
              width: '100%'
            })
          },
          fail: console.error,
          complete: res=>{
            wx.hideLoading();
          }
        })
      }
    })
  },

  //form表单提交
  submitCategory: function (e) {
    let category = e.detail.value

    //先做一些校验，再发起提交
    if(util.isEmpty(category.name)){
      wx.showToast({
        name: '名称不能为空',
      })
      return
    }

    wx.showLoading({
      title: "更新中..."
    })

    if (this.data.categoryImg != this.data.category.img) {
      let categoryImg = this.data.categoryImg
      let filename = categoryImg.substring(categoryImg.lastIndexOf("."))
      filename = new Date().getTime() + filename

      wx.cloud.uploadFile({
        cloudPath: filename,
        filePath: this.data.categoryImg,
        success: res => {
          category.img = res.fileID
          this.updateCloudCategory(category)
        },
        fail: console.error
      })

    } else {
      //更新到云数据库(category是新对象)
      category.img = this.data.categoryImg
      this.updateCloudCategory(category)
    }

  },

  //创建博客到云数据库
  updateCloudCategory: function (category) {
    category.devid = app.devid
    category.id = this.data.category._id
    category.status = this.data.status
    category.statusName = this.data.statusName
    category.recommend = this.data.recommend
    category.recommendName = this.data.recommendName
    category.name = category.name.trim()
    category.devid = app.devid
    
    //添加博客到云平台数据库中
    wx.cloud.callFunction({
      name: "zzCategoryFunctions",
      data: {
        type: "updateCategory",
        category: category
      },
      success: res => {
        wx.showToast({
          title: '更新成功',
        })
        console.log(res);
      },
      fail: res => {
        console.log(res)
      },
      complete: res => {
        wx.hideLoading() //不严谨
      }
    })

  },

  //选择本地图片
  chooseCategoryImage: function (e) {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          categoryImg: res.tempFilePaths[0]
        })
      }
    })
  },

  //移除图片
  removeCategoryImage: function (e) {
    this.setData({
      categoryImg: null
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }


})
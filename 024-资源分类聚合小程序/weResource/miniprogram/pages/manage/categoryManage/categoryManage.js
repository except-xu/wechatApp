
let util = require("../../../utils/util.js")
const db = wx.cloud.database()
const app = getApp()

Page({

  //分页
  pageNum:1,
  pageSize:20,
  hasMore:true,

  /**
   * 页面的初始数据
   */
  data: {
    categoryArr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载云数据库中的数据
    this.loadCategory()
  },
  
  //刷新
  loadCategory: function(key){
    wx.showLoading()

    let query = db.collection("zz_category").field({
      name: true,
      img: true,
      statusName:true
    }).where({
        devid : app.devid
      })
    
    if(key && !util.isEmpty(key)){
      query = query.where({
        name: db.RegExp({
          regexp: key,
          options: 'i'
        })
      })
    }

    query = query.orderBy("recommend", "asc")
    query = query.skip((this.pageNum-1)*this.pageSize).limit(this.pageSize)

    //默认加载20条
    query.get({
      success: res => {
        this.hasMore=(res.data.length==this.pageSize)?true:false
        this.pageNum=this.pageNum + 1

        let categoryArr = this.data.categoryArr
        categoryArr = categoryArr.concat(res.data)
        this.setData({
          categoryArr: categoryArr
        })

      },
      complete: res => wx.hideLoading()
    })

  },

  //搜索
  doSearch:function(e){
    let key = e.detail.value.key
    this.resetSearch()
    this.loadCategory(key.trim())
  },

  //重置搜索条件
  resetSearch:function(){
    this.hasMore = true
    this.pageNum = 1
    this.setData({
      categoryArr:[]
    })
  },

  //添加分类
  addCategory: function (e) {
    wx.navigateTo({
      url: '/pages/manage/categoryAdd/categoryAdd',
    })
  },

  //修改分类
  editCategory: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/manage/categoryEdit/categoryEdit?id='+id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if(this.hasMore){
      this.loadCategory()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
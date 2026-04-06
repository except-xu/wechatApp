// pages/search/search.js
const db = wx.cloud.database()
const _ = db.command
const util = require("../../utils/util.js");

Page({

  //分页
  pageNum:1,
  pageSize:20,
  hasMore:true,

  /**
   * 页面的初始数据
   */
  data: {
    key:'',
    curCategory:1,
    articles:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 修改答案配图
  changeKey: function(e){
    if(e.detail.value){
      this.setData({
        key:e.detail.value
      })
    }
  },

  //搜索
  doSearch:function(){
    let key = this.data.key.trim()
    if(util.isEmpty(key)){
      wx.showToast({
        title: '请输入关键字',
      })
      return;
    }
    this.pageNum = 1
    this.hasMore = true
    this.setData({
      articles:[]
    })
    this.loadArticleByKey(key)
  },

  loadArticleByKey: function (key) {
    //加载云数据库中的数据
    wx.showLoading({
        title: '数据加载中',
    })
    
    let query = db.collection("zz_article").where(_.or([
      {title: db.RegExp({
        regexp: key,
        options: 'i'
      })},
      {desc: db.RegExp({
        regexp: key,
        options: 'i'
      })}
    ])).field({
        title: true,
        desc: true,
        read: true,
        time:true,
        img:true,
        link: true
    })
    
    query = query.skip((this.pageNum-1)*this.pageSize).limit(this.pageSize)
    query.get({
      success: res => {
          this.hasMore=(res.data.length==this.pageSize)?true:false
          this.pageNum = this.pageNum + 1

          let articles = this.data.articles
          articles = articles.concat(res.data)
          
          let regExp = new RegExp(key,"gi")
          let str = "<font class='red'>"+key+"</font>"
          for(let item of res.data){
              item.title = item.title.replace(regExp, str)
              if(item.desc){
                item.desc = item.desc.replace(regExp, str)
              }
          }
          
          this.setData({
            articles: articles
          })
      },
      complete: res => {
          wx.hideLoading()
      },
      fail: res => {
          wx.showToast({
              title: '获取失败',
          })
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if(this.hasMore){
      let key = this.data.key
      if(!util.isEmpty(key)){
        this.loadArticleByKey(key)
      }
    }
  },

  //预览图片
  previewImg: function(e){
    let img = e.currentTarget.dataset.img
    this.wxPerviewImg(img)
  },

  //广告激励才能看大图
  previewImgAd: function(e){
    let img = e.currentTarget.dataset.img
    let _that = this
    wx.showModal({
      title: '下载原图',
      content: '看完视频广告，长按下载原图',
      confirmText:"看广告",
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中...',
          })
          if(!this.videoAd){
            this.videoAd = wx.createRewardedVideoAd({
              adUnitId: 'adunit-c7b44a576b479e8b'
            })
          }
          if(this.videoAd.closeHandler){
            this.videoAd.offClose(this.videoAd.closeHandler);
          }
          this.videoAd.onError(function(res){
          })
          this.videoAd.onLoad(function(res){
          })
          this.videoAd.closeHandler = function(res){
            if(res.isEnded){
              _that.wxPerviewImg(img)
            }else{
              wx.showToast({
                title: '很遗憾未成功',
              })
            }
          }
          this.videoAd.onClose(this.videoAd.closeHandler);

          this.videoAd.load().then(() => {
            this.videoAd.show().then(() => {
              wx.hideLoading()
            }).catch(err => {
              wx.hideLoading()
            })
          }).catch(err => {
            wx.hideLoading()
          })
        }
      }
    })
  },
  
  wxPerviewImg: function(img){
    wx.previewImage({
      current: img,  //当前图片的地址
      urls: [img]  //图片列表，可以实现多个图片预览
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
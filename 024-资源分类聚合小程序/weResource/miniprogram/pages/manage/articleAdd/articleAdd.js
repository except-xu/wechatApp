const db = wx.cloud.database()
const app = getApp()
let util = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否推荐
    recommendArray:[
      {name:"否",id:0},
      {name:"是",id:1}
    ],
    recommend:0,
    recommendName:"否",
    
    //是否发布
    statusArray:[
      {name:"发布",id:1},
      {name:"草稿",id:0}
    ],
    status:1,
    statusName:"发布",

    //是否显示在首页
    idxArray:[
      {name:"是",id:1},
      {name:"否",id:0}
    ],
    idx:1,
    idxName:"是"

  },

  onLoad:function(){
      this.prepareCategory()
  },

  prepareCategory:function(e){
    //从模块加载
    db.collection("zz_category").field({
      name:true,
      _id:true
    }).where({
      status:1,
      devid: app.devid
    }).orderBy("recommend", "asc").get({
      success: res => {
        let categoryArray = res.data
        this.setData({
          categoryArray:categoryArray,
          category:categoryArray[0]._id,
          categoryName:categoryArray[0].name
        })
      },
      complete: res => wx.hideLoading()
    })
  },

  //修改分类
  changeCategory:function(e){
    let item = this.data.categoryArray[e.detail.value];
    this.setData({
      category: item._id,
      categoryName: item.name
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

  //修改发布
  changeStatus:function(e){
    let item = this.data.statusArray[e.detail.value];
    this.setData({
      status: item.id,
      statusName: item.name
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
            //第一个上传的图片
            if(that.firstImage == null){
              that.firstImage = cloudRes.fileID
            }

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
  submitArticle: function (e) {
    let article = e.detail.value

    //先做一些校验，再发起提交
    if(util.isEmpty(article.title)){
      wx.showToast({
        title: '标题不能为空',
      })
      return
    }

    //提交数据
    wx.showLoading({
      title: "数据加载中..."
    })

    //获取富文本编辑器里的内容
    this.editorContext.getContents({
      success: res => {
        article.content = res.html

        //上传图片
        if (this.data.articleImg) {
          let articleImg = this.data.articleImg
          let filename = articleImg.substring(articleImg.lastIndexOf("."))
          filename = new Date().getTime() + filename

          wx.cloud.uploadFile({
            cloudPath: filename,
            filePath: this.data.articleImg,
            success: res => {
              article.img = res.fileID
              this.createCloudArticle(article)
            },
            fail: console.error
          })
        } else {
          //创建到云数据库
          this.createCloudArticle(article)
        }
      }
    })
  },

  //创建博客到云数据库
  createCloudArticle: function (article) {
    article.time = new Date().getTime()
    article.version = app.version
    article.recommend = this.data.recommend
    article.recommendName = this.data.recommendName
    article.status = this.data.status
    article.statusName = this.data.statusName
    article.category = this.data.category
    article.categoryName = this.data.categoryName
    
    article.read = 105 + util.rand(10,50) //阅读量
    article.like = 0 //喜欢量
    article.title = article.title.trim()
    article.desc = article.desc.trim()
    article.sortNum = new Number(article.sortNum)
    article.devid = app.devid
    
    //添加博客到云平台数据库中
    wx.cloud.callFunction({
      name: "zzArticleFunctions",
      data: {
        type: "addArticle",
        article: article
      },
      success: res => {
        wx.showToast({
          title: '添加成功',
        })
      },
      fail: res => {
        console.log(res)
      },
      complete: res => {
        wx.hideLoading() //不严谨
      }
    })

  },

  //富文本编辑器准备好了
  onEditorReady: function (e) {
    wx.createSelectorQuery().select("#contentEditor").context(res => {
      this.editorContext = res.context
    }).exec()
  },

  //富文本处理
  format: function (e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    this.editorContext.format(name, value)
  },

  //选择本地图片
  chooseArticleImage: function (e) {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          articleImg: res.tempFilePaths[0]
        })
      }
    })
  },

  //移除图片
  removeArticleImage: function (e) {
    this.setData({
      articleImg: null
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
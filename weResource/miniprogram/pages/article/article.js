// pages/articleRead/articleRead.js
const db = wx.cloud.database()
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
      })

      this.loadArticle(options.id)
      this.incRead(options.id)
    },

    //博客阅读量+1
    incRead: function(id){
      wx.cloud.callFunction({
        name: "quickFunctions",
        data: {
          type: "incArticleRead",
          id: id
        }
      })
    },

    //加载站点
    loadSite:function(){
      app.getSite(res=>{
        this.setData({
          site: res.data
        })
      })
    },

    //加载博客
    loadArticle: function(id){
      wx.showLoading({
        title: '数据加载中',
      })

      let articleDoc = db.collection("zz_article").doc(id);
      articleDoc.get({
        success: res => {
            this.setData({
                article: res.data
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

    //打开视频
    openVideo: function (e) {
        let fname = e.currentTarget.dataset.fname
        let vid = e.currentTarget.dataset.vid
        wx.openChannelsActivity({
            finderUserName: fname,
            feedId: vid
        })
    },

    //复制链接
    copyDownload: function (e) {
        wx.setClipboardData({
            data: e.currentTarget.dataset.download
        })
    },

    //打开PDF
    openPdf: function (e) {
        wx.showLoading({
          title: '数据加载中...',
        })
        let pdf = e.currentTarget.dataset.pdf
        wx.downloadFile({
            url: pdf,
            success: res => {
                if (res.statusCode === 200) {
                    wx.openDocument({
                        filePath: res.tempFilePath
                    })
                } else {
                    //fail tip
                }
            },
            fail: res => {
                wx.showToast({
                  title: '打开失败...',
                })
            },
            complete: function () {
                wx.hideLoading();
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

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
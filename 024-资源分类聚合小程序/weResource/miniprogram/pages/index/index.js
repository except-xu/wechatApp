// pages/index/index.js
let util = require("../../utils/util.js");
var app = getApp();
const db = wx.cloud.database();

Page({

    //分页
    pageNum: 1,
    pageSize: 20,
    hasMore: true,

    /**
     * 页面的初始数据
     */
    data: {
        curId: 0,
        articleList: [],
        categoryList: [{
            name: "所有",
            _id: '0',
            img:'../../images/icon/c0.png'
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })

        //默认加载所有
        this.loadArticleList()

        //家长分类
        this.prepareCategory()
    },

    //加载资源
    loadArticleList: function () {
        wx.showLoading({
            title: '数据加载中',
        })

        let query = db.collection("zz_article").where({
            devid: app.devid
        })
        if (this.data.curId != '0') {
            query = query.where({
                category: this.data.curId
            })
        }
        query = query.field({
            title: true,
            link: true,
            desc: true,
            img: true
        })
        if (this.data.curId) {
            query = query.orderBy("status", "desc").orderBy("time", "desc")
        } else {
            query = query.orderBy("time", "desc")
        }

        query = query.skip((this.pageNum - 1) * this.pageSize).limit(this.pageSize)
        query.get({
            success: res => {
                this.hasMore = (res.data.length == this.pageSize) ? true : false
                this.pageNum = this.pageNum + 1
                let articleList = this.data.articleList
                articleList = articleList.concat(res.data)
                this.setData({
                    articleList: articleList
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

    // 记载分类
    prepareCategory: function () {
        db.collection("zz_category").field({
            name: true,
            img: true,
            _id: true
        }).where({
            status: 1,
            devid: app.devid
        }).orderBy("recommend", "asc").get({
            success: res => {
                let categoryArray = res.data
                let categoryList = this.data.categoryList.concat(categoryArray)
                this.setData({
                    categoryList: categoryList
                })
            },
            complete: res => wx.hideLoading()
        })
    },

    changeItem: function (e) {
        let id = e.currentTarget.dataset.id
        this.setData({
            curId: id,
            articleList: []
        })
        //重置
        this.pageNum = 1
        this.hasMore = true
        //加载数据
        this.loadArticleList()
    },

    toArticle(e){
        let id = e.currentTarget.dataset.id
        const url = "/pages/article/article?id=" + id
        wx.navigateTo({
          url: url,
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    scrollToLower() {
        if (this.hasMore) {
            this.loadArticleList()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {

    }

})

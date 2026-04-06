const app = getApp()
Component({

  properties: {
    showBack: Boolean,
    category: Number,
    title: String,
  },

  data: {
    navBarHeight: app.globalData.navBarHeight,
    navMenuRight: app.globalData.navMenuRight,
    navMenuTop: app.globalData.navMenuTop,
    navMenuHeight: app.globalData.navMenuHeight,
  },

  methods: {
    //返回
    doBack: function(e){
      wx.navigateBack()
    },

    //搜索页面
    toSearch: function (e) {
      if (this.properties.category == 2) {
        wx.navigateTo({
          url: '/pages/search/search?category=2',
        })
      }else{
        wx.navigateTo({
          url: '/pages/search/search',
        })
      }
    }
  }

})

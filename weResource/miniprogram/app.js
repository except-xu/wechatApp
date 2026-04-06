//app.js
const cloud = wx.cloud

App({
    devid: 101,
    globalData:{ },
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                env: 'cloud1-9gpqtz2t48f59ac7',
                traceUser: true,
            })
        }
        this.prepareNavigationBar()
    },

    //自定义NavigationBar
    prepareNavigationBar: function () {
        const systemInfo = wx.getSystemInfoSync();
        // 胶囊按钮位置信息
        const menuButton = wx.getMenuButtonBoundingClientRect();
        // 导航栏高度 = 状态栏高度 + 44（适配所有机型）
        this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
        this.globalData.navMenuRight = systemInfo.screenWidth - menuButton.right;
        this.globalData.navMenuTop = menuButton.top;
        this.globalData.navMenuHeight = menuButton.height;
        //窗口高度
        this.globalData.windowHeight = systemInfo.windowHeight;
        this.globalData.windowWidth = systemInfo.windowWidth;
    },
})

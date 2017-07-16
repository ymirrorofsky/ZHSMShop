angular.module('starter.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })

            // Each tab has its own nav history stack:

            .state('tab.home', {
                url: '/home',
                templateUrl: 'templates/tab-home.html',
                controller: 'HomeCtrl'
            })
            .state('auth', {
                url: '/auth',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })

            .state('auth.login', {
                url: '/login',
                cache: false,
                templateUrl: 'templates/auth/login.html',
                controller: 'loginCtrl'
            })
            .state('auth.registerRole', {
                url: '/registerRole',
                cache: false,
                templateUrl: 'templates/auth/registerRole.html'
                // controller: 'registerRoleCtrl'
            })
            .state('auth.register', {
                url: '/register',
                cache: false,
                params: { role: null },
                templateUrl: 'templates/auth/register.html',
                controller: 'registerCtrl'
            })
            .state('auth.resetPsdRole', {
                url: '/resetPsdRole',
                templateUrl: 'templates/auth/resetPsdRole.html',
            })
            .state('auth.resetPsd', {
                url: '/resetPsd',
                params: { role: null },
                cache: false,
                templateUrl: 'templates/auth/resetPsd.html',
                controller: 'resetPsdCtrl'
            })
            .state('product', {
                url: '/product',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })
            .state('product.upload', {
                url: '/upload',
                cache: false,
                templateUrl: 'templates/shop/upload.html',
                controller: 'uploadCtrl'
            })
            .state('product.manage', {
                url: '/manage',
                cache: false,
                templateUrl: 'templates/shop/manage.html',
                controller: 'manageCtrl'
            })
            .state('product.goodsInfo', {
                url: '/goodsInfo',
                params: { goodsNo: null },
                cache: false,
                templateUrl: 'templates/shop/goodsInfo.html',
                controller: 'goodsInfoCtrl'
            })
            .state('product.updateGoodsInfo', {
                url: '/updateGoodsInfo',
                params: { goodsNo: null },
                cache: false,
                templateUrl: 'templates/shop/updateGoodsInfo.html',
                controller: 'updateGoodsInfoCtrl'
            })
            .state('shop', {
                url: '/shop',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })
            .state('shop.info', {
                url: '/info',
                cache: false,
                templateUrl: 'templates/shop/shopInfo.html',
                controller: 'shopInfoCtrl'
            })
            .state('shop.orderList', {
                url: '/orderList/:type',
                params: { type: null },
                cache: false,
                templateUrl: 'templates/shop/orderList.html',
                controller: 'shopOrderListCtrl'
            })
            .state('shop.orderInfo', {
                url: '/orderInfo/:id/:type',
                params: {
                    id: null,
                    type: null
                },
                cache: false,
                templateUrl: 'templates/shop/orderInfo.html',
                controller: 'shopOrderInfoCtrl'
            })
            .state('shop.center', {
                url: '/center',
                cache: false,
                templateUrl: 'templates/shop/center.html'
            })
            .state('shop.profit', {
                url: '/profit',
                cache: false,
                templateUrl: 'templates/shop/profit.html'
            })
            .state('shop.orderProfit', {
                url: '/orderProfit',
                cache: false,
                templateUrl: 'templates/shop/orderProfit.html',
                controller: 'shopOrderProfitCtrl'
            })
            .state('shop.moneyBack', {
                url: '/moneyBack',
                cache: false,
                templateUrl: 'templates/shop/moneyBack.html',
                controller: 'shopMoneyBackCtrl'
            })

            .state('shop.finance', {
                url: '/finance',
                cache: false,
                templateUrl: 'templates/shop/finance.html',
                controller: 'shopFinanceCtrl'
            })
            .state('shop.repo', {
                url: '/repo',
                cache: false,
                templateUrl: 'templates/shop/repo.html',
                controller: 'shopRepoCtrl'
            })
            .state('shop.myBank', {
                url: '/myBank',
                cache: false,
                templateUrl: 'templates/shop/myBank.html',
                controller: 'shopMyBankCtrl'
            })
            .state('shop.getRealMoney', {
                url: '/getRealMoney',
                cache: false,
                templateUrl: 'templates/shop/getRealMoney.html',
                controller: 'shopGetRealMoneyCtrl'
            })
            .state('shop.modifyLoginPwd', {
                url: '/modifyLoginPwd',
                params: { type: null },
                cache: false,
                templateUrl: 'templates/shop/modifyLoginPwd.html',
                controller: 'shopModifyLoginPwdCtrl'
            })
            .state('shop.repoList', {
                url: '/repoList/:type',
                params: {
                    type: null
                },
                cache: false,
                templateUrl: 'templates/shop/repoList.html',
                controller: 'shopRepoListCtrl'
            })
            .state('shop.repoInfo', {
                url: '/repoInfo/:id',
                params: {
                    id: null
                },
                templateUrl: 'templates/shop/repoInfo.html',
                controller: 'shopRepoInfoCtrl'
            })
            .state('agent', {
                url: '/agent',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })
            .state('agent.manage', {
                url: '/manage',
                cache: 'false',
                templateUrl: 'templates/agent/manage.html',
            })
            .state('agent.userInfo', {
                url: '/userInfo',
                cache: 'false',
                params: { uid: null },
                templateUrl: 'templates/agent/userInfo.html',
                controller: 'agentUserInfoCtrl'
            })
            .state('agent.profit', {
                url: '/profit',
                cache: 'false',
                templateUrl: 'templates/agent/profit.html',
                controller: 'agentProfitCtrl'
            })
            .state('agent.profitDetail', {
                url: '/profitDetail',
                cache: 'false',
                params: { subId: null },
                templateUrl: 'templates/agent/profitDetail.html',
                controller: 'agentprofitDetailCtrl'
            })
            .state('agent.subordinate', {
                url: '/subordinate',
                cache: 'false',
                params: { uid: null },
                templateUrl: 'templates/agent/subordinate.html',
                controller: 'agentSubordinateCtrl'
            })
            .state('agent.recommend', {
                url: '/recommend',
                cache: false,
                templateUrl: 'templates/agent/recommend.html',
                controller: 'agentRecommendCtrl'
            })
            .state('agent.recommendHistory', {
                url: '/recommendHistory',
                cache: false,
                templateUrl: 'templates/agent/recommendHistory.html',
                controller: 'agentRecommendHistoryCtrl'
            })
            .state('agent.getRealMoney', {
                url: '/agentGetRealMoney',
                cache: false,
                templateUrl: 'templates/agent/getRealMoney.html',
                controller: 'agentGetRealMoneyCtrl'
            })
            .state('shareholder', {
                url: '/shareholder',
                abstract: true,
                template: '<ion-nav-view></ion-nav-view>'
            })
            .state('shareholder.profit', {
                url: '/profit',
                cache: 'false',
                params: { uid: null },
                templateUrl: 'templates/shareholder/profit.html',
                controller: 'shareholderProfitCtrl'
            })
            .state('shareholder.profitDetail', {
                url: '/profitDetail',
                cache: 'false',
                params: { uid: null },
                templateUrl: 'templates/shareholder/profitDetail.html',
                controller: 'shareholderprofitDetailCtrl'
            })

            ;



        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/auth/login');
    });
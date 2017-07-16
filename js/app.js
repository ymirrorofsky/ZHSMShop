// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.routes', 'starter.services', 'starter.directives', 'ngResource', 'ngCordova'])

	.run(function ($rootScope, $ionicPlatform, $ionicHistory,$interval, $cordovaSplashscreen, $location, $state, Storage, Shop, Message) {
		$ionicPlatform.ready(function () {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});

		// 初始化全局变量
		$rootScope.globalInfo = {
			user: (function () {
				return Storage.get('user') || { uid: '', role: 0 }
			})(), //全局user的数据
			noticeNum: ''
		}

		// 监听路由变化
		$rootScope.$on('$stateChangeStart', function (event, toState) {
			//Object {url: "/login", cache: false, templateUrl: "templates/auth/login.html", controller: "loginCtrl", name: "auth.login"}
			var noNeedLogin = ['auth.login', 'auth.registerRole', 'auth.register', 'auth.resetPsd','auth.resetPsdRole' , 'oneLogin'];
			if (noNeedLogin.indexOf(toState.name) < 0 && !Shop.checkAuth()) {
				$state.go("auth.login"); //跳转到登录页
				event.preventDefault(); //阻止默认事件，即原本页面的加载
			}
		})

		// cordova初始化后的操作
		document.addEventListener("deviceready", function () {
			//退出启动画面
			setTimeout(function () {
				try {
					$cordovaSplashscreen.hide();
				} catch (e) {
					console.info(e);
				}  
			}, 700);
			// Jpush.init(); // 极光推送
			// System.checkUpdate(); //检查更新
		}, false);


		//退出
		var exit = false;
		$ionicPlatform.registerBackButtonAction(function (e) {
			if ($location.path() == '/tab/home' || $location.path() == '/auth/login') {
				if (exit) {
					ionic.Platform.exitApp();
				} else {
					exit = true;
					Message.show('再按一次退出系统', "500");
					setTimeout(function () {
						exit = false;
					}, 3000);
				}
			} else if ($ionicHistory.backView()) {
				$ionicHistory.goBack();
			} else {
				if (exit) {
					ionic.Platform.exitApp();
				}
				exit = true;
				Message.show('再按一次退出系统', "500");
				setTimeout(function () {
					exit = false;
				}, 3000);
			}
			e.preventDefault();
			return false;
		}, 101);




	})


	.constant('ENV', {
		'REGULAR_MONEY': /^\d*(\.\d{1,2}){0,1}$/,
		'REGULAR_MOBILE': /^1\d{10}$/,
		'REGULAR_IDCARD': /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
		'BANK_CARD': /^(\d{16}|\d{19})$/,
		// 'ZH_URL': 'http://192.168.0.122/app/index.php?i=1&c=entry&m=dgmc',		
		'ZH_URL': 'http://zhsc.weishang6688.com/app/index.php?i=1&c=entry&m=dgmc',
		'default_avatar': 'img/nav.png'
	})

	.config(function ($ionicConfigProvider) {
		$ionicConfigProvider.platform.ios.tabs.style('standard');
		$ionicConfigProvider.platform.ios.tabs.position('bottom');
		$ionicConfigProvider.platform.android.tabs.style('standard');
		$ionicConfigProvider.platform.android.tabs.position('bottom');
		$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
		$ionicConfigProvider.platform.android.navBar.alignTitle('center');
		$ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
		$ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
		$ionicConfigProvider.platform.ios.views.transition('no');
		$ionicConfigProvider.platform.android.views.transition('no');
	})

	.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
		$ionicConfigProvider.views.transition('no')
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		var param = function (obj) {
			var query = '',
				name, value, fullSubName, subName, subValue, innerObj, i;
			for (name in obj) {
				value = obj[name];
				if (value instanceof Array) {
					for (i = 0; i < value.length; ++i) {
						subValue = value[i];
						fullSubName = name + '[' + i + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if (value instanceof Object) {
					for (subName in value) {
						subValue = value[subName];
						fullSubName = name + '[' + subName + ']';
						innerObj = {};
						innerObj[fullSubName] = subValue;
						query += param(innerObj) + '&';
					}
				} else if (value !== undefined && value !== null)
					query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}
			return query.length ? query.substr(0, query.length - 1) : query;
		};
		$httpProvider.defaults.transformRequest = [function (data) {
			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}];
		/*$httpProvider.defaults.headers.post['X-CSRFToken'] = 11;*/
		$httpProvider.interceptors.push('TokenAuth');
	});
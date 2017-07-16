angular.module('starter.controllers', [])

  .controller('HomeCtrl', function ($scope, $rootScope, Shop, $ionicActionSheet, $ionicLoading, $timeout, Storage, $ionicHistory, $state) {
    $scope.$on("$ionicView.beforeEnter", function () {
      if (!$rootScope.globalInfo.user.uid) {
        $state.go('auth.login');
      }
    })
    $scope.logout = function () {
      $ionicActionSheet.show({
        destructiveText: '退出登录',
        titleText: '确定退出当前登录账号吗？',
        cancelText: '取消',
        cancel: function () {
          return true;
        },
        destructiveButtonClicked: function () {
          Shop.logout();
          $ionicHistory.nextViewOptions({ //退出后清除导航的返回
            disableBack: true
          });
          $ionicLoading.show({
            noBackdrop: true,
            template: '退出成功！',
            duration: '1000'
          });
          $timeout(function () {
            $state.go('auth.login');
          }, 1200);
          return true;
        }
      });
    };

  })

  .controller('ChatsCtrl', function ($scope) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});


  })


  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })
  .controller('loginCtrl', function ($rootScope, $scope, $ionicModal, Auth, $state, Message, Shop) {
    $scope.$on("$ionicView.beforeEnter", function () {
      if ($rootScope.globalInfo.user.uid) {
        $state.go('tab.home');
      }
    });
    $scope.isEmptyObjct = function (obj) {
      for (var key in obj) {
        return false;
      }
      return true;
    }
    $scope.agree = true;
    $scope.loginData = { role: '', mobile: '', password: '' };
    $scope.loginData.role = '0';
    $scope.authAgree = function () {
      $scope.agree = !$scope.agree;
    };
    $ionicModal.fromTemplateUrl('templates/modal/single-page.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.spTitle = '用户注册协议';
    })
    $scope.showAgreement = function ($event) {
      $scope.modal.show();
      $event.stopPropagation(); // 阻止冒泡
    };
    $scope.login = function () {
      if (!$scope.agree) {
        Message.show('请勾选会员注册协议');
        return false;
      }
      $scope.loginData.role = $scope.loginData.role || 1
      console.log($scope.loginData)
      Auth.login($scope.loginData.role, $scope.loginData.mobile, $scope.loginData.password).then(function (response) {
        $state.go('tab.home')
        // Shop.getShopInfo($rootScope.globalInfo.user.uid).then(function (response) {
        //   $scope.shopInfo = response.data
        //   if ($scope.isEmptyObjct($scope.shopInfo)) {
        //     $state.go('shop.shopInfo')
        //     return false;
        //   }
        //   $state.go('tab.home')
        // })
      });
    }
  })
  .controller('registerCtrl', function ($scope, $ionicModal, Message, ENV, Auth, $interval, $stateParams, $cordovaCamera, $ionicActionSheet) {
    $scope.agree = true;
    $scope.reg = {
      step: 1, registerRole: '', tMobile: '', mobile: '', pictureCaptcha: '', captcha: '', agree: true, password: '', rePassword: '', number: 60, bol: false,
      IDCard: '', realname: '', idFront: '', idBehind: '', photo: '', license: ''
    };
    $scope.reg.registerRole = $stateParams.role;
    // console.log($scope.reg.registerRole)
    $scope.authAgree = function () {
      $scope.agree = !$scope.agree;
    };
    $ionicModal.fromTemplateUrl('templates/modal/single-page.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.spTitle = '用户注册协议';
    })
    $scope.showAgreement = function ($event) {
      $scope.modal.show();
      $event.stopPropagation(); // 阻止冒泡
    };
    $scope.pictureCaptchaUrl = ENV.ZH_URL + '&do=utility&op=getPictureCaptcha';
    $scope.getSmsCaptcha = function () {
      if (!$scope.agree) {
        Message.show('请勾选会员注册协议');
        return false;
      }
      if ($scope.reg.tMobile) {
        if (!ENV.REGULAR_MOBILE.test($scope.reg.tMobile)) {
          Message.show('请输入正确的推荐人手机号');
          return;
        }
      }
      if (!$scope.reg.mobile || !ENV.REGULAR_MOBILE.test($scope.reg.mobile)) {
        Message.show('请输入正确的手机号');
        return;
      }
      if (!$scope.reg.pictureCaptcha) {
        Message.show('请输入验证码');
        return;
      }
      Auth.getSmsCaptcha('send', $scope.reg.registerRole, $scope.reg.tMobile, $scope.reg.mobile, $scope.reg.pictureCaptcha).then(function () {
        $scope.reg.step = 2;
        $scope.countDown();
      }, function () {
        document.querySelector('img[update-img]').src = $scope.pictureCaptchaUrl; // 更新图片验证码
      });

      // Auth.checkTMobile($scope.registerRole, $scope.reg.tMobile).then(function (response) {
      //   $scope.reg.tMobile = response;
      //   console.log(response);
      // })

    };
    //发送验证后倒计时
    $scope.countDown = function () {
      $scope.reg.step = 2;
      $scope.reg.bol = true;
      $scope.reg.number = 60;
      var timer = $interval(function () {
        if ($scope.reg.number <= 1) {
          $interval.cancel(timer);
          $scope.reg.bol = false;
          $scope.reg.number = 60;
        } else {
          $scope.reg.number--;
        }
      }, 1000)
    };
    // 验证验证码，设置密码
    // idFront: '', idBehind: '', photo: '', license: ''
    $scope.next = function () {
      if ($scope.reg.step == 2) {
        Auth.checkCaptain($scope.reg.mobile, $scope.reg.captcha, $scope.reg.registerRole);
      } else if ($scope.reg.step == 3) {
        if ($scope.reg.registerRole == 0) {
          // if (!$scope.reg.idFront) {
          //   Message.show("请上传您的身份证正面照！");
          //   return false;
          // }
          // if (!$scope.reg.idBehind) {
          //   Message.show("请上传您的身份证反面照！");
          //   return false;
          // }
          // if (!$scope.reg.photo) {
          //   Message.show("请上传您的商铺封面照！");
          //   return false;
          // }
          // if (!$scope.reg.license) {
          //   Message.show("请上传您的营业执照！");
          //   return false;
          // }

        } else if ($scope.reg.registerRole == 1) {
          if (!$scope.reg.realname || $scope.reg.realname.length <= 1) {
            Message.show('请输入真实姓名dd！');
            return false;
          }
          if (!$scope.reg.IDCard || !ENV.REGULAR_IDCARD.test($scope.reg.IDCard)) {
            Message.show('请输入正确的身份证号码！');
            return false;
          }
        }
        Auth.setPassword($scope.reg);
      }
    };
    /*上传证件照*/
    $scope.uploadAvatar = function (type) {
      var buttons = [{
        text: "拍一张照片"
      },
        {
          text: "从相册选一张"
        }
      ];
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '请选择',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera", type);
          } else if (index == 1) {
            selectImages("", type);
          }
          return true;
        }
      })
    };
    var selectImages = function (from, type) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1000,
        targetHeight: 1000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == 'camera') {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }

      document.addEventListener("deviceready", function () {
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          if (type == 1) { //身份证正面照
            $scope.reg.idFront = "data:image/jpeg;base64," + imageURI;
            var image1 = document.getElementById('divImg01');
            image1.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 2) { //身份证反面照
            $scope.reg.idBehind = "data:image/jpeg;base64," + imageURI;
            var image2 = document.getElementById('divImg02');
            image2.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 3) { //商铺封面照
            $scope.reg.photo = "data:image/jpeg;base64," + imageURI;
            var image3 = document.getElementById('divImg03');
            image3.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 4) { //营业执照
            $scope.reg.license = "data:image/jpeg;base64," + imageURI;
            var image4 = document.getElementById('divImg04');
            image4.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          }
        }, function (error) {
          Message.show('选择失败,请重试.', 1000);
        });
      }, false);
    };
    //验证成功后
    $scope.$on("Captcha.success", function () {
      $scope.reg.step = 3;
    });

  })
  .controller('resetPsdCtrl', function ($scope, Auth, $interval, Message, $rootScope, $stateParams) {
    $scope.reg = {
      captcha: null,
      mobile: null,
      password: null,
      repassword: null,
      number: 60,
      bol: false,
      role: $stateParams.role
    };
    $scope.showNext = 1;
    //获取短信验证码
    $scope.getCaptcha = function () {
      Auth.getCaptcha(function (response) {
        if (response.code !== 0) {
          Message.show(response.msg);
          return false;
        }
        $rootScope.$broadcast('Captcha.send');
        Message.show(response.msg, 1000);
      }, function () {
        Message.show('通信错误，请检查网络!', 1500);
      }, $scope.reg.mobile, $scope.reg.role);
    };
    //  忘记密码 验证验证码
    $scope.next = function () {
      if ($scope.showNext == 3) {
        Auth.setPassword($scope.reg, 1);
      } else if ($scope.showNext == 1) {
        Auth.checkCaptain($scope.reg.mobile, $scope.reg.captcha, $scope.reg.role, 1);
      }
    };
    //验证成功后
    $scope.$on("Captcha.success", function () {
      $scope.showNext = 3;
    });
    //发送验证后倒计时
    $scope.$on("Captcha.send", function () {
      $scope.reg.bol = true;
      $scope.reg.number = 60;
      var timer = $interval(function () {
        if ($scope.reg.number <= 1) {
          $interval.cancel(timer);
          $scope.reg.bol = false;
          $scope.reg.number = 60;
        } else {
          $scope.reg.number--;
        }
      }, 1000)
    });
  })
  .controller('uploadCtrl', function ($scope, $ionicActionSheet, $cordovaCamera, Product, Message, $state) {
    $scope.isproduceDesc = true;
    $scope.uploadInfo = {
      goodsName: '',
      goodsDesc: '',
      ex_price: '',
      marketPrice: '',
      total: '',
      firstImg: '',
      secondImg: '',
      thirdImg: '',
    };
    $scope.showProduceDesc = function () {
      $scope.isproduceDesc = !$scope.isproduceDesc;
    };

    $scope.uploadAvatar = function (type) {
      var buttons = [
        { text: "拍一张照片" },
        { text: "从相册选一张" }
      ];
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '请选择',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera", type);
          } else if (index == 1) {
            selectImages("", type);
          }
          return true;
        }
      })

    };
    var selectImages = function (from, type) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1000,
        targetHeight: 1000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == 'camera') {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }
      document.addEventListener("deviceready", function () {
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          if (type == 1) { //第一张商品图片
            $scope.uploadInfo.firstImg = "data:image/jpeg;base64," + imageURI;
            // var image1 = document.getElementById('divImg01');
            // image1.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 2) { //第二张商品图片
            $scope.uploadInfo.secondImg = "data:image/jpeg;base64," + imageURI;
            // var image2 = document.getElementById('divImg02');
            // image2.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 3) { //第三张商品图片
            $scope.uploadInfo.thirdImg = "data:image/jpeg;base64," + imageURI;
            // var image3 = document.getElementById('divImg03');
            // image3.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          }
        }, function (error) {
          Message.show('选择失败,请重试.', 1000);
        });
      }, false);
    }

    $scope.upload = function () {
      if (!$scope.uploadInfo.goodsName) {
        Message.show('商品名称不能为空');
        return false;
      }
      if (!$scope.uploadInfo.ex_price) {
        Message.show('商品价格不能为空');
        return false;
      }
      if (!$scope.uploadInfo.total) {
        Message.show('商品库存不能为空');
        return false;
      }
      if (!$scope.uploadInfo.goodsDesc) {
        Message.show('商品描述不能为空');
        return false;
      }
      Product.upload($scope.uploadInfo).then(function (data) {
        $state.go('tab.home')
      });
    };

  })
  .controller('manageCtrl', function ($scope, Product, $ionicLoading, $ionicScrollDelegate, $ionicPopup, $state, $timeout) {
    $scope.orderEmpty = false;
    $scope.products = {};
    Product.fetchProducts().then(function (data) {
      if (data == '' || data.length == 0) {
        $scope.orderEmpty = true;
        return false;
      }
      $scope.orderEmpty = false;
      $scope.products = data;
    })
    //删除
    $scope.delete = function (goodsNo) {
      var confirmPopup = $ionicPopup.confirm({
        title: '提示',
        template: '确定删除该商品吗?',
        cancelText: '取消',
        okText: '确定'
      });
      confirmPopup.then(function (res) {
        if (res) {
          Product.delete(goodsNo).then(function () {
            $state.go('product.manage', {}, { reload: true })
          })
        } else {
          console.log('You are not sure');
        }
      });
    }
    // 下拉刷新
    $scope.doRefresh = function () {
      $scope.refreshing = true;
      $scope.noMore = true;
      Product.fetchProducts().then(function (data) {
        $scope.products = data;
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '1000'
        });
      })
    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      $scope.refreshing = false;
      Product.fetchProducts($scope.page).then(function (data) {
        $scope.page++;
        $scope.products = $scope.products.concat(data);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        if (data.code != 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: '没有更多了！',
            duration: '1200'
          });
          $scope.noMore = true;
        }
      });
    };


  })
  .controller('goodsInfoCtrl', function ($scope, $stateParams, Product) {
    $scope.isproduceDesc = true;
    $scope.showProduceDesc = function () {
      $scope.isproduceDesc = !$scope.isproduceDesc;
    };
    $scope.goodInfo = {};
    angular.element(document).ready(function () {
      Product.getProductsDetail($stateParams.goodsNo).then(function (data) {
        $scope.goodInfo = data;
        console.log($scope.goodInfo.thumbs.firstImg)
        $scope.goodInfo.firstImg = data.thumbs.firstImg || './img/wuimg.png';
        $scope.goodInfo.secondImg = data.thumbs.secondImg || './img/wuimg.png';
        $scope.goodInfo.thirdImg = data.thumbs.thirdImg || './img/wuimg.png';
      });
    })







  })
  .controller('updateGoodsInfoCtrl', function ($scope, $stateParams, $cordovaCamera, Product, Message, $ionicActionSheet) {
    $scope.isproduceDesc = true;
    $scope.showProduceDesc = function () {
      $scope.isproduceDesc = !$scope.isproduceDesc;
    };
    Product.getProductsDetail($stateParams.goodsNo).then(function (data) {
      console.log(data)
      $scope.uploadInfo = data;
      $scope.uploadInfo.firstImg = '';
      $scope.uploadInfo.secondImg = '';
      $scope.uploadInfo.thirdImg = '';
      $scope.uploadInfo.firstImgShow = data.thumbs.firstImg || './img/wuimg.png';
      $scope.uploadInfo.secondImgShow = data.thumbs.secondImg || './img/wuimg.png';
      $scope.uploadInfo.thirdImgShow = data.thumbs.thirdImg || './img/wuimg.png';

      console.log($scope.uploadInfo)

    })
    $scope.uploadAvatar = function (type) {
      var buttons = [
        { text: "拍一张照片" },
        { text: "从相册选一张" }
      ];
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '请选择',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera", type);
          } else if (index == 1) {
            selectImages("", type);
          }
          return true;
        }
      })

    };
    var selectImages = function (from, type) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1000,
        targetHeight: 1000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == 'camera') {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }
      document.addEventListener("deviceready", function () {
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          if (type == 1) { //第一张商品图片
            $scope.uploadInfo.firstImg = "data:image/jpeg;base64," + imageURI;
            var image1 = document.getElementById('divImg01');
            image1.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 2) { //第二张商品图片
            $scope.uploadInfo.secondImg = "data:image/jpeg;base64," + imageURI;
            var image2 = document.getElementById('divImg02');
            image2.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          } else if (type == 3) { //第三张商品图片
            $scope.uploadInfo.thirdImg = "data:image/jpeg;base64," + imageURI;
            var image3 = document.getElementById('divImg03');
            image3.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
          }
        }, function (error) {
          Message.show('选择失败,请重试.', 1000);
        });
      }, false);
    }

    $scope.update = function () {
      if (!$scope.uploadInfo.goodsName) {
        Message.show('商品名称不能为空');
        return false;
      }
      if (!$scope.uploadInfo.spe_price) {
        Message.show('商品价格不能为空');
        return false;
      }
      if (!$scope.uploadInfo.total) {
        Message.show('商品库存不能为空');
        return false;
      }
      if (!$scope.uploadInfo.goodsDesc) {
        Message.show('商品描述不能为空');
        return false;
      }
      Product.update($scope.uploadInfo, $stateParams.goodsNo).then(function (data) {
        console.log('修改信息成功商家成功')
      });
    };

  })
  .controller('shopInfoCtrl', function ($scope, $rootScope, $ionicPopup, $ionicModal, $cordovaCamera, Area, $ionicScrollDelegate, $ionicActionSheet, Message, Shop, ENV, $state) {
    $scope.shopInfo = {
      shopName: '',
      cName: '',
      shopDescrip: '',
      selecedType: '',
      logoShow: '',
      logo: ''
    };
    $scope.isEmptyObjct = function (obj) {
      for (var key in obj) {
        return false;
      }
      return true;
    }

    Shop.getShopInfo($rootScope.globalInfo.user.uid).then(function (response) {
      // $state.go('shop.info',{},{reload:true})
      $scope.category = response.data.cid;
      if (!$scope.isEmptyObjct(response.data.info)) {
        $scope.up = {};
        $scope.up.userInfo = {};
        $scope.shopInfo = response.data.info.data
        $scope.shopInfo.shopName = response.data.info.data.title;
        $scope.shopInfo.cName = response.data.info.data.cname;
        $scope.shopInfo.shopDescrip = response.data.info.data.description;
        $scope.shopInfo.selecedType = response.data.info.data.cid
        $scope.up.userInfo.area = response.data.info.birth;
        if (response.data.info.data.logo) {
          $scope.shopInfo.logoShow = response.data.info.data.logo
        } else {
          $scope.shopInfo.logoShow = './img/wuimg.png';
        }
        $scope.shopInfo.logo = '';
      }
      //  else {
      //   $scope.shopInfo = {
      //     spid: $rootScope.globalInfo.user.uid,
      //     shopName: '',
      //     cName: '',
      //     shopPer: '',
      //     address: '',
      //     mobile: '',
      //     shopDescrip: '',
      //     selecedType: '',
      //     logo: '',
      //   };
      // }

    })




    $scope.applyBol = true;
    $scope.showShopDesc = function () {
      $scope.applyBol = !$scope.applyBol;
    };
    // 商家协议
    $ionicModal.fromTemplateUrl('templates/modal/shopAgreement.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function (modal) {
      $scope.shopAgreement = modal;
    });
    $scope.showShopAgreement = function () {
      $scope.shopAgreement.show()
    };

    $scope.areaList = {};
    $scope.up = {};
    $scope.up.userInfo = {};
    $ionicModal.fromTemplateUrl('templates/modal/area.html', {
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function (modal) {
      $scope.area = modal;
    });
    $scope.areaShow = function () {
      Area.getList(function (data) {
        $scope.areaList = $scope.areaData = data;
      });
      $scope.area.show();
    };
    $scope.selectArea = function (id) {
      $ionicScrollDelegate.scrollTop();
      var pid = id.substr(0, 2) + "0000";
      var cid = id.substr(0, 4) + "00";
      if (id.substr(0, 2) != "00" && id.substr(2, 2) != "00" && id.substr(4, 2) != "00") {
        $scope.up.userInfo.area = $scope.areaData[pid].title + " " + $scope.areaData[pid]['cities'][cid].title + " " + $scope.areaData[pid]['cities'][cid]['districts'][id];
        $scope.area.hide();
        return true;
      }
      if (id.substr(0, 2) != "00" && id.substr(2, 2) != "00") {
        $scope.areaList = $scope.areaData[pid]['cities'][id]['districts'];
        if ($scope.areaList.length <= 0) {
          $scope.up.userInfo.area = $scope.areaData[pid].title + " " + $scope.areaData[pid]['cities'][cid].title + " " + "其他（县/区）";
          $scope.area.hide();
        }
        return true;
      }
      if (id.substr(0, 2) != "00") {
        $scope.areaList = $scope.areaData[pid]['cities'];
        return true;
      }
    };

    //上传logo
    /*上传证件照*/
    $scope.uploadAvatar = function (type) {
      var buttons = [
        { text: "拍一张照片" },
        { text: "从相册选一张" }
      ];
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '请选择',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera");
          } else if (index == 1) {
            selectImages("");
          }
          return true;
        }
      })
    };

    var selectImages = function (from, type) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1000,
        targetHeight: 1000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == 'camera') {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }
      document.addEventListener("deviceready", function () {
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.shopInfo.logo = "data:image/jpeg;base64," + imageURI;
          var image1 = document.getElementById('divImg01');
          image1.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";
        }, function (error) {
          Message.show('选择失败,请重试.', 1000);
        });
      }, false);
    };


    $scope.apply = function () {
      if (!$scope.shopInfo.shopName) {
        Message.show("商户名称不能为空！");
        return false;
      }
      if (!$scope.shopInfo.cName) {
        Message.show("请输入商家负责人名字！");
        return false;
      }
      // if c(!$scope.shopInfo.shopPer) {
      //   Message.show("请输入商家推荐人名字！");
      //   return false;
      // }
      if (!$scope.up.userInfo.area) {
        Message.show("请选择地址！");
        return false;
      }
      if (!$scope.shopInfo.address) {
        Message.show("请输入您的详细地址！");
        return false;
      }
      if (!$scope.shopInfo.mobile || !ENV.REGULAR_MOBILE.test($scope.shopInfo.mobile)) {
        Message.show("请输入正确的联系方式！");
        return false;
      }
      if (!$scope.shopInfo.shopDescrip) {
        Message.show("请输入您的商家描述信息！");
        return false;
      }
      if (!$scope.shopInfo.selecedType) {
        Message.show("请选择商户经营类型！");
        return false;
      }
      //			if(!$scope.shopInfo.logo) {
      //				Message.show("请上传您的法人身份证正面照！");
      //				return false;
      //			}
      //检查该推荐商家账号是否存在
      //----------------------------------

      var confirmPopup = $ionicPopup.confirm({
        title: '提示',
        template: '确定要完善商家信息吗?',
        cancelText: '取消',
        okText: '确定'
      });
      confirmPopup.then(function (res) {
        if (res) {
          Shop.saveShopInfo($scope.shopInfo, $scope.up.userInfo.area).then(function (data) {
            // $scope.uploadInfo.logo='';
            $state.go('tab.home')
          });
        } else {
          console.log('You are not sure');
        }
      });

      //------------------------




    }


  })
  .controller('shopOrderListCtrl', function ($scope, $stateParams, Order, $ionicLoading, $timeout) {
    $scope.type = $stateParams.type;
    $scope.orderList = [];
    $scope.orderEmpty = false;
    $scope.statusName = {
      '-3': '待交易',
      '0': '已交易',
      '1': '商家已确认',
      '2': '已完成'
    };
    Order.getList($scope.type).then(function (response) {
      if (response.data == '' || response.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.orderList = response.data;
      }
    });

    // 列表下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Order.getList($scope.type).then(function (response) {
        if (response.data == '' || response.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.orderList = response.data;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '3000'
        });
      });
    };
    // 下拉加载更多列表
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Order.getList($scope.type, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.orderList = $scope.orderList.concat(response.data);
        if (response.code == 0) {
          if (response.data.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };




  })
  .controller('shopOrderInfoCtrl', function ($scope, Shop, $stateParams, $ionicModal, Message, Order, $state, $timeout, $resource, ENV, $ionicActionSheet, $ionicPopup) {
    // orderStatus -2: 代表平台拒绝, -1: 商家拒绝， 0： 待商家确认， 1： 商家已确认待平台确认， 2： 平台已确认订单完成
    $scope.statusName = {
      '-3': '待交易',
      '0': '已交易',
      '1': '商家已确认',
      '2': '已完成'
    };
    Order.getInfo($stateParams.id).then(function (response) {
      $scope.orderInfo = response.data
    })
    $scope.sureSubmit = function () {
      Order.getSure($scope.orderInfo.orderId, $scope.orderInfo.voucher).then(function (response) {

        var alertPopup = $ionicPopup.alert({
          title: '请登录商家PC后台完成付款',
        });
        alertPopup.then(function (res) {
          $state.go('shop.orderList', { 'type': 'shops' });
        });



        // if (response.code == 0) {
        //   console.log('nihao')         
        //   $state.go('shops.orderList', { 'type': 'shops' });
        // } else if (response.code == 1) {
        //   Message.show(response.msg);
        // }
      });
    }


  })
  .controller('shopRepoCtrl', function () {

  })
  .controller('shopMyBankCtrl', function ($scope, $ionicModal, Message, $ionicListDelegate, Shop, ENV, $timeout) {
    $scope.getMoney = {};


    $scope.submit = function () {
      if (!$scope.getMoney.bankName) {
        Message.show('银行名称不能为空');
        return;
      }
      if (!$scope.getMoney.bankCard) {
        Message.show('银行卡号不能为空');
        return;
      }
      if (!getMoney.bankUser) {
        Message.show('银行卡账户名不能为空');
        return;
      }
      if (!$scope.getMoney.bankMobile) {
        Message.show('银行卡预留手机号不能为空');
        return;
      }

      Shop.getMoney($scope.getMoney).then(function () {

      })


    }




  })
  .controller('shopGetRealMoneyCtrl', function ($scope, $rootScope, Shop, Message, ENV, $ionicPopup, $state) {
   
    angular.element(document).ready(function () {
      // console.log($scope.info.cost.cash_less)
      $scope.info = {};
      $scope.allow = false;
      //请求提现余额及其他
      Shop.getRealMoneytotal().then(function (data) {
        $scope.info = data;
        $scope.info.bankName = data.bank.bankName || '中国建设银行';
        $scope.info.bankCard = data.bank.bankCard || '';
        $scope.info.bankMobile = data.bank.bankMobile || '';
        $scope.info.bankUserName = data.bank.bankUserName || '';
        $scope.info.takeMoney = ''
        if ($scope.info.money == 0) {
          $scope.allow = true;
        } else {
          $scope.allow = false;
        }

        // if (!$scope.info.bank) {
        //   console.log($scope.info.bank)
        //   return false;
        // } else {
        //   console.log('world!!')
        //   // $scope.info.bankName = data.bank.bankName 
        //   // $scope.info.bankCard = data.bank.bankCard
        //   // $scope.info.bankMobile = data.bank.bankMobile
        //   // $scope.info.bankUserName = data.bank.bankUserName
        //   // $scope.info.takeMoney = ''
        // }


      })
      $scope.submit = function () {
        $scope.info.cost.cash_less = parseInt($scope.info.cost.cash_less)
        $scope.info.cost.cash_most = parseInt($scope.info.cost.cash_most)
        if (!$scope.info.bankName) {
          Message.show('请输入银行全称');
          return;
        }
        if (!$scope.info.bankCard || !ENV.BANK_CARD.test($scope.info.bankCard)) {
          Message.show('请输入正确的银行卡号');
          return;
        }
        if (!$scope.info.bankUserName) {
          Message.show('请输入银行开户姓名');
          return;
        }
        if (!$scope.info.bankMobile) {
          Message.show('请输入银行预留手机号');
          return;
        }
        if (!$scope.info.takeMoney || !ENV.REGULAR_MONEY.test($scope.info.takeMoney)) {
          Message.show('请输入提现金额');
          return;
        }
        if ($scope.info.takeMoney > $scope.info.money) {
          Message.show('提现余额不足');
          return;
        }
        if ($scope.info.takeMoney < $scope.info.cost.cash_less) {
          console.log($scope.info.cost.cash_less)
          Message.show('单次提现金额最低为' + $scope.info.cost.cash_less + '元');
          return false;
        }
        if ($scope.info.takeMoney > $scope.info.cost.cash_most) {
          Message.show('单日提现金额最高为' + $scope.info.cost.cash_most + '元');
          return;
        }
       
        Shop.applyRealMoney($scope.info).then(function (data) {

          var alertPopup = $ionicPopup.alert({
            title: '申请已提交',
          });
          alertPopup.then(function (res) {
            $state.go('shop.repoList')
          });
        })

      }
    })

  })
  .controller('shopOrderProfitCtrl', function ($scope, $rootScope, Order, $timeout) {
    var date = new Date()
    var fullYear = date.getFullYear()
    var Month = date.getMonth() + 1
    var day = date.getDate()
    Month = Month < 10 ? '0' + Month : Month;
    console.log(Month)
    day = day < 10 ? '0' + day : day;
    $scope.today = fullYear + '-' + Month + '-' + day;
    $scope.profit = {}
    $scope.profit.date = $scope.today;
    $scope.orderEmpty = false;
    Order.getOrderProfit($scope.profit.date).then(function (response) {
      $scope.profitInfo = response.data;
      $scope.orderEmpty = false;
      if (response.data.order == '' || response.data.order.length == 0) {
        $scope.orderEmpty = true;
      }
    })

    $scope.test = function () {
      var date = new Date($scope.profit.date);
      var fullYear = date.getFullYear()
      var Month = date.getMonth() + 1
      var day = date.getDate();
      Month = Month < 10 ? '0' + Month : Month;
      day = day < 10 ? '0' + day : day;
      $scope.profit.date = fullYear + '-' + Month + '-' + day;
      Order.getOrderProfit($scope.profit.date).then(function (response) {
        $scope.profitInfo = response.data;
        $scope.orderEmpty = false;
        if (response.data.order == '' || response.data.order.length == 0) {
          $scope.orderEmpty = true;
        }
      })
    }

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Order.getOrderProfit($scope.profit.date).then(function (response) {
        $scope.profitInfo = response.data;
        $scope.orderEmpty = false;
        if (response.data.order == '' || response.data.order.length == 0) {
          $scope.orderEmpty = true;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '2000'
        });
      })

    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Order.getOrderProfit($scope.profit.date, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.profitInfo.order = $scope.profitInfo.order.concat(response.data.order);
        if (response.code == 0) {
          if (response.data.order.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
  })
  .controller('shopFinanceCtrl', function ($scope, $rootScope, Order, $timeout) {
    var date = new Date()
    var fullYear = date.getFullYear()
    var Month = date.getMonth() + 1
    var day = date.getDate()
    Month = Month < 10 ? '0' + Month : Month;
    console.log(Month)
    day = day < 10 ? '0' + day : day;
    $scope.today = fullYear + '-' + Month + '-' + day;
    $scope.finance = {}
    $scope.finance.date = $scope.today;
    $scope.orderEmpty = false;
    Order.getFinance($scope.finance.date).then(function (response) {
      $scope.financeInfo = response.data;
      $scope.orderEmpty = false;
      if (response.data.order == '' || response.data.order.length == 0) {
        $scope.orderEmpty = true;
      }
    })

    $scope.test = function () {
      var date = new Date($scope.finance.date);
      var fullYear = date.getFullYear()
      var Month = date.getMonth() + 1
      var day = date.getDate();
      Month = Month < 10 ? '0' + Month : Month;
      day = day < 10 ? '0' + day : day;
      $scope.finance.date = fullYear + '-' + Month + '-' + day;
      Order.getFinance($scope.finance.date).then(function (response) {
        $scope.financeInfo = response.data;
        $scope.orderEmpty = false;
        if (response.data.order == '' || response.data.order.length == 0) {
          $scope.orderEmpty = true;
        }
      })
    }

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Order.getFinance($scope.finance.date).then(function (response) {
        $scope.financeInfo = response.data;
        $scope.orderEmpty = false;
        if (response.data.order == '' || response.data.order.length == 0) {
          $scope.orderEmpty = true;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '2000'
        });
      })

    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Order.getFinance($scope.finance.date, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.financeInfo.order = $scope.financeInfo.order.concat(response.data.order);
        if (response.code == 0) {
          if (response.data.order.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }


  })
  .controller('shopMoneyBackCtrl', function ($scope, $rootScope, Order, $ionicPopup, $state, $timeout) {
    var date = new Date()
    var fullYear = date.getFullYear()
    var Month = date.getMonth() + 1
    var day = date.getDate()
    Month = Month < 10 ? '0' + Month : Month;
    console.log(Month)
    day = day < 10 ? '0' + day : day;
    $scope.today = fullYear + '-' + Month + '-' + day;
    $scope.moneyBack = {}
    $scope.moneyBack.date = $scope.today;
    $scope.orderEmpty = false;
    Order.getMoneyBack($scope.moneyBack.date).then(function (response) {
      $scope.moneyBackInfo = response.data
      $scope.orderEmpty = false;
      if (response.data.every == '' || response.data.every.length == 0) {
        $scope.orderEmpty = true;
      }
    })
    //选择日期
    $scope.test = function () {
      var date = new Date($scope.moneyBack.date);
      var fullYear = date.getFullYear()
      var Month = date.getMonth() + 1
      var day = date.getDate();
      Month = Month < 10 ? '0' + Month : Month;
      day = day < 10 ? '0' + day : day;
      $scope.moneyBack.date = fullYear + '-' + Month + '-' + day;
      Order.getMoneyBack($scope.moneyBack.date).then(function (response) {
        $scope.moneyBackInfo = response.data
        $scope.orderEmpty = false;
        if (response.data.every == '' || response.data.every.length == 0) {
          $scope.orderEmpty = true;
        }
      })
    }

    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Order.getMoneyBack($scope.moneyBack.date).then(function (response) {
        $scope.moneyBackInfo = response.data
        $scope.orderEmpty = false;
        if (response.data.every == '' || response.data.every.length == 0) {
          $scope.orderEmpty = true;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '2000'
        });
      })

    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Order.getMoneyBack($scope.moneyBack.date, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.moneyBackInfo.every = $scope.moneyBackInfo.every.concat(response.data.every);
        if (response.code == 0) {
          if (response.data.every.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }
  })
  .controller('shopModifyLoginPwdCtrl', function ($scope, $rootScope, Order, $ionicPopup, $state, $stateParams, Message, Shop, $interval) {
    $scope.type = $stateParams.type;
    $scope.role = $rootScope.globalInfo.user.role;
    $scope.getCaptchaSuccess = false;
    $scope.pageData = {
      oldpsd: '',
      code: '',
      newpsd: '',
      respsd: ''
    };
    $scope.reg = {
      number: 60
    };
    // 获取修改登录或支付验证码
    $scope.getCode = function (oldpsd, newpsd, respsd, type) {
      if (oldpsd.length < 6 || newpsd.length < 6 || respsd.length < 6) {
        Message.show('请输入至少6位的密码');
        return;
      } else if (newpsd != respsd) {
        Message.show('两次密码不一致');
        return;
      }
      Shop.getCaptcha(oldpsd, newpsd, respsd, type, $scope.role).then(function (data) {
        $scope.getCaptchaSuccess = true;
        var timer = $interval(function () {
          if ($scope.reg.number <= 1) {
            $interval.cancel(timer);
            $scope.getCaptchaSuccess = false;
            $scope.reg.number = 60;
          } else {
            $scope.reg.number--;
          }
        }, 1000)
      })
    };
    $scope.savePsd = function (oldpsd, code, newpsd, respsd) {
      if (oldpsd.length < 6 || newpsd.length < 6 || respsd.length < 6) {
        Message.show('请输入至少6位的密码');
        return;
      } else if (newpsd != respsd) {
        Message.show('两次密码不一致');
        return;
      } else if (code.length < 4) {
        Message.show('请输入正确的验证码');
        return;
      }
      if ($scope.type == 1) {
        Shop.changeLoginPsd(oldpsd, code, newpsd, respsd, $scope.role);
      } else if ($scope.type == 2) {
        Shop.changePayPsd(oldpsd, code, newpsd, respsd);
      }
    }
  })
  .controller('registerRoleCtrl', function ($scope, $rootScope) {

  })
  .controller('agentUserInfoCtrl', function ($scope, $rootScope, Agent, $stateParams, Message) {
    Agent.getMy($stateParams.uid).then(function (data) {
      console.log(data);
      $scope.myInfo = data;
      if ($scope.myInfo.realname) {
        $scope.show = false;
      } else {
        $scope.show = true;
      }
    });
    $scope.submit = function () {
      if (!$scope.myInfo.realname) {
        Message.show('账号姓名不能为空');
        return false;
      }
      Agent.saveUserInfo($scope.myInfo.realname).then(function (response) {
        window.location.reload()
      })
    }



  })
  .controller('agentProfitCtrl', function ($scope, $rootScope, Agent, $timeout) {
    $scope.orderEmpty = false;
    Agent.getProfit().then(function (response) {
      // response.data={total:'',data:[]}
      $scope.info = response.data;
      if (response.data.data == '' || response.data.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.info = response.data;
      }
    })
    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = false;
      Agent.getProfit().then(function (response) {
        $scope.info = response.data;
        if (response.data.data == '' || response.data.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.info = response.data;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '2000'
        });
      })

    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Agent.getProfit($scope.page).then(function (response) {
        $scope.page += 1;
        $scope.info.data = $scope.info.data.concat(response.data.data);
        if (response.code == 0) {
          if (response.data.data.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }


  })
  .controller('agentprofitDetailCtrl', function ($scope, $rootScope, Agent, $stateParams, $ionicLoading) {
    $scope.subId = $stateParams.subId;
    Agent.getProfitDetail($scope.subId).then(function (response) {
      $scope.info = response.data;
    })
    //下拉刷新
    $scope.doRefresh = function () {
      Agent.getProfitDetail($scope.subId).then(function (response) {
        $scope.info = response.data;
      })
      $scope.$broadcast('scroll.refreshComplete');
      $ionicLoading.show({
        noBackdrop: true,
        template: '刷新成功！',
        duration: '2000'
      });
    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Agent.getProfitDetail($scope.subId, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.moneyBackInfo.every = $scope.moneyBackInfo.every.concat(response.data.order);
        if (response.code == 0) {
          if (response.data.every.length == 1) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }



  })
  .controller('agentSubordinateCtrl', function ($scope, $rootScope, Agent, $stateParams) {
    console.log($stateParams)
    $scope.orderEmpty = false;
    Agent.getSubordinate().then(function (response) {
      if (response.data == '' || response.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.shopList = response.data;
      }
    });
    // 列表下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Agent.getSubordinate().then(function (response) {
        if (response.data == '' || response.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.shopList = response.data;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '3000'
        });
      });
    };
    // 下拉加载更多列表
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Agent.getSubordinate($scope.page).then(function (response) {
        $scope.page += 1;
        $scope.shopList = $scope.shopList.concat(response.data);
        if (response.code == 0) {
          if (response.data.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };



  })
  .controller('agentGetRealMoneyCtrl', function ($scope, $rootScope, Agent, Message, ENV, $ionicPopup) {
    // console.log($scope.info.cost.cash_less)
    $scope.info = {};
    //请求提现余额及其他
    Agent.getRealMoneytotal().then(function (data) {
      $scope.info = data;
      $scope.info.bankName = data.bank.bankName || '中国建设银行';
      $scope.info.bankCard = data.bank.bankCard || '';
      $scope.info.bankMobile = data.bank.bankMobile || '';
      $scope.info.bankUserName = data.bank.bankUserName || '';
      $scope.info.takeMoney = ''
      if ($scope.info.money == 0) {
        $scope.allow = true;
      } else {
        $scope.allow = false;
      }

    })
    $scope.submit = function () {
      if (!$scope.info.bankName) {
        Message.show('请输入银行全称');
        return;
      }
      if (!$scope.info.bankCard || !ENV.BANK_CARD.test($scope.info.bankCard)) {
        Message.show('请输入正确的银行卡号');
        return;
      }
      if (!$scope.info.bankUserName) {
        Message.show('请输入银行开户姓名');
        return;
      }
      if (!$scope.info.bankMobile) {
        Message.show('请输入银行预留手机号');
        return;
      }
      if (!$scope.info.takeMoney || !ENV.REGULAR_MONEY.test($scope.info.takeMoney)) {
        Message.show('请输入提现金额');
        return;
      }
      if ($scope.info.takeMoney > $scope.info.money) {
        Message.show('提现余额不足');
        return;
      }
      if ($scope.info.takeMoney < $scope.info.cost.cash_less) {
        Message.show('单次提现金额最低为' + $scope.info.cost.cash_less + '元');
        return false;
      }
      if ($scope.info.takeMoney > $scope.info.cost.cash_most) {
        Message.show('单日提现金额最高为' + $scope.info.cost.cash_most + '元');
        return false;
      }

      Agent.applyRealMoney($scope.info).then(function (data) {
        var alertPopup = $ionicPopup.alert({
          title: '申请已提交',
        });
        alertPopup.then(function (res) {

        });
      })

    }
  })
  .controller('agentRecommendCtrl', function ($scope, Agent, Message) {
    $scope.myQrcode = {};
    Agent.recomCode().then(function (data) {
      $scope.myQrcode = data;
    });
  })
  .controller('shareholderProfitCtrl', function ($scope, Shareholder, Message, $timeout) {
    $scope.orderEmpty = false;
    $scope.info = {}
    Shareholder.getProfit().then(function (response) {
      $scope.info = response.data;
      if (response.data.daili == '' || response.data.daili.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.info = response.data;
      }
    })
    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Shareholder.getProfit().then(function (response) {
        $scope.info = response.data;
        if (response.data.daili == '' || response.data.daili.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.info = response.data;
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '2000'
        });
      })

    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Shareholder.getProfit($scope.page).then(function (response) {
        $scope.page += 1;
        $scope.info.daili = $scope.info.daili.concat(response.data.daili);
        if (response.code == 0) {
          if (response.data.daili.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }

  })
  .controller('shareholderprofitDetailCtrl', function ($scope, Shareholder, Message, $stateParams, $timeout) {
    $scope.orderEmpty = false;
    $scope.info = {}
    Shareholder.getProfitDetail($stateParams.uid).then(function (response) {
      if (response.data.data == '' || response.data.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.info = response.data.data
      }

    })
    //下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Shareholder.getProfitDetail($stateParams.uid).then(function (response) {
        if (response.data.data == '' || response.data.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.info = response.data.data
        }
      })
      $scope.$broadcast('scroll.refreshComplete');
      $timeout(function () {
        $scope.noMore = false;
      }, 1000)
      $ionicLoading.show({
        noBackdrop: true,
        template: '刷新成功！',
        duration: '2000'
      });
    };
    //上拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Shareholder.getProfitDetail($stateParams.uid, $scope.page).then(function (response) {
        $scope.page += 1;
        $scope.info = $scope.info.concat(response.data.data);
        if (response.code == 0) {
          if (response.data.data.length == 0) {
            $scope.noMore = true;
            $ionicLoading.show({
              noBackdrop: true,
              template: '没有更多了！',
              duration: '1200'
            });
          }
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    }

  })
  .controller('shopRepoListCtrl', function ($scope, $rootScope, Shop, $ionicLoading, $stateParams, $timeout) {
    $scope.type = $stateParams.type;
    $scope.repoList = {};
    $scope.orderEmpty = false;
    $scope.select = $scope.type || 1;
    Shop.getRepoList($scope.select).then(function (response) {
      if (response.data == '' || response.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.repoList = response.data
      }
    });

    $scope.active = function (id) {
      $scope.select = id;
      $scope.noMore = false;
      Shop.getRepoList(id).then(function (response) {
        if (response.data == '' || response.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.repoList = response.data
        }
      });
    };

    // 下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Shop.getRepoList($scope.select).then(function (response) {
        if (response.data == '' || response.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.repoList = response.data
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '3000'
        });
      });
    };
    // 下拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Shop.getRepoList($scope.select, $scope.page).then(function (response) {
        $scope.page++;
        $scope.repoList = $scope.repoList.concat(response.data);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        if (response.code != 0) {
          $scope.noMore = true;
          $ionicLoading.show({
            noBackdrop: true,
            template: '没有更多了！',
            duration: '1200'
          });
        }
      });
    };
  })
  .controller('agentRecommendHistoryCtrl', function ($scope, Agent, $ionicLoading, $timeout) {
    $scope.recommendList = {};
    $scope.orderEmpty = false;
    Shop.recommendList().then(function (response) {
      $scope.recommendList = response.data;
      if (response.data == '' || response.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.orderEmpty = false;
        $scope.recommendList = response.data
      }
    });
    // 下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = true;
      Shop.recommendList().then(function (response) {
        $scope.recommendList = response.data;
        if (response.data == '' || response.data.length == 0) {
          $scope.orderEmpty = true;
        } else {
          $scope.orderEmpty = false;
          $scope.recommendList = response.data
        }
        $scope.$broadcast('scroll.refreshComplete');
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
        $ionicLoading.show({
          noBackdrop: true,
          template: '刷新成功！',
          duration: '3000'
        });
      });
    };
    // 下拉加载
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      Shop.recommendList($scope.page).then(function (response) {
        $scope.page++;
        $scope.recommendList = $scope.recommendList.concat(response.data);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        if (response.code != 0) {
          $scope.noMore = true;
          $ionicLoading.show({
            noBackdrop: true,
            template: '没有更多了！',
            duration: '1200'
          });
        }
      });
    };
  })
  .controller('shopRepoInfoCtrl', function ($scope, Message, Shop, $stateParams) {
    $scope.id = $stateParams.id;
    $scope.repoInfo = {};
    $scope.orderEmpty = false;
    Shop.getRepoInfo($scope.id).then(function (response) {
      if (response.data == '' || response.data.length == 0) {
        $scope.orderEmpty = true;
      } else {
        $scope.repoInfo = response.data;
      }
    });
  })

  ;
angular.module('starter.services', [])
  .factory('Storage', function () {
    return {
      set: function (key, data) {
        return window.localStorage.setItem(key, window.JSON.stringify(data));
      },
      get: function (key) {
        return window.JSON.parse(window.localStorage.getItem(key));
      },
      remove: function (key) {
        return window.localStorage.removeItem(key);
      }
    };
  })

  .factory('Message', function ($ionicLoading) {
    return {
      show: function () {
        var text = arguments[0] ? arguments[0] : 'Hi，出现了一些错误，请检查网络或者退出重试！';
        var duration = arguments[1] ? arguments[1] : 1500;
        var callback = arguments[2] ? arguments[2] : '';
        $ionicLoading.hide();
        if (typeof callback === "function") {
          $ionicLoading.show({
            noBackdrop: true,
            template: text,
            duration: duration
          }).then(function () {
            callback();
          });
        } else {
          $ionicLoading.show({
            noBackdrop: true,
            template: text,
            duration: duration
          });
        }
      },
      loading: function () {
        var text = arguments[0] ? arguments[0] : '';
        $ionicLoading.hide();
        $ionicLoading.show({
          hideOnStateChange: false,
          duration: 10000,
          template: '<ion-spinner icon="spiral" class="spinner-stable"></ion-spinner><br/>' + text
        })
      },
      hidden: function () {
        $ionicLoading.hide();
      }
    };
  })

  .factory('TokenAuth', function ($q, Storage, $location) {
    return {
      request: function (config) {
        var userInfo = Storage.get('user');
        config.headers = config.headers || {};
        if (userInfo && userInfo.token) {
          config.headers.TOKEN = userInfo.token;
        }
        return config;
      },
      response: function (response) {
        if (response.data.code === 403) {
          Storage.remove('user');
          $location.path('/auth/login');
        }
        return response || $q.when(response);
      }
    };
  })

  .factory('Auth', function ($resource, $rootScope, $q, ENV, Message, $state, Storage) {
    var resource = $resource(ENV.ZH_URL + '&do=s_login', { op: "@op" });
    var checkMobile = function (mobile) {
      if (!ENV.REGULAR_MOBILE.test(mobile)) {
        Message.show('请输入正确的11位手机号码', 800);
        return false;
      } else {
        return true;
      }
    };

    var checkPwd = function (pwd) {
      if (!pwd || pwd.length < 6) {
        Message.show('请输入正确的密码(最少6位)', 800);
        return false;
      }
      return true;
    };

    return {
      // 用户注册协议
      fetchAgreement: function () {
        var deferred = $q.defer();
        resource.get({ op: 'agreement' }, function (response) {
          deferred.resolve(response.data);
        });
        return deferred.promise;
      },

      // 登陆操作
      login: function (role, mobile, password) {
        if (!checkMobile(mobile)) {
          return false;
        }
        if (!checkPwd(password)) {
          return false;
        }
        var deferred = $q.defer();
        Message.loading('登陆中……');
        resource.save({
          op: 'login',
          role: role,
          mobile: mobile,
          password: password
        }, function (response) {
          if (response.code == 0) {
            Message.show('登陆成功', 500);
            Storage.set("user", response.data);
            $rootScope.globalInfo.user = response.data;
            deferred.resolve(response);
          } else {
            Message.show(response.msg, 2500);
            deferred.reject();
          }
        }, function () {
          Message.show('通信错误，请检查网络', 1500);
        });
        return deferred.promise;
      },

      checkTMobile: function (role, tMobile) {
        var deferred = $q.defer();
        Message.loading();
        var _json = {
          op: 'checkTMobile',
          type: 'check',
          role: role,
          tMobile: tMobile
        }
        resource.save(_json, function (response) {
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },


      //获取验证码
      getSmsCaptcha: function (type, role, tMobile, mobile, pictureCaptcha) {
        if (!checkMobile(mobile)) {
          return false;
        }
        var deferred = $q.defer();
        Message.loading('加载中');
        console.log(role)
        resource.save({ op: 'register', role: role, type: type, tMobile: tMobile, mobile: mobile, pictureCaptcha: pictureCaptcha }, function (response) {
          Message.hidden();
          console.log(response);

          if (response.code == 0) {
            Message.show(response.msg);
            deferred.resolve();
          } else if (response.code == 1) {
            Message.show(response.msg);
            return false;
          } else if (response.code == 2) {
            Message.show(response.msg);
            deferred.reject();
            // deferred.resolve();//为了测试而添加的
            //deferred.resolve();
          }
        });
        return deferred.promise;
      },

      getoneLogin: function (success, error) {
        var res = $resource(ENV.YD_URL + '?do=api');
        res.save({ op: 'nav' }, success, error);
      },
      //忘记密码获取验证码
      getCaptcha: function (success, error, mobile, role) {
        if (!checkMobile(mobile)) {
          return false;
        }
        var _json = {
          op: 'forget',
          type: 'send',
          mobile: mobile,
          role: role
        };
        Message.loading();
        resource.save(_json, success, error);
      },
      //检查验证码
      checkCaptain: function (mobile, captcha, role, type) {
        if (!checkMobile(mobile)) {
          return false;
        }
        var _json = {
          op: 'register',
          type: 'verifycode',
          mobile: mobile,
          code: captcha,
          role: role
        };

        if (type) {
          _json = {
            op: 'forget',
            type: 'verifycode',
            mobile: mobile,
            code: captcha,
            role: role
          };
        }

        Message.loading();

        return resource.get(_json, function (response) {
          console.log(response);
          if (response.code !== 0) {
            Message.show(response.msg, 1500);
            // $rootScope.$broadcast('Captcha.success'); //为了测试而添加，原先没有
            return;
          }
          $rootScope.$broadcast('Captcha.success');
          Message.show(response.msg, 1000);
        }, function () {
          Message.show('通信错误，请检查网络！', 1500);
        });
      },

      /*设置密码*/
      setPassword: function (reg, type) {
        if (reg.password.length < 6) {
          Message.show('密码长度不能小于6位！', 1500);
          return false;
        }
        if (reg.password != reg.rePassword) {
          Message.show('两次密码不一致，请检查！', 1500);
          return false;
        }

        if (reg.registerRole == 0) {
          var _json = {
            op: 'register',
            role: reg.registerRole,
            tMobile: reg.tMobile,
            mobile: reg.mobile,
            password: reg.password,
            repassword: reg.rePassword,
            code: reg.captcha,
            idFront: reg.idFront,
            idBehind: reg.idBehind,
            photo: reg.photo,
            license: reg.license
          };
        } else if (reg.registerRole == 1) {
          var _json = {
            op: 'register',
            role: reg.registerRole,
            tMobile: reg.tMobile,
            mobile: reg.mobile,
            IDCard: reg.IDCard,
            realname: reg.realname,
            password: reg.password,
            repassword: reg.rePassword,
            code: reg.captcha,
          };
        }
        if (type) {
          _json = {
            op: 'forget',
            mobile: reg.mobile,
            password: reg.password,
            repassword: reg.rePassword,
            code: reg.captcha,
            role: reg.role
          };
        }

        Message.loading();
        return resource.save(_json, function (response) {
          if (response.code !== 0) {
            Message.show(response.msg, 1500);
            return;
          }
          $state.go('auth.login');
          Message.show("密码设置成功，请重新登录！", 1500);
        }, function () {
          console.log('nihao')
          Message.show('通信错误，请检查网络！', 1500);
        });
      },
      // 获取头像
      getUserLogo: function (success, error) {
        var res = $resource(ENV.YD_URL + '?do=api');
        res.get({ op: 'logo' }, success, error);
      }
    }
  })

  .factory('Product', function ($resource, $rootScope, $q, ENV, Message, $state) {
    var resource = $resource(ENV.ZH_URL, { do: 'goods', op: "@op" });
    var spid = $rootScope.globalInfo.user.uid

    return {
      upload: function (uploadInfo) {
        var spid = $rootScope.globalInfo.user.uid
        var deferred = $q.defer();
        Message.loading();
        var _json = {
          op: 'upload',
          // type: 'save',
          spid: spid,
          goodsName: uploadInfo.goodsName,
          goodsDesc: uploadInfo.goodsDesc,
          spe_price: uploadInfo.ex_price,
          marketPrice: uploadInfo.marketPrice,
          total: uploadInfo.total,
          firstImg: uploadInfo.firstImg,
          secondImg: uploadInfo.secondImg,
          thirdImg: uploadInfo.thirdImg,
        }
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            Message.show(response.msg)
            deferred.resolve(response)
          } else {
            Message.show(response.msg)
            deferred.reject()
          }
        }, function () {
          Message.show('通信错误，请检查网络!', 1500);
        })

        return deferred.promise;
      },
      fetchProducts: function (page) {
        var spid = $rootScope.globalInfo.user.uid
        Message.loading();
        page = page || 1;
        var deferred = $q.defer();
        resource.get({ op: 'productList', page: page, spid: spid, }, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else {
            deferred.reject();
            Message.show(response.msg);
          }

        });
        return deferred.promise;
      },
      getProductsDetail: function (goodsNo) {
    				Message.loading();
        var deferred = $q.defer();
        resource.get({ op: 'goodsInfo', goodsNo: goodsNo }, function (response) {
          if (response.code == 0) {
            Message.hidden();
            console.log(response)
            deferred.resolve(response.data);
          }

        }

        );
        return deferred.promise;
      },
      update: function (updateInfo, goodsNo) {
        console.log(updateInfo.firstImg)
        var deferred = $q.defer();
        Message.loading();
        var _json = {
          op: 'update',
          goodsNo: goodsNo,
          goodsName: updateInfo.goodsName,
          goodsDesc: updateInfo.goodsDesc,
          spe_price: updateInfo.spe_price,
          marketPrice: updateInfo.marketPrice,
          total: updateInfo.total,
          firstImg: updateInfo.firstImg,
          secondImg: updateInfo.secondImg,
          thirdImg: updateInfo.thirdImg,
        }
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            Message.show(response.msg)
          } else {
            Message.show(response.msg)
          }
        })
        return deferred.promise;
      },
      delete: function (goodsNo) {
        Message.loading();
        var deferred = $q.defer();
        resource.get({ op: 'delete', goodsNo: goodsNo }, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve();
          }

        });
        return deferred.promise;
      }
    }
  })

  .factory("Area", function ($resource) {
    var resource = $resource("lib/area.json");
    return {
      getList: function (success, pid, cid) {
        console.log('yby')
        resource.get({}, function (data) {
          success(data);
        });
      }
    }
  })

  .factory('Shop', function ($resource, $q, ENV, Message, Storage, $state) {
    var resource = $resource(ENV.ZH_URL, { do: 's_shops', op: "@op" });
    var shopUser = Storage.get('user')
    return {
      checkAuth: function () {
        return (Storage.get('user') && Storage.get('user').uid != '');
      },
      /*退出登录*/
      logout: function () {
        Storage.remove('user');
        // Message.show('退出成功！', '', function () {
        //   $state.go("auth.login");
        // });
      },
      saveShopInfo: function (shopInfo, area) {
        var shopUser = Storage.get('user')
        console.log(shopUser.uid)
        var deferred = $q.defer()
        Message.loading();
        var _json = {
          op: 'shopsInfo',
          spid: shopUser.uid,
          shopName: shopInfo.shopName,
          cname: shopInfo.cName,
          shopPerUid: shopInfo.shopPer,
          address: shopInfo.address,
          birth: area,
          mobile: shopInfo.mobile,
          description: shopInfo.shopDescrip,
          cid: shopInfo.selecedType,
          logo: shopInfo.logo,
        }
        resource.save(_json, function (response) {
          Message.hidden()
          if (response.code == 0) {
            Message.show(response.msg)
            deferred.resolve();
          } else {
            Message.show(response.msg)
            deferred.reject();
          }

        })
        return deferred.promise;
      },
      getShopInfo: function (uid) {
        var deferred = $q.defer()
        Message.loading();
        var _json = {
          op: 'getshopsInfo',
          spid: uid
        }
        resource.save(_json, function (response) {
          Message.hidden()
          if (response.code == 0) {
            // Message.show(response.msg);
            console.log(response)
            deferred.resolve(response);
          }

        })
        return deferred.promise;
      },
      getRealMoneytotal: function () {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var _json = {};
        _json = {
          op: 'getRealMoneytotal',
          uid: shopUser.uid,
          role: shopUser.role
        };
        Message.loading();
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },

      applyRealMoney: function (info) {
        var deferred = $q.defer();
        var _json = {};
        _json = {
          op: 'applyRealMoney',
          uid: shopUser.uid,
          role: shopUser.role,
          bankName: info.bankName,
          bankCard: info.bankCard,
          bankUserName: info.bankUserName,
          bankMobile: info.bankMobile,
          takeMoney: info.takeMoney,
          count: info.cost.count
        };
        Message.loading();
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },
      // 回购列表
      getRepoList: function (type, page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        page = page || 1;
        Message.loading();
        resource.save({ op: 'withdrawList', type: type, page: page, uid: shopUser.uid }, function (response) {
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      // 修改登录密码
      changeLoginPsd: function (oldpsd, code, newpsd, respsd, role) {
        var shopUser = Storage.get('user')
        Message.loading();
        var deferred = $q.defer();
        var _json = {
          op: 'updatePassword',
          spid: shopUser.uid,
          userPassword: oldpsd,
          code: code,
          password: newpsd,
          repassword: respsd,
          role: role
        };
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else if (response.code == 301) {
            Message.show(response.msg);
            $state.go('shop.center');
          } else {
            Message.show(response.msg);
          }
        }, function () {
          Message.show('通信错误，请检查网络!', 1500);
        });
        return deferred.promise;
      },
      // 修改登录及支付密码 获取验证码
      getCaptcha: function (oldpsd, newpsd, respsd, type, role) {
        var shopUser = Storage.get('user')
        var _json = {};
        Message.loading();
        var deferred = $q.defer();
        if (type == 1) {
          _json = {
            op: 'updatePassword',
            type: 'send',
            spid: shopUser.uid,
            userPassword: oldpsd,
            password: newpsd,
            repassword: respsd,
            role: role
          }
        } else if (type == 2) {
          _json = {
            op: 'updatePayPassword',
            type: 'send',
            userPassword: oldpsd,
            password: newpsd,
            repassword: respsd
          }
        }
        resource.get(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
            Message.show(response.msg);
          } else {
            Message.show(response.msg);
          }
        }, function () {
          Message.show('通信错误，请检查网络!', 1500);
        });
        return deferred.promise;
      },
      // 提现单
      getRepoInfo: function (id) {
         var shopUser = Storage.get('user')
        var deferred = $q.defer();
        Message.loading();
        resource.save({ op: 'getWithdrawInfo', id: id}, function (response) {
          Message.hidden();
          deferred.resolve(response);
          if (response.code == 1) {
            Message.show(response.msg);
            return;
          }
        });
        return deferred.promise;
      },


    }

  })

  .factory('Order', function ($resource, $q, Message, ENV, Storage) {
    var resource = $resource(ENV.ZH_URL, { do: 'order', op: '@op' });
    var shopUser = Storage.get('user')
    return {
      getList: function (type, page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        page = page || 1;
        var _json = {
          op: 'getList',
          type: 'shops',
          spid: shopUser.uid,
          page: page
        }
        Message.loading();
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }

        });
        return deferred.promise;
      },
      getInfo: function (id) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var _json = {
          op: 'getInfo',
          id: id,
          uid: shopUser.uid
        }
        Message.loading();
        resource.get(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },
      getSure: function (orderId, thumbs) {
        var res = $resource(ENV.ZH_URL, { do: 'payment', op: '@op' });
        var deferred = $q.defer();
        Message.loading();
        res.save({ op: 'getOffline', orderId: orderId, thumbs: thumbs }, function (response) {
          if (response.code == 0) {
            Message.hidden();
            deferred.resolve();
          } else {
            Message.show(response.msg)
          }
        });
        return deferred.promise;
      },
      getFinance: function (time, page) {
        var shopUser = Storage.get('user')
        console.log(shopUser.uid)
        var deferred = $q.defer();
        page = page || 1;
        var _json = {
          op: 'getfinance',
          time: time,
          spid: shopUser.uid,
          page: page
        }
        Message.loading();
        resource.get(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }

        });
        return deferred.promise;

      },
      getOrderProfit: function (time, page) {
        var res = $resource(ENV.ZH_URL, { do: 'earn', op: '@op' })
        var shopUser = Storage.get('user')
        console.log(shopUser.uid)
        var deferred = $q.defer();
        page = page || 1;
        var _json = {
          op: 'display',
          time: time,
          spid: shopUser.uid,
          page: page
        }
        Message.loading();
        res.get(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }

        });
        return deferred.promise;

      },
      getMoneyBack: function (time, page) {
        var res = $resource(ENV.ZH_URL, { do: 'earn', op: '@op' })
        var shopUser = Storage.get('user')
        console.log(shopUser.uid)
        var deferred = $q.defer();
        page = page || 1;
        var _json = {
          op: 'moneyBack',
          time: time,
          spid: shopUser.uid,
          page: page
        }
        Message.loading();
        res.get(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response);
          } else if (response.code == 1) {
            Message.show(response.msg);
          }

        });
        return deferred.promise;
      }



    }
  })

  .factory('Agent', function ($resource, $q, Message, ENV, Storage, $rootScope) {
    var uid = $rootScope.globalInfo.user.uid;
    //获得下级收益信息
    var resource = $resource(ENV.ZH_URL, { do: 'agent', op: '@op' });
    var shopUser = Storage.get('user')
    return {
      getMy: function (uid) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        Message.loading();
        resource.save({ op: 'display', uid: shopUser.uid, role: shopUser.role }, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
            console.log(response.data);
          } else if (response.code == 1) {
            Message.show('response.msg');
          }
        });
        return deferred.promise;
      },
      saveUserInfo: function (realname) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        Message.loading();
        resource.save({ op: 'saveUserInfo', uid: shopUser.uid, role: shopUser.role, realname: realname }, function (response) {
          Message.hidden();
          if (response.code == 0) {
            Message.show(response.msg)
            deferred.resolve();
          } else if (response.code == 1) {
            Message.show('response.msg');
          }
        });
        return deferred.promise;
      },

      getProfit: function (page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var page = page || 1;
        var _json = {};
        _json = {
          op: 'getProfit',
          uid: shopUser.uid,
          page: page
        };
        Message.loading();
        resource.save(_json, function (response) {
          console.log(response);
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      // 获取收益详情
      getProfitDetail: function (subId, page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var page = page || 1;
        var _json = {};
        _json = {
          op: 'getProfitDetail',
          uid: shopUser.uid,
          subId: subId,
          page: page
        };
        Message.loading();
        resource.save(_json, function (response) {
          console.log(response);
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      getSubordinate: function (page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var page = page || 1;
        var _json = {};
        _json = {
          op: 'getSubordinate',
          uid: shopUser.uid,
          role: shopUser.role,
          page: page
        };
        Message.loading();
        resource.save(_json, function (response) {
          console.log(response);
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      // 推荐码
      recomCode: function () {
        var res = $resource(ENV.ZH_URL, { do: 'users', op: '@op' });
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        Message.loading();
        res.save({ op: 'getQrcode', uid: shopUser.uid }, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else if (response.code == 0) {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },
      // 推荐记录
      recommendList: function (page) {
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        page = page || 1;
        Message.loading();
        resource.save({ op: 'histroyRecommend', uid: shopUser.uid, page: page }, function (response) {
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      getRealMoneytotal: function () {
        var deferred = $q.defer();
        var _json = {};
        _json = {
          op: 'getRealMoneytotal',
          uid: shopUser.uid,
          role: shopUser.role
        };
        Message.loading();
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      },
      applyRealMoney: function (info) {
        var deferred = $q.defer();
        var _json = {};
        _json = {
          op: 'applyRealMoney',
          uid: shopUser.uid,
          role: shopUser.role,
          bankName: info.bankName,
          bankCard: info.bankCard,
          bankUserName: info.bankUserName,
          bankMobile: info.bankMobile,
          takeMoney: info.takeMoney,
          count: info.cost.count
        };
        Message.loading();
        resource.save(_json, function (response) {
          Message.hidden();
          if (response.code == 0) {
            deferred.resolve(response.data);
          } else {
            Message.show(response.msg);
          }
        });
        return deferred.promise;
      }

    }
  })
  .factory('Shareholder', function ($resource, $q, Message, ENV, Storage, $rootScope) {

    return {
      getProfit: function (page) {
        var res = $resource(ENV.ZH_URL, { do: 'agent', op: '@op' });
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var page = page || 1;
        var _json = {};
        _json = {
          op: 'getProfitGu',
          uid: shopUser.uid,
          page: page
        };
        Message.loading();
        res.save(_json, function (response) {
          console.log(response);
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
      getProfitDetail: function (uid, page) {
        //uid：代理商的uid
        var res = $resource(ENV.ZH_URL, { do: 'agent', op: '@op' });
        var shopUser = Storage.get('user')
        var deferred = $q.defer();
        var page = page || 1;
        var _json = {};
        _json = {
          op: 'getProfitDetailGu',
          uid: uid,
          page: page
        };
        Message.loading();
        res.save(_json, function (response) {
          console.log(response);
          Message.hidden();
          deferred.resolve(response);
        });
        return deferred.promise;
      },
    }
  })

  .factory('Mc', function ($resource, $rootScope, $ionicLoading, ENV, Message, $q, $state, Storage) {
    var resource = $resource(ENV.ZH_URL, { do: 'mc', op: '@op' });
    return {


    }
  })
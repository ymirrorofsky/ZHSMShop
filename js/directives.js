angular.module('starter.directives', [])
    // 回车触发函数
    .directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter, { 'event': event });
                    });

                    event.preventDefault();
                }
            });
        }
    })
    .directive('updateImg', function () {
        return function (scope, element, attrs) {
            element.bind("click", function () {
                console.log(attrs)
                element[0].src = attrs.src;
            });
        }
    })
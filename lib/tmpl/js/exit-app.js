var exit_app = function() {
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        api.toast({
            msg: '再按一次退出' + api.appName,
            duration: 2000,
            location: 'bottom'
        });
        api.addEventListener({
            name: 'keyback'
        }, function(ret, err) {
            api.closeWidget({
                id: api.appId,
                retData: {
                    name: 'closeWidget'
                },
                animation: {
                    type: 'flip',
                    subType: 'from_bottom',
                    duration: 500
                },
                silent: true
            });
        });
        window.setTimeout(function() {
            exit_app();
        }, 2000);
    });
}

if (typeof define === "function" && define.amd) {
    define(function() {
        return exit_app;
    });
}

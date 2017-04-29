const fs = require('fs');

// 编辑window模板
function edit_winTmpl(name, title) {
    // window模板
    var win_tmpl = `<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no,email=no,date=no,address=no">
    <title>` + name + `</title>
    <link rel="stylesheet" href="../css/gazer.css">
    <script src="../js/require.js"></script>
    <style>
    html,
    body {
        height: 100%;
    }
    </style>
</head>

<body>
    <div class="ezWindow">
        <header class="header" id="ezHeader">
            <a class="header__btn_left iconfont i-arrow31 js_func" data-func-name="F._closeWin()"></a>
            <div class="header__title">` + title + `</div>
        </header>

        <div class="ezMain">
            <div id="iframe" data-name="` + name + `_cont"></div>
        </div>
    </div>
<script>
(function(){var b=document.getElementById("ezHeader");if(b){var d=b.style,b=b.style.cssText,a;a=navigator.userAgent;var c=/iP(ad|hone|od)/.test(a);a=c?!/iPhone OS [0-6]_\d/.test(a):!(4.4>parseFloat(a.match(/Android ([^]+?);/)[1]));d.cssText=b+(";padding-top:"+(c?a?20:0:a?25:0)+"px")}})();
require([
    '../js/common',
], function() {
    Q.ready(function() {

    });
});
</script>
</body>

</html>
`;
    return win_tmpl;
}

// 编辑frame模板
function edit_frmTmpl(name, title) {
    // frame模板
    var frm_tmpl = `<!DOCTYPE HTML>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no,email=no,date=no,address=no">
    <title>` + name + `</title>
    <link rel="stylesheet" href="../css/gazer.css">
    <script src="../js/require.js"></script>
    <style>
    section {
        background-color: #fff;
        overflow: hidden;
    }
    </style>
</head>

<body>
    <div class="gazer-content" id="id-ul"></div>
    <script type="text/html" id="id-li">
        <div class="wrap col-xs-24">
            <section class="sec col-xs-24">
                
            </section>
        </div>
    </script>
<script>
require([
    '../js/common',
], function() {
    F.data = {}; // 模板所需数据

    F.load = function() {
        var html;
        html = $("#id-li").html();
        $("#id-ul").html(Q.tmpl(html)());
    };

    function pre_data(data) {
        
    }

    F.loadData = function(callback) {
        // TODO
        pre_data();
        callback();
    };

    Q.ready(function() {
        F.loadData(function() {
            F.load();
        });
    });
});
</script>
</body>

</html>
`;
    return frm_tmpl;
}

function create_win(name, title) {
    // window
    name = name || 'test';
    title = title || '新页面';

    fs.open('./' + name + '.html', 'w+', function(err, fd) {
        if (err) return console.log("打开文件失败");

        fs.write(fd, edit_winTmpl(name, title), 0, 'utf8', function(err, written, string) {
            if (err) return console.log('写入失败');

            console.log(name + '.html 创建成功');
            fs.close(fd, function() {});
        });
    });
}

function create_frm(name, title) {
    // frame
    name = name || '_test';
    title = title || '新页面';

    fs.open('./' + name + '.html', 'w+', function(err, fd) {
        if (err) return console.log("打开文件失败");

        fs.write(fd, edit_frmTmpl(name, title), 0, 'utf8', function(err, written, string) {
            if (err) return console.log('写入失败');

            console.log(name + '.html 创建成功');
            fs.close(fd, function() {});
        });
    });
}


function create_win_frm(name, title) {
    create_win(name, title);
    create_frm(name + '_cont', title);
}

// 新增一个项目
function createProject(path) {

    function copyFile(path, keyword) {
        let readdir = __dirname.slice(0, -5) + '/tmpl/' + keyword;
        fs.readdir(readdir, (err, files) => {
            if (!files.length) return false;

            files.every(function(value, index) {
                let read_path = readdir + '/' + value;
                let write_path = path + '/' + keyword + '/' + value;

                fs.createReadStream(read_path).pipe(fs.createWriteStream(write_path));
                console.log('        ' + value + ' 创建成功');
                return true;
            });
        });
    }

    function mkdir(path) {
        let data = ['css', 'html', 'img', 'js', 'res'];

        for (let a = 0; a < data.length; a += 1) {
            let keyword = data[a];
            let mk_path = path + '/' + data[a];
            fs.mkdir(mk_path, function() {
                console.log('    ' + keyword + ' 文件夹创建成功');
                copyFile(path, keyword);
            });
        }
    }

    fs.mkdir(path, function() {
        mkdir(path);
    });
}

function calc_add(a, b) {
    return a + b;
}


exports.add_frm = create_frm;
exports.add_win = create_win;
exports.add_wf = create_win_frm;
exports.createProject = createProject;
exports.calc_add = calc_add;
exports.abc = {
    a: 1,
    b: 2,
    c: 3
};
// 服务接口地址
var SERVICE_URL = "";
// 设置服务接口地址
var index = window.location.href.indexOf("/sglj-mui", (window.location.href.indexOf("//") + 2));
SERVICE_URL = window.location.href.substring(0, index) + "/services/";
// 状态码：成功
var SUCCESS = "000000";
// 状态码：登录失败
var LOGIN_FAILED = "101001";
// 缓存
var ALL_MENU = "";

function appInit() {
	allMenus();
}

function common() {
	<!--百度统计-->
	var _hmt = _hmt || [];
	(function() {
	  var hm = document.createElement("script");
	  hm.src = "https://hm.baidu.com/hm.js?c89a57cd2854a5e38d5497e99363a7cf";
	  var s = document.getElementsByTagName("script")[0]; 
	  s.parentNode.insertBefore(hm, s);
	})();
}

// 是否已登录
function isLogin() {
	if($.cookie("id")!=null && $.cookie("id")!=""){
		return true;
	}else{
		return false;
	}
}

// ajax
function ajax(url, data, callback) {
	doAjax(url, data, callback, null, true);
}

function ajax(url, data, callback, failCallback) {
	doAjax(url, data, callback, failCallback, true);
}

function ajaxNoCache(url, data, callback) {
	doAjax(url, data, callback, null, false);
}

function ajaxNoCache(url, data, callback, failCallback) {
	doAjax(url, data, callback, failCallback, false);
}

function doAjax(url, data, callback, failCallback, cache) {
	//localStorage.clear();
	// 是否更新缓存
	var updateCache = false;
	// 使用缓存
	if(cache && localStorage.getItem($.md5(url+JSON.stringify(data)))!=null){
		callback(JSON.parse(localStorage.getItem($.md5(url+JSON.stringify(data)))).body);
	}
	var startTime = new Date();
	try {
		$.ajax({
			url: SERVICE_URL + url,
			type: "POST",
			async: true,
			data: data,
			success: function(response) {
				if(SUCCESS == response.code) {
					// 使用缓存
					if(cache && localStorage.getItem($.md5(url+JSON.stringify(data)))!=JSON.stringify(response)){
						updateCache = true;
						localStorage.setItem($.md5(url+JSON.stringify(data)), JSON.stringify(response));
						callback(JSON.parse(localStorage.getItem($.md5(url+JSON.stringify(data)))).body);
					}
					// 回调函数
					callback(response.body);
				} else if(LOGIN_FAILED == response.code) {
					console.info("未登录");
					// 再次清除登录状态
					localStorage.clear();
					$.cookie("id", "", {path : '/'});
					$.cookie("token", "", {path : '/'});
					$.cookie("name", "", {path : '/'});
					$.cookie("mobileNo", "", {path : '/'});
					window.location.href="login.html";
				} else {
					mui.alert(response.msg);
					if(failCallback!=null){
						failCallback(response.msg);
					}
				}
				console.log(url + " ajax success time " + (new Date() - startTime) + "ms" + (updateCache?", update cache":""));
			}
		});
	} catch(e) {
		console.error(url + " ERROR\n", e);
	}
}

// 1、所有菜单
function allMenus() {
	ajax("portfolio/all", null, function(body) {
		// 更新缓存
		ALL_MENU = body;
		if(ALL_MENU==null) {
			return;
		}
		var usernameMenu = "登录/注册";
		if($.cookie("id")!=null && $.cookie("id")!=""){
			usernameMenu = $.cookie("name");
		}
		var typeAs = '<a id="setting" class="mui-control-item">['+usernameMenu+']</a>';
		typeAs += '<a id="guessMenu" class="mui-control-item mui-active" href="#guess">股市猜猜猜</a>';
		for(var i = 0; i < ALL_MENU.length; i++) {
			typeAs += '<a class="type-a mui-control-item" href="#type" id="' + i + '">' + ALL_MENU[i].typeName + '</a>';
		}
		var menuDiv = document.getElementById("menuDiv");
		// 动态添加菜单
		menuDiv.innerHTML = typeAs;
		// setting
		mui("#menuDiv").off('tap', '#setting');
		mui("#menuDiv").on('tap', '#setting', function() {
			window.location.href="setting.html";
		});
		// guess
		mui("#menuDiv").off('tap', 'guessMenu');
		mui("#menuDiv").on('tap', '#guessMenu', function() {
			window.location.href="index.html";
		});
		// type
		mui("#menuDiv").off('tap', '.type-a');
		mui("#menuDiv").on('tap', '.type-a', function() {
			var index = this.getAttribute("id");
			window.location.href="index.html?typeIndex="+index;
		});
		if(getUrlParam("typeIndex")!=null){
			$("#guessMenu").removeClass("mui-active");
			$("#guess").removeClass("mui-active");
			$("#"+getUrlParam("typeIndex")).addClass("mui-active");
			$("#type").addClass("mui-active");
			type(getUrlParam("typeIndex"));
		}
	});
}

/**
 * 格式化涨跌幅
 */
function changeFormat(change) {
	if(change==null || isNaN(change)) {
		return "<sss>-</sss>";
	}
	if(change >= 0) {
		return '<sss style="color:#dd524d">+' + (change*100).toFixed(2) + '%</sss>';
	} else if(change < 0) {
		return '<sss style="color:#4cd964">' + (change*100).toFixed(2) + '%</sss>';
	}
}

/*
 * 获取url中的参数
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); // 匹配目标参数
	if (r != null)
		return unescape(r[2]);
	return null; // 返回参数值
}
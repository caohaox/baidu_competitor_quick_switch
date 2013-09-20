//保存选项
function optionsSave(){
	saveCompetitor();
}
function byId(id){
	return document.getElementById(id);
}
function saveCompetitor(){
	if(competitor_baidu360.checked){
		localStorage['competitor']='360';
	}else if(competitor_baidusogou.checked){
		localStorage['competitor']='sogou';
	}else if(competitor_baidugoogle.checked){
		localStorage['competitor']='google';
	}		
	if(window.chrome&&chrome.extension)
	window.chrome.extension.getBackgroundPage().updateRuntimeHandlers();
}
function init(){
	byId('save').onclick=optionsSave;
	//初始化竞品
	var competitor=localStorage['competitor']||'360';
	competitor_baidu360=byId('competitor_baidu360');
	competitor_baidusogou=byId('competitor_baidusogou');
	competitor_baidugoogle=byId('competitor_baidugoogle');
	if(competitor=='360'){
		competitor_baidu360.checked=true;
	}else if(part=='sogou'){
		competitor_baidusogou.checked=true;
	}else if(part=='google'){
		competitor_baidugoogle.checked=true;
	}
}
document.addEventListener("DOMContentLoaded",init,false);
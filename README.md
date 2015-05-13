# mp3Lrc

##描述
这是一个用于歌词获取以及显示在网页的一个插件，没有任何样式设置，全部依靠你自己手动设置，同时支持滚动时对audio的事件支持，用于操控audio，简单粗暴

##使用说明

```javascript
  $('#yourLrcDiv')
    .on('scrollBegin',function(){
        console.log('scrollBegin');
    })
    .on('scrollEnd',function(e,time){
        console.log('scrollEnd',time);
    })
    .on('begin',function(){
        console.log('begin');
    })
    .on('end',function(){
        console.log('end');
    })
    .lrc({
    url:'./your/ajax/address.lrc',
    classUl:'yourClassUlCss',  
    classLi:'yourClassLiCss',
    classLiActive: 'yourClassLiActiveCss'
  },function(handle){
    //your code
  });
```
##更新
* 2015/05/13 增加对歌词的操控方法
* 2015/05/12 提供简单的lrc预览及事件操控 


# mp3Lrc

##描述
这是一个用于歌词获取以及显示在网页的一个插件，没有任何样式设置，全部依靠你自己手动设置，同时支持滚动时对audio的事件支持，用于操控audio，简单粗暴

##使用说明

```javascript
  $('#yourLrcDiv')
    .on('scrollTime',function(e,startTime){
        console.log('scrollTime',startTime);
    })
    .on('scrollBegin',function(){
        console.log('scrollBegin');
    })
    .on('scrollEnd',function(){
        console.log('scrollEnd');
    })
    .on('begin',function(){
        console.log('begin');
    })
    .on('end',function(){
        console.log('end');
    })
    .lrc({
    classUl:'yourClassUlCss',
    classLi:'yourClassLiCss',
    classLiActive: 'yourClassLiActiveCss',
    url:'./your/ajax/address.lrc'
  });
```
##更新

* 2015/05/12 提供简单的lrc预览及事件操控 


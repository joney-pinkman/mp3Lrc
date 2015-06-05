/**
 * Created by nemo on 2015/5/11.
 */
;(function($){


    $.extend({

        'getParseLrc':function(url,cb){

            $.get(url).done(function(content){
                //按行读取
                var lineArr = content.match(/\[[^\r\n]+\r\n/mg);
                if(!lineArr){
                    throw new Error('the request file is not a lyric file');
                }
                var lrcInfo = {content:[]},matchTmp;

                lineArr.forEach(function(line){
                    //歌词时间，歌词内容以及其他信息解析
                    if((matchTmp = line.match(/^\[([^0-9:]+):([^\]]+)\]/))){
                        lrcInfo[matchTmp[1]] = matchTmp[2];
                    }else if( ( matchTmp = line.match(/^\[(\d+):(\d+)\.(\d+)\]([^\r\n]+)\r\n/)) ){
                        lrcInfo['content'].push({startTime: Number(matchTmp[1]) * 60 + Number(matchTmp[2]) + Number(matchTmp[3]) * 0.01 , content: matchTmp[4] })
                    }

                });
                lrcInfo['content'].sort(function(a,b){
                    return a.startTime > b.startTime ? 1 : -1;
                });
                //添加间隔时间字段
                lrcInfo['content'].forEach(function(item,index){
                    if(index < lrcInfo['content']['length'] - 1){
                        item.time = lrcInfo['content'][index+1]['startTime'] - item['startTime'];
                    }else{
                        item.time = 0;
                    }
                });
                cb(lrcInfo);

            });
        }
    })
})(jQuery);

;(function($){

    $.fn.extend({
        constructLrc:function(option,contentObj){
            option = $.extend({
                classUl:'',
                classLi:'',
                classLiActive:'',

                scrollTime:300,

                infoBegin: 'begin',
                infoEnd : 'end',

                isAutoBegin:true

            },option);
            var $ul = $('<ul>').addClass(option.classUl).appendTo(this);

            contentObj.forEach(function(item){
                $('<li>').addClass(option.classLi).data({'time':item.time,startTime:item.startTime}).text(item.content).appendTo($ul);
            });

            var $lis =  $ul.children(),
                $li =  $lis.first(),
                height = $li.height(),
                lineShowUp = Math.round($ul.height()/height/ 2),
                scrollTimeout = 0,
                //歌词进度 current 当前行已等待之间 index 当前行index startTime 当前时间
                lineProcess = {current:0,index:lineShowUp - 1,startTime :(new Date()).getTime()},
                //歌词列表滚动状态
                isScroll = false,
                //是否暂停状态
                isPause = true,

                setLineProcess = function(index,current,time){
                    lineProcess.index = index;
                    lineProcess.current = current;
                    lineProcess.startTime = time ? time : (new Date().getTime());
                };

            for(var i = 0; i< lineShowUp;i++){

                $('<li>')
                    .text( i == 0 ? option.infoBegin : '')
                    .addClass(option.classLi)
                    .data({
                        //如果是首行 则在首行之前加上歌词开始信息
                        time: i == 0 ? contentObj[0]['startTime'] : 0,
                        startTime:0
                    })
                    .prependTo($ul);
                $('<li>')
                    .text(i == 0 ? option.infoEnd : '')
                    .addClass(option.classLi)
                    .data({
                        time:0,
                        //如果是尾部的话 则在结尾添加结束信息
                        startTime:  contentObj[contentObj.length - 1]['startTime']
                    })
                    .appendTo($ul);

            }
            $lis = $ul.children();
            var $self = $(this),
                //
                lineHandle = function(index,current){
                    if(index == undefined){
                        index = lineProcess.index;
                    }
                    if(current == undefined){
                        current = lineProcess.current;
                    }
                    var total =  $lis.eq(index).data('time');

                    clearTimeout(scrollTimeout);
                    $ul.stop();

                    scrollTimeout = setTimeout(function(){
                        setLineProcess(++index,0);
                        scroll();
                    },(total - current) * 1000);

                    $lis.filter('.'+option.classLiActive).removeClass(option.classLiActive);
                    $lis.eq(index).addClass(option.classLiActive);

                    if(index == lineShowUp - 1 && current == 0) $self.trigger('begin');
                    else if(index == $lis.length - lineShowUp && current == 0) $self.trigger('end');
                },
                //连续滚动 从index行开始 并记录到lineProcess中
                scroll = function(index){
                    if(index == undefined) index = lineProcess.index;

                    if(index < lineShowUp - 1 || index > $lis.length - lineShowUp){
                        return ;
                    }
                    if(index == lineShowUp - 1) $self.trigger('begin');
                    else if(index == $lis.length - lineShowUp) $self.trigger('end');

                    $ul.stop().animate({scrollTop:(index  - lineShowUp + 1 ) * height},option.scrollTime,function(){
                        lineHandle(index, option.scrollTime/1000);
                    });
                },
                //直接跳至index行
                jump = function(index){
                    if(index == undefined){
                        index = lineProcess.index;
                    }

                    clearTimeout(scrollTimeout);
                    $ul.stop().scrollTop((index - lineShowUp + 1) * height);

                    $lis.filter('.'+option.classLiActive).removeClass(option.classLiActive);
                    $lis.eq(index).addClass(option.classLiActive);
                };


            //鼠标滚轮事件
            $ul.mousewheel(function(event){
                event.stopPropagation();
                event.preventDefault();

                if( (lineProcess.index <= lineShowUp - 1 && event.deltaY == 1) ||
                    (lineProcess.index >= $lis.length - lineShowUp  && event.deltaY == -1) ){
                    return ;
                }
                if(!isScroll){
                    isScroll = true;
                    $self.trigger('scrollBegin');
                }
                event.deltaY == 1 ? lineProcess.index-- : lineProcess.index++;
                jump();
                //设定500毫秒的延迟，防止多次连续滚轮滚动时出现异常
                scrollTimeout = setTimeout(function(){

                    isScroll = false;
                    setLineProcess(lineProcess.index,0);

                    if(!isPause){
                        lineHandle();
                    }
                    $self.trigger('scrollEnd',[$lis.eq(lineProcess.index).data('startTime') ]);
                },500);
            });
            if(option.isAutoBegin){
                isPause = false;
                scroll(lineShowUp - 1);
            }
            return {
                pause:function(){
                    if(isPause) return;
                    clearTimeout(scrollTimeout);
                    $ul.stop();
                    setLineProcess(lineProcess.index,lineProcess.current  + ((new Date().getTime()) - lineProcess.startTime)/1000)
                    isPause = true;

                },
                goOn:function(){
                    if(!isPause) return;
                    lineHandle();
                    isPause = false;

                },
                getProcess:function(){
                    if(isScroll) return false;

                    if(!isPause) {
                        var now = (new Date()).getTime();
                        setLineProcess(lineProcess.index,lineProcess.current + (now - lineProcess.startTime)/1000,now);

                    }

                    return $lis.eq(lineProcess.index).data('startTime') + lineProcess.current;
                },
                setProcess:function(time){
                    var index = -1;
                    $lis.each(function(i,item){
                         if( $(item).data('startTime') <=  time && $(item).data('startTime') + $(item).data('time') > time){
                             index = i;
                             return false;
                         }
                    });

                    if(index == -1 ) return false;
                    setLineProcess(index,time -  $lis.eq(index).data('startTime'));

                    jump();
                    if(!isPause){
                        lineHandle();
                    }

                    return true;
                }

            }
        }
    })

})(jQuery)


/**
 * Created by nemo on 2015/5/12.
 */
;(function($){
    /**
     * 对constructLrc以及getParseLrc这两个方法的简单封装
     * option: 选项
     * {
     *          url :'', mp3连接地址
     *          classUl:'', 歌词列表框样式类
                classLi:'', 歌词列表单元样式
                classLiActive:'', 当前进度歌词样式类别

                scrollTime:300, 读取下一句歌词的滚动时间

                infoBegin: 'begin', 添加歌词开头信息显示
                infoEnd : 'end', 歌词结尾信息显示

                isAutoBegin:true 是否自动开始
     *
     *  }
     *  cb : 回调
     *  function(handle){
     *      handle:  操作歌词方法
     *      {
     *          pause : 暂停歌词进度
     *          goOn : 继续当前进度
     *          getProcess : 获取当前进度
     *          setProcess : 设置当前进度
     *      }
     *
     *  }
     */
    $.fn.extend({
        lrc:function(option,cb){

            if(!option.url) throw new Error('please input lyric url in your option');
            var $self = $(this);
            $.getParseLrc(option.url,function(content){
                var handle = $self.constructLrc(option,content.content);
                if(cb && typeof cb == 'function') cb(handle);
            });

        }
    });

})(jQuery)
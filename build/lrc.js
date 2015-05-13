/**
 * Created by nemo on 2015/5/11.
 */
;(function($){


    $.extend({

        'getParseLrc':function(url,cb){

            $.ajax({url:url,type:'get',dataType:'text'}).done(function(content){
                var lineArr = content.match(/\[[^\r\n]+\r\n/mg);
                if(!lineArr){
                    throw new Error('the request file is not a lyric file');
                }
                var lrcInfo = {content:[]},matchTmp;

                lineArr.forEach(function(line){

                    if((matchTmp = line.match(/^\[([^0-9:]+):([^\]]+)\]/))){
                        lrcInfo[matchTmp[1]] = matchTmp[2];
                    }else if( ( matchTmp = line.match(/^\[(\d+):(\d+)\.(\d+)\]([^\r\n]+)\r\n/)) ){
                        lrcInfo['content'].push({startTime: Number(matchTmp[1]) * 60 + Number(matchTmp[2]) + Number(matchTmp[3]) * 0.01 , content: matchTmp[4] })
                    }

                });
                lrcInfo['content'].sort(function(a,b){
                    return a.startTime > b.startTime ? 1 : -1;
                });

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
                lineProcess = {current:0,index:lineShowUp - 1},
                startTime = (new Date()).getTime(),
                isScroll = false,
                isPause = true;

            for(var i = 0; i< lineShowUp;i++){

                $('<li>')
                    .text( i == 0 ? option.infoBegin : '')
                    .addClass(option.classLi)
                    .data({
                        time: i == 0 ? contentObj[0]['startTime'] : 0,
                        startTime:0
                    })
                    .prependTo($ul);
                $('<li>')
                    .text(i == 0 ? option.infoEnd : '')
                    .addClass(option.classLi)
                    .data({
                        time:0,
                        startTime:  contentObj[contentObj.length - 1]['startTime']
                    })
                    .appendTo($ul);

            }
            $lis = $ul.children();
            var $self = $(this),
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

                        lineProcess.index++;
                        lineProcess.current = 0;
                        startTime = (new Date()).getTime();
                        scroll();
                    },(total - current) * 1000);

                    $lis.filter('.'+option.classLiActive).removeClass(option.classLiActive);
                    $lis.eq(index).addClass(option.classLiActive);

                    if(index == lineShowUp - 1 && current == 0) $self.trigger('begin');
                    else if(index == $lis.length - lineShowUp && current == 0) $self.trigger('end');
                },
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
                jump = function(index){
                    if(index == undefined){
                        index = lineProcess.index;
                    }

                    clearTimeout(scrollTimeout);
                    $ul.stop().scrollTop((index - lineShowUp + 1) * height);

                    $lis.filter('.'+option.classLiActive).removeClass(option.classLiActive);
                    $lis.eq(index).addClass(option.classLiActive);
                };


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

                scrollTimeout = setTimeout(function(){
                    $self.trigger('scrollEnd',[$lis.eq(lineProcess.index).data('startTime') ]);
                    isScroll = false;
                    startTime = (new Date()).getTime();
                    if(!isPause){
                        lineHandle();
                    }
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
                    lineProcess.current  += ((new Date().getTime()) - startTime)/1000;
                    startTime = (new Date()).getTime();
                    isPause = true;

                },
                goOn:function(){
                    if(!isPause) return;
                    lineHandle();
                    isPause = false;

                },
                getProcess:function(){
                    if(!isPause) {
                        var now = (new Date().getTime());
                        lineProcess.current += (now - startTime)/1000;
                        startTime = now;
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

                    lineProcess.index = index;
                    lineProcess.current = time -  $lis.eq(index).data('startTime');
                    startTime = (new Date().getTime());

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
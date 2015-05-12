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
                        item.time = null;
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

                scrollTime:300

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
                lineIndex,
                isScroll = false;

            for(var i = 0; i< lineShowUp;i++){
                $('<li>').addClass(option.classLi).data({'time':0,startTime:0}).prependTo($ul);
                $('<li>').addClass(option.classLi).data({'time':0,startTime:0}).appendTo($ul);
            }
            $lis = $ul.children();
            var $self = $(this);
            var cb = function(index,time){
                $lis.filter('.'+option.classLiActive).removeClass(option.classLiActive);
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function(){

                    $lis.eq(index).removeClass(option.classLiActive);
                    scroll(++index);
                },time);

                $lis.eq(index).addClass(option.classLiActive);

                switch(index){
                    case lineShowUp -1 : $self.trigger('begin');break;
                    case $lis.length - lineShowUp : $self.trigger('end');break;
                    default : $self.trigger('scrollTime',[$lis.eq(index).data('startTime')]);
                }

                lineIndex = index;
            }
            var  scroll = function(index){
                if(index < lineShowUp - 1) return ;
                else if(index > $lis.length - lineShowUp ) return ;
                $ul.stop().animate({scrollTop:(index  - lineShowUp + 1 ) * height},option.scrollTime,function(){
                    cb(index,$lis.eq(index).data('time')*1000 - option.scrollTime);
                });
            }

            scroll(lineShowUp - 1);

            $ul.mousewheel(function(event){
                if(!isScroll){
                    isScroll = true;
                    $self.trigger('scrollBegin');
                }


                event.stopPropagation();
                event.preventDefault();
                if( (lineIndex == lineShowUp - 1 && event.deltaY == 1) || (lineIndex == $lis.length - lineShowUp && event.deltaY == -1) ){
                    return ;
                }else {
                    $lis.eq(lineIndex).removeClass(option.classLiActive);
                    event.deltaY == 1 ? lineIndex-- : lineIndex++;

                }

                $ul.scrollTop((lineIndex - lineShowUp + 1) * height);
                $lis.eq(lineIndex).addClass(option.classLiActive);
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(function(){
                    $self.trigger('scrollEnd');
                    isScroll = false;
                    scroll( lineIndex );
                },500);

            });
            return $(this);
        }
    })

})(jQuery)


/**
 * Created by nemo on 2015/5/12.
 */
;(function($){
    $.fn.extend({
        lrc:function(option,cb){
            option = $.extend({
                classUl:'',
                classLi:'',
                classLiActive:'',

                scrollTime:300,
                url : ''
            },option);

            if(!option.url) throw new Error('please input lyric url in your option');
            var $self = $(this);
            $.getParseLrc(option.url,function(content){
                $self.constructLrc(option,content.content);
                if(cb && typeof cb == 'function') cb(content);
            });

        }
    });

})(jQuery)
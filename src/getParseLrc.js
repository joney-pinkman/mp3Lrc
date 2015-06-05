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
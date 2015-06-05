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
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
                console.log(content);
                $self.constructLrc(option,content.content);
                if(cb && typeof cb == 'function') cb(content);
            });

        }
    });

})(jQuery)
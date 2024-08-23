transmitted_files = "algorithm/SemCom/Transmitted_files/"
received_files = "algorithm/SemCom/Received_files/"
refresh_frequent = 2000

$(function () {
    var intervalId = setInterval(get_receiver_info, refresh_frequent);
});

function get_receiver_info() {
    $.ajax({
        url:"/SemCom_R/get_receiver_info/",
        contentType: "application/json; charset=utf-8",
        type:"GET",
        cache:false,
        success:function(data){
            //每次加载时重置一些参数
            var channel = data['channel'];
            var snr = data['snr'];
            var received_data = data['r_data']
            var feature_img = data['f_img']
            console.log(snr,received_data,feature_img)
            show_received_data(received_data,feature_img)
            var inputElement = document.getElementById('Channel');
            inputElement.value = channel;
            inputElement = document.getElementById('SNR');
            inputElement.value = snr+" dB";
        }


    });
}

function show_received_data(received_data,feature_img) {
    // show recovered semantics
    $('#R_SF').html('<img id="feature_img" src="" alt="" style="margin-top:1%; display: block; width: 100%; height: 100%; position:relative; z-index:30;">\n')
    $('#feature_img').attr("src", feature_img);
    // show recovered data
    $('#R_Data').html('<img id="recovered_img" src="" alt="" style="margin-top:1%; display: block; width: 100%; height: 100%; position:relative; z-index:30;">\n')
    $('#recovered_img').attr("src", received_data);
    img = new Image()
    // 改变图片的src
    img.src = received_data
    // 加载完成执行
    img.onload = function(){
        var windowW = 480;//获取当前窗口宽度
        var windowH = 240;//获取当前窗口高度
        var realWidth = img.width;//获取图片真实宽度
        var realHeight = img.height;//获取图片真实高度
        var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
        // console.log(realWidth,realHeight,windowW,windowH,scale)
        $('#feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
        $('#recovered_img').css({"width":realWidth/scale,"height":realHeight/scale});
    }
}





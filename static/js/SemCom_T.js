transmitted_files = "algorithm/SemCom/Transmitted_files/"
received_files = "algorithm/SemCom/Received_files/"
source_data_path = ""
source_data_size = 0
semantics_size = 0
current_modal = ""
$(function () {
    show_source_data();
    // 加载按键信息
    set_click_response();

});

function set_click_response() {
    $('#transmit').blur().on("click",function () {
        perform_transmition();
    });
    $('#remove').blur().on("click",function () {
        remove_source_data();
    });
}

// select transmitted file and display
function show_source_data() {
    //首先监听input框的变动，选中一个新的文件会触发change事件
    document.querySelector("#upload_file").addEventListener("change",function () {
        //获取到选中的文件
        var file = document.querySelector("#upload_file").files[0];
        //创建formdata对象
        console.log(file);
        var formdata = new FormData();
        formdata.append("file",file);
        //创建xhr，使用ajax进行文件上传
        var xhr = new XMLHttpRequest();
        xhr.open("post","/SemCom_T/upload_file/");
        //回调
        xhr.onreadystatechange = function () {
            // if (xhr.readyState==4 && xhr.status==200){
            //     alert("Upload success!");
            // }
            source_data_path = transmitted_files+file.name
            source_data_size = file.size
            $('#source_data_size').html("Data size: "+source_data_size+ " Bytes");
            if (file.type.startsWith("image")){
                $('#source_data').html('<img id="source_img" src="" alt="" style="margin-top:1%; display: block; width: 100%; height: 100%; position:relative; z-index:30;">\n')
                $('#source_img').attr("src", source_data_path);
                var img = new Image()
                // 改变图片的src
                img.src = source_data_path
                // 加载完成执行
                img.onload = function(){
                    var windowW = 480;//获取当前窗口宽度
                    var windowH = 240;//获取当前窗口高度
                    var realWidth = img.width;//获取图片真实宽度
                    var realHeight = img.height;//获取图片真实高度
                    var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
                    // console.log(realWidth,realHeight,windowW,windowH,scale)
                    $('#source_img').css({"width":realWidth/scale,"height":realHeight/scale});
                }
            }

        }
        //将formdata上传
        xhr.send(formdata);
    });
}

function perform_transmition() {
    var transmitted_info = {
        'transmitted_file':source_data_path,
        'channel':$("#Channel").val(),
        "SNR":$("#SNR").val(),
        "modal": current_modal
    }
    console.log(transmitted_info);
    var post_data = JSON.stringify(transmitted_info)
    $.ajax({
        url: "/SemCom_T/data_transmition/",
        type: "POST",
        cache:false,
        data:post_data,
        success: function (data) {
            var feature_img = data['featureImg']
            $('#semantics').html('<img id="feature_img" src="" alt="" style="margin-top:1%; display: block; width: 100%; height: 100%; position:relative; z-index:30;">\n')
            $('#feature_img').attr("src", feature_img);
            var img = new Image()
            // 改变图片的src
            img.src = source_data_path
            // 加载完成执行
            img.onload = function(){
                var windowW = 480;//获取当前窗口宽度
                var windowH = 240;//获取当前窗口高度
                var realWidth = img.width;//获取图片真实宽度
                var realHeight = img.height;//获取图片真实高度
                var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
                // console.log(realWidth,realHeight,windowW,windowH,scale)
                $('#feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
            }
            getImageSize(feature_img);
            // alert("transmit success!")
        },
        error: function (data) {
            alert("出现错误，请联系管理员！");
        }
    })

}

async function getImageSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('Content-Length');

        if (contentLength) {
            console.log('Image Size:', contentLength, 'Bytes');
            var cp = 100*(source_data_size-contentLength)/source_data_size
            $('#semantic_size').html("Data size: "+contentLength+ " Bytes"+"<br>Compression Rate: "+cp+"%");
        } else {
            console.log('Could not determine image size.');

        }
    } catch (error) {
        console.error('Error fetching image:', error);
    }

}





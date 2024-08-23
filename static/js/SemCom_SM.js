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
}

function loadVideo(videoPath,elementId) {
    // 获取ID为'source_data'的div容器
    const container = document.getElementById(elementId);

    // 如果容器中已经存在一个video元素，先移除它
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // 创建新的video元素
    const videoElement = document.createElement('video');

    // 设置video元素的属性
    videoElement.src = videoPath;
    videoElement.controls = true; // 添加控制栏
    videoElement.autoplay = false; // 自动播放
    videoElement.style.objectFit = 'fill'; // 确保视频填充整个video元素


    // 设置视频的CSS样式
    videoElement.style.width = '480px';  // 设置宽度
    videoElement.style.height = '240px'; // 设置高度

    // 将新的video元素添加到div容器中
    container.appendChild(videoElement);
}

function loadTextFile(filePath,elementId) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(textContent => {
            // 获取ID为'source_data'的div容器
            const container = document.getElementById(elementId);

            // 如果容器中已有内容，先清空
            container.innerHTML = '';

            // 创建一个新的p元素用于显示文本内容
            const textElement = document.createElement('p');
            textElement.textContent = textContent;
            textElement.style.height = "90%"

            // 将文本内容添加到容器中
            container.appendChild(textElement);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function loadImageFile(imagePath,elementId) {
    // 获取ID为'source_data'的div容器
    const container = document.getElementById(elementId);

    // 如果容器中已有内容，先清空
    container.innerHTML = '';

    // 创建一个新的img元素
    const imgElement = document.createElement('img');

    // 设置img元素的属性
    imgElement.src = imagePath;
    imgElement.alt = "Loaded Image"; // 为图像提供替代文本
    imgElement.style.maxHeight = "100%"
    imgElement.style.minHeight = "50px"
    imgElement.style.maxWidth = "100%"

    // imgElement.style.objectFit = "contain"

    // 将新的img元素添加到div容器中
    container.appendChild(imgElement);
}

function loadAudioFile(audioPath, elementId) {
    // 获取ID为'source_data'的div容器
    const container = document.getElementById(elementId);

    // 如果容器中已有内容，先清空
    container.innerHTML = '';

    // 创建一个新的audio元素
    const audioElement = document.createElement('audio');

    // 设置audio元素的属性
    audioElement.src = audioPath;
    audioElement.controls = true; // 添加控制栏
    audioElement.autoplay = false; // 自动播放设为false

    // 将新的audio元素添加到div容器中
    container.appendChild(audioElement);
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
            // 图像SC
            if (file.type.startsWith("image")){
                current_modal = "image"
                loadImageFile(source_data_path,"T_D")
            }
            // 音频SC
            if (file.type.startsWith("audio")){
                current_modal = "audio"
                loadAudioFile(source_data_path,"T_D")
            }
            // 文本SC
            if (file.type.startsWith("text")){
                current_modal = "text"
                loadTextFile(source_data_path,"T_D");
            }
            // 视频SC
            if (file.type.startsWith("video")){
                current_modal = "video"
                // 假设你的视频路径是以下变量
                loadVideo(source_data_path,"T_D");
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
        'SNR':$("#SNR").val(),
        'modal':current_modal,
    }
    console.log(transmitted_info);
    var post_data = JSON.stringify(transmitted_info)
    $.ajax({
        url: "/SemCom_T/data_transmition/",
        type: "POST",
        cache:false,
        data:post_data,
        success: function (data) {
            var semantics = data['semantics']
            if(current_modal === "video"){
                $('#semantic_title_T').html('Semantic text')
                loadTextFile(semantics,"T_SF")
            }
            else {
                $('#semantic_title_T').html('Semantic feature')
                loadImageFile(semantics,"T_SF")
                // alert("transmit success!")
            }
            getCompressionRatio(semantics);
            get_receiver_info();

        },
        error: function (data) {
            alert("出现错误，请联系管理员！");
        }
    })

}

async function getCompressionRatio(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('Content-Length');

        if (contentLength) {
            var cp = 100*(source_data_size-contentLength)/source_data_size
            $('#data_size').html("Compression Rate: "+cp+"%");
        } else {
            console.log('Could not determine image size.');

        }
    } catch (error) {
        console.error('Error fetching image:', error);
    }

}

async function get_receiver_info() {
    await sleep(500)
    $.ajax({
        url:"/SemCom_R/get_receiver_info/",
        contentType: "application/json; charset=utf-8",
        type:"GET",
        cache:false,
        success:function(data){
            var channel = data['channel'];
            var snr = data['snr'];
            var R_D = data['r_data']
            var R_F = data['semantics']
            if (current_modal==="video"){
                $('#semantic_title_R').html('Semantic text')
                loadTextFile(R_F,"R_SF")
                loadVideo(R_D,"R_D")
            }
            if (current_modal==="image") {
                $('#semantic_title_R').html('Semantic feature')
                loadImageFile(R_F,"R_SF")
                loadImageFile(R_D,"R_D")

            }
            if (current_modal==="audio") {
                $('#semantic_title_R').html('Semantic feature')
                loadImageFile(R_F,"R_SF")
                loadAudioFile(R_D,"R_D")

            }
            if (current_modal==="text") {
                $('#semantic_title_R').html('Semantic feature')
                loadImageFile(R_F,"R_SF")
                loadTextFile(R_D,"R_D")
            }

            // var inputElement = document.getElementById('Channel');
            // inputElement.value = channel;
            // inputElement = document.getElementById('SNR');
            // inputElement.value = snr;
        }


    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function show_received_images(received_data,feature_img) {
    // show recovered semantics
    await sleep(500);
    // show recovered data
    $('#R_Data').html('<img id="recovered_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#recovered_img').attr("src", received_data);
    $('#R_SF').html('<img id="r_feature_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#r_feature_img').attr("src", feature_img);
    img = new Image()
    // 改变图片的src
    img.src = received_data
    // 加载完成执行
    img.onload = function(){
        var windowW = 480;
        var windowH = 240;
        var realWidth = img.width;//获取图片真实宽度
        var realHeight = img.height;//获取图片真实高度
        var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
        // console.log(realWidth,realHeight,windowW,windowH,scale)
        $('#r_feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
        $('#recovered_img').css({"width":realWidth/scale,"height":realHeight/scale});
    }
}

async function show_received_video(received_data,feature_img) {
    // show recovered semantics
    await sleep(500);
    // show recovered data
    $('#R_Data').html('<img id="recovered_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#recovered_img').attr("src", received_data);
    $('#R_SF').html('<img id="r_feature_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#r_feature_img').attr("src", feature_img);
    img = new Image()
    // 改变图片的src
    img.src = received_data
    // 加载完成执行
    img.onload = function(){
        var windowW = 480;
        var windowH = 240;
        var realWidth = img.width;//获取图片真实宽度
        var realHeight = img.height;//获取图片真实高度
        var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
        // console.log(realWidth,realHeight,windowW,windowH,scale)
        $('#r_feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
        $('#recovered_img').css({"width":realWidth/scale,"height":realHeight/scale});
    }
}

async function show_received_text(received_data,feature_img) {
    // show recovered semantics
    await sleep(500);
    // show recovered data
    $('#R_Data').html('<img id="recovered_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#recovered_img').attr("src", received_data);
    $('#R_SF').html('<img id="r_feature_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#r_feature_img').attr("src", feature_img);
    img = new Image()
    // 改变图片的src
    img.src = received_data
    // 加载完成执行
    img.onload = function(){
        var windowW = 480;
        var windowH = 240;
        var realWidth = img.width;//获取图片真实宽度
        var realHeight = img.height;//获取图片真实高度
        var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
        // console.log(realWidth,realHeight,windowW,windowH,scale)
        $('#r_feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
        $('#recovered_img').css({"width":realWidth/scale,"height":realHeight/scale});
    }
}

async function show_received_audio(received_data,feature_img) {
    // show recovered semantics
    await sleep(500);
    // show recovered data
    $('#R_Data').html('<img id="recovered_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#recovered_img').attr("src", received_data);
    $('#R_SF').html('<img id="r_feature_img" src="" alt="" style="margin-top:1%; display: block; width: 90%; height: 90%; position:relative; z-index:30;">\n')
    $('#r_feature_img').attr("src", feature_img);
    img = new Image()
    // 改变图片的src
    img.src = received_data
    // 加载完成执行
    img.onload = function(){
        var windowW = 480;
        var windowH = 240;
        var realWidth = img.width;//获取图片真实宽度
        var realHeight = img.height;//获取图片真实高度
        var scale = Math.max(realWidth/windowW,realHeight/windowH);//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
        // console.log(realWidth,realHeight,windowW,windowH,scale)
        $('#r_feature_img').css({"width":realWidth/scale,"height":realHeight/scale});
        $('#recovered_img').css({"width":realWidth/scale,"height":realHeight/scale});
    }
}
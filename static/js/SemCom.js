$(function () {
    getLocalIP();

});

function getLocalIP() {
    $.ajax({
        url:"/SemCom/get_local_address/",
        contentType: "application/json; charset=utf-8",
        type:"GET",
        cache:false,
        success:function(data){
            //每次加载时重置一些参数
            var ip = data['local_address'];//local ip
            $('#local_address').attr("value", ip);
            console.log(ip);
        },
        error:function(data){
            alert("数据加载出错，请联系管理员！");
            // top.location.reload();
        }
    });
}





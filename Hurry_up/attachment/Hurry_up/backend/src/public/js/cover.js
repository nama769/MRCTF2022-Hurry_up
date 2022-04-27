
$(document).ready(function(){
    $("#get").click(function(){
        var path=$('#path').val();
        $(this).attr('href','/?path='+path)
    });
    $("#hide").click(function(){
        var path=$('#path').val();
        var value=$('#value').val();
        $('#value').val('');
        $.get("/hide?path="+path+"&value="+value);
    });
});

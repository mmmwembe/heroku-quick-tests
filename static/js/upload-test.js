async function start() {


    
    $('.xModelDeleteButton').on('click', function(){

        var model_url = $(this).attr('model_url')
        var model_name = $(this).attr('model_name')
        var model_type = $(this).attr('model_type')
        var task = $(this).attr('task')

        alert('model name : ' + model_name)

        req = $.ajax({
                url: '/NewDeleteModel/',
                type: 'POST',
                data: { model_url : model_url, model_name : model_name, model_type : model_type, task : task }
            });

        req.done(function(data)
        {
        alert('Data from Server :' + data.everything)
        });

    });






}
  

start();
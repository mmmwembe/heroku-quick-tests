window.addEventListener('load', (event) => {


    $('.xModelDeleteButton').on('click', function(e){

        var model_index = e.target.model_id

        //var model_url = $(this).attr('model_url')
        //var model_name = $(this).attr('model_name')
        //var model_type = $(this).attr('model_type')
        //var task = $(this).attr('task')
       // var model_id = $(this).attr('model_id')

        alert('button index : ' + model_id)

        /*
        req = $.ajax({
                url: '/NewDeleteModel/',
                type: 'POST',
                data: { model_url : model_url, model_name : model_name, model_type : model_type, task : task }
            });

        req.done(function(data)
        {
        alert('Data from Server :' + data.everything)
        });

        */

    }); // End of .xModelDeleteButton on click event


























}); // End Window Load Event


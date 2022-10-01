window.addEventListener('load', (event) => {


    $('.xModelDeleteButton').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        //alert('model_Id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type)

        req = $.ajax({
                url: '/NewDeleteModel/',
                type: 'POST',
                data: { model_url : model_url, model_name : model_name, model_type : model_type, task : task }
            });

        req.done(function(data)
        {
        alert('Data from Server :' + data.everything)
        });



    }); // End of .xModelDeleteButton on click event



    // Deploy Model
    
    $('.xDeployModel').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type)

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
    }); 


    $('.xViewModelInfo').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type)

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
    }); 




























}); // End Window Load Event


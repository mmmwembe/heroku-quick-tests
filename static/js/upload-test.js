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

        alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type  + ' task ' + task)
        alert(' Changing Model being Deployed....')
        

        if ((model_type =="classification")) {
            storeSessionValue("classification_model_url", model_url)
            alert(' Deployed classification model updated ')
        }


        if ((model_type =="object detection")) {
            storeSessionValue("detection_model_url", model_url)
            alert(' Deployed Object Detection model updated ')
        }

    


    }); 


    // View and Edit Model Info

    $('.xViewModelInfo').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type)



    }); 



    function storeSessionValue(key, value) {
        if (localStorage) {
            localStorage.setItem(key, value);
        } else {
            $.cookies.set(key, value);
        }
    }

    function getStoredSessionValue(key) {
        if (localStorage) {
            return localStorage.getItem(key);
        } else {
            return $.cookies.get(key);
        }
    }







}); // End Window Load Event


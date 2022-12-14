window.addEventListener('load', (event) => {

/*

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

*/

    // Deploy Model
    
    $('.xDeployModel').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        //alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type  + ' task ' + task)
        //alert(' Changing Model being Deployed....')
        

        //if ((model_type =="classification")) {
        if(model_url.includes("tflite")){
            storeSessionValue("classification_model_url", model_url)
           // alert(' Deployed classification model updated ')
        }


    }); 


    $('.xDeployDetectionModel').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        var labels =  $('#detection_labels_data' + model_id).attr('data-all-labels');

        //alert('detection labels : ' + labels)

        //alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type  + ' task ' + task)
        //alert(' Changing Model being Deployed....')
        

        if(model_url.includes("tflite")){
            storeSessionValue("detection_model_url", model_url)
            //alert(' Deployed Object Detection model updated ')     
        }

        // Store model with model_url, labels and model_type
        const detectionModelObject = {
            model_url : model_url,
            labels : labels,
            model_type : "object detection"
          }

        localStorage.setItem("detectionModelObject", JSON.stringify(detectionModelObject));




    }); 


    // View and Edit Model Info

    $('.xViewModelInfo').on('click', function(e){


        var model_id = $(this).attr('model_id')
        var model_url = $('#model_url' +model_id ).val()
        var model_name = $('#model_name' +model_id ).val()
        var model_type = $('#model_type' +model_id ).val()
        var task = $('task' +model_id ).val()

        //alert('model_id : ' + model_id + '  model_name : ' + model_name + ' model_type :' + model_type)



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

    function getFileExtension(file_path){

        return file_path.split('.').pop();

    }



    function clearEntireLocalStorage(){

        localStorage.clear();
  
      }







}); // End Window Load Event


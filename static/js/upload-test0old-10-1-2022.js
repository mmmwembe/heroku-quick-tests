async function start() {

    // https://stackoverflow.com/questions/14199788/how-do-i-use-an-image-as-a-submit-button

    task_btns = document.getElementsByClassName('actions_column');

            for(let i = 0; i < task_btns.length; i++) {
                
            task_btns[i].addEventListener("click", function(e) {

            // var _cell = e.target
            // alert("model-url :" + e.target.getAttribute('data-model') +  "task : " + e.target.getAttribute('data-task'));

            var model_url = e.target.dataset.model
            var model_name = e.target.dataset.modelname
            var model_type = e.target.dataset.model_type
            var task =  e.target.dataset.task

            // const body ={ "model_url": model_url, "model_name": model_name, "model_type": model_type, "task": task }

  
            // var detection_model_url = btn_clicked.getAttribute('data-model')
            // storeSessionValue("deployed_detection_model_url", detection_model_url)

            // alert('deploy model  ' + ' ' + model_url);
            // alert('model name : ' + ' ' + model_name + ' model_type : ' + model_type  + ' task : ' + task );

            if (task =="delete"){

                // deleteModel(model_url,model_name, model_type,task)
                alert('DELETE MODEL CLICKED ' + model_url)
                // deleteModel(model_url,model_name, model_type,task)

            }

            if ((task =="deploy") && (model_type =="classification")) {
                storeSessionValue("classification_model_url", model_url)
            }
            if ((task =="deploy") && (model_type =="object detection")) {
                storeSessionValue("detection_model_url", model_url)
            }

            if (task =="view"){

                // deleteModel(model_url,model_name, model_type,task)
                alert('view model info clicked')

            }

    })

   }



   function deleteModel(model_url,model_name, model_type,task){

    $.ajax({
        type: "POST",
        url: "/NewDeleteModel/",
        dataType: 'json',
        data: { 
            model_url: model_url,
            model_name : model_name, 
            model_type : model_type,
            task : task,
        },
            success: function(data) {
            var everything = data.everything
            alert('Everything sent to server  : ' + JSON.stringify(everything))
        }

    });

    }

    
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



    $("#deleteForm").submit(function( e ) {


        // alert('BEFORE ')

        var model_url = $(this).data('model')
        var model_name = $(this).data('modelname')
        var model_type = $(this).data('model_type')
        var task = $(this).data('task')
     
        // alert(' Model URL ' + model_url )
        alert(' model name : ' + model_name +  ' model type ' + model_type +  ' task :' + task)

        var dataToPost = { 
            "model_url": model_url,
            "model_name" : model_name, 
            "model_type" : model_type,
            "task" : task
        }

        // $.post("/NewDeleteModel/", dataToPost)

        // $.post("/NewDeleteModel/", function(dataToPost, status){alert('status from post : ' + status);});

        $.post("/NewDeleteModel/",
        {
            model_url: model_url,
            model_name: model_name,
            model_type: model_type,
            task: task
        },
        function(data,status){
          alert("Data: " + data + "\nStatus: " + status);
        });

        /*

        $.ajax({
            type: "POST",
            url: "/NewDeleteModel/",
            contentType: 'application/json',
            dataType: 'json',
            data:JSON.stringify(dataToPost),
                success: function(data) {
                var everything = data.everything
                alert('Everything sent to server  : ' + JSON.stringify(everything))
            }

    
        });

        */

    
        e.preventDefault();

      });
   














}
    

    

start();
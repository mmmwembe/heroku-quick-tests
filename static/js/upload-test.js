async function start() {

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
                // alert('delete model clicked' + model_url)
                deleteModel(model_url,model_name, model_type,task)

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



    
    deleteForm.onsubmit = async (e) => {

        e.preventDefault();

        var model = $(this).attr('data-model')

        alert('model +++' + model )

        /*

        var form = document.querySelector("#deleteForm")[0];
  
        data = {
            model_url : document.querySelectorAll('[data-model]').value,
            model_name : document.querySelectorAll('[data-modelname]').value,
            model_type : document.querySelectorAll('[data-model_type]').value,
            task : document.querySelectorAll('[data-task]').value           
         }
  
        let response = await fetch('/NewDeleteModel/', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
          })
  
          let text = await response.text(); 
          alert('response from server ' + text)

          */
      };










}
    

    

start();
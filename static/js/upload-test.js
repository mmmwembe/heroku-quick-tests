async function start() {


   /*
    const modelButtons = document.getElementsByClassName('modelbtn');

    for(let i = 0; i < modelButtons.length; i++) {
     modelButtons[i].addEventListener("click", function(e) {

        var model_url = e.target.dataset.model
        var model_name = e.target.dataset.modelname
        var model_type = e.target.dataset.model_type
        var task =  e.target.dataset.task

        const body ={ "model_url": model_url, "model_name": model_name, "model_type": model_type, "task": task }

        // var detection_model_url = btn_clicked.getAttribute('data-model')
        // storeSessionValue("deployed_detection_model_url", detection_model_url)

        alert('deploy model_url  ' + ' ' + model_url);
        alert('model name : ' + ' ' + model_name + ' model_type : ' + model_type  + ' task : ' + task );



        if (task =="delete"){

            // deleteModel(model_url,model_name, model_type,task)

            storeSessionValue("classification_model_url", model_url)


        }



        })

    }

  */

    task_btns = document.getElementsByClassName('actions_column');

            for(let i = 0; i < task_btns.length; i++) {
                
            task_btns[i].addEventListener("click", function(e) {

            // var _cell = e.target
            alert("model-url :" + e.target.getAttribute('data-model') +  "task : " + e.target.getAttribute('data-task'));

    })

   }


   image_btns = document.getElementsByClassName('actions_column');

   for(let i = 0; i < image_btns.length; i++) {
       
   image_btns[i].addEventListener("click", function(e) {

   // var _cell = e.target
   alert("model-url :" + e.target.getAttribute('data-model') +  "task : " + e.target.getAttribute('data-task'));

})

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










}
    

    

start();
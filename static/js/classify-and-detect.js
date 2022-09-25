async function start() {
    const imageView = document.querySelector("#imageView"); 
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    const div_active_folder = document.getElementById("upload-folder");
    const form_hidden_field_current_folder = document.getElementById("current_folder");




    var img_thumbnails = null
    var active_folder = document.getElementById("upload-folder").value;
    // alert('active folder ' + active_folder)

    let results_JSON =[];
    let results_JSON_obj_detection =[];

    var datatable = datatable =  $('#results-datatable').DataTable( {data: results_JSON, columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    var firstColumnHeader = $('#results-datatable thead th');
    firstColumnHeader.css('background', '#252526');

    var datatable_obj_detection =  $('#results-datatable-object-detection').DataTable( {data: results_JSON_obj_detection,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    var firstColumnHeader2 = $('#results-datatable-object-detection thead th');
    firstColumnHeader2.css('background', '#252526');

    //$('#results-datatable').css('color', 'black');

    document.querySelector("#predict-button").disabled = true;

    // --------------------------
    // Classification Model

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    const classification_model = await tfTask.ImageClassification.CustomModel.TFLite.load({
        model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
    });




   // MODEL INFORMATION - Mwembeshi 9/12/2022
    // Google Drive: DUST-SUN-FOG-CLEAR
    // Model Directory: model-object-detection
    // Model URL: /content/drive/MyDrive/DUST-SUN-FOG-CLEAR/model-object-detection/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite
    // Google Cloud URL: https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite

    var obj_detection_model = undefined;
    // https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite   
    // https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-object-detection/obj-detection-dust-model.tflite
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite").then((loadedModel) => {
       obj_detection_model = loadedModel;
       document.querySelector("#predict-button").disabled = false;
    });


    // Analyze image
    document.querySelector("#predict-button").addEventListener("click",async () => {

        // const predictions = await model.predict(img);
        const predictions_from_classifier = await classification_model.predict(img);
        results_JSON = create_json_from_predictions_classification(predictions_from_classifier)
        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();
    });

}



async function analyze_image(){

    // get classification predictions and update the table
    classify_image()

}

function create_json_from_predictions_classification(preds){
    var jsonArr = [];
    var json_object
    
    for (var i = 0; i < preds.classes.length; i++) {     
        json_object = [i+1,preds.classes[i].className,((preds.classes[i].score*100).toFixed(0)).toString() + "%"]; 
        jsonArr.push(json_object);
       }
      return jsonArr

}

        
img_thumbnails = document.getElementsByClassName('gallery_column');

   for(let i = 0; i < img_thumbnails.length; i++) {

       img_thumbnails[i].addEventListener("click", async (e) => {

        var img_url = e.target.src
        document.getElementById('selected-image').src = img_url;

        /*

        // const predictions = await model.predict(img);
        const predictions = await classification_model.predict(document.getElementById('selected-image'));
        results_JSON = create_json_from_predictions_classification(predictions)
        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();

        */

    });






    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }


    function remove_bboxes_and_labels(){

        // Remove labels
        var elms1 = document.querySelectorAll("[id='p-label']");
        for(var i = 0; i < elms1.length; i++) 
        // elms[i].style.display='none'; 
          elms1[i]?.remove()

        // Remove labels
        var elms2 = document.querySelectorAll("[id='bbox-highlighter']");
        for(var i = 0; i < elms2.length; i++) 
          // elms[i].style.display='none'; 
            elms2[i]?.remove()        

    }


    function update_caption_and_bbox_colors(){

        // Remove labels
        var elms1 = document.querySelectorAll("[id='p-label']");
        for(var i = 0; i < elms1.length; i++) 
        // elms[i].style.display='none'; 
         // elms1[i]?.remove()
         alert('p-label '+ elms1[i].getAttribute('label'))
         // alert('p-label')

        // Remove labels
        var elms2 = document.querySelectorAll("[id='bbox-highlighter']");
        for(var i = 0; i < elms2.length; i++) 
          // elms[i].style.display='none'; 
          //  elms2[i]?.remove()   
          // alert('bbox-highlighter')
          // elms2[i].style["border"] = "10px dashed #C2175B;"
          elms2[i].setAttribute("border","10px dashed #C2175B")

    }


    function delay(time_in_miliseconds) {
        //delay(1000).then(() => console.log('ran after 1 second1 passed'));
        return new Promise(resolve => setTimeout(resolve, time_in_miliseconds));
    }
  
    


}



start();
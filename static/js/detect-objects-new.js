async function start() {
    const imageView = document.querySelector("#imageView"); 
    const img = document.querySelector("#selected-image");
    const resultDiv = document.querySelector(".result");
    const div_active_folder = document.getElementById("upload-folder");
    const form_hidden_field_current_folder = document.getElementById("current_folder");

    var img_thumbnails = null
    var active_folder = document.getElementById("upload-folder").value;
    // alert('active folder ' + active_folder)

    let results_JSON =[];
    var threshold = 0.5
    var datatable = datatable =  $('#results-datatable').DataTable( {data: results_JSON, columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    var firstColumnHeader = $('#results-datatable thead th');
    firstColumnHeader.css('background', '#252526');

    document.querySelector("#predict-button").disabled = true;

    //$('#results-datatable').css('color', 'black');

    // MODEL INFORMATION - Mwembeshi 9/12/2022
    // Google Drive: DUST-SUN-FOG-CLEAR
    // Model Directory: model-object-detection
    // Model URL: /content/drive/MyDrive/DUST-SUN-FOG-CLEAR/model-object-detection/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite
    // Google Cloud URL: https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite

    var model = undefined;
    // https://tfhub.dev/tensorflow/lite-model/ssd_mobilenet_v1/1/metadata/2?lite-format=tflite   
    // https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-object-detection/obj-detection-dust-model.tflite
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite").then((loadedModel) => {
        model = loadedModel;
        document.querySelector("#predict-button").disabled = false;
    });


    document.querySelector("#predict-button").addEventListener("click", async () => {

        if (!model) {
            return;
        }
        // Run inference on an image.
        const predictions = model.detect(img);

        // Remove bounding boxes and labels from previous frame
        remove_bboxes_and_labels()

        results_JSON = create_json_for_object_detection(predictions)

        // update_caption_and_bbox_colors()
        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();

    });


    img_thumbnails = document.getElementsByClassName('gallery_column');
    for(let i = 0; i < img_thumbnails.length; i++) {
       img_thumbnails[i].addEventListener("click", function(e) {
       var img_url = e.target.src
       document.getElementById('selected-image').src = img_url;

       })
    }

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
          // alert('highligther ' + elms2[i].getAttribute('label'))     

    }










} // End of async function start()




function create_json_for_object_detection(preds){

    var jsonArr = [];
    var json_object

    for (let i = 0; i < preds.length; i++) {

        const currentObject = preds[i];

        if (currentObject.classes[0].probability > 0.5) {        
        // if (currentObject.classes[0].probability > threshold) {

            label = currentObject.classes[0].className
            confidence = Math.round(parseFloat(currentObject.classes[0].probability) * 100) + "%"; 

            json_object = [i+1,label, confidence]; 
            jsonArr.push(json_object);

            const p = document.createElement("p");
            p.setAttribute("id","p-label");
            p.setAttribute('label', label);
            // p.setAttribute('style', 'background-color:#218838;');

            p.innerText =label +  " - with " + confidence + " confidence.";

            p.style = "margin-left: " + currentObject.boundingBox.originX + "px; margin-top: " + (currentObject.boundingBox.originY - 10) + "px; width: " + (currentObject.boundingBox.width - 10) + "px; top: 0; left: 0;";
      
            const highlighter = document.createElement("div");
            highlighter.setAttribute("id", "bbox-highlighter");
            highlighter.setAttribute("class", "highlighter");
            highlighter.setAttribute('label', label);
            // highlighter.setAttribute('style', 'background-color:darkblue;');

            const myStyles = `
            background: rgba(0, 255, 0, 0.25);
            border: 5px dashed #C2175B;
            z-index: 1;
            position: absolute;
          `;
            highlighter.style ="left: " +
              currentObject.boundingBox.originX + "px; top: " +
              currentObject.boundingBox.originY + "px; width: " +
              currentObject.boundingBox.width +   "px; height: " +
              currentObject.boundingBox.height +  "px;";
      
            imageView.appendChild(highlighter);
            imageView.appendChild(p);

            //children.push(highlighter);
            //children.push(p);

        }
    }

    return jsonArr 


}



    

start();
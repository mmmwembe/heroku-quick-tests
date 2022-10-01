async function start() {
    const img = document.querySelector("#selected-image");
    var input = document.getElementById("image-selector");
    const resultDiv = document.querySelector(".result");
    const div_active_folder = document.getElementById("upload-folder");
    const form_hidden_field_current_folder = document.getElementById("current_folder");




    var img_thumbnails = null
    var active_folder = document.getElementById("upload-folder").value;
    // alert('active folder ' + active_folder)

    let results_JSON =[];
    var datatable = datatable =  $('#results-datatable').DataTable( {data: results_JSON, columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );

    var firstColumnHeader = $('#results-datatable thead th');
    firstColumnHeader.css('background', '#252526');

    //$('#results-datatable').css('color', 'black');

    // Load the TFLite model - Load the model from a custom url with other options (optional).
    const model = await tfTask.ImageClassification.CustomModel.TFLite.load({
        model: "https://storage.googleapis.com/2021_tflite_glitch_models/stack-plume-dust-classification/model_classifier.tflite",
    });

    input.addEventListener("change", preview_image);

    function preview_image(event) {
        var reader = new FileReader();
        reader.onload = function () {
            img.src = reader.result;
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    document.querySelector("#predict-button").addEventListener("click", async () => {

        // Run inference on an image.
        // const predictions = await model.predict(img);
        const predictions = await model.predict(document.querySelector("#selected-image"));
        // console.log(predictions.classes);

        // Show the results.
        // resultDiv.textContent = predictions.classes.map((c) => `${c.className}: ${c.score.toFixed(3)}`).join(", ");

        results_JSON = create_json_from_predictions(predictions)

        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();
    });

}

function create_json_from_predictions(preds){
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
   img_thumbnails[i].addEventListener("click", function(e) {
   var img_url = e.target.src
   document.getElementById('selected-image').src = img_url;

   // alert("image index = " + e.target.getAttribute('data-index'));

    // Regenerate datatable so it maintains its font color
    // datatable =  $('#results-datatable').DataTable( {data: results_JSON, columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
    // searching: false,ordering: false,lengthChange: false} );
    // var firstColumnHeader = $('#results-datatable thead th');
    // firstColumnHeader.css('background', '#252526');


    // Wait for 2 seconds (2000 milisecond) before re-analysing the image
    /*
    setTimeout(function (){
  
        const predictions = await model.predict(document.querySelector("#selected-image"));
        results_JSON = create_json_from_predictions(predictions)
        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();
                  
      }, 2000);

      */



   })
}
    

    

start();
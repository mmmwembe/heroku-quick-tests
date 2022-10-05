window.addEventListener('load', (event) => {

    var imageView = document.querySelector("#imageView");    
    var img = document.querySelector("#selected-image");
    let results_JSON =[];
    const predictButton = document.querySelector("#predict-button")
    var model = undefined;

    JSON_TEST = [
        [1, "Chicken", "90.4%"],
        [2, "Rat", "54.4%"],
        [3, "Rabbit", "80%"],
        [4, "Mango", "75%"]
    ]


    $(document).ready(function () {
        $('#GradingTable').DataTable();
    });

    results_JSON = JSON_TEST


    var datatable =  $('#results-datatable').DataTable( {data: results_JSON,
        columns: [{ title: "#" },{ title: "Class/Label" },{ title: "Confidence" }],
        searching: false,ordering: false,lengthChange: false} );
    
    
    predictButton.disabled = true;

    // Upload Model
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite").then((loadedModel) => {

        model = loadedModel;

        document.querySelector("#predict-button").disabled = false;

    });



    
    predictButton.addEventListener("click", async () => {


        if (!model) {
          alert('There is no model mate...something changed real bad')
            return;
        }

        // Run inference on an image.
        const predictions = model.detect(img);

        // Remove bounding boxes and labels from previous frame
        // remove_bboxes_and_labels()
        removeAllLabels()

        results_JSON = create_json_for_object_detection(predictions)

        alert('results_JSON: ' + JSON.stringify(results_JSON))

       // update_caption_and_bbox_colors()
        datatable.clear();
        datatable.rows.add(results_JSON);
        datatable.draw();

    });

    
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
                p.setAttribute('style', 'background-color:#218838;');

                p.innerText =label +  " - with " + confidence + " confidence.";

                p.style = "margin-left: " + currentObject.boundingBox.originX + "px; margin-top: " + (currentObject.boundingBox.originY - 10) + "px; width: " + (currentObject.boundingBox.width - 10) + "px; top: 0; left: 0;";
        
                const highlighter = document.createElement("div");
                highlighter.setAttribute("id", "bbox-highlighter");
                highlighter.setAttribute("class", "highlighter");
                highlighter.setAttribute('label', label);
    

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


    function removeAllLabels_Original(){
        const elements = document.getElementsByClassName("card");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }


    function removeAllLabels(){

        const elements = document.querySelectorAll("[id='p-label']");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }

        const elements2 = document.querySelectorAll("[id='bbox-highlighter']");
        while(elements2.length > 0){
            elements2[0].parentNode.removeChild(elements2[0]);
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


    img_thumbnails = document.getElementsByClassName('gallery_column');

    for(let i = 0; i < img_thumbnails.length; i++) {



        img_thumbnails[i].addEventListener("click", function(e) {

        // First remove previous labels
        removeAllLabels()
        //remove_bboxes_and_labels()
 
        var img = document.querySelector("#selected-image");

        var img_url = e.target.src

        img.src = img_url;

        $(".main-image").load(" .main-image")

        $("#imageView").load(" #imageView");

        // get_size_of_image_vs_imageview()

   })

}








  
  // -------------------------------------------------------
  // RELOAD DIV WITHOUT REFRESHING WHOLE PAGE
  // http://jsfiddle.net/6nLa19be/7/
  // ---------------------------------------------------------
    function get_size_of_image_vs_imageview(){


        var img_height = $("#selected-image").height();
        var img_width = $("#selected-image").width();
     
        var imageView_height= $("#imageView").height();
        var imageView_width = $("#imageView").width();


        var before = 'BEFORE  Actual image h/w: ' + img_height +'/' + img_width + '     imageView h/w: ' +  imageView_height +'/' + imageView_width 

  
        $("#imageView").css("width", img_width);
        $("#imageView").css("height", img_height);

        // $("#imageView").load(" #imageView");

        var imageView_height= $("#imageView").height();
        var imageView_width = $("#imageView").width();

        var after= 'AFTER Actual image h/w: ' + img_height +'/' + img_width + '     imageView h/w: ' +  imageView_height +'/' + imageView_width 

        $("#before").html(before);
        $("#after").html(after);



    }














    
    
}); // End Window Load Event
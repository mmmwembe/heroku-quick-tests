window.addEventListener('load', (event) => {

    var imageView = document.querySelector("#imageView");    
    var img = document.querySelector("#selected-image");
    let results_JSON =[];
    const predictButton = document.querySelector("#predict-button")
    var model = undefined;
    var DEFAULT_MODEL ="https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite"
    var SELECTED_MODEL =""
    var LABELS_MODEL_TRAINED_ON=""
    var LABELS_JSON_ARRAY =[]

    var colors = ['#ff0000', '#00ff00', '#0000ff','#ff3333', '#ffff00', '#ff6600'];
    var random_color = colors[Math.floor(Math.random() * colors.length)].toString() + '';

    /*
    JSON_TEST = [
        [1, "Chicken", "90.4%"],
        [2, "Rat", "54.4%"],
        [3, "Rabbit", "80%"],
        [4, "Mango", "75%"]
    ]
   */

    // $(document).ready(function () { $('#GradingTable').DataTable();});

    // results_JSON = JSON_TEST

    // columns: [{ title: "#" },{ title: "Label" }], 

    var datatable =  $('#results-datatable').DataTable( {data: LABELS_JSON_ARRAY, 
        columns:[
            { id:"title",   header:{ text:"#", css:{ "background":"#AFA"}} },
            { id:"title",   header:{ text:"Label", css:"my_datatable_style"} }
        ],

        columnDefs: [
            { width: "20%", targets: 0 }   // Make first column 20% of the width
        ],
        searching: true,ordering: false,lengthChange: false} );
    


    predictButton.disabled = true;

    // Upload Model

    if (localStorage.getItem("detection_model_url")) {

        var isTFlite = localStorage.getItem("detection_model_url").includes("tflite");

       if (isTFlite  === true)  {

         SELECTED_MODEL = localStorage.getItem("detection_model_url")

         let detectionModelObject = window.localStorage.getItem("detectionModelObject");

         json_obj_detection_model = JSON.parse(detectionModelObject)

         LABELS_MODEL_TRAINED_ON = json_obj_detection_model["labels"]

         alert('SELECTED MODEL ' + SELECTED_MODEL)
         // alert('SELECTED MODEL LABELS ' +  LABELS_MODEL_TRAINED_ON)

         const SPLIT_LABELS = LABELS_MODEL_TRAINED_ON.split(/[, ]+/);

         var label_json_object
         for (let i = 0; i < SPLIT_LABELS.length; i++) { 
            const _label = SPLIT_LABELS[i];

            label_json_object = [i+1,_label]; 
            LABELS_JSON_ARRAY.push(label_json_object);
          }

          datatable.clear();
          datatable.rows.add(LABELS_JSON_ARRAY);
          datatable.draw();


	  // Load Model

    	 tflite.ObjectDetector.create(SELECTED_MODEL).then((loadedModel) => {

        	 model = loadedModel;

        	document.querySelector("#predict-button").disabled = false;

    	});



       } 


      else if (DEFAULT_MODEL.includes("tflite")) {
        //  Load default model

        // alert(' It gets to the default Model')

           tflite.ObjectDetector.create(DEFAULT_MODEL).then((loadedModel) => {

        	 model = loadedModel;

        	document.querySelector("#predict-button").disabled = false;

    	  });


      }


       else {

         // No model and de-activate the predict button
         alert(' It doesnt see any model')

         var model = undefined;

         document.querySelector("#predict-button").disabled = true;

       }

    }






     // model = loadModel(DEFAULT_MODEL)

/*
    tflite.ObjectDetector.create("https://storage.googleapis.com/2021_tflite_glitch_models/dust-sun-fog-clear-rain-snow-blurry/model-obj-detect-dust-sun-fog-clear-blurry-rain-snow.tflite").then((loadedModel) => {

        model = loadedModel;

        document.querySelector("#predict-button").disabled = false;

    });

*/

    
    predictButton.addEventListener("click", async () => {


        if (!model) {
          alert('There is no model mate...something changed real bad')
            return;
        }

        // Run inference on an image.
        const predictions = model.detect(img);

        // Remove bounding boxes and labels from previous frame
        // remove_bboxes_and_labels()
        // removeAllLabels()

        //removeAllLabels()

        removeAllCustomLabels()

        results_JSON = create_json_for_object_detection(predictions)

        // alert('results_JSON: ' + JSON.stringify(results_JSON))

       // update_caption_and_bbox_colors()
       // datatable.clear();
       // datatable.rows.add(results_JSON);
       // datatable.draw();


        // New Table Update

        buildTable(results_JSON)

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

                // Bounding Box dimensions
                top =currentObject.boundingBox.originY 
                left = currentObject.boundingBox.originX
                width = currentObject.boundingBox.width
                height=currentObject.boundingBox.height 

                label_num = i
                label_color = colors[Math.floor(Math.random() * colors.length)].toString();

                var newLabel = LabelCard(label_num, label_color, label, confidence, top, left, width, height)
               
                json_object = [i,label, confidence]; 
                jsonArr.push(json_object);

                imageView.appendChild(newLabel);

            }
        }

        return jsonArr 
    }


    function create_json_for_object_detection_ORIGINAL(preds){

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

                // p.innerText =label +  " - with " + confidence + " confidence.";
                p.innerText =label +  " - " + confidence;

                p.style = "margin-left: " + currentObject.boundingBox.originX + "px; " + 
                          "margin-top: " + (currentObject.boundingBox.originY - 10) + "px; " + 
                          "width: " + (currentObject.boundingBox.width - 10) + "px; " + 
                          "top: 0; left: 0;";
        
                const highlighter = document.createElement("div");
                highlighter.setAttribute("id", "bbox-highlighter");
                highlighter.setAttribute("class", "highlighter");
                highlighter.setAttribute('label', label);
    

                highlighter.style =" left: " + currentObject.boundingBox.originX +  "px; " + 
                          " top: " + currentObject.boundingBox.originY + "px; " + 
                          " width: " + currentObject.boundingBox.width +   "px; " +
                          " height: " + currentObject.boundingBox.height +  "px;";
        
                imageView.appendChild(highlighter);
                imageView.appendChild(p);

                //img.appendChild(highlighter);
                //img.appendChild(p);

                //children.push(highlighter);
                //children.push(p);

            }
        }

        return jsonArr 
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

        fetch(img_url)
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(blob => {
          let objectURL = URL.createObjectURL(blob);
          let myImage = new Image();
          myImage.src = objectURL;
          document.getElementById('selected-image').appendChild(myImage)
          //document.getElementById('myImg').appendChild(myImage)
          img.src = objectURL;
      });


   })

}

/*
function resize_imageView(){


    $("#imageView").load(" #imageView");


}



function updateTestImage(image_url){

    $.ajax({
        type: "POST",
        url: "/updateTestImage/",
        contentType: 'application/json;charset=UTF-8',
        data: { 
           img_url: image_url,
           model_type : 'object detection'
        },
        success: function(data) {
          var new_url = data.img_url
          alert('the next image is  : ' + JSON.stringify(new_url))
        }
    
      });
    
}

*/

function buildTable(data){
    var table = document.getElementById('myTable')
    table.innerHTML = ''
    for (var i = 0; i < data.length; i++){
        // <td>${data[i].index}</td>
        //<td><a id="${data[i].index}" href="#"  onclick="href_onclick(this.id)">${data[i].index}</a></td>
        var row = `<tr class = "align-middle">        
                        <td><button id="${data[i][0]}" onclick="hello()" type="button" class="btn btn-outline-dark">${data[i][0]}</button></td>
                        <td id="label${data[i][0]}">${data[i][1]}</td>
                        <td id="confidence${data[i][0]}">${data[i][2]}</td>

                        <td>
                            <div class="form-group">
                                <button type="submit" id="${data[i][0]}" label_index ="${data[i][0]}" class="xCorrectBtn" style="background:url('/static/project-icons/icons8-checkmark-64.png'); width: 30px; height: 30px; background-size: cover; border: none; cursor: pointer; color: transparent;"></button>
                            </div></form>
                        </td>

                        <td>

                          <button type="submit" id ="${data[i][0]}" label_index ="${data[i][0]}" class="xWrongBtn" style="background:url('/static/project-icons/icons8-cross-mark-48.png'); width: 30px; height: 30px; background-size: cover; border: none; cursor: pointer; color: transparent;"></button>

                        </td>

                        <td>
                        <input type="text" id="${data[i][0]}" name="labelComment">
                        </td>

                  </tr>`
        table.innerHTML += row


    }
}


// ----------------------------------------------------------
//     Manipulating Data from New Table
//------------------------------------------------------------

$('.xCorrectBtn').on('click', function(e){


    var label_index = $(this).attr('label_index')
    // var label = $('#label' +label_index ).val()
    // var confidence = $('#confidence' + label_index ).val()
    alert('Correct Btn - label_index ' + label_index)


    //alert('button clicked: CORRECT '  + '  label index : ' + label_index  + ' confidence : ' + confidence)

}); 


$('.xWrongBtn').on('click', function(e){


    var label_index = $(this).attr('label_index')
    //var label = $('#label' +label_index ).val()
    //var confidence = $('#confidence' + label_index ).val()

    alert('Wrong button - label index ' + label_index)
    

    // alert('button clicked: WRONG '  + '  label index : ' + label_index  + ' confidence : ' + confidence)

}); 



function hello() {

    alert('Hello from the check box')

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


    async function loadModel(model_url){

            // Upload Model
        tflite.ObjectDetector.create(model_url).then((loadedModel) => {

        selected_model = loadedModel;

        document.querySelector("#predict-button").disabled = false;


        return selected_model

    });


    }




    //-------------------------------------------------------------------------------
    //   New Labeling Function
    //------------------------------------------------------------------------------

    
    function LabelCard(label_num, label_color, label, confidence, top, left, width, height){

        const labelCard = document.createElement('div')
        labelCard.className ="customLabel"
        labelCard.id = label
        labelCard.setAttribute("label_name", "customLabel"+ label_num)
        labelCard.setAttribute("label_index", label_num)
        labelCard.setAttribute("label", label)

        const labelHeader = document.createElement('label')
        labelHeader.className="label-header"
        labelHeader.style = "position: absolute; top: "  + (top - 20) + "px;" +  
                                                " left: " + left + "px;"  + 
                                                " width: " + width +  "px;" + 
                                                " height: 20px; line-height: 20px; color: white; padding: 0 0px; background-color:" + label_color + "; border: 3px solid  " + label_color + "; cursor: pointer;"
        labelHeader.innerHTML ="<strong> "+ label + "-" + confidence + " </strong>";
        labelCard.append(labelHeader);

        const boundingBox = document.createElement('div')
        boundingBox.style = "position: absolute; top: " + top + "px; ; left: "+  left + "px; width: " + width + "px;  height: " + height + "px; border: 3px solid " + label_color + "; background-color: transparent; z-index: 2; cursor: pointer;"
        labelCard.append(boundingBox);

        labelCard.addEventListener("click", function(){

            // alert('You clicked a label ' + this.id)
            $(this).attr('id');

            var label_name =  labelCard.getAttribute("label_name")
            // alert('label name ' + label_name)
            var label = labelCard.labelHeader.getAttribute("label_name")

            $(this).fadeOut();
            $(this).fadeIn();

        });


        labelCard.addEventListener('mouseenter', (e) => {

            $(this).fadeOut();
            $(this).fadeIn();

        });

        labelCard.addEventListener('mouseenter', (e) => {

            $(this).fadeOut();
            $(this).fadeIn();

        });


        return labelCard

        }


        // Remove all Custom Labels

        function removeAllCustomLabels(){
            const elements = document.getElementsByClassName("customLabel");
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        }


 













    
    
}); // End Window Load Event
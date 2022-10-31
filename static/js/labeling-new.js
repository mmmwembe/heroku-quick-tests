window.addEventListener('load', (event) => {

    var MAX_CANVAS_WIDTH = 600
    var MAX_CANVAS_HEIGHT = 400
    var TARGET_CANVAS_WIDTH = null
    var TARGET_CANVAS_HEIGHT = null
    var BOUNDING_BOXES_ARRAY = []
    var rectangle, isDown, origX, origY;
    var label='label'
    var label_color = 'green'
    var LABEL_STATUS ="active"
    var x_min, y_min, x_max, y_max;
    var norm_x_min,norm_y_min,norm_x_max,norm_y_max;
    var IMAGE_URL;
    const MODE = {
        drawing :  'drawing',
        notDrawing : 'notDrawing'  // // notDrawing = {scaling rotating skewing resizing moving }
    }
    var currentMode = MODE.drawing
    var startTime, endTime, elapsed_time_seconds;
    var total_duration = null, units_of_measure ='s', total_duration_array = [], date = null

    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const d = new Date()
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var month_text = months[d.getMonth()];
    var day = d.getDate();
    var today = new Date();
    var ISODate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var Date_Month_Text = today.getDate() + '-' + month_text +'-'+ today.getFullYear()
    var iso_date_timestamp 
    var current_img_index = 0;

    var NUM_OF_IMAGES;
    // LABELED_IMAGES_TRACKER, NUM_LABELLED_IMAGES and NUM_IMAGES_TOTAL are determined by Show_Labeled_Images_and_Enable_Labels_Download()
    var LABELED_IMAGES_TRACKER = []
    var NUM_LABELLED_IMAGES;
    var NUM_IMAGES_TOTAL;
    var ACTIVE_PROJECT_ID=""
    var ACTIVE_PROJECT_JSON;
    var ALL_USER_PROJECTS;
    var CURRENT_PROJECT="";
    var PROJECT_JSON

    var first_20_colors = ['#112FDF', '#FF0006', '#00A546','#D95C00', '#862E85', '#AFD800','#512479', '#31CBF1', '#FCAE03','#FC368D', '#723BB0', '#E12A1F','#FF014A', '#0094D4', '#879AF9','#E40061', '#F7DC43', '#3C55E6','#590F26', '#243274'];

    var user_id ="45f20651684f40be8916c29d69295998"

 

    // https://www.demo2s.com/javascript/javascript-fabric-js-draw-rectangle-between-two-mouse-clicks-on-canvas.html
    var fabricCanvas = new fabric.Canvas("fabricCanvas");
    fabric.Object.prototype.set("field", "value");

    // You can access this field through
    // fabric.Object.prototype.Rect.field
    // It returns "value"
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.getAngleInRadians = function() {
        return this.getAngle() / 180 * Math.PI;
    };

    fabric.Object.prototype.getZIndex = function() {
        return this.fabricCanvas.getObjects().indexOf(this);
    }

    // -----------------------------------------------------------
    //  Clear Local Storage - If needed during coding - update final
    //------------------------------------------------------------
    
    clearEntireLocalStorage()

    img_thumbnails = document.getElementsByClassName('gallery_column');

    var IMAGE_LIST = {}
    for(let i = 0; i < img_thumbnails.length; i++) {
      var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;
      // alert(' image URL ' + imageURL)
      IMAGE_LIST[i] = imageURL
    }
    NUM_OF_IMAGES = img_thumbnails.length; 
    // alert(' Number of Images ' + NUM_OF_IMAGES)

    // Show the first image from the thumbnails the main image
    showFirstImage()

    // alert('new image width :' + image_dimensions.width)

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

            img_url = e.target.src
            IMAGE_URL = img_url
            current_img_index = i
            updateFabricCanvasBackgroundImage(img_url)
            //alert(img_url)
            var img_name = getFileName(IMAGE_URL)

            // Get stored canvas json and display on the canvas
            if (getStoredSessionValue(img_name) !== null) {
                const canvas_json = getStoredSessionValue(img_name);
                fabricCanvas.loadFromJSON($.parseJSON(canvas_json), fabricCanvas.renderAll.bind(fabricCanvas))
            }

      })
    }

 
    //----------------------------------------------------------
    // Show Marked Images and Enable Download
    //----------------------------------------------------------
    // Show_Labeled_Images_and_Enable_Labels_Download()

    //--------------------------------------------------------

   function updateFabricCanvasBackgroundImage(NEW_IMAGE_URL){

        var remoteImageForFabric = new Image();
        remoteImageForFabric.crossOrigin = "Anonymous";
        remoteImageForFabric.src = "";
        remoteImageForFabric.onload = function(loadedImage) {

            var imgToDrawOnFabricCanvas = new fabric.Image(remoteImageForFabric);

           // Clear background image and everything on the canvas
           fabricCanvas.remove.apply(fabricCanvas, fabricCanvas.getObjects().concat())

            sourceImageWidth = imgToDrawOnFabricCanvas.width;
            sourceImageHeight = imgToDrawOnFabricCanvas.height;
            // alert('Original Width : ' + orgWidth +" Original Height " + orgHeight)
            target_image_dimensions = calculateAspectRatioFit(sourceImageWidth, sourceImageHeight, MAX_CANVAS_WIDTH, MAX_CANVAS_HEIGHT)
            TARGET_CANVAS_WIDTH = target_image_dimensions.width
            TARGET_CANVAS_HEIGHT = target_image_dimensions.height

            // Set Fabric Canvas width and height to target width and height
            fabricCanvas.setDimensions({width:TARGET_CANVAS_WIDTH, height:TARGET_CANVAS_HEIGHT});

            // fabricCanvas.add(imgToDrawOnFabricCanvas);
            fabricCanvas.setBackgroundImage(imgToDrawOnFabricCanvas, fabricCanvas.renderAll.bind(fabricCanvas), {
                scaleX: fabricCanvas.width / sourceImageWidth,
                scaleY: fabricCanvas.height / sourceImageHeight 
            });

        }
        //remoteImageForFabric.src = "https://images-na.ssl-images-amazon.com/images/S/aplus-seller-content-images-us-east-1/ATVPDKIKX0DER/A1GLDJYFYVCUE8/B0044FL7SG/kFRS1LS1QWWr._UX500_TTW_.jpg";
        remoteImageForFabric.src = NEW_IMAGE_URL;

   }

    /**
  * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
  * images to fit into a certain area.
  *
  * @param {Number} srcWidth width of source image
  * @param {Number} srcHeight height of source image
  * @param {Number} maxWidth maximum available width
  * @param {Number} maxHeight maximum available height
  * @return {Object} { width, height }
  */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
 }

//---------------------------------------------------------------------------
//      Draw Rectangle on Canvas
//----------------------------------------------------------------------------
// https://www.demo2s.com/javascript/javascript-fabric-js-draw-rectangle-with-fabric-js.html

 fabricCanvas.on('mouse:down', function(o){

    startTimer() 

    if(current_label.length > 0 && current_color.length > 0){
    // Only start drawing if both a label and label exist

        var pointer = fabricCanvas.getPointer(o.e);
        isDown = true;
        origX = pointer.x;
        origY = pointer.y;
        // rectangle = new fabric.Rect({
        rectangle = new fabric.BoundingBox({        
            left: origX,
            top: origY,
            fill: 'transparent',
            stroke: current_color,
            strokeWidth: 2,
            label : current_label,
            label_color : current_color
        });
        fabricCanvas.add(rectangle);

  }

});

fabricCanvas.on('mouse:move', function(o){
    if (!isDown) return;

    currentMode = MODE.drawing

    if(current_label.length > 0 && current_color.length > 0){
    // Only start drawing if both a label and label exist        

    var pointer = fabricCanvas.getPointer(o.e);
    if(origX>pointer.x){
        rectangle.set({ left: Math.abs(pointer.x) });
    }
    if(origY>pointer.y){
        rectangle.set({ top: Math.abs(pointer.y) });
    }
    rectangle.set({ width: Math.abs(origX - pointer.x) });
    rectangle.set({ height: Math.abs(origY - pointer.y) });

    // change cursor to hover
    rectangle.set({ hoverCursor: "pointer"})

    // rectangle.on("mousedblclick", ()=>{alert(' active Object ')})
    
    fabricCanvas.renderAll();

}


});

fabricCanvas.on('mouse:up', function(o){


    if (isDown && currentMode === MODE.drawing) {

        endTimer()

        if(current_label.length > 0 && current_color.length > 0){     

        var canvas_height = fabricCanvas.height
        var canvas_width =  fabricCanvas.width
        var canvas_objects, last_object, last_object_index  = getObjectIndexOnCanvas()

        x_min = rectangle.get("left")
        y_min = rectangle.get("top")
        x_max = rectangle.get("left") + rectangle.get("width")
        y_max = rectangle.get("top")  + rectangle.get("height")
    
        norm_x_min = rectangle.get("left")/canvas_width
        norm_y_min = rectangle.get("top")/canvas_height 
        norm_x_max = (rectangle.get("left") + rectangle.get("width"))/canvas_width
        norm_y_max = (rectangle.get("top")  + rectangle.get("height"))/canvas_height 
        iso_date_timestamp = new Date().toISOString()
    
        norm_data =  {'test_train_validation' : 'TESTING', 'image_url': IMAGE_URL, 'label': current_label, 'norm_x_min': norm_x_min, 'norm_y_min': norm_y_min, 'norm_x_tr' : '', 'norm_y_tr' :'', 'norm_x_max' : norm_x_max, 'norm_y_max' : norm_y_max, 'norm_x_bl': '', 'norm_y_bl':'', 'label_status' : LABEL_STATUS, 'ISODate': iso_date_timestamp }
        // alert(' NORMALIZED DATA ' + JSON.stringify(norm_data))

        rectangle.set({
            'originator': user_id,
            'ISODate' : ISODate,
            'date_month_text' : Date_Month_Text,
            'ai_ready_normalized_data' : norm_data,
            'timer_tracker': {'elapsed_time_seconds' : elapsed_time_seconds, 'total_duration_array': total_duration_array, 'total_duration': total_duration, 'units_of_measure' : units_of_measure},
        })

        fabricCanvas.toJSON(['name', 'label', 'label_font', 'label_color', 'originator', 'checker', 'reviewer', 'qa','approved_true_false', 'ISODate', 'date_month_text', 'ai_ready_normalized_data', 'timer_tracker'])
        fabricCanvas.add(rectangle);
        fabricCanvas.renderAll();

        /*
        // Save the data above to the Canvas
        fabricCanvas.toJSON(['data'])

        // Add label to the rectangle
        var label_text = new fabric.Text(label)
        var label_height = label_text.height
        label_text.set({
            fill: 'green',
            left: rectangle.get("left")+2,
            top: rectangle.get("top") + 2,
            hoverCursor: "pointer"
            //fontSize: 15
        });
        fabricCanvas.add(label_text);
        fabricCanvas.renderAll();

         */

        // save Canvas JSON to localStorage
        const json = fabricCanvas.toJSON();
        var canvas_json_string = JSON.stringify(json)

        var img_name = getFileName(IMAGE_URL)

        if (canvas_json_string !== null) {

            storeSessionValue(img_name, canvas_json_string)

            // Show Labelled Images and Enable Download
           // Show_Labeled_Images_and_Enable_Labels_Download()
        }
        else {
            storeSessionValue(img_name, null)
        }

        // alert('filename : ' + img_name)

       }
    
    };

      isDown = false;
      currentMode = MODE.notDrawing

});


// Delete the bounding box by double clicking the box
fabricCanvas.on('mouse:dblclick', (e1) => {
    // fabricCanvas.getActiveObject().remove();
    fabricCanvas.remove(fabricCanvas.getActiveObject())

    // save Canvas JSON to localStorage
    const json = fabricCanvas.toJSON();
    var canvas_json_string = JSON.stringify(json)

    var img_name = getFileName(IMAGE_URL)

    if (canvas_json_string !== null) {
        storeSessionValue(img_name, canvas_json_string)
    }
    else {
        storeSessionValue(img_name, null)
    }

});




    function showFirstImage(){
        var first_img_div = document.getElementsByClassName('gallery_column')[0]
        var first_img = first_img_div.getElementsByTagName('img')[0].src;
        // alert(first_img)
        if(first_img){
        IMAGE_URL = first_img
        updateFabricCanvasBackgroundImage(first_img)
        }
    }



    function startTimer() {
        startTime = Date.now();
    };
      
    function endTimer() {
        endTime = Date.now();
        var timeDiff = (endTime - startTime)/1000; //in seconds
    
        // to 2 decimal places 
        elapsed_time_seconds = timeDiff.toFixed(2);
        //console.log(seconds + " seconds");
        total_duration_array.push(elapsed_time_seconds)
        total_duration = sum_of_array(total_duration_array)
       // $('#amina_heading').html(' Amina -  ' + total_duration + 's')
    }
    
    
    function sum_of_array(myarray){
        let sum = 0;
        for (let i = 0; i < myarray.length; i++) {
            sum += parseFloat(myarray[i]);
        }
        return sum
    }
    
    
    function getObjectIndexOnCanvas(){
        var last_object = null
        var last_object_index = null
    
        canvas_objects = fabricCanvas._objects;
    
        if(canvas_objects.length !== 0){
            
            last_object = canvas_objects[canvas_objects.length -1]; //Get last object 
            last_object_index = canvas_objects.length -1
    
        }
        else {
    
            canvas_objects = null
    
        }
        return canvas_objects, last_object, last_object_index 
    }


    function getFileName(url){

        var filename = url.substring(url.lastIndexOf('/')+1);

        return filename

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

    function removeStoredSessionVariable(key){

        if (localStorage.getItem(key) != ''  || localStorage.getItem(key) != null){
            localStorage.removeItem(key);
        }
    }

    function clearEntireLocalStorage(){

      localStorage.clear();

    }



    // -----------------------------------------------------------------
    //          Download CSV File
    //-----------------------------------------------------------------

    //Activate and de-activate download button

   /*
   if(BOUNDING_BOXES_ARRAY.length > 0){
    document.getElementById("download-csv-button").disabled = false;
   }
   else {
    document.getElementById("download-csv-button").disabled = true;
   }
  */

    document.getElementById("download-csv-button").onclick = function() {

        //alert(' download csv button clicked !!! ')

        // IMAGE_LIST.forEach(addToCSVFile);

        for(let i = 0; i < img_thumbnails.length; i++) {
            var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;

            image_file = getFileName(imageURL)
            //alert(' image file name ' + image_file)

            if (getStoredSessionValue(image_file) !== null) {
                const new_canvas_json_string = getStoredSessionValue(image_file);
                const canvas_json_object = JSON.parse(new_canvas_json_string )


                var jsClean = new_canvas_json_string.replace(/"objects"/, 'objects');
                var jsonObj = JSON.parse(JSON.stringify(jsClean));
                var jsonobj2 = eval('(' + jsonObj + ')');

                var bounding_boxes = jsonobj2.objects

                
                for (let i = 0; i < bounding_boxes.length; i++) {
                    var bbox = bounding_boxes[i]

                    var type = bbox.type
                    var version = bbox.version
                    var originX = bbox.originX
                    var ai_ready_normalized_data = bbox.ai_ready_normalized_data

                  if (Object.keys(ai_ready_normalized_data).length !== 0){

                    BOUNDING_BOXES_ARRAY.push(ai_ready_normalized_data)

                   }
                    //a
                    //var ISODate = bbox.ISODate

                    //alert(JSON.stringify(bbox))

                    //alert('ISODate ' + ISODate)

                }





                       
            }
        }


            // Pretty-printing is implemented natively in JSON.stringify(). 
            // var str = JSON.stringify(obj, null, 2); // spacing level = 2
            all_bounding_boxes_json = JSON.parse(JSON.stringify(BOUNDING_BOXES_ARRAY, null, 2));
            
            // Download as JSON
            var file_name_for_saving = 'my-data-' + iso_date_timestamp + '.json'

            downloadAsJSON(all_bounding_boxes_json,file_name_for_saving)

            // Download as CSV
            var csv_file_name_for_saving = 'my-data-' + iso_date_timestamp + '.csv'

            var csv_file = convertJSON2CSV(all_bounding_boxes_json)

            // alert(' csv file ' + csv_file)

            // Save CSV_BLOB
            var csv_blob = new Blob([csv_file], { type: 'text/csv' });
            saveAs(csv_blob, csv_file_name_for_saving);

            // downloadAsCSV(all_bounding_boxes_json, csv_file_name_for_saving)

    };



    function addToCSVFile(image_url) {

        image_file = getFileName(image_url)
        alert(' image file name ' + image_file)

    }

    function ConvertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    // https://colab.research.google.com/github/nikitamaia/tensorflow-examples/blob/main/task.ipynb#scrollTo=P0OJP2KJEfa9
    // 


    function downloadAsJSON(new_json_object, filename){

        // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        // var data = {key: 'value'};
        //var fileName = 'myData.json';
        var fileName = filename ? filename : 'myData.json';
        
        // Create a blob of the data
        var fileToSave = new Blob([JSON.stringify(new_json_object)], {type: 'application/json'});
        
        // Save the file
        saveAs(fileToSave, fileName);

    }

    function downloadAsCSV(new_json_object, filename){

        var fileName = filename ? filename : 'myData.csv';

        var csv_fileToSave = ConvertToCSV(new_json_object)

        saveTextAs(csv_fileToSave, fileName);
    }


    //------------------------------------------------------------------------------------
    // Add custom attributes to the rectangle so that we can retrieve them from the canvas
    //------------------------------------------------------------------------------------

    fabric.BoundingBox = fabric.util.createClass(fabric.Rect, {
        type: 'BoundingBox',
        initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize', options);
        this.set('name', options.name || '');
        this.set('label', options.label || '');
        this.set('label_font', options.label_font || '16px Arial');
        this.set('label_color', options.label_color || 'Black');
        this.set('originator', options.originator || '');
        this.set('checker', options.checker || '');
        this.set('reviewer', options.reviewer || '');
        this.set('qa', options.qa|| '');
        this.set('approved_true_false', options.approved_true_false || 'false');
        this.set('ISODate', options.ISODate || '');
        this.set('date_month_text', options.date_month_text || '');      
        this.set('ai_ready_normalized_data', options.ai_ready_normalized_data || '');
        this.set('timer_tracker', options.timer_tracker || '');
                
        },
    
        toObject: function(options) {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            name: this.get('name'),
            selectable: this.get('selectable'),
            label: this.get('label'),
            label_font: this.get('label_font'),
            label_color: this.get('label_color'),
            originator: this.get('originator'),
            checker: this.get('checker'),
            reviewer: this.get('reviewer'),
            qa: this.get('qa'),
            approved_true_false: this.get('approved_true_false'),
            ISODate: this.get('ISODate'),
            date_month_text: this.get('date_month_text'),    
            ai_ready_normalized_data: this.get('ai_ready_normalized_data'),
            timer_tracker: this.get('timer_tracker'),                                                                                                          
        });
        },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    
        //draw label text
        ctx.font = this.label_font;
        ctx.fillStyle = this.label_color;
        var txtwidth=ctx.measureText(this.label).width;
        ctx.fillText(this.label, -(this.width/2-this.width/2)-txtwidth/2, -this.height/2 + 20, this.width-10);
        
    }
        
    });

    // THIS WAS THE MISSING PIECE; FOR A LONG TIME THE BOUNDING BOXES COULD NOT BE LOADED WITH LOADFROMJSON UNTIL
    // THIS REPLACED THE ONES BELOW
    // https://gist.github.com/howtomakeaturn/453753be4e415c20ab501b3a6259b87d
    fabric.BoundingBox.fromObject = function(object, callback) {
        return fabric.Object._fromObject('BoundingBox', object, callback);
      };
  
  /*
    fabric.BoundingBox.fromObject = function(options) {
        return new fabric.BoundingBox(options);
    }


    fabric.BoundingBox.fromObject = function (object: any, callback: any) {
        var BoundingBox = new fabric.BoundingBox(object);
        callback && callback(BoundingBox);
        return BoundingBox;
    };
    */

    // -----------------------------------------------------------------------------
    //              Save Properties for Canvas
    //------------------------------------------------------------------------------

    fabric.Object.prototype.toObject = (function (toObject) {
        return function (propertiesToInclude) {
            propertiesToInclude = (propertiesToInclude || []).concat(
              ['name', 'label', 'label_font', 'label_color', 'originator', 'checker', 
               'reviewer', 'qa','approved_true_false', 'ISODate', 
               'date_month_text', 'ai_ready_normalized_data', 'timer_tracker']
            );
            return toObject.apply(this, [propertiesToInclude]);
        };
    })(fabric.Object.prototype.toObject);


    // Double click function for canvas
  
    // ------------------------------------------------------------------------------------------
    //                       Convert JSON object array to csv file
    //-------------------------------------------------------------------------------------------

    function convertJSON2CSV(json, filename){

        var fields = Object.keys(json[0]) // Get field names from first array

        var replacer = function(key, value) { return value === null ? '' : value } 

        var csv = json.map(function(row){
        return fields.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
        })

        csv.unshift(fields.join(',')) // add header column

        csv = csv.join('\r\n');
        
        return csv
        
    }


    // -----------------------------------------------------------------------------------------------------------------
    //                     Show Labelled Images and Enable Images Download
    //                     Also populate LABELED_IMAGES_TRACKER and get NUM_LABELLED_IMAGES and NUM_IMAGES_TOTAL
    //----------------------------------------------------------------------------------------------------------------


    function Show_Labeled_Images_and_Enable_Labels_Download(){

        img_thumbnails = document.getElementsByClassName('gallery_column');
    
        for(let i = 0; i < img_thumbnails.length; i++) {
    
            var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;
    
            var img_name = getFileName(imageURL)
    
            // Get stored canvas json and display on the canvas
            if (getStoredSessionValue(img_name) !== null) {
    
                const canvas_json = getStoredSessionValue(img_name);
                //var new_JSON_Object = $.parseJSON(canvas_json)
    
                // Add show green tick mark on thumbnail to show it has been labelled
                $("#"+imageURL).css("display", "block");
    
                LABELED_IMAGES_TRACKER.push(imageURL);
                
            }
    
            else {
    
                // Set display to none on the green tick mark 
                $("#"+imageURL).css("display", "none");
    
            }
    
        }
    
    
        // NUM_OF_LABELLED_IMAGES
        // Enable Download Button When NUM_OF_LABELLED_IMAGES > 0
        NUM_LABELLED_IMAGES = LABELED_IMAGES_TRACKER.length; 

        if (NUM_LABELLED_IMAGES > 0){
    
            document.getElementById("download-csv-button").disabled = false;
    
        }
        else {
    
            document.getElementById("download-csv-button").disabled = true;
    
        }
    
        NUM_IMAGES_TOTAL = img_thumbnails.length
    
    }



    // var g = window.localStorage.getItem("project_json");
    // alert(' g ' + g)


    // ------------------------------------------------------------------------------------------
    //                     Add / Edit Labels for Labelling
    //-------------------------------------------------------------------------------------------
  
    var original_textarea_content;
    var new_textarea_content = []
    var LABELS_COLOR_MAP = {}   // label (key) and color (value)
    var current_label;
    var current_color;
    var labels_string = ''

    const  parentLabelClassItem = document.getElementById("newLabelParent")

    $("#addOrEdit_button").attr("style", "display: none !important");
    $("#cancel_button").attr("style", "display: none !important");

    // Restore label map if it exists in localStorage

 
 /*
    var new_map = JSON.parse(getStoredSessionValue("labels_color_map"))
    var new_jsonObj = JSON.parse(JSON.stringify(new_map));
    var new_jsonobj2 = eval('(' + new_jsonObj + ')');
    alert(JSON.stringify(new_map))





   var new_map = JSON.parse(getStoredSessionValue("labels_color_map"))
   
   for (const [label, color] of Object.entries(new_map)) {

    current_label = label.toString();
    current_color = color.toString() +';';

    alert('new map label ' + current_label + ' color ' + current_color)

   }


    restore_LABELS_COLOR_MAP()


    function restore_LABELS_COLOR_MAP(){

        if (getStoredSessionValue("labels_color_map") ===null || getStoredSessionValue("labels_color_map") ==="undefined"){
                       return;
         }

       else {
               
            LABELS_COLOR_MAP = getStoredSessionValue("labels_color_map")

           for (const [label, color] of Object.entries(LABELS_COLOR_MAP)) {

               current_label = label.toString();
               current_color = color.toString() +';';

               if(current_label.length>0){
               document.getElementById('labels_textarea').value += current_label + '\r\n';    
               }
           }

       }

    }

    */


    function showSelectedLabel(){

        current_label = $(this).attr('id')
        current_color = $(this).css("borderColor");

        var all_labels = document.getElementsByClassName('labelclass');
        for(let i = 0; i < all_labels.length; i++) {

            if (all_labels[i].getAttribute("id").toString() === current_label.toString()){

                $(this).css("backgroundColor",current_color);

                showCurrentLabel(current_color, current_label)

            }
            else {

                all_labels[i].style.backgroundColor ="transparent"
            }

        }

    }


    function chooseInitialLabel(){

        if (Object.keys(LABELS_COLOR_MAP).length > 0){

        const firstColor = Object.values(LABELS_COLOR_MAP)[0];
        const firstLabel = Object.keys(LABELS_COLOR_MAP)[0];

        if(firstLabel){
            $("#"+firstLabel).css("backgroundColor",firstColor);
            showCurrentLabel(firstColor, firstLabel)
    
        }

        }

    }

    function updateLabelDivs(){

        if (Object.keys(LABELS_COLOR_MAP).length > 0){

            for (const [label, color] of Object.entries(LABELS_COLOR_MAP)) {

                current_label = label.toString();
                current_color = color.toString() +';';;

                addNewLabel()

        }

     }

    }

    
    $('#addOrEdit_button').click(function(){
    //function addOrEditLabels(){

        // First remove all label divs (class = labelclass)
        removeAllLabelDivs()

        // Remove the current label display
        $("#currentLabel").attr("style", "display: none !important");
        $("#addOrEdit_button").attr("style", "display: none !important");
        // Display the text area
        $("#labels_textarea").attr("style", "display:  !important");
        $("#labels_textarea").attr('class', 'scrollabletextbox');
        $("#labels_textarea").css("backgroundColor","#F6F6F6");
        $("#labels_textarea").css("border","6px outset #494848");
        $("#labels_textarea").css("fontSize", "16px");
        $("#labels_textarea").css("text-align", "left");

        // Display Save and Cancel Buttons
        $("#save_button").attr("style", "display:  !important");
        $("#save_button").css("margin", "5px");
        $("#save_button").css("width", "150px");
        $("#cancel_button").attr("style", "display:  !important");
        $("#cancel_button").css("margin", "5px");
        $("#cancel_button").css("width", "150px");

        // Create text that is line-separated

        if (Object.keys(LABELS_COLOR_MAP).length > 0){

                for (const [label, color] of Object.entries(LABELS_COLOR_MAP)) {
                    current_label = label.toString();
                    current_color = color.toString() +';';
                    // string_of_labels += current_label.join("\n");
                }

        }

    //}
    });


    function showCurrentLabel(_current_color, _current_label){

        $("#currentLabel").css("backgroundColor",_current_color);
        $("#currentLabel").css("borderColor",_current_color);
        $("#currentLabel").css("borderSize","3px");
        $("#currentLabel").css("border-radius","5px");
        $("#currentLabel").css("fontSize", "20px");
        $("#currentLabel").css("font-weight", "bold")
        $("#currentLabel").css('color', 'white');
        $("#currentLabel").css("width", "130px");
        $("#currentLabel").css("margin", "5px");
        $("#currentLabel").html("")          
        $("#currentLabel").html(_current_label)
        $("#currentLabel").animate({height: '50px',width: '220px'},2000)
        // alert(' line 973 - perhaps this is it now...')    
        // $("#currentLabel").verticalAlign();
        // alert(' line 976 - showCurrentLabel is executed OK!!!')

    }


    $('#cancel_button').click(function(){
    // function cancelLabelChange(){

        if (Object.keys(LABELS_COLOR_MAP).length > 0){

        //  Re-populate textarea with original content

        var string_of_labels="";

            document.getElementById('labels_textarea').value =''

            for (const [label, color] of Object.entries(LABELS_COLOR_MAP)) {

                current_label = label.toString();
                current_color = color.toString() +';';

                if(current_label.length>0){
                //string_of_labels += current_label + "\n"
                document.getElementById('labels_textarea').value += current_label + '\r\n';

                
                }

            }
        
            // Hide the textarea
            $("#labels_textarea").attr("style", "display:  none  !important");  

        // Display the label divs
            updateLabelDivs()

            // Selete the first label as the initial label
            chooseInitialLabel()

        }

        // alert('Labels to save ' + textarea_content)
        $("#cancel_button").attr("style", "display: none !important");
        $("#save_button").attr("style", "display: none !important");
        $("#addOrEdit_button").attr("style", "display:  !important");

    //}
   });
    


    $('#save_button').click(function(){            

        if($("#labels_textarea").val().trim().length < 1)
        {
            // alert("Please Enter Labels...");
            $("#labels-error-message").attr("style", "display: !important");
            $("#labels-error-message").css('color', 'red');
            $("#labels-error-message").html("Please Enter Labels...")
            return; 
        }

        else {

            LABELS_COLOR_MAP = {}

            //new_textarea_content = document.getElementById('labels_textarea').value;
            new_textarea_content = $("#labels_textarea").val().split('\n');

            // alert(' new_textarea_content - 1044 ' +  new_textarea_content)
    
            for(let i = 0; i < new_textarea_content.length; i++) {
    
                var new_label = new_textarea_content[i]
    
                // var new_color = generateDarkColor();
    
                if (new_label.length > 0){
    
                   // Use first 20 colors otherwise generate random dark color
                   var new_color = (i <=20 ) ? first_20_colors[i] : generateDarkColor()
    
                   LABELS_COLOR_MAP[new_label] = new_color;
    
                }
                // Store the labels_color_map
               
    
                // alert(' new label ' + new_label +  ' new color ' + new_color)
            }

           
              labels_string = new_textarea_content.toString();

              // alert(' labels_string - line 1071 ' + labels_string)
    
            // Get Project Name
    
                // storeSessionValue("labels_color_map", LABELS_COLOR_MAP)
                window.localStorage.setItem("labels_color_map", JSON.stringify(LABELS_COLOR_MAP));


                if (window.localStorage.hasOwnProperty('project_json')){

                    //---------------------------------------------------------------------------------
                    //         Update project_json with labels_color_map, user_id and ISODate to server
                    //-----------------------------------------------------------------------------------


                    PROJECT_JSON = window.localStorage.getItem("project_json");
                    var retrieved_json_object = JSON.parse(PROJECT_JSON)
        
                   // Add labels_color_map and user_id
                    retrieved_json_object ["labels_color_map"] = LABELS_COLOR_MAP;
                    retrieved_json_object ["labels_string"] = labels_string;
                    retrieved_json_object ["user_id"] = user_id;
                    retrieved_json_object ["ISODate"] = ISODate;  
                    retrieved_json_object ["num_images"] = ""; 
                    retrieved_json_object ["labeled_images"] = ""; 
                    retrieved_json_object ["all_labeled_true_false" ] = false;  
                    // Store session variable for the updated object
                    window.localStorage.setItem("project_json", JSON.stringify(retrieved_json_object));
        
                  // alert(' Line 1082 - stored session variable for the updated object')
        
                   // Post Information to Server for saving on database
                   // post_project_and_labels_to_server()

                    //----------------------------------------------------------------------------------
                    //         Post project_json to server
                    //-----------------------------------------------------------------------------------

                    post_project_json_info(retrieved_json_object ["user_id"], retrieved_json_object ["project_name"], retrieved_json_object ["project_id"], retrieved_json_object ["labels_color_map"], retrieved_json_object ["ISODate"],retrieved_json_object ["num_images"],retrieved_json_object ["labeled_images"],retrieved_json_object ["all_labeled_true_false"], retrieved_json_object ["labels_string"]) 

                    //-----------------------------------------------------------------------------------------
                
                    // CREATE LABEL BUCKETS 
                    create_label_buckets_dummy('project_json')
          
                }

                if (window.localStorage.hasOwnProperty('project_json')){ 

                    var project_json_string = window.localStorage.getItem('project_json')


                }
    
                // Hide the textarea
                // $("#labels_textarea").css("visibility", "hidden");
                $("#labels_textarea").attr("style", "display: none !important");
                $("#save_button").attr("style", "display: none !important");
                $("#cancel_button").attr("style", "display: none !important");
                $("#currentLabel").attr("style", "display: !important");
                $("#addOrEdit_button").attr("style", "display:  !important");
                // Create or Update the Label divs

                $("#labels-error-message").html("")

                updateLabelDivs()
    
                // Selete the first label as the initial label
                chooseInitialLabel()
    



                // Show the first image from the thumbnails the main image
                showFirstImage()

                // Add labels_color_map to project_json and post information to server
                AddLabels_Color_Map_to_Project_JSON()

                $("#labels-error-message").html("")

        }

});


    function displayLabels(){


        LABELS_COLOR_MAP = {}

        //new_textarea_content = document.getElementById('labels_textarea').value;
        new_textarea_content = $("#labels_textarea").val().split('\n');

        for(let i = 0; i < new_textarea_content.length; i++) {

            var new_label = new_textarea_content[i]

            // var new_color = generateDarkColor();

            if (new_label.length > 0){

               // Use first 20 colors otherwise generate random dark color
               var new_color = (i <=20 ) ? first_20_colors[i] : generateDarkColor()

               LABELS_COLOR_MAP[new_label] = new_color;

            }
            // Store the labels_color_map
           

            // alert(' new label ' + new_label +  ' new color ' + new_color)
        }

        // Get Project Name

            storeSessionValue("labels_color_map", LABELS_COLOR_MAP)

            // Hide the textarea
            // $("#labels_textarea").css("visibility", "hidden");
            $("#labels_textarea").attr("style", "display: none !important");
            $("#save_button").attr("style", "display: none !important");
            $("#cancel_button").attr("style", "display: none !important");
            $("#currentLabel").attr("style", "display: !important");
            $("#addOrEdit_button").attr("style", "display:  !important");
            // Create or Update the Label divs
            updateLabelDivs()

            // Selete the first label as the initial label
            chooseInitialLabel()

            $("#labels-error-message").html("")


            // alert('LABEL MAP AS STRING ')

            // post_project_and_labels_to_server()

    }


    function addNewLabel(){

    const newlabelClassItem = document.createElement('div')
    newlabelClassItem.className ="labelclass"
    newlabelClassItem.id = current_label
    newlabelClassItem.style= "border: 3px solid " + current_color + " z-index: 2; background-color: transparent;  margin : 2px; border-radius: 10px; height: 35px;  width: 150px;";
    newlabelClassItem.style.fontSize = "16";
    newlabelClassItem.innerHTML ="<strong> "+ current_label + " </strong>";
    newlabelClassItem.onclick = showSelectedLabel // function shows the selected label by highlighting background with the bordercolor
    
    parentLabelClassItem.append(newlabelClassItem)
    
    }


    // Remove all Custom Labels
    function removeAllLabelDivs(){
        const elements = document.getElementsByClassName("labelclass");
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    // Generate dark color for labelling
    function generateDarkColor() {
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += Math.floor(Math.random() * 10);
        }
        return color;
    }

    function randDarkColor() {
        var lum = -0.25;
        var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#",
            c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    const getRandomNumber = (limit) => {
    return Math.floor(Math.random() * limit);
    };

    const setBackgroundColor = () => {
    const h = getRandomNumber(360);
    const randomColor = `hsl(${h}deg, 50%, 10%)`;
    return randomColor;

    };

  //-------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------
//                Project Folder and Subdirectories
//------------------------------------------------------------------------

    var myModal = new bootstrap.Modal(document.getElementById('myModal'), {})

    var startNewProjectButton = document.getElementById('StartNewProjectButton')
    var projectNameLabel = document.getElementById('projectLabel')

    // Check if localStorage has project_json object stored
    // If so, get CURRENT_PROJECT from the stored json
    if (window.localStorage.hasOwnProperty('project_json')){

        PROJECT_JSON = window.localStorage.getItem("project_json");
        var retrieved_json_object = JSON.parse(PROJECT_JSON)
        CURRENT_PROJECT = retrieved_json_object.project_name
        //alert('localStorage Current Project ' + CURRENT_PROJECT)
        
    }

    // If project name exists - hide button
    if(CURRENT_PROJECT.length > 0){

        Hide_StartNewProject_Button_and_Show_ProjectLabel()

        // show the labels textarea and save button
        Show_Labels_TextArea_and_Save_Button_Only()

        // fabricCanvas.selection = true;

    }
    else{

        // Hide labels textarea and save button
        $("#labels_textarea").attr("style", "display: none !important");
        $("#save_button").attr("style", "display: none !important");
        $("#cancel_button").attr("style", "display: none !important");
        $("#currentLabel").attr("style", "display: none !important");
        $("#addOrEdit_button").attr("style", "display: none !important");

        //fabricCanvas.selection = false;

    }

    $("#StartNewProjectButton").click(function (){
        myModal.toggle()

        $('#myModal').on('shown.bs.modal', function () {
            $('#project_name').focus()
        })

    });

    $("#OpenExistingProjectButton").click(function (){

        // alert(' Open existing project ...')
        get_all_projects()

    });

    // 
    const uniqueId = () => {
        const dateString = Date.now().toString(36);
        const randomness = Math.random().toString(36).substr(2);
        return dateString + randomness;
    };


    $("#closeCornerBtn").click(function (){
        myModal.toggle()
    });

    $("#close").click(function (){
        myModal.toggle()
    });

    function showProjectName_Modal(){
        myModal.toggle()
    }


    function Hide_StartNewProject_Button_and_Show_ProjectLabel(){

        $("#StartNewProjectButton").attr("style", "display:  none  !important");  
        $("#OpenExistingProjectButton").attr("style", "display:  none  !important");  
        $("#projectLabel").html()
        $("#projectLabel").html(CURRENT_PROJECT)

    }

    function Show_Labels_TextArea_and_Save_Button_Only(){
        // Show labels text area and Save Button Only
        $("#labels_textarea").attr("style", "display:  !important");
        $("#save_button").attr("style", "display:  !important");

        // Hide Cancel Button and Edit Button and 
        $("#cancel_button").attr("style", "display: none !important");
        $("#addOrEdit_button").attr("style", "display: none !important");
        $("#labels-error-message").attr("style", "display: none !important");
        $("#currentLabel").attr("style", "display: none !important");

    }

    function AddLabels_Color_Map_to_Project_JSON(){

        if (window.localStorage.hasOwnProperty('project_json')){

            PROJECT_JSON = window.localStorage.getItem("project_json");
            var retrieved_json_object = JSON.parse(PROJECT_JSON)

           // Add labels_color_map and user_id
            retrieved_json_object ["labels_color_map"] = LABELS_COLOR_MAP;
            retrieved_json_object ["user_id"] = user_id;

           // Store session variable for the updated object
           window.localStorage.setItem("project_json", JSON.stringify(retrieved_json_object));

           // alert(' It gets to  line 1321')

           // Post Information to Server for saving on database
           post_project_and_labels_to_server()

            
        }
    }

    function Hide_Labels_TextArea_and_Save_Button(){
        // Show labels text area and Save Button Only
        $("#labels_textarea").attr("style", "display: none !important");
        $("#save_button").attr("style", "display: none !important");

        // Hide Cancel Button and Edit Button and 
        $("#cancel_button").attr("style", "display:  !important");
        $("#addOrEdit_button").attr("style", "display:  !important");
        $("#labels-error-message").attr("style", "display:  !important");
        $("#currentLabel").attr("style", "display: !important");

    }


    $("#createProjectBtn").click(function (event){

        var project_name =""
        project_name = $('#project_name').val();
        var project_id = uniqueId();
        CURRENT_PROJECT = project_name

   
        if(project_name.length > 0){

            myModal.toggle()

            PROJECT_JSON = {
                project_id : project_id,
                project_name :  project_name       
            }

            window.localStorage.setItem("project_json", JSON.stringify(PROJECT_JSON));
            // alert('project_json :' + JSON.stringify(PROJECT_JSON))

            // Hide StartNewProject Button and Show project Label
            Hide_StartNewProject_Button_and_Show_ProjectLabel()

            // Show Labels Text Area and Save Button. This also hides the Cancel Button and Add/Edit Button
            Show_Labels_TextArea_and_Save_Button_Only()

            
        }

        else {

            event.preventDefault()
            event.stopPropagation()

        }

    }); // End of "#createProjectBtn" click event


    function post_project_and_labels_to_server(){

        $.ajax({
            type: "POST",
            url: '/create_new_project',
            dataType: 'json',
            data: { 
                    'user_id' : user_id, 
                    'project_name' : project_name, 
                    'project_id' : project_id, 
                    'labels_color_map' : JSON.stringify(LABELS_COLOR_MAP), 
                    'labels_string' : labels_string,
                    'ISODate' : ISODate,
            
                },
            success: function(data) {

                var server_user_id = data.user_id
                var server_project_name = data.project_name
                var server_project_id = data.project_id
                // alert('user id: ' + server_user_id)
                // alert('server project name: ' + server_project_name)
                // alert('server project id: ' + server_project_id )

            }
            
        });


    }

    function get_all_projects(){

        $.ajax({
            type: "POST",
            url: "/get_user_projects",
            data: {},
            success: function(data) { 

                var all_user_projects = data.all_projects
                var num_projects = all_user_projects.length

                if (num_projects > 0) {

                    window.localStorage.setItem("all_user_projects", all_user_projects);
                    location.href = "/choose_project"

                }

                else {
                    alert('You have no projects mate!')
                }

            }
          });

    }


    function post_project_json_to_server(myData){

        $.ajax({
            type: "POST",
            url: '/create_new_project',
            dataType: 'json',
            data: JSON.parse(myData),
            success: function(data) {

                var server_user_id = data.user_id
                var server_project_name = data.project_name
                var server_project_id = data.project_id
                alert('user id: ' + server_user_id)
                alert('server project name: ' + server_project_name)
                alert('server project id: ' + server_project_id )

            }
            
        });


    }



    function post_project_json_info(user_id, project_name, project_id, labels_color_map, iso_date,num_images,labeled_images,all_labeled_true_false, labels_string_format){
    
        $.ajax({
            type: "POST",
            url: '/create_new_project',
            dataType: 'json',
            data: { 
                    'user_id' : user_id, 
                    'project_name' : project_name, 
                    'project_id' :  project_id, 
                    'labels_color_map' : JSON.stringify(labels_color_map), 
                    'labels_string' : labels_string_format, 
                    'ISODate' : iso_date,
                    'num_images' : num_images,
                    'labeled_images' : labeled_images,   
                    'all_labeled_true_false' : all_labeled_true_false                                                
                },
            success: function(data) {

                //var server_user_id = data.user_id
                //var server_project_name = data.project_name
                //var server_project_id = data.project_id
                //alert('user id: ' + server_user_id)
                //alert('server project name: ' + server_project_name)
                //alert('server project id: ' + server_project_id )

            }
            
        });   


   }


// -----------------------------------------------------------------------
//                Label Bucket Container 
//------------------------------------------------------------------------

function create_card(data){

    var new_card = data.label ?

                        `<div class="col card h-100 mb-3 w-15" style="border: 5px solid ${data.color ? data.color : "#808080"}; margin-top: 10px; margin-right: 5px;">
                            <h5 class="card-header d-flex justify-content-between align-items-center">
                                ${data.label ? data.label : ""}
                                <div id="labeling_complete"> ${data.all_labeled_true_false ? "&#x2705;" : ""}</div>
                            </h5>
                            <div class="card-body">
                            <h2 class="card-title"></h2>
                            <p class="card-text"></p>
                            <p class="card-text">Number of Images: ${data.num_images ? data.num_images : ""} <small class="text-muted"></small></p>
                            <p class="card-text">Labelled Images: ${data.labeled_images ? data.labeled_images : ""}<small class="text-muted"></small></p>
                            <p class="card-text"><small class="text-muted"></small></p>

                            <div> 
                                <input type="submit" id="${data.label}-showThumbnailsButton-${data.index}" project_id ="${data.project_id ? data.project_id : ""}" value="Show Images" class="btn btn btn-outline-primary xShowThumbnailsBtnClass" style="margin-left: 0px; width: 100%; height: 50px; margin-bottom: 20px; border: 5px solid ${data.color ? data.color : "#808080"}">
                                <input type="hidden" id="current_folder" name="current_folder" value="${data.label ? data.label : ""}">
                                <input type="hidden" id="project_id" name="project_id" value="${data.project_id ? data.project_id : ""}">
                            </div> 
   

                            <div>
                                <div class="input-group">
                                    <input id="imageLoader${data.index}" type="file" name="upload_images_project_label[]" multiple="true" autocomplete="off" required>
                                    <input type="submit" id="${data.label}-uploadImagesButton-${data.index}" project_id="${data.project_id}" value="Upload Images" class="btn  btn-info xUploadImagesBtnClass" style="margin-left: 0px;">
                                </div>
                                <input type="hidden" id="project_id" name="project_id" value="${data.project_id ? data.project_id : ""}">
                                <input type="hidden" id="current_folder" name="current_folder" value="${data.label ? data.label : ""}">
                                <input type="hidden" name="which-form" value="images-for-labeling">
                            </div> 
                        </div>
                        <div class="card-footer">

                        <form>
                            <button type="submit" id="deleteLabelButton-${data.index}" class="btn btn-default XXBUTTON">Submit</button>
                        </form>
                            <div class="solTitle" id="solTitle${data.index}">
                                 <a href="/atagDelete?label=${data.label}&project_id=${data.project_id}&a=100&b=500" class="btn btn-danger xDeleteButtonClass"  id="deleteLabelButton-${data.index}" data-label="${data.label ? data.label : ""}" project_id="${data.project_id ? data.project_id : ""}">Delete</a> <small> Delete all images & labels</small>
                            </div>
                        </div>
                    </div>`  : ""

                    //  role="form" method="POST" action="/"

        return new_card 

}

// 

function create_label_buckets(data){

    // show_label_buckets()

    for (var i = 0; i < data.length; i += 4) {

        var new_row = document.createElement('div')
        new_row.className="row"

        var card_1_data = data.hasOwnProperty(i) ? data[i]  : " ";  
        var card_2_data = data.hasOwnProperty(i+1) ? data[i+1] : " ";   
        var card_3_data = data.hasOwnProperty(i+2) ? data[i+2]  : " ";   
        var card_4_data = data.hasOwnProperty(i+3) ? data[i+3] : " ";   

        card_1_string = create_card(card_1_data)
        card_2_string = create_card(card_2_data)
        card_3_string = create_card(card_3_data)
        card_4_string = create_card(card_4_data)

        var combined_card_string = card_1_string + '\n' + card_2_string + '\n' + card_3_string + '\n' + card_4_string

        new_row.innerHTML = combined_card_string

        document.getElementById('label_buckets_container').appendChild(new_row)
     

    }

}



function create_label_buckets_dummy(project_json_storage_variable){

    if (window.localStorage.hasOwnProperty(project_json_storage_variable)){

        var data = [];  // Json data objects will be stored here

        PROJECT_JSON = window.localStorage.getItem(project_json_storage_variable);

        var my_json_object = JSON.parse(PROJECT_JSON)

        var labels_color_map_json = my_json_object.labels_color_map

        Object.keys(labels_color_map_json).forEach(function(key) {


            var label = key
            var color = labels_color_map_json[key]

            var data_element = {"label": label,"color": color, "num_images": my_json_object.num_images, "labeled_images": my_json_object.labeled_images, "all_labeled_true_false": my_json_object.all_labeled_true_false, "project_id": my_json_object.project_id, "project_name": my_json_object.project_name, "user_id": my_json_object.user_id, "ISODate": my_json_object.ISODate}
    
            // alert('Key : ' + key + ', Value : ' + labels_color_map_json[key])
            data.push(data_element)

          })

         // alert(' Entire Data Array :  ' + JSON.stringify(data))
         // ------------------------------------------------------
         //                Create  Label Buckets


         create_label_buckets(data)


    }


}

    //------------------------------------------------------------------
    //                  Show and Hide Label Buckets
    // ----------------------------------------------------------------


    var label_buckets_checkbox = document.getElementById('flexSwitchCheckChecked')
    label_buckets_checkbox.addEventListener('change', function () {
        var checkbox_status =$("#flexSwitchCheckChecked").is(":checked");
        // alert(' Checkbox status ' + checkbox_status)
        checkbox_status ? show_label_buckets() : hide_label_buckets()
    })


    function show_label_buckets(){
        $("#label_buckets_container").attr("style", "display:  !important");
    }

    function hide_label_buckets(){
        $("#label_buckets_container").attr("style", "display: none !important");
    }

    // ----------------------------------------------------------------------------------------------
    //                             
    //----------------------------------------------------------------------------------------------


  /*  

    $('#deleteLabelButton-1').on('click', function(e){

        alert('you clicked  deleteLabelButton-1 on line 1709')
         e.preventDefault();
 
  }); 

    $('.xUploadImagesButton').on('click', function(e){

        alert('you clicked  xUploadImagesButton')
         e.preventDefault();
 
  }); 

  $("#xUploadImagesButton").click(function (event){

    alert('you clicked  xUploadImagesButton')

  }); 

  function postImages4Label(){

    alert('IT FINALLY MADE IT TO HERE!!!!')

}


$('#form').submit(function (evt) {
    evt.preventDefault();
    alert('IT FINALLY MADE IT TO HERE!!!!')
});




function submit_form() {

    alert('You clicked the simple button')

}

*/
//--------------------------------------------------------------------------------------------------------------------------
//           Check for Current Session Variables and Set Environment Variables
//--------------------------------------------------------------------------------------------------------------------------

//ACTIVE_PROJECT_ID = window.localStorage.hasOwnProperty("active_project") ?  window.localStorage.getItem("active_project") : ""
// alert(' active project id : ' + ACTIVE_PROJECT_ID) // This corresponds to this variable project_js_id

$.ajax({
    type: "POST",
    url: '/get_active_project',
    dataType: 'json',
    data: {},
    success: function(data) {

        var active_project_id = data.active_project_id
        var active_label = data.active_label
        var active_project_result = data.active_project_result[0]
        alert('line 1767 -- active_project : ' + active_project_id)
        //alert('active_label: ' + active_label)
        //alert(' active_project_result  ' + JSON.stringify(active_project_result))

        /*

        var project_summary_array =[]
        for(var k in all_projects) {
            var project = all_projects[k]
            var project_id = project.project_js_id ? project.project_js_id: ""
            var project_name = project.project_name ? project.project_name : ""
            var date_created = project.date_created ? project.date_created : ""
        
            var project_item = {'index': k, 'project_js_id': project.project_js_id, 'project_name': project.project_name, 'date_created': date_created} //, 'user_id': project.user_id, 'date_created': project.date_created, 'date_modified': project.date_modified,'labels': labels}
            project_summary_array.push(project_item)
            // alert(' k ' + k + ' project_item ' + JSON.stringify(project_item));
        }

        alert('project_summary_array ' +  JSON.stringify(project_summary_array))


       */

        // Set Environment Variables
        ACTIVE_PROJECT_ID = active_project_id
        ACTIVE_PROJECT_JSON = active_project_result
        CURRENT_PROJECT = ACTIVE_PROJECT_JSON['project_name']
        LABELS_COLOR_MAP = ACTIVE_PROJECT_JSON['labels_color_map']
        PROJECT_JSON = ACTIVE_PROJECT_JSON

        window.localStorage.setItem("project_json",JSON.stringify(ACTIVE_PROJECT_JSON))
        window.localStorage.setItem("labels_color_map",JSON.stringify(LABELS_COLOR_MAP))

        data = [];

        counter = 0

        Object.keys(LABELS_COLOR_MAP).forEach(function(key) {
            var label = key
            var color = LABELS_COLOR_MAP[key]

            var current_label_info = filter_project_json_by_label(key)

            var label_id = current_label_info['label_id']

            // Attributes for each label...can use this information in the future
            var original_image_urls = current_label_info['original_image_urls']
            var all_jpeg_image_urls = current_label_info['all_jpeg_image_urls']
            var cropped_image_urls = current_label_info['cropped_image_urls']
            var augmentation_image_urls = current_label_info['augmentation_image_urls']
            var original_image_label_jsons = current_label_info['original_image_label_jsons']
            var all_jpeg_image_label_jsons = current_label_info['all_jpeg_image_label_jsons']
            var augmentation_image_label_jsons = current_label_info['augmentation_image_label_jsons']
            var number_original_images = current_label_info['original_image_urls'].length
            var number_all_jpeg_images = current_label_info['all_jpeg_image_urls'].length
            var number_cropped_images = current_label_info['cropped_image_urls'].length
            var number_augmentation_images = current_label_info['augmentation_image_urls'].length
            var original_image_label_jsons = current_label_info['original_image_label_jsons']
            var all_jpeg_image_label_jsons = current_label_info['all_jpeg_image_label_jsons']
            var augmentation_image_label_jsons = current_label_info['augmentation_image_label_jsons']
            var date_created = current_label_info['date_created']
            var date_modified = current_label_info['date_modified']
           
            var data_element = {"index": counter, "label": label,"color": color, 
                                "num_images": number_original_images, "labeled_images": "", 
                                "all_labeled_true_false": "", "project_id": ACTIVE_PROJECT_JSON['project_js_id'],
                                "project_name": ACTIVE_PROJECT_JSON['project_name'], "user_id": ACTIVE_PROJECT_JSON['user_id'], 
                                "ISODate": date_created, "date_created": date_created, 
                                "original_image_urls": original_image_urls,"all_jpeg_image_urls": all_jpeg_image_urls}
      
            data.push(data_element)
            
            counter += 1;

        })


        // Update Page

        updatePage()

        //alert(' Line 1887 - this is the first gate I see')   

        //show_label_buckets()
        new_create_label_buckets(data)

        // create_label_buckets(data)

        for (var i = 0; i < data.length; i += 4) {

            var new_row = document.createElement('div')
            new_row.className="row"

            // alert('line 1897 - it gets here' )
    
            var card_1_data = data.hasOwnProperty(i) ? data[i]  : " ";  
            var card_2_data = data.hasOwnProperty(i+1) ? data[i+1] : " ";   
            var card_3_data = data.hasOwnProperty(i+2) ? data[i+2]  : " ";   
            var card_4_data = data.hasOwnProperty(i+3) ? data[i+3] : " ";   
 
            // alert('line 1904 - it gets also here' )
            
            card_1_string = create_card(card_1_data)
            card_2_string = create_card(card_2_data)
            card_3_string = create_card(card_3_data)
            card_4_string = create_card(card_4_data)
    
            var combined_card_string = card_1_string + '\n' + card_2_string + '\n' + card_3_string + '\n' + card_4_string

            new_row.innerHTML = combined_card_string

            //document.getElementById('label_buckets_container').appendChild(new_row)
      
        }



    }
   
});





function filter_project_json_by_label(label){

    var labels_JSON = ACTIVE_PROJECT_JSON['labels']
    // alert('number of label arrays : ' + labels_JSON.length)
    

    for(let i = 0; i < labels_JSON.length; i++) {

        var result;

        if(labels_JSON[i]['label']==label){

            result = labels_JSON[i];
            // alert(' label number ' + i  + ' results : ' + JSON.stringify(result))
        }


    }

    return result
}


function updatePage(){     


    Hide_StartNewProject_Button_and_Show_ProjectLabel()
           
    // Hide the textarea
    $("#labels_textarea").attr("style", "display: none !important");
    $("#save_button").attr("style", "display: none !important");
    $("#cancel_button").attr("style", "display: none !important");
    $("#currentLabel").attr("style", "display: !important");
    $("#addOrEdit_button").attr("style", "display:  !important");
    // Create or Update the Label divs

    $("#labels-error-message").html("")

    updateLabelDivs()

    // alert(' Line 1968 - this is just after the updateLabelsDivs()')   

    // Select the first label as the initial label
    chooseInitialLabel()

    // alert(' Line 1973 - this is just after the chooseInitialLabel()')   

    // Show the first image from the thumbnails the main image
    showFirstImage()

    // Add labels_color_map to project_json and post information to server
    // AddLabels_Color_Map_to_Project_JSON()

    $("#labels-error-message").html("")

    // Show Label Buckets


    /*

    var data = [];  // Json data objects will be stored here
    
    Object.keys(LABELS_COLOR_MAP).forEach(function(key) {

        var label = key
        var color = LABELS_COLOR_MAP[key]

        var data_element = {"label": label,"color": color, "num_images": ACTIVE_PROJECT_JSON.num_images, "labeled_images": ACTIVE_PROJECT_JSON.labeled_images, "all_labeled_true_false": ACTIVE_PROJECT_JSON.all_labeled_true_false, "project_id": ACTIVE_PROJECT_JSON.project_id, "project_name": ACTIVE_PROJECT_JSON.project_name, "user_id": ACTIVE_PROJECT_JSON.user_id, "ISODate": ACTIVE_PROJECT_JSON.date_created}

        // alert('Key : ' + key + ', Value : ' + labels_color_map_json[key])
        data.push(data_element)

      })

     create_label_buckets(data)

    */

}


$('.XXBUTTON').on('click', function(e){

    // var btn_id = $(this).attr('id')
    // var project_js_id = $('#'+btn_id).attr('project_id')

    alert(' ---- XXBUTTON - This is 1963 ----- ')
  
}); 




$('.xUploadImagesBtnClass').on('click', function(e){

    // var btn_id = $(this).attr('id')
    // var project_js_id = $('#'+btn_id).attr('project_id')

    alert(' xUploadImagesBtnClass + project_id ')
  
}); 

$('.xShowThumbnailsBtnClass').on('click', function(e){

    //var btn_id = $(this).attr('id')
    //var project_js_id = $('#'+btn_id).attr('project_id')

    alert(' xShowThumbnailsBtnClass + project_id ')
  
}); 

$('.xDeleteButtonClass').on('click', function(e){

    //var btn_id = $(this).attr('id')
    //var project_js_id = $('#'+btn_id).attr('project_id')

    alert(' xDeleteButtonClass + project_id ')
  
}); 

alert(' Testing to see where the script stops !!! --- line 2012')

showThumbnailsButtons = document.getElementsByClassName('xShowThumbnailsBtnClass');

for(let i = 0; i < showThumbnailsButtons.length; i++) {

    showThumbnailsButtons[i].addEventListener("click", function(e) {

      var btn_id = e.target.id

      var project_js_id = $('#'+btn_id).attr('project_id')

      alert(' showThumbnailsButtons ' + project_js_id)

  });


}




xNewDeleteButtons = document.getElementsByClassName('xNewDeleteButtonClass');

for(let i = 0; i < xNewDeleteButtons.length; i++) {

    xNewDeleteButtons[i].addEventListener("click", function(e) {

      //var btn_id = e.target.id

      //var project_js_id = $('#'+btn_id).attr('project_id')

      alert(' xNewDeleteButtons - line 2019')

  });


}

$('.solTitle').click(function(e) {
    e.preventDefault();
    alert('here in');
     var divId = 'summary' +$(this).attr('id');

    alert('2052  ' + divId)

});

/*
$('.xNewDeleteButtonClass').on('click', function(e){

    alert('Line 2011 - xNewDeleteButtonClass has been clicked !!')

});



function myFunction() {

    alert('myFunction on line 2036....')

}


$('#solTitle a').click(function(evt) {
    evt.preventDefault();
    alert('here in');
    var divId = 'summary' + $(this).attr('id');
    alert('divId ' + divId)
});

*/


function myFunction() {

   alert('the Silva method...')

}


xShowThumbnailsBtns = document.getElementsByClassName('xShowThumbnailsBtnClass');

for(let i = 0; i < xShowThumbnailsBtns.length; i++) {

    xShowThumbnailsBtns[i].addEventListener("click", function(e) {

      //var btn_id = e.target.id

      //var project_js_id = $('#'+btn_id).attr('project_id')

      alert(' a tag - 2093 + xShowThumbnailsBtns')

  });


}

//alert(' It gets here....')

xNewDeleteButtons = document.getElementsByClassName('xDeleteButtonClass a');

for(let i = 0; i < xNewDeleteButtons.length; i++) {

    xNewDeleteButtons[i].addEventListener("click", function(e) {

      //var btn_id = e.target.id

      //var project_js_id = $('#'+btn_id).attr('project_id')

      alert(' a tag - 2054')

  });


}

/*

$('.xDeleteButtonClass a').click(function(e) {
    e.preventDefault();
    alert('here in');
     var divId = 'summary' +$(this).attr('id');
    alert(divId)
});



ALL_USER_PROJECTS = window.localStorage.hasOwnProperty("all_user_projects") ?  window.localStorage.getItem("all_user_projects") : []
alert(' all user projects  : ' + JSON.stringify(ALL_USER_PROJECTS))


if (window.localStorage.hasOwnProperty("active_project")){

    ACTIVE_PROJECT_ID = window.localStorage.getItem("active_project");
    alert(' active project id : ' + ACTIVE_PROJECT_ID)

}

*/


//-----------------------------------------------------------------------
//                       MyProjectsModal
//------------------------------------------------------------------------
/*
var myProjectsModal = new bootstrap.Modal(document.getElementById('myProjectsModal'), {})

$("#closeProjectsCornerBtn").click(function (){
    myProjectsModal.toggle()
});

//'index', 'project_js_id', 'project_name','date_created'



                    <tr>
                       <th scope="row">${data.index ? data.index  : ""}</th>
                        <td>${data.project_name ? data.project_name : ""}</td>
                        <td>${data.project_name ? data.project_name : ""}</td>
                        <td>${data.project_name ? data.project_name : ""}</td>
                        <td>
                            <button id="delete_project_btn"  data-projectID="${data.project_js_id ? data.project_js_id : ""}" type="button" class="btn btn-danger" onclick="DeleteProject(${data.project_js_id})"><i class="far fa-trash-alt"> Delete </i></button>
                            <button id="open_project_btn"    data-projectID="${data.project_js_id ? data.project_js_id : ""}" type="button" class="btn btn-success" onclick="OpenProject(${data.project_js_id})"><i class="fas fa-edit"></i> Open Project</button>       
                        </td>
                    </tr>





function newTableRow(data){

    var new_table_row = data.project_js_id ?
                    `<tr>
                    <td>${data.project_name ? data.project_name : ""}</td>
                    <td>${data.project_name ? data.project_name : ""}</td>
                    <td>
                        <button id="delete_project_btn"  data-projectID="${data.project_js_id}" type="button" class="btn btn-danger"><i class="far fa-trash-alt"> Delete </i></button>
                        <button id="open_project_btn"  data-projectID="${data.project_js_id}" type="button" class="btn btn-success"><i class="fas fa-edit"></i> Open Project</button>    
                    </td>
                </tr>`  : ""
        return new_table_row

}


function addAllTableRows(data_array){

    var table_rows_strings=''

    for (var i = 0; i < data_array.length; i += 1) {

        var table_row  = document.createElement('tr'); 

        data = data_array[i]

        new_table_row_string = newTableRow(data)

        table_rows_strings  += new_table_row_string + '\n'
            
    }

    document.getElementById('xProjectsTable').tBodies[0].innerHTML = table_rows_strings

}

function OpenProject(project_id){
    alert('project to open ' + project_id);
}

function DeleteProject(project_id){
    alert('project to delete ' + project_id);
}


$("#open_project_btn").click(function (){
  alert('You clicked on the open project button')
});

$("#delete_project_btn").click(function (){
    alert('You clicked on the delete btn button')
  });




//var parsed = {{lat_lng | tojson }};

var parsed = JSON.parse({{'lat_lng | tojson'}});
alert('line 2214 - ' + JSON.stringify(parsed))

*/



//---------------------------------------------------------------
//          New Dynamic Generation of Label Bucket Cards      
//----------------------------------------------------------------

function NewLabelBucketCard(data_element){

   // alert('data element : ' + JSON.stringify(data_element))

    var counter = data_element.index ? data_element.index : ""
    var label = data_element.label ? data_element.label : ""
    var color = data_element.color ? data_element.color : ""            
    var number_original_images = data_element.num_images ? data_element.num_images : ""
    var project_name = data_element.project_name ? data_element.project_name : ""
    var project_js_id = data_element.project_id ? data_element.project_id : ""
    var date_created = data_element.date_created ? data_element.project_name : ""
    var all_labeled_true_false = data_element.all_labeled_true_false ? data_element.all_labeled_true_false : false;
    var user_id = data_element.user_id ? data_element.user_id : ""
    //alert(' project_name : ' + project_name +  ' date_created : ' + date_created)


    const newCardParent = document.createElement('div')
    newCardParent.className ="col card h-100 mb-3 w-15"
    newCardParent.style= "margin-top: 10px; margin-right: 5px; margin-bottom: 20px; border: 5px solid " + color;

    const h5 = document.createElement('h5')
    h5.className ="card-header d-flex justify-content-between align-items-center;"
    h5.innerHTML = label;

    const checkmark_div = document.createElement('div')
    checkmark_div.id = "labeling_complete"
    checkmark_div.innerHTML ="&#x2705;";
    h5.append(checkmark_div)

    const cardBody = document.createElement('div')
    cardBody.className ="card-body"

    const h2 = document.createElement('h2')
    h2.className ="card-title"
    h2.innerHTML ="";

    const p1 = document.createElement('p')
    p1.className ="card-text"
    p1.innerHTML ="";

    const p2 = document.createElement('p')
    p2.className ="card-text"
    p2.innerHTML ="Number of Images:";

    const p3 = document.createElement('p')
    p3.className ="card-text"
    p3.innerHTML ="Labelled Images:";

    const p4 = document.createElement('p')
    p4.className ="card-text"

    const small_1 = document.createElement('small')
    small_1.className ="text-muted"
    small_1.innerHTML ="";
    p4.append(small_1)  

    const show_thumbnails_div = document.createElement('div')
    //const input_1 = document.createElement('input')
    //input_1.type ="submit"
    //input_1.id ="showThumbnails";
    //input_1.value ="Show Images";
    //input_1.style="margin-left: 0px; width: 50%; height: 50px; margin-bottom: 20px; border: 5px solid green;"
    //input_1.onclick = showImagesAction()
    //var atag_id = label + "-" + project_js_id

    var atag_showthumbnails = document.createElement("a");
    atag_showthumbnails.id =  label + "-" + project_js_id
    atag_showthumbnails.className ="btn"
    //atag_showthumbnails.href = "/showImages?label=" + label +  "&project_id="+ project_js_id;
    atag_showthumbnails.style = "width: 100%; height: 50px; margin-bottom: 20px; border: 5px solid " + color; 
    atag_showthumbnails.setAttribute("label",label)
    atag_showthumbnails.setAttribute("project_id",project_js_id)
    atag_showthumbnails.innerHTML ="Show Images";
    atag_showthumbnails.addEventListener('mouseover',function(){ $(this).css('background-color', color);  });
    atag_showthumbnails.addEventListener('mouseout', function(){ $(this).css('background-color', '');  });
    atag_showthumbnails.addEventListener('click', function(){ 
        var atag_id_x = $(this).attr('id');  
        const myArray = atag_id_x.split("-");
        var xlabel = myArray[0];
        var xproject_id = myArray[1];

        alert(' atag parameters 2331 - xlabel : ' + xlabel  + '  xproject_id ' + xproject_id)
    });
    //$("#"+atag_id).on('click', function(e) { alert("inside onclick + atag_showthumbnails "); });

    show_thumbnails_div.append(atag_showthumbnails) 

 /*
    const input_2 = document.createElement('input')
    input_2.type ="hidden"
    input_2.id ="current_folder";
    input_2.value ="current label";
    input_2.name ="current_folder";

    const input_3 = document.createElement('input')
    input_3.type ="hidden"
    input_3.id = project_js_id;
    input_3.value = project_js_id;
    input_3.name = project_js_id;

    //show_thumbnails_div.append(input_1)     
    show_thumbnails_div.append(input_2)  
    show_thumbnails_div.append(input_3)  
    show_thumbnails_div.append(atag_showthumbnails) 

    const input_group = document.createElement('div')
    input_group.className ="input-group"
    input_group.style ="display: inline;"


    const upload_left_div = document.createElement('div')
    upload_left_div.style ="display: inline;"  
    
    const upload_right_div = document.createElement('div')
    upload_right_div.style ="display: inline;"             

    const input_1x = document.createElement('input')
    input_1x.className ="form-control"
    input_1x.type ="file"
    input_1x.id ="imageLoader-" + label + "-" + project_js_id;
    input_1x.name ="upload_images_project_label[]"
    input_1x.multiple = true;
    input_1x.autocomplete = true;
    input_1x.required =true;


    const atag_imgs_upload = document.createElement('a')
    // atag_imgs_upload.href ="/upload?label=" + label +  "&project_id="+ project_js_id +"&a=100&b=500"
    atag_imgs_upload.className ="btn btn-success"
    atag_imgs_upload.id =  label + "-" + project_js_id;
    atag_imgs_upload.setAttribute("imageLoader_id","imageLoader-" + label + "-" + project_js_id)
    atag_imgs_upload.setAttribute("label",label)
    atag_imgs_upload.setAttribute("project_id",project_js_id)
    atag_imgs_upload.innerHTML ="Upload Images";
    atag_imgs_upload.style ="display: inline; width: 100%;"     
    atag_imgs_upload.addEventListener('mouseover',function(){ $(this).css('opacity', 0.5);  });
    atag_imgs_upload.addEventListener('mouseout', function(){ $(this).css('opacity', 1.0);  });
    atag_imgs_upload.addEventListener('click', function(){ 
        var atag_imgs_x = $(this).attr('id');  
        const myArray = atag_imgs_x.split("-");
        var xlabel = myArray[0];
        var xproject_id = myArray[1];

        alert(' atag parameters 2389 - xlabel : ' + xlabel  + '  xproject_id ' + xproject_id)
        var imageLoader_id = $(this).attr('imageLoader_id'); 
        alert(' 2392 imageLoader_id  ' + imageLoader_id)

    });         


    upload_left_div.append(input_1x)
    upload_right_div.append(atag_imgs_upload)

    const input_2x = document.createElement('input')
    input_2x.className ="btn  btn-info xUploadImagesBtnClass"
    input_2x.type ="submit"
    input_2x.id ="uploadImagesButton-001";
    input_2x.value ="Upload Images";
    input_2x.style="margin-left: 0px;"
    input_2x.setAttribute("project_id",project_js_id)
    input_2x.setAttribute("current_folder",label)
    // input_2x.onclick = uploadButtonAction("motocar")


    const input_3x = document.createElement('input')
    input_3x.type ="hidden"
    input_3x.id ="current_folder";
    input_3x.value ="current label";
    input_3x.name ="current_folder";

    const input_4x = document.createElement('input')
    input_4x.type ="hidden"
    input_4x.id ="current_folder";
    input_4x.value ="images-for-labeling";
    input_4x.name ="which-form";

    //input_group.append(input_1x)
    //input_group.append(atag_imgs_upload)
    input_group.append(upload_left_div)
    input_group.append(upload_right_div)            
    //input_group.append(input_2x)
    input_group.append(input_3x)
    input_group.append(input_4x)

  */

    // --------------------------------------------------------------------------------------

    const dl_upload = document.createElement('dl')

    const p_x = document.createElement('p')

    const p_x_msg = document.createElement('p')
    p_x_msg.id = "msg-" + label + "-" + project_js_id
    p_x_msg.innerHTML ="";

    p_x.append(p_x_msg)


    const input_dl_upload = document.createElement('input')
    input_dl_upload.className ="form-control"
    input_dl_upload.type ="file"
    input_dl_upload.id ="imageLoader-" + label + "-" + project_js_id;
    input_dl_upload.name ="x-files[]"
    input_dl_upload.multiple = true;
    input_dl_upload.autocomplete = true;
    input_dl_upload.required =true;


    const new_atag_imgs_upload = document.createElement('a')
    new_atag_imgs_upload.className ="btn btn-success"
    new_atag_imgs_upload.id =  label + "-" + project_js_id;
    new_atag_imgs_upload.setAttribute("imageLoader_id","imageLoader-" + label + "-" + project_js_id)
    new_atag_imgs_upload.setAttribute("msg_id","msg-" + label + "-" + project_js_id)
    new_atag_imgs_upload.setAttribute("label",label)
    new_atag_imgs_upload.setAttribute("project_id",project_js_id)
    new_atag_imgs_upload.innerHTML ="Upload Images";
    new_atag_imgs_upload.style ="display: inline; width: 100%;"     
    new_atag_imgs_upload.addEventListener('mouseover',function(){ $(this).css('opacity', 0.5);  });
    new_atag_imgs_upload.addEventListener('mouseout', function(){ $(this).css('opacity', 1.0);  });
    new_atag_imgs_upload.addEventListener('click', function(){ 
        var atag_imgs_x = $(this).attr('id');  
        const myArray = atag_imgs_x.split("-");
        var xlabel = myArray[0];
        var xproject_id = myArray[1];

        // alert(' DL TAG atag parameters 2389 - xlabel : ' + xlabel  + '  xproject_id ' + xproject_id)
        var imageLoader_id = $(this).attr('imageLoader_id'); 
        var msg_id = $(this).attr('msg_id'); 
        //var x_label = $(this).attr('label');     
        //var x_project_id = $(this).attr('project_id');           
        //alert(' 2392 imageLoader_id  ' + imageLoader_id)
        var form_data = new FormData();
        var num_of_image_files = document.getElementById(imageLoader_id).files.length;
        // alert(' imageLoader_id ' + imageLoader_id + ' number of files : ' + num_of_image_files)
        if(num_of_image_files == 0) {
             $('#' + msg_id).html('<span style="color:red">Select at least one file</span>');
            return;
        }

        if(num_of_image_files > 0) {
            $('#' + msg_id).html('<span style="color:red"></span>');
       }

       for (var x = 0; x < num_of_image_files; x++) {
        form_data.append("x-files[]", document.getElementById(imageLoader_id).files[x]);
        // alert('  x  ' + document.getElementById(imageLoader_id).files[x])
       }

      form_data.append("project_id", xproject_id)
      form_data.append("label", xlabel)


      // Post the files to the Server
      $.ajax({
        url: '/upload_x_files/', // point to server-side URL
        dataType: 'json', // what to expect back from server
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function (response) { // display success response   
           msg = ' xproject_id  : ' + response.xproject_id  + '\n'  + ' xlabel : ' + response.xlabel + '\n' +  'bucket_name : ' +  response.bucket_name + '\n' +  'gcp_subdirectory_path : ' + response.gcp_subdirectory_path + '\n'  + '  file_names : ' + JSON.stringify(response.file_names) + ' blob_full_path_array : ' + JSON.stringify(response.blob_full_path_array) + ' returned_public_urls :  ' +  JSON.stringify(response.returned_public_urls) + '  label_image_urls : ' + JSON.stringify(response.label_image_urls)
           alert(msg) 

           // Reset the input files field
           //document.getElementById(imageLoader_id).value = ''
           //document.getElementById(imageLoader_id).files =[]

        },
        error: function (response) {
           alert('an error occured ...')
        }
     });


    }); 


   dl_upload.append(p_x)
   dl_upload.append(input_dl_upload)
   dl_upload.append(new_atag_imgs_upload)

    // --------------------------------------------------------------------------------------

    const cardFooter = document.createElement('div')
    cardFooter.className ="card-footer"
    cardFooter.style ="display: inline;"

    const left_div =  document.createElement('div')
    left_div.style = "display: inline;"            
    const right_div =  document.createElement('div')
    right_div.style = "display: inline; "    


    const atag = document.createElement('a')
    //atag.href ="/atagDelete?label=" + label +  "&project_id="+ project_js_id +"&a=100&b=500"
    atag.className ="btn btn-danger"
    // atag.style = "margin-top: 20px; width: 30%;"
    atag.id =  label + "-" + project_js_id; + "-deleteLabelButton"
    atag.setAttribute("label",label)
    atag.setAttribute("project_id",project_js_id)
    atag.innerHTML ="Delete"; 
    //atag.addEventListener('mouseover',function(){ $(this).removeClass("btn btn-success");   $(this).addClass("btn btn-warning");   });
    // atag.addEventListener('mouseout', function(){ $(this).removeClass("btn btn-warning");   $(this).addClass("btn btn-success");   });
    atag.addEventListener('click', function(){ 

        var atag_delete_x = $(this).attr('id');  
        const myArray = atag_delete_x.split("-");
        var xlabel = myArray[0];
        var xproject_id = myArray[1];

        alert('  delete tag button 2389 - xlabel : ' + xlabel  + '  xproject_id ' + xproject_id)
    });   




    const small_1x = document.createElement('small')
    small_1x.className ="text-muted"
    small_1x.innerHTML ="Delete all images & labels";
    small_1x.style = "margin-left: 10px; "  


    left_div.append(atag)
    right_div.append(small_1x)

    cardFooter.append(left_div)
    cardFooter.append(right_div)

    newCardParent.append(h5)
    newCardParent.append(cardBody)    
    newCardParent.append(h2)
    newCardParent.append(p1)
    newCardParent.append(p2)
    newCardParent.append(p3)    
    newCardParent.append(p4)            
    newCardParent.append(show_thumbnails_div)
    // newCardParent.append(input_group)

    newCardParent.append(dl_upload)   // New

    newCardParent.append(cardFooter)


    return newCardParent

}



function new_create_label_buckets(data){

    for (var i = 0; i < data.length; i += 4) {

        var new_row = document.createElement('div')
        new_row.className="row"

        //for (var k = i; k <= i+4; k += 1){

        var new_card = NewLabelBucketCard(data[i])
        new_row.appendChild(new_card)

        var new_card2 = NewLabelBucketCard(data[i+1])
        new_row.appendChild(new_card2)

        var new_card3 = NewLabelBucketCard(data[i+2])
        new_row.appendChild(new_card3)

        var new_card4 = NewLabelBucketCard(data[i+3])
        new_row.appendChild(new_card4)

        //}

        document.getElementById('cropped_images_label_buckets_container').appendChild(new_row)

    }

}



//-----------------------------------------------------------------------------------------
//          Check Hidden Fields for CURRENT PROJECT AND CURRENT LABEL
//          See section in html page with 'MAIN-CONTAINER USED FOR LABEL BUCKETS"
//-----------------------------------------------------------------------------------------


function getJinJaVariablesFromHtmlFile() {
    return active_project_id + ' ' + active_label
}

// alert(getJinJaVariablesFromHtmlFile())

//alert('active_label :  ' + $('input#active_label').val());
//alert('active_project_id :  ' + $('input#active_project_id').val());













    
}); // End Window Load Event
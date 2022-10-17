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
    var CURRENT_PROJECT="";
    var PROJECT_JSON

    var first_20_colors = ['#112FDF', '#FF0006', '#00A546','#D95C00', '#862E85', '#AFD800','#512479', '#31CBF1', '#FCAE03','#FC368D', '#723BB0', '#E12A1F','#FF014A', '#0094D4', '#879AF9','#E40061', '#F7DC43', '#3C55E6','#590F26', '#243274'];

    var user_id ="10101010102030232"


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
    
    // clearEntireLocalStorage()

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

      // localStorage.clear();

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









    // ------------------------------------------------------------------------------------------
    //                     Add / Edit Labels for Labelling
    //-------------------------------------------------------------------------------------------
  
    var original_textarea_content;
    var new_textarea_content = []
    var LABELS_COLOR_MAP = {}   // label (key) and color (value)
    var current_label;
    var current_color;

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
        // alert(' You selected label ' + id)
        

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

        // Choose the first label in the labels div as the first color
        if (Object.keys(LABELS_COLOR_MAP).length > 0){

        const firstColor = Object.values(LABELS_COLOR_MAP)[0];
        const firstLabel = Object.keys(LABELS_COLOR_MAP)[0];

        current_color = firstColor
        current_label = firstLabel

        //alert('first label ' + firstLabel + 'first color ' + firstColor)

        var all_labels = document.getElementsByClassName('labelclass');
        var first_div = document.getElementById(firstLabel)

        if(document.getElementById(firstLabel)){

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
                //alert('LABEL COLOR MAP ' + JSON.stringify(LABELS_COLOR_MAP))
                // alert(' label  ' + label +  ' color ' + color)

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
        $("#currentLabel").css("fontSize", "30px");
        $("#currentLabel").css("font-weight", "bold")
        $("#currentLabel").css('color', 'white');
        $("#currentLabel").css("width", "130px");
        $("#currentLabel").css("margin", "5px");
        $("#currentLabel").html()
        $("#currentLabel").html(_current_label)
        $("#currentLabel").animate({height: '50px',width: '200px'},5000)

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
    //function saveNewLabels(){

    //var textarea_content = document.getElementById('labels_textarea').value;
        if($("#labels_textarea").val().trim().length < 1)
        {
            // alert("Please Enter Labels...");
            $("#labels-error-message").html("Please Enter Labels...")
            return; 
        }

        else {

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
    
                // storeSessionValue("labels_color_map", LABELS_COLOR_MAP)
                window.localStorage.setItem("labels_color_map", JSON.stringify(LABELS_COLOR_MAP));
    
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

        }
        //alert('Labels to save ' + textarea_content)
    //}
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

    //var original_textarea_content = document.getElementById('labels_textarea').value;
    //var colors = ['#ff0000', '#00ff00', '#0000ff','#ff3333', '#ffff00', '#ff6600'];
    //var random_color = colors[Math.floor(Math.random() * colors.length)].toString() + ';';
    //var labels = ['Tomato', 'Popcorn', 'Sugar','Mango', 'Kandolo', 'Football'];
    //var random_label = labels[Math.floor(Math.random() * labels.length)].toString();
    // var new_color = setBackgroundColor().toString() + ';';

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
        alert('localStorage Current Project ' + CURRENT_PROJECT)
        
        }

    // If project name exists - hide button
    if(CURRENT_PROJECT.length > 0){

        Hide_StartNewProject_Button_and_Show_ProjectLabel()

        // show the labels textarea and save button
        Show_Labels_TextArea_and_Save_Button_Only()

    }
    else{

        // Hide labels textarea and save button
        $("#labels_textarea").attr("style", "display: none !important");
        $("#save_button").attr("style", "display: none !important");
        $("#cancel_button").attr("style", "display: none !important");
        $("#currentLabel").attr("style", "display: none !important");
        $("#addOrEdit_button").attr("style", "display: none !important");

    }

    $("#StartNewProjectButton").click(function (){
        myModal.toggle()
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
                    'ISODate' : ISODate,
            
                },
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
















    
}); // End Window Load Event
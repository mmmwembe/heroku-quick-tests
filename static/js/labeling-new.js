window.addEventListener('load', (event) => {

    var MAX_CANVAS_WIDTH = 600
    var MAX_CANVAS_HEIGHT = 400
    var TARGET_CANVAS_WIDTH = null
    var TARGET_CANVAS_HEIGHT = null
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

    var pointer = fabricCanvas.getPointer(o.e);
    isDown = true;
    origX = pointer.x;
    origY = pointer.y;
    // rectangle = new fabric.Rect({
    rectangle = new fabric.BoundingBox({        
        left: origX,
        top: origY,
        fill: 'transparent',
        stroke: label_color,
        strokeWidth: 2,
    });
    fabricCanvas.add(rectangle);
});

fabricCanvas.on('mouse:move', function(o){
    if (!isDown) return;

    currentMode = MODE.drawing

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
});

fabricCanvas.on('mouse:up', function(o){


    if (isDown && currentMode === MODE.drawing) {

        endTimer()

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
    
        norm_data =  {'test_train_validation' : 'TESTING', 'image_url': IMAGE_URL, 'label': label, 'norm_x_min': norm_x_min, 'norm_y_min': norm_y_min, 'norm_x_tr' : '', 'norm_y_tr' :'', 'norm_x_max' : norm_x_max, 'norm_y_max' : norm_y_max, 'norm_x_bl': '', 'norm_y_bl':'', 'label_status' : LABEL_STATUS, 'ISODate': iso_date_timestamp }
        // alert(' NORMALIZED DATA ' + JSON.stringify(norm_data))

        rectangle.set({
            'originator': user_id,
            'label' : label,
            'label_color' : label_color,
            'ISODate' : ISODate,
            'date_month_text' : Date_Month_Text,
            'ai_ready_normalized_data' : norm_data,
            'timer_tracker': {'elapsed_time_seconds' : elapsed_time_seconds, 'total_duration_array': total_duration_array, 'total_duration': total_duration, 'units_of_measure' : units_of_measure},
          })

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
        }
        else {
            storeSessionValue(img_name, null)
        }

        // alert('filename : ' + img_name)
    
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



    // ------------------------------------------
    //          Download CSV File
    //-------------------------------------------


    document.getElementById("download-csv-button").onclick = function() {

        //alert(' download csv button clicked !!! ')

        // IMAGE_LIST.forEach(addToCSVFile);

        for(let i = 0; i < img_thumbnails.length; i++) {
            var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;

            image_file = getFileName(imageURL)
            //alert(' image file name ' + image_file)

            if (getStoredSessionValue(image_file) !== null) {
                const canvas_json_string = getStoredSessionValue(image_file);
                const canvas_json_object = JSON.parse(canvas_json_string)


                var jsClean = canvas_json_string.replace(/"objects"/, 'objects');
                var jsonObj = JSON.parse(JSON.stringify(jsClean));
                var jsonobj2 = eval('(' + jsonObj + ')');

                var bounding_boxes = jsonobj2.objects

                downloadAsJSON(bounding_boxes,'boundingboxes.json')

                for (let i = 0; i < bounding_boxes.length; i++) {
                    var bbox = bounding_boxes[i]

                    var type = bbox.type
                    var version = bbox.version
                    var originX = bbox.originX
                    //var ai_ready_normalized_data = bbox.ai_ready_normalized_data
                    //var ISODate = bbox.ISODate

                    //alert(JSON.stringify(bbox))

                    //alert('ISODate ' + ISODate)


                }
                        
            }

          }


    };

    function addToCSVFile(image_url) {

        image_file = getFileName(image_url)
        alert(' image file name ' + image_file)

    }


    function downloadAsJSON(new_json_object, filename){

        // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        // var data = {key: 'value'};
        //var fileName = 'myData.json';
        var fileName = filename ? filename : 'myData.json';
        
        // Create a blob of the data
        var fileToSave = new Blob([JSON.stringify(new_json_object)], {
            type: 'application/json'
        });
        
        // Save the file
        saveAs(fileToSave, fileName);






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
        this.set('label', options.label|| '');
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
            label: this.get('ISODate'),
            label: this.get('date_month_text'),    
            label: this.get('ai_ready_normalized_data'),
            label: this.get('timer_tracker'),                                                                                                          
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

    fabric.BoundingBox.fromObject = function(options) {
        return new fabric.BoundingBox(options);
    }


    // Double click function for canvas
  
    
    
    
}); // End Window Load Event
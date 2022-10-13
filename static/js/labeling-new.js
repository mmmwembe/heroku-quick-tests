window.addEventListener('load', (event) => {

    var MAX_CANVAS_WIDTH = 600
    var MAX_CANVAS_HEIGHT = 400
    var TARGET_CANVAS_WIDTH = null
    var TARGET_CANVAS_HEIGHT = null
    var rectangle, isDown, origX, origY;
    var x_min, y_min, x_max, y_max;
    var norm_x_min,norm_y_min,norm_x_max,norm_y_max;
    var IMAGE_URL;
    const MODE = {
        drawing :  'drawing',
        notDrawing : 'notDrawing'  // // notDrawing = {scaling rotating skewing resizing moving }
    }
    var currentMode = MODE.drawing

    // https://www.demo2s.com/javascript/javascript-fabric-js-draw-rectangle-between-two-mouse-clicks-on-canvas.html

    var fabricCanvas = new fabric.Canvas("fabricCanvas");
    fabric.Object.prototype.set("field", "value");
    fabric.Object.prototype.getAngleInRadians = function() {
        return this.getAngle() / 180 * Math.PI;
    };

    fabric.Object.prototype.getZIndex = function() {
        return this.fabricCanvas.getObjects().indexOf(this);
    }

    img_thumbnails = document.getElementsByClassName('gallery_column');

    // Show the first image from the thumbnails the main image
    showFirstImage()

    // alert('new image width :' + image_dimensions.width)

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

            img_url = e.target.src
            IMAGE_URL = img_url
            updateFabricCanvasBackgroundImage(img_url)
            //alert(img_url)

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
    var pointer = fabricCanvas.getPointer(o.e);
    isDown = true;
    origX = pointer.x;
    origY = pointer.y;
    rectangle = new fabric.Rect({
        left: origX,
        top: origY,
        fill: 'transparent',
        stroke: 'green',
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

    // rectangle.on("mousedblclick", ()=>{alert(' active Object ')})
    
    fabricCanvas.renderAll();
});

fabricCanvas.on('mouse:up', function(o){


    if (isDown && currentMode === MODE.drawing) {

        var canvas_height = fabricCanvas.height
        var canvas_width =  fabricCanvas.width
        var object_index = rectangle.getZIndex()
    
        alert('canvas height : ' + canvas_height + ' canvas_width ' + canvas_width + 'Index of rectangle ' + object_index)
    

    };

      isDown = false;
      currentMode = MODE.notDrawing

});


// Delete the bounding box by double clicking the box
fabricCanvas.on('mouse:dblclick', (e1) => {
    // fabricCanvas.getActiveObject().remove();
    fabricCanvas.remove(fabricCanvas.getActiveObject())
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









    
    
    // Double click function for canvas
  
    
    
    
}); // End Window Load Event
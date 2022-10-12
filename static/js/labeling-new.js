window.addEventListener('load', (event) => {

    var MAX_CANVAS_WIDTH = 600
    var MAX_CANVAS_HEIGHT = 400
    var TARGET_CANVAS_WIDTH = null
    var TARGET_CANVAS_HEIGHT = null

    // https://www.demo2s.com/javascript/javascript-fabric-js-draw-rectangle-between-two-mouse-clicks-on-canvas.html

    var fabricCanvas = new fabric.Canvas("fabricCanvas");
    img_thumbnails = document.getElementsByClassName('gallery_column');

    // Show the first image from the thumbnails the main image
    showFirstImage()

    // alert('new image width :' + image_dimensions.width)

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

            img_url = e.target.src
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

            //orgWidth = imgToDrawOnFabricCanvas.width;
            // orgHeight = imgToDrawOnFabricCanvas.height;

            sourceImageWidth = imgToDrawOnFabricCanvas.width;
            sourceImageHeight = imgToDrawOnFabricCanvas.height;
            // alert('Original Width : ' + orgWidth +" Original Height " + orgHeight)
            target_image_dimensions = calculateAspectRatioFit(sourceImageWidth, sourceImageHeight, MAX_CANVAS_WIDTH, MAX_CANVAS_HEIGHT)
            TARGET_CANVAS_WIDTH = target_image_dimensions.width
            TARGET_CANVAS_HEIGHT = target_image_dimensions.height

            // Set Fabric Canvas width and height to target width and height
            fabricCanvas.setDimensions({width:TARGET_CANVAS_WIDTH, height:TARGET_CANVAS_HEIGHT});

            fabricCanvas.add(imgToDrawOnFabricCanvas);
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


















    function showFirstImage(){
        var first_img_div = document.getElementsByClassName('gallery_column')[0]
        var first_img = first_img_div.getElementsByTagName('img')[0].src;
        // alert(first_img)
        updateFabricCanvasBackgroundImage(first_img)
    }



    
    
    
    
    
    
    
    
}); // End Window Load Event
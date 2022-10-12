window.addEventListener('load', (event) => {

    // https://www.demo2s.com/javascript/javascript-fabric-js-draw-rectangle-between-two-mouse-clicks-on-canvas.html

    var fabricCanvas = new fabric.Canvas("fabricCanvas");
    img_thumbnails = document.getElementsByClassName('gallery_column');

    // Show the first image from the thumbnails the main image

    showFirstImage()

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

                img_url = e.target.src

                //alert(img_url)

      })
    }



   function updateFabricCanvasBackgroundImage(NEW_IMAGE_URL){

        var remoteImageForFabric = new Image();
        remoteImageForFabric.crossOrigin = "Anonymous";
        remoteImageForFabric.src = "";
        remoteImageForFabric.onload = function(loadedImage) {

            orgWidth = remoteImageForFabric.width;
            orgHeight = remoteImageForFabric.height;
            alert('Original Width : ' + orgWidth +" Original Height " + orgHeight)

            var imgToDrawOnFabricCanvas = new fabric.Image(remoteImageForFabric);
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
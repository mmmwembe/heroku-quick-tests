window.addEventListener('load', (event) => {


    img_thumbnails = document.getElementsByClassName('gallery_column');

    // Show the first image from the thumbnails the main image

    showFirstImage()

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

                img_url = e.target.src

                //alert(img_url)

      })
    }



    var fabricCanvas = new fabric.Canvas("fabricCanvas");
    var remoteImageForFabric = new Image();
    remoteImageForFabric.crossOrigin = "Anonymous";
    remoteImageForFabric.src = "";
    remoteImageForFabric.onload = function(loadedImage) {
        var imgToDrawOnFabricCanvas = new fabric.Image(remoteImageForFabric);
        fabricCanvas.add(imgToDrawOnFabricCanvas);
    }
    remoteImageForFabric.src = "https://images-na.ssl-images-amazon.com/images/S/aplus-seller-content-images-us-east-1/ATVPDKIKX0DER/A1GLDJYFYVCUE8/B0044FL7SG/kFRS1LS1QWWr._UX500_TTW_.jpg";





















    function showFirstImage(){
        var first_img_div = document.getElementsByClassName('gallery_column')[0]
        var first_img = first_img_div.getElementsByTagName('img')[0].src;
        alert(first_img)
    }



    
    
    
    
    
    
    
    
}); // End Window Load Event
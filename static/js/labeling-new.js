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





















    function showFirstImage(){
        var first_img_div = document.getElementsByClassName('gallery_column')[0]
        var first_img = first_img_div.getElementsByTagName('img')[0].src;
        alert(first_img)
    }



    
    
    
    
    
    
    
    
}); // End Window Load Event
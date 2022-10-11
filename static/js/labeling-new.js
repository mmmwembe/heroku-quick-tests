window.addEventListener('load', (event) => {


    img_thumbnails = document.getElementsByClassName('gallery_column');

    //showFirstImage()

    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

                img_url = e.target.src

                //alert(img_url)

      })
    }





















    function showFirstImage(){
        var first_img_div = document.getElementsByClassName('gallery_column')[0]
        //var first_img = first_img_div.src;
        alert(first_img_div)
    }



    
    
    
    
    
    
    
    
}); // End Window Load Event
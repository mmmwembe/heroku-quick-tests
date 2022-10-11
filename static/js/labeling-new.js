window.addEventListener('load', (event) => {


    img_thumbnails = document.getElementsByClassName('gallery_column');
    
    for(let i = 0; i < img_thumbnails.length; i++) {
      img_thumbnails[i].addEventListener("click", function(e) {

                img_url = e.target.src

                alert(img_url)

      })
    }



    
    
    
    
    
    
    
    
}); // End Window Load Event
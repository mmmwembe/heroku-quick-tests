
function Show_Labeled_Images_and_Enable_Labels_Download(){

    img_thumbnails = document.getElementsByClassName('gallery_column');

    for(let i = 0; i < img_thumbnails.length; i++) {

        var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;

        var img_name = getFileName(IMAGE_URL)

        // Get stored canvas json and display on the canvas
        if (getStoredSessionValue(img_name) !== null) {

            const canvas_json = getStoredSessionValue(img_name);
            var new_JSON_Object = $.parseJSON(canvas_json)

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

function Show_Labeled_Images_and_Enable_Labels_Download(){

    img_thumbnails = document.getElementsByClassName('gallery_column');

    for(let i = 0; i < img_thumbnails.length; i++) {

        var imageURL = img_thumbnails[i].getElementsByTagName('img')[0].src;

        var img_name = getFileName(IMAGE_URL)

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






$.ajax({
    type: "POST",
    url: '/send_tokens',
    dataType: 'json',
    data: { 
            'user_id' : user_id, 
            'project_name' : project_name, 
            'project_id' : project_id, 
            'labels_color_map' : LABELS_COLOR_MAP, 
            'isoDate' : ISODate,
       
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





$.ajax({
    url: 'python-flask-files-upload', // point to server-side URL
    dataType: 'json', // what to expect back from server
    cache: false,
    contentType: false,
    processData: false,
    data: form_data,
    type: 'post',
    success: function (response) { // display success response
        $('#msg').html('');
        $.each(response, function (key, data) {							
            if(key !== 'message') {
                $('#msg').append(key + ' -> ' + data + '<br/>');
            } else {
                $('#msg').append(data + '<br/>');
            }
        })
    },
    error: function (response) {
        $('#msg').html(response.message); // display error response
    }
});

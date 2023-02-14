
// Retrieve instance of Fabricjs Canvas
var y = document.getElementById("mycanvas").fabric;
var url = y.toDataURL("png", 1);

Canvas("fabricCanvas")
    //----------------------------------------------------------
    // Show Marked Images and Enable Download
    //----------------------------------------------------------
    // Show_Labeled_Images_and_Enable_Labels_Download()

    //--------------------------------------------------------

    function updateFabricCanvasBackgroundImage(NEW_IMAGE_URL){

        var rect1, rect2, rect3

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


            // Add the code for opacity here

            rect1 = new fabric.Rect({left: 0,top: 0,width: 150,height: 50,fill: 'green',angle: 0,opacity: 0.5});
            rect2 = new fabric.Rect({left:150,top: 50,width: 150,height: 50,fill: 'magenta',angle: 0,opacity: 0.75});
            rect3 = new fabric.Rect({left: 0,top: 100,width: 150,height: 50,fill: 'gray',angle: 0,opacity: 0.80});
          
           var group = new fabric.Group([rect1,rect2])
           fabricCanvas.add(group);
           fabricCanvas.renderAll()



           var cropped_image_dataURL = fabricCanvas.toDataURL({
            format: 'png',   // format: 'image/jpeg',
            left: rect1.left,      //  canvas.offsetLeft,
            top: rect1.top,        // canvas.offsetTop,
            width: rect1.width,
            height: rect1.height,
            selection: false
        })


        const cropped_image_display = document.getElementById('cropped-image-container');
        var imgElement = document.createElement("img");
        imgElement.src = cropped_image_dataURL;
        //document.body.appendChild(imgElement);
        cropped_image_display.appendChild(imgElement);

        cropped_image_dataURL= cropped_image_dataURL.replace("data:image/png;base64,", "");
              // Remove data:image/png;base64, at beginning of the cropped_image_dataURL string


           //const cropped_image_display = document.getElementById('cropped-image-container');
           //var img = document.createElement('img');
           //img.setAttribute('src', cropped_image_dataURL);
           //cropped_image_display.appendChild(img);

      

            // var imgBase64 = cropped_image_dataURL

            // Save image to server
            // saveCroppedSection()

            // alert(' line 182 - cropped_image_dataURL ' + JSON.stringify(cropped_image_dataURL))

           // https://stackoverflow.com/questions/55941068/change-image-size-with-pil-in-a-google-cloud-storage-bucket-from-a-vm-in-gcloud


            $.ajax({
                type: "POST",
                url: "/saveCroppedImage200",
                data: { 
                   imgBase64: cropped_image_dataURL,
                   active_label_bucket :  ACTIVE_LABEL_BUCKET,
                   active_project_id :  ACTIVE_PROJECT_ID,                   
                   user_id : "user_id", 
                   image_name : "image_name.png",
                   label_num : "label_num",
                   current_folder: "WORKING_LABELS_FOLDER",
                   rect_width: rect1.width,
                   rect_height: rect1.height, 
                },
                success: function(data) {
                  var new_url = data.url
                  alert('Line 206 cropped-image-dataURL : ' + JSON.stringify(new_url))


                  //var imgElement = document.createElement("img");
                  //imgElement.src = new_url;
                  //imgElement.crossOrigin ="anonymous"
                  //cropped_image_display.appendChild(imgElement);

                  $('#external_image').attr('src', new_url);


                }
            
              });





        }
        //remoteImageForFabric.src = "https://images-na.ssl-images-amazon.com/images/S/aplus-seller-content-images-us-east-1/ATVPDKIKX0DER/A1GLDJYFYVCUE8/B0044FL7SG/kFRS1LS1QWWr._UX500_TTW_.jpg";
        remoteImageForFabric.src = NEW_IMAGE_URL;





   }
function auto_add_group_rects(){

    // var rect_group =[]
    var rect_group = new fabric.Group([])
    var rect_width = 150
    var rect_height = 50
    var rect_name = null
    var x_value = null, y_value = null
  
    var opacity_rect_width = null // 50 + getRandomInt(-20, 20) 
    var opacity_rect_height = 50
    var opacity_value = null
    var x_value_opacity = null
    var y_value_opacity = null
    var opacity_fill_color ='#232D38'  // Black diesel
    var opacity_array =[0,0.05,0.10,0.15,0.20,0.25,0.30,0.35,0.40,0.45,0.50,0.55,0.60,0.65,0.70,0.75,0.80,0.85,0.90,0.95,1.00]
    var opacity_frame_of_interest = null
    var x_min = null, y_min = null, x_max = null, y_max = null
    var norm_x_min = null,norm_y_min = null,norm_x_max = null,norm_y_max = null
    var AI_READY_NORMALIZED_ARRAY = []
    var AI_READY_RAW_DATA =[] 
  
  
  
  
    var num_columns = Math.floor(canvas.width/rect_width)
    // var num_rows = Math.floor(final_image_height/rect_height)
    var num_rows = Math.floor(canvas.height/rect_height)
    //var num_rows = Math.floor( canvasHeight/rect_height)
   
    var counter = 0
  
    for (var y = 0; y < num_rows; y++) {
  
     for (var x = 0; x < num_columns; x++) {
  
      x_value = x * rect_width;
      y_value = y * rect_height;
  
      x_value_opacity = x_value + (rect_width/2) + getRandomInt(-40, 10) 
      y_value_opacity = y_value
      opacity_rect_width =  50 + getRandomInt(-20, 20) 
  
      opacity_value = opacity_array[6] // 0.05
      opacity_label = opacity_value * 100
      
  
  
  
  
      rect_name = "rect" + counter
  
      var rectx = new fabric.Rect({left: x_value,top: y_value, width: rect_width,height: rect_height,angle: 0, fill: '', stroke:'#0dd5fc',strokeWidth: 2})
  
      // TODO crop and save this image as a jpeg
  
      // TODO define new rect for opacity of plume 
      
      var rect_plume = new fabric.Rect({left: x_value_opacity,top: y_value, width: opacity_rect_width,height: rect_height,angle: 0, fill: opacity_fill_color, opacity: opacity_value,stroke:'',strokeWidth: ''})
  
      // opacity region of interest
      x_min = rect_plume.get("left")
      y_min = rect_plume.get("top")
      x_max = rect_plume.get("left") + rect_plume.get("width")
      y_max = rect_plume.get("top") + rect_plume.get("height")
  
      norm_x_min = rect_plume.get("left")/rectx.get("width")
      norm_y_min = rect_plume.get("top")/rectx.get("height")
      norm_x_max = (rect_plume.get("left") + rect_plume.get("width"))/rectx.get("width")
      norm_y_max = (rect_plume.get("top") + rect_plume.get("height"))/rectx.get("height")
  
      var IMAGE_URL = getFilename(canvas.backgroundImage.getSrc())
  
      // TODO - update the Image URLs to align with the saved image url on the drive
  
      var ai_ready_normalized_data = { 'test_train_validation' : 'TESTING', 'image_url': IMAGE_URL, 'label': opacity_label , 'norm_x_min': norm_x_min, 'norm_y_min': norm_y_min, 'norm_x_tr' : '', 'norm_y_tr' :'', 'norm_x_max' : norm_x_max, 'norm_y_max' : norm_y_max, 'norm_x_bl': '', 'norm_y_bl':'' }
      var ai_ready_raw_data = {'test_train_validation' : 'TESTING', 'image_url': IMAGE_URL, 'label': opacity_label, 'x_min': x_min, 'y_min': y_min, 'x_tr' : '', 'y_tr': '', 'x_max' : x_max, 'y_max' : y_max, 'x_bl': '', 'y_bl':  ''}
  
      var label_ROI_rect = new fabric.Rect({
              left: x_min,
              top: y_min,
              fill: '',
              width: x_max - x_min,
              height: y_max - y_min,
              stroke: 'red',
              strokeDashArray: [3, 3]
          });
  
      rect_group.addWithUpdate(rectx);
      rect_group.addWithUpdate(rect_plume);
      // rect_group.addWithUpdate(label_ROI_rect);
      
      AI_READY_NORMALIZED_ARRAY.push(ai_ready_normalized_data);
      AI_READY_RAW_DATA.push(ai_ready_raw_data);
  
      // rect_group.push(rect_name) = new fabric.Rect({left: x_value,top: y_value, width: rect_width,height: rect_height,angle: 0});
  
      counter +=1
  
     }  
  
  
  }

}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }


  function createRect(x, y, width, height, fill, opacity) {
    var rect = new Path2D();
    rect.rect(x, y, width, height);
    ctx.fillStyle = fill;
    ctx.globalAlpha = opacity;
    ctx.fill(rect);
    ctx.globalAlpha = 1;
    return rect;
  }

  var myRect = createRect(x_value_opacity, y_value_opacity, opacity_rect_width, rect_height, opacity_fill_color, opacity_value);


  function iterateArray(array) {
    for (let i = 0; i < array.length; i++) {
      alert(array[i]);
    }
  }
  
  var opacity_array =[0,0.05,0.10,0.15,0.20,0.25,0.30,0.35,0.40,0.45,0.50,0.55,0.60,0.65,0.70,0.75,0.80,0.85,0.90,0.95,1.00]
  // Usage:
  iterateArray(opacity_array);



  
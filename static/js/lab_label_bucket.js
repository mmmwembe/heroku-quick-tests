     // Set Environment Variables
     ACTIVE_PROJECT_ID = active_project_id
     ACTIVE_PROJECT_JSON = active_project_result
     CURRENT_PROJECT = ACTIVE_PROJECT_JSON['project_name']
     LABELS_COLOR_MAP = ACTIVE_PROJECT_JSON['labels_color_map']
     PROJECT_JSON = ACTIVE_PROJECT_JSON
     
     var current_label_info = filter_project_json_by_label(key)

     window.localStorage.setItem("project_json",JSON.stringify(ACTIVE_PROJECT_JSON))
     window.localStorage.setItem("labels_color_map",JSON.stringify(LABELS_COLOR_MAP))

     data = [];

     counter = 0

     Object.keys(LABELS_COLOR_MAP).forEach(function(key) {
         var label = key
         var color = LABELS_COLOR_MAP[key]

         var current_label_info = filter_project_json_by_label(key)

         var label_id = current_label_info['label_id']

         // Attributes for each label...can use this information in the future
         var original_image_urls = current_label_info['original_image_urls']
         var all_jpeg_image_urls = current_label_info['all_jpeg_image_urls']
         var cropped_image_urls = current_label_info['cropped_image_urls']
         var augmentation_image_urls = current_label_info['augmentation_image_urls']

         var labelled_original_image_urls = current_label_info['labelled_original_image_urls']
         var labelled_all_jpeg_image_urls = current_label_info['labelled_all_jpeg_image_urls']
         var labelled_cropped_image_urls = current_label_info['labelled_cropped_image_urls']
         var labelled_augmentation_image_urls = current_label_info['labelled_augmentation_image_urls']

         var original_image_label_jsons = current_label_info['original_image_label_jsons']
         var all_jpeg_image_label_jsons = current_label_info['all_jpeg_image_label_jsons']
         var augmentation_image_label_jsons = current_label_info['augmentation_image_label_jsons']

         var number_original_images = current_label_info['original_image_urls'].length
         var number_all_jpeg_images = current_label_info['all_jpeg_image_urls'].length
         var number_cropped_images = current_label_info['cropped_image_urls'].length
         var number_augmentation_images = current_label_info['augmentation_image_urls'].length

         var number_labelled_original_image_urls = current_label_info['labelled_original_image_urls'].length
         var number_labelled_all_jpeg_image_urls = current_label_info['labelled_all_jpeg_image_urls'].length
         var number_labelled_cropped_image_urls = current_label_info['labelled_cropped_image_urls'].length
         var number_labelled_augmentation_image_urls = current_label_info['labelled_augmentation_image_urls'].length

         var original_image_label_jsons = current_label_info['original_image_label_jsons']
         var all_jpeg_image_label_jsons = current_label_info['all_jpeg_image_label_jsons']
         var augmentation_image_label_jsons = current_label_info['augmentation_image_label_jsons']
         var date_created = current_label_info['date_created']
         var date_modified = current_label_info['date_modified']
        
         var data_element = {"index": counter, "label": label,"color": color, 
                             "num_images": number_original_images, "labeled_images": "", 
                             "all_labeled_true_false": "", "project_id": ACTIVE_PROJECT_JSON['project_js_id'],
                             "project_name": ACTIVE_PROJECT_JSON['project_name'], "user_id": ACTIVE_PROJECT_JSON['user_id'], 
                             "ISODate": date_created, "date_created": date_created, 
                             "original_image_urls": original_image_urls,"all_jpeg_image_urls": all_jpeg_image_urls}
   
         data.push(data_element)
         
         counter += 1;

     })
    // alert(' Line 1895 data obect ' + JSON.stringify(data))   

     // Update Page

     updatePage()

     //alert(' Line 1901 data obect - confirmation that it gets past the updatePage() function ')   
     //alert(' Line 1887 - this is the first gate I see')   

     //show_label_buckets()
     new_create_label_buckets(data)








     function new_create_label_buckets(data){

        for (var i = 0; i < data.length; i += 4) {
    
            var new_row = document.createElement('div')
            new_row.className="row"
    
            //for (var k = i; k <= i+4; k += 1){
    
            var new_card = NewLabelBucketCard(data[i])
            new_row.appendChild(new_card)
    
            var new_card2 = NewLabelBucketCard(data[i+1])
            new_row.appendChild(new_card2)
    
            var new_card3 = NewLabelBucketCard(data[i+2])
            new_row.appendChild(new_card3)
    
            var new_card4 = NewLabelBucketCard(data[i+3])
            new_row.appendChild(new_card4)
    
            //}
    
            document.getElementById('cropped_images_label_buckets_container').appendChild(new_row)
    
        }
    
    }
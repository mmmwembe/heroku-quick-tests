

function create_new_table_row(index, data){

    var position = index + 1
    var project_id = data.project_id ? data.project_id : ""
    var project_name = data.project_name ? data.project_name : ""
    var new_table_row =''

    alert('position ' + position + ' project id ' + project_id + ' project name ' + project_name)  


     // Adding a row inside the tbody.
        $('#myModalProjectsTable').append(
              `<tr id="${position}">
                <td>${project_id}</td>
                <td>${project_id}</td>
                <td>${project_id}</td>
                <td>
                    <button class="btn btn-danger remove"type="button">Remove</button>
                </td>
                </tr>`);


    /*
    var new_table_row = `<tr> 
                            <th scope="row">${position}</th>
                                <td> ${ project_id } </td>
                                <td> ${ project_id } </td>
                                <td> ${ project_id } </td>
                                <td>
                                    <button id="delete_project_btn" data-projectID="${project_id}" type="button" class="btn btn-danger" onclick="DeleteProject(${project_id})"><i class="far fa-trash-alt"> Delete </i></button>
                                    <button id="open_project_btn"  data-projectID="${project_id}" type="button" class="btn btn-success" onclick="OpenProject(${project_id})"><i class="fas fa-edit"></i> Open Project</button>       
                                </td>
                        </tr>` 


        alert('html string created : ' + new_table_row)    
     */


        return new_table_row

    

}


function add_rows_to_table(data_array){

    for (var i = 0; i < data_array.length; i += 1) {

        var table_row  = document.createElement('tr'); 

        data = data_array[i]

        new_table_row_string = create_new_table_row(i, data)

        //alert(new_table_row_string)
        table_row.innerHTML = new_table_row_string

        var projects_tbody = document.getElementById('xProjectsTable').getElementsByClassName('xProjectsTableClass')[0]; //getElementById('myModalProjectsTable');

        /// document.getElementById('myModalProjectsTable').appendChild(new_table_row_string)
        projects_tbody.appendChild(table_row)// 
            
    }

}

function add_rows_to_table2(data_array){

    var table_rows_strings=''

    for (var i = 0; i < data_array.length; i += 1) {

        var table_row  = document.createElement('tr'); 

        data = data_array[i]

        new_table_row_string = create_new_table_row(i,data)

        table_rows_strings  += new_table_row_string + '\n'
            
    }

    //myProjectsModal.getElementById('xProjectsTable').getElementsByTagName('tbody')[0].innerHTML = table_rows_strings;
    alert('html string ' + table_rows_strings)
    
   (table_rows_strings,length > 0) ?  

    document.getElementById('xProjectsTable').tBodies[0].innerHTML = table_rows_strings

    : ""

}

all_data =[{day: 1, article_name: "Bootstrap 4 CDN and Starter Template", author: "Cristina" , shares: 2.846, button_name : 1},	
	       {day: 2, article_name: "Bootstrap Grid 4 Tutorial and Examples", author: "Cristina",  shares: 2458.6, button_name : 2},
	       {day: 3, article_name: "Bootstrap 5 CDN and Starter Template", author: "Munyaz"  ,shares: 100.23, button_name : 3},
	       {day: 4, article_name: "Bootstrap 8  CDN and Starter Template", author: "Munyaz" , shares: 200.1, button_name : 4}]


// add_rows_to_table(all_data)

function create_new_table_row_X(data){

    var new_table_row = data.day ?
                        `<tr>
                             <th scope="row">${data.day ? data.day : ""}</th>
                            <td>${data.article_name ? data.article_name : ""}</td>
                            <td>${data.author ? data.author : ""}</td>
                            <td>${data.shares ? data.shares: ""}</td>
                            <td>
                                <button id="delete_project_btn"  data-projectID="${data.day ? data.day : ""}" type="button" class="btn btn-danger" onclick="DeleteProject(${data.day})"><i class="far fa-trash-alt"> Delete </i></button>
                                <button id="open_project_btn"  data-projectID="${data.day ? data.day : ""}" type="button" class="btn btn-success" onclick="OpenProject(${data.day})"><i class="fas fa-edit"></i> Open Project</button>       
                            </td>
                        </tr>`  : ""
        return new_table_row

}


   function add_rows_to_table_X(data_array){

    var table_rows_strings=''

    for (var i = 0; i < data_array.length; i += 1) {

        var table_row  = document.createElement('tr'); 

        data = data_array[i]

        new_table_row_string = create_new_table_row_X(data)

        table_rows_strings  += new_table_row_string + '\n'

        //alert(new_table_row_string)
        // table_row.innerHTML += new_table_row_string + '\n'

        // var tbody = document.getElementById('xProjectsTable').getElementsByTagName('tbody')[0];

        /// document.getElementById('myModalProjectsTable').appendChild(new_table_row_string)
        //tbody.appendChild(table_row)// 
            
    }

    document.getElementById('xProjectsTable').tBodies[0].innerHTML = table_rows_strings

}





        // $.post( "/choose_project", { user_id: user_id } );

      /*
        $.ajax({
            type: "POST",
            url: '/get_user_projects',
            data: {},
            success: function(data) {

                var all_user_projects = data.all_projects
                var num_projects = all_user_projects.length


                // var summary_projects_data =[]

                //for(var k in all_user_projects) {

                    // var project = all_user_projects[k]

                    // alert(' project_id ' + project.project_js_id)
                    // alert(' k ' + k + ' all_user_projects ' + JSON.stringify(all_user_projects[k]));

                    //var project_item = {'project_js_id': project.project_js_id, 'project_name': project.project_name} //, 'user_id': project.user_id, 'date_created': project.date_created, 'date_modified': project.date_modified,'labels': labels}
                    //alert('project item : ' + JSON.stringify(project_item) )
                    //alert()
                 //}

                //alert('number of projects : ' + JSON.stringify(data.all_projects))
                // Open the Modal that will show the table


                add_rows_to_table2(all_user_projects)
                myProjectsModal.toggle()

                //add_rows_to_table(all_user_projects)


            }         
        });

       */





        
    $('#save_button').click( updatePage );


function updatePage(){     

    // Hide the textarea
    $("#labels_textarea").attr("style", "display: none !important");
    $("#save_button").attr("style", "display: none !important");
    $("#cancel_button").attr("style", "display: none !important");
    $("#currentLabel").attr("style", "display: !important");
    $("#addOrEdit_button").attr("style", "display:  !important");
    // Create or Update the Label divs

    $("#labels-error-message").html("")

    updateLabelDivs()

    // Select the first label as the initial label
    chooseInitialLabel()

    // Show the first image from the thumbnails the main image
    showFirstImage()

    // Add labels_color_map to project_json and post information to server
    AddLabels_Color_Map_to_Project_JSON()

    $("#labels-error-message").html("")

}





function addNewLabel(){

    const newlabelClassItem = document.createElement('div')
    newlabelClassItem.className ="labelclass"
    newlabelClassItem.id = current_label
    newlabelClassItem.style= "border: 3px solid " + current_color + " z-index: 2; background-color: transparent;  margin : 2px; border-radius: 10px; height: 35px;  width: 150px;";
    newlabelClassItem.style.fontSize = "16";
    newlabelClassItem.innerHTML ="<strong> "+ current_label + " </strong>";
    newlabelClassItem.onclick = showSelectedLabel // function shows the selected label by highlighting background with the bordercolor
    
    parentLabelClassItem.append(newlabelClassItem)
    

}


function NewCard(){

    const newCardParent = document.createElement('div')
    newCardParent.className ="col card h-100 mb-3 w-15"
    newCardParent.style= "margin-top: 10px; margin-right: 5px; margin-bottom: 20px; border: 5px solid blue;";


    const h5 = document.createElement('h5')
    h5.className ="card-header d-flex justify-content-between align-items-center;"

    const checkmark_div = document.createElement('div')
    checkmark_div.id = "labeling_complete"
    checkmark_div.innerHTML ="&#x2705;";
    h5.append(checkmark_div)

    const cardBody = document.createElement('div')
    cardBody.className ="card-body"

    const h2 = document.createElement('h2')
    h2.className ="card-title"
    h2.innerHTML ="";

    const p1 = document.createElement('p')
    p1.className ="card-text"
    p1.innerHTML ="";

    const p2 = document.createElement('p')
    p2.className ="card-text"
    p2.innerHTML ="Number of Images:";

    const p3 = document.createElement('p')
    p3.className ="card-text"
    p3.innerHTML ="Labelled Images:";

    const p4 = document.createElement('p')
    p4.className ="card-text"

    const small_1 = document.createElement('small')
    small_1.className ="text-muted"
    small_1.innerHTML ="";
    p4.append(small_1)  

    const show_thumbnails_div = document.createElement('div')

    const input_1 = document.createElement('input')
    input_1.type ="submit"
    input_1.id ="showThumbnails";
    input_1.value ="Show Images";
    input_1.style="margin-left: 0px; width: 100%; height: 50px; margin-bottom: 20px; border: 5px solid green;"

    const input_2 = document.createElement('input')
    input_2.type ="hidden"
    input_2.id ="current_folder";
    input_2.value ="current label";
    input_2.name ="current_folder";

    const input_3 = document.createElement('input')
    input_3.type ="hidden"
    input_3.id ="project_id";
    input_3.value ="project js id";
    input_3.name ="project id";

    show_thumbnails_div.append(input_1)     
    show_thumbnails_div.append(input_2)  
    show_thumbnails_div.append(input_3)  


    const input_group = document.createElement('div')
    input_group.className ="input-group"

    const input_1x = document.createElement('input')
    input_1x.type ="file"
    input_1x.id ="imageLoader-101";
    input_1x.type ="upload_images_project_label[]"
    input_1x.multiple = true;
    input_1x.autocomplete = true;
    input_1x.required =true;

    const atag_imgs_upload = document.createElement('a')
    atag_imgs_upload.href ="/upload?a=100&b=500"
    atag_imgs_upload.className ="btn btn-success"
    atag_imgs_upload.id ="upload-images-anchor-btn-001";
    atag_imgs_upload.setAttribute("label","0000128238732")
    atag_imgs_upload.setAttribute("project_id","current_folder")
    atag_imgs_upload.innerHTML ="Upload Images";

    const input_2x = document.createElement('input')
    input_2x.className ="btn  btn-info xUploadImagesBtnClass"
    input_2x.type ="submit"
    input_2x.id ="uploadImagesButton-001";
    input_2x.value ="Upload Images";
    input_2x.style="margin-left: 0px;"
    input_2x.setAttribute("project_id","0000128238732")
    input_2x.setAttribute("current_folder","current_folder")
    input_2x.onclick = uploadButtonAction($(this).attr('id'))

    const input_3x = document.createElement('input')
    input_3x.type ="hidden"
    input_3x.id ="current_folder";
    input_3x.value ="current label";
    input_3x.name ="current_folder";

    const input_4x = document.createElement('input')
    input_4x.type ="hidden"
    input_4x.id ="current_folder";
    input_4x.value ="images-for-labeling";
    input_4x.name ="which-form";

    input_group.append(input_1x)
    input_group.append(atag_imgs_upload)
    input_group.append(input_2x)
    input_group.append(input_3x)
    input_group.append(input_4x)

    const cardFooter = document.createElement('div')
    cardFooter.className ="card-footer"

    const atag = document.createElement('a')
    atag.href ="/atagDelete?a=100&b=500"
    atag.className ="btn btn-danger xDeleteButtonClass"
    atag.id ="deleteLabelButton-001";
    atag.setAttribute("label","0000128238732")
    atag.setAttribute("project_id","current_folder")
    atag.innerHTML ="Delete";

    const small_1x = document.createElement('small')
    small_1x.className ="text-muted"
    small_1x.innerHTML ="Delete all images & labels";
    atag.append(small_1x)  

    cardFooter.append(input_group)

    newCardParent.append(h5)
    newCardParent.append(cardBody)    
    newCardParent.append(h2)
    newCardParent.append(p1)
    newCardParent.append(p2)
    newCardParent.append(p3)    
    newCardParent.append(p4)            
    newCardParent.append(show_thumbnails_div)
    newCardParent.append(input_group)
    newCardParent.append(atag)
}



NewCard()






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
$(document).ready(function() {

    $('.cropButton').on('click', function(event) {

        alert('You clicked the crop button!!!')

        // event.preventDefault();


        // var member_id = $(this).attr('member_id');

           // var name = $('#nameInput'+member_id).val();
           // var email = $('#emailInput'+member_id).val();

           // req = $.ajax({
               // url : '/update',
               // type : 'POST',
               // data : { name : name, email : email, id : member_id }
           // });

           // req.done(function(data) {

              //  $('#memberSection'+member_id).fadeOut(1000).fadeIn(1000);
              //  $('#memberNumber'+member_id).text(data.member_num);

        //});
    

    });


    // https://codepen.io/subhasishwebdev/pen/jyOeya






        var canvas = new fabric.Canvas('canvas');

        var line, isDown, startPosition={}, rect,drawingMode=true;


        canvas.on('mouse:down', function(event){
        if (!drawingMode) return;
            isDown = true;
            console.log(event.e.clientX,event.e.clientY);
            startPosition.x=event.e.clientX;
            startPosition.y=event.e.clientY;
            console.log(startPosition);
                rect=new fabric.Rect({
                    left:event.e.clientX,
                    top:event.e.clientY,
                    width:0,
                    height:0,
                    stroke:'red',
                    strokeWidth:3,
                    fill:''
                });
                canvas.add(rect);
        });
        canvas.on('mouse:move', function(event){
            if (!isDown || !drawingMode) return;
            rect.setWidth(Math.abs( event.e.clientX-startPosition.x ));
            rect.setHeight(Math.abs( event.e.clientY -startPosition.y ));
            canvas.renderAll();
        });
        canvas.on('mouse:up', function(){
            isDown = false;
            canvas.add(rect);
        });
        canvas.on('object:selected', function(){
            drawingMode = false;
        });
        canvas.on('object:selected', function(){
            drawingMode = false;
        });
        canvas.on('selection:cleared', function(){
            drawingMode = true;
        });








});
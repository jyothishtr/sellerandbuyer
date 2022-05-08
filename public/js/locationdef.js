$(document).ready(function(){
//alert("Hello world");
    fill_parent_category();
  
    fill_treeview();
    


    


    function fill_treeview()
    {
     $.ajax({
      url:"/locdef/populate",
      dataType:"json",
      success:function(data){
       $('#treeview').treeview({
        data:data   
       });
      }
     })
    }
  
    function fill_parent_category()
    {
     $.ajax({
      url:'/locdef/parent',
      success:function(data){
       $('#parent_category').html(data);
      }
     });
     
    }
  
    $('#treeview_form').on('submit', function(event){
     event.preventDefault();
     $.ajax({
      url:"add.php",
      method:"POST",
      data:$(this).serialize(),
      success:function(data){
       fill_treeview();
       fill_parent_category();
       $('#treeview_form')[0].reset();
       alert(data);
      }
     })
    });
   });
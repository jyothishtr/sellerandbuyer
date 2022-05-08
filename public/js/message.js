$(document).ready(function() { 
       
    $.ajax({
        type: 'POST',
        url: '/suppliers/filter',
        data:{
            companyName : companyName,contactPerson:contactPerson,phoneNumber:phoneNumber
        },
        dataType: 'json',
        success: function(data){
    
           // console.log(data);
            $('tbody').empty();
    
            data.forEach(element => {
             //  console.log(element);
                $('tbody').append('<tr><td>'+element.companyname+'</td><td>'+element.contactperson+'</td><td>'+element.contactnumber+'</td><td width = "20%">'+
               ' <a class="btn btn-xs btn-warning custom" href="/suppliers/'+element.id+'/edit"> Edit</a>'+
                '<form id="delete-form" action="/suppliers/'+element.id+'?_method=DELETE" method="POST" style="float: left; ">'+
                 ' <input type="submit" class="btn btn-xs btn-danger custom" value="Delete">'+
                '  </form></td></tr>');
        
        
      });
    
       }
    });
    
       
    
     });
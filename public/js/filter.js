

   $(document).ready(function() { 
   
 
alert("HELLO");
   function reloadOnChange(){

    var companyName = $('#name').val();
    var contactPerson = $('#contactperson').val();
    var phoneNumber = $('#phonenumber').val();
   
   


   // console.log(JSON.stringify(filterObj));
//     $.ajax({
//         url: '/suppliers/filter',
//         method: 'POST',
//         data: { filterObj: filterObj }
//         }).done(function(res) {
//             if (res.success) {
//             console.log('id from ajax call is', res);
//             window.location.reload();
//         } else {
//             console.log('error...ajax');
//             }
//    });

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
} 
  function callback(){
console.log("Success");
   }

  
    $('select').on('change',function(){
        reloadOnChange();

 });

 });
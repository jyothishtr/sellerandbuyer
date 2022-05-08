//alert("Hello world");


$(document).ready(function() { 
    $('#print').addClass('inactive');
    $("#new").addClass('inactive');

    $(document).keypress(function(key) {
       if(key.which == 13){
           return false;
       }
        console.log( "Handler for .keypress() called." );
      });
$('#assetCreation').submit(function(e){
    e.preventDefault();
    
    
    var assetName = $('#assetName').val();
    var category = $('#category').val();
    var location = $('#location').val();
    
    var purchaseDate = $('#purchaseDate').val();
    purchaseDate =  (purchaseDate == '') ? '0000-00-00' :purchaseDate;
   // alert(purchaseDate);
    var quantity = $('#quantity').val();
   
   
    $.ajax({
        type: 'POST',
        url: '/atms/test',
        data:{
            assetName : assetName,category:category,location:location,purchaseDate:purchaseDate,quantity:quantity
        },
        dataType: 'json',
        success: function(data){
        
           // console.log(data);
            $('tbody').empty();
            $('#new').removeClass('inactive');
            $('#print').removeClass('inactive');
            data.forEach(element => {
             //  console.log(element);
                $('tbody').append('<tr><td>'+element.assetname+'</td><td>'+element.barcode+'</td><td width = "20%">'+
               '  <span   id= "btn'+element.keyvalue+'" class="commonbutton btn btn-primary ">Print</span>'+
                '</td></tr>');
        
        
      });
    
       }
    });


})

$('#print').click(function(){
    
    var barcode =[];
    var assetname = [];
    var table = $("tbody");
    //alert(JSON.stringify($('#table')));
    table.find('tr').each(function (i, el) {
        var $tds = $(this).find('td');  
           // productId = $tds.eq(0).text(),
           name = $tds.eq(0).text();
           code = $tds.eq(1).text();
           assetname.push(name);
           barcode.push(code);
           
           // Quantity = $tds.eq(2).text();
            
        // do something with productId, product, Quantity
    });
    stringcreator(barcode,assetname);
})

$("tbody tr").click(function() {
    
    alert("Hello");
//     var $item = $(this).closest("tr")   // Finds the closest row <tr> 
//                        .find(".nr")     // Gets a descendent with class="nr"
//                        .text();         // Retrieves the text within <td>
// alert($item);

   // $("#resultas").append($item);       // Outputs the answer
});


function stringcreator(barcode,assetname){
  //alert(assetname.length);
//  var zpl1= "^XA^FT15,95^XGLOGO.GRF,1,1^FS^FS^FO30,110^A015,20^FD";
//  var zpl2="^FS^BY2,2.0^FO30,135^B3N,N,60,Y,N^FD";
//  var zpl3="^FS^XZS";

 var zpl1= "^XA\n^FT15,95^XGLOGO.GRF,1,1\n^FS^FS^FO30,110^A015,20^FD";
 var zpl2="^FS\n^BY2,2.0^FO30,135^B3N,N,60,Y,N^FD";
 var zpl3="^FS\n^XZS";

 var zpl="";


  for(var i =  0;i<parseInt(assetname.length);i++){
    //alert(assetname[i]);  alert(barcode[i]);

    var line = zpl1.concat(assetname[i],zpl2,barcode[i],zpl3);
      zpl=zpl.concat('\n',line);
      
      //alert(zpl);
  }
  printZpl(zpl);
}

function printZpl(zpl) {
// alert(zpl);
console.log(zpl);
    var printWindow = window.open();
    printWindow.document.open('text/plain')
    printWindow.document.write(zpl);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    if(!isChrome){
      printWindow.close();
    }
  
  }
 

    $('tbody').on('click','span',function(){
        //alert(JSON.stringify(this));
     //   var row =  this.parent().parent();
     //   $(this).closest('tr').children('td.two').text();
     var name = $(this).closest('tr').find('td:eq(0)').text()
     var code =$(this).closest('tr').find('td:eq(1)').text();
    // alert(name)
   // alert(typeof(code));
    var assetname1=[];
    var barcode1 = [];
     assetname1.push(name);
     barcode1.push(code);
  //  alert(typeof(assetname1));
  //  alert(barcode1);
    
     stringcreator(barcode1,assetname1);
    })


  });
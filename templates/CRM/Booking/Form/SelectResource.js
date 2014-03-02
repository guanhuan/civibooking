var basket = {};
var subTotal = 0.00;

function show_minical(){
  if (scheduler.isCalendarVisible()){
    scheduler.destroyCalendar();
  }else{
    scheduler.renderCalendar({
      position:"dhx_minical_icon",
      date:scheduler._date,
      navigation:true,
      handler:function(date,calendar){
        scheduler.setCurrentView(date);
        scheduler.destroyCalendar();
      }
    });
  }
}

cj(function($) {
  scheduler.locale.labels.timeline_tab = "Timeline";
  scheduler.config.show_loading = true;
  scheduler.config.full_day = true;
  scheduler.config.details_on_create = true;
  scheduler.config.details_on_dblclick = false;
  scheduler.config.collision_limit = 1; //allows creating 1 events per time slot
  scheduler.config.xml_date="%Y-%m-%d %H:%i";

  if(bookingSlotDate){
    var momentDate = moment(bookingSlotDate, "YYYY-M-D HH:mm");
    var date = momentDate.toDate();
  }else{
    var date = new Date();  //today date
  }

  scheduler.init("resource_scheduler", date ,"timeline");
  scheduler.setLoadMode("day");

  if(bookingId){
    var url = [CRM.url('civicrm/booking/ajax/slots'), '?booking_id=',bookingId].join('');
  }else{
    var url = CRM.url('civicrm/booking/ajax/slots');
  }
  scheduler.load(url,"json");

  //prevent lightbox changing
  scheduler.attachEvent("onBeforeDrag", function(id){
    var evObj = scheduler.getEvent(id);

    if(!_.isUndefined(evObj) && !_.isUndefined(evObj.booking_id) && !_.isNull(evObj.booking_id) && evObj.booking_id != bookingId){
      //console.log("Not Allow");
      evObj.readonly = true;
      return false;   //not allow
    }else{
      //console.log("Allow");
      if(!_.isUndefined(evObj)){
        evObj.readonly = false;
      }
      return true;  //allow
    }
  });

  //when edit lightbox
	scheduler.attachEvent("onEventChanged", function(event_id, ev){
    var resourceLabel = $("div[event_id="+event_id+"]").parent().parent().parent().find(".dhx_scell_name").html(); //get resource label from position of lightbox
    var resourceId = ev.resource_id;
    var selectedItem = getItemInBasket(ev.id);  //get item in basket
    if(_.isUndefined(ev.booking_id)){ //new item?
      var lightboxText = [resourceLabel, " - ", ts("New")].join("");
      selectedItem.text = lightboxText;
      ev.text = lightboxText;
    }
    selectedItem.label = resourceLabel;
    selectedItem.resource_id = resourceId;
    selectedItem.start_date = moment(ev.start_date).format("YYYY-M-D HH:mm:ss");
    selectedItem.end_date = moment(ev.end_date).format("YYYY-M-D HH:mm:ss");
    selectedItem.is_updated = true;
    basket[ev.id] = selectedItem;   //update item in basket
    updateBasketTable(selectedItem);  //render ui
  });

  //custom validator for start time and end time
  $.validator.addMethod("greaterThan", function(value, element) {

    //get the digital values of the retrieved dates
	  var startDateVals = $("#start_date").val().split("/");
	  var endDateVals = $("#end_date").val().split("/");
	  var startTimeVals = $("#start_time").val().split(":");
    var endTimeVals = $("#end_time").val().split(":");
    
    //create the date format for the retrieved dates
	  var startDate = new Date(startDateVals[2],startDateVals[0]-1,startDateVals[1],startTimeVals[0],startTimeVals[1]);
	  var endDate = new Date(endDateVals[2],endDateVals[0]-1,endDateVals[1],endTimeVals[0],endTimeVals[1]);

    var val = startDate < endDate || value == "";
    return val;
  }, ts("End date time must be after start date time"));

  //click at lightbox
  scheduler.showLightbox = function(id) {
    var ev = scheduler.getEvent(id);
    scheduler.startLightbox(id,null);
    scheduler.hideCover();

		$("#crm-booking-new-slot").dialog({
			title : ts('Add resource to basket'),
			modal : true,
			minWidth : 600,
			open : function() {
				$('#crm-booking-new-slot').html(['<div class="crm-loading-element">', ts('Loading ...'), '</div>'].join(""));
				//CiviCRM api call to set up configuration options
				CRM.api('Resource', 'get', {
					id : ev.resource_id,
					sequential : 1,
					'api.resource_config_set.get' : {
						id : '$value.set_id',
						'api.resource_config_option.get' : {
							set_id : '$value.id',
							'api.option_group.get' : {
								name : 'booking_size_unit',
							},
							'api.option_value.get' : {
								value : '$value.unit_id',
								option_group_id : '$value.api.option_group.get.value'
							}
						}
					}
				}, {
					success : function(data) {
						//insert the template so tag <form /> will work for validation
						var template = _.template(cj('#add-resource-template').html());
						$('#crm-booking-new-slot').html(template());
            //add validation
						$('#add-resource-form').validate({
							rules : {
								configuration : {
									required : true
								},
								quantity : {
									required : true,
									number : true
								},
                "end_date" : {
                  "greaterThan" : true
                },
							}
						});
						var item = getItemInBasket(id);
						if (item == null && (ev.booking_id === "undefined")) { //new item?
							$("#SelectResource :input").attr("disabled", false);
							//clear form value
							$("#price-estimate").html('0.00');
							$("#resource-note").val('');
							$("input[name='quantity']").val('');
							$("#add-resource-btn").show();
						} else {
						  //set form value
							$("#price-estimate").html(ev.price);
							$("#resource-note").val(ev.note);
							$("input[name='quantity']").val(ev.quantity);
						}

            //lock editing          
						if((ev.readonly) && (ev.booking_id != bookingId)){ //check editable slots against with bookingId
              $(".crm-booking-form-add-resource").attr("disabled", true);
              $("#add-resource-btn").hide();
            }

						var initStartDate = moment(new Date(ev.start_date));
						var initEndDate = moment(new Date(ev.end_date));
            
            //set the formatted months
						var month=new Array();
						month[0]="01";
						month[1]="02";
						month[2]="03";
						month[3]="04";
						month[4]="05";
						month[5]="06";
						month[6]="07";
						month[7]="08";
						month[8]="09";
						month[9]="10";
						month[10]="11";
						month[11]="12";
            
            //get and set the text for the datepicker text fields for the booking creating window
						var startDateTxt = [month[initStartDate.months()],"/", initStartDate.format("DD"),"/", initStartDate.years()].join("");
						var endDateTxt = [month[initStartDate.months()],"/", initStartDate.format("DD"),"/", initStartDate.years()].join("");
						$("#start_date").val(startDateTxt);
						$("#end_date").val(endDateTxt);
            
            var startTimeTxt = [initStartDate.hours() < 10 ? '0' + initStartDate.hours() : initStartDate.hours(),":",initStartDate.minute() < 10 ? '0' + 
            initStartDate.minute() : initStartDate.minute()].join("");
						var endTimeTxt = [initEndDate.hours() < 10 ? '0' + initEndDate.hours() : initEndDate.hours(), ":", initEndDate.minute() < 10 ? '0' +
            initEndDate.minute() : initEndDate.minute()].join("");
            $("#start_time").val(startTimeTxt);
						$("#end_time").val(endTimeTxt);

						var resource = data['values']['0'];
						$("#resource-label").val(resource.label);
						var options = data['values']['0']['api.resource_config_set.get']['values']['0']['api.resource_config_option.get']['values'];
						var optionsTemp = [];
						//if (ev.readonly) {
							var configId = ev.configuration_id;
							_.each(options, function(item, key) {
								if (item.id == configId) {
									item.selected = "selected";
								} else {
									item.selected = "";
								}
								optionsTemp.push(item);
							});
							options = optionsTemp;
						//}
						var template = _.template(cj('#select-config-option-template').html());

						$('#configSelect').html(template({
							options : options,
							first_option : ["- ", ts('select configuration'), " -"].join("")
						}));
					}
				});
			},
			close : function() {
        $( "#start_date" ).datepicker("destroy");
        $( "#end_date" ).datepicker("destroy");
				scheduler.endLightbox(false, null);
				$(this).dialog('destroy');
			},
		});
  };

  //Click Save - "select-resource-save"
  $(document).on("click", 'input[name="select-resource-save"]', function(e){
    e.preventDefault();
    if (!$('#add-resource-form').valid()) {
        return false;
    }
    $( "#start_date" ).datepicker("destroy");
    $( "#end_date" ).datepicker("destroy");
    
    var ev = scheduler.getEvent(scheduler.getState().lightbox_id);
    var startDateVals = $("#start_date").val().split("/");
    var endDateVals = $("#end_date").val().split("/");
    var startTimeVals = $("#start_time").val().split(":");
    var endTimeVals = $("#end_time").val().split(":");
    var startDate = new Date(startDateVals[2],startDateVals[0]-1,startDateVals[1],startTimeVals[0],startTimeVals[1]);
	  var endDate = new Date(endDateVals[2],endDateVals[0]-1,endDateVals[1],endTimeVals[0],endTimeVals[1]);
	
    var configOptionUnitId = $.trim(_.last($('#configSelect').find(':selected').html().split("/"))).toLowerCase();
    var configOptionPrice = $('#configSelect').find(':selected').data('price');

    ev.start_date = startDate;
    ev.end_date = endDate;
    ev.price = $("#price-estimate").html();
    ev.quantity = $('input[name="quantity"]').val();
    ev.quantity_display = $('input[name="quantity"]').val() + " x " + configOptionUnitId + " ("+ configOptionPrice +")";
    ev.configuration_id = $('#configSelect').val();
    ev.note = $("#resource-note").val();

    var item = getItemInBasket(ev.id);
    if(item == null){ //new item?
      ev.text = [$("#resource-label").val(), " - ", ts("New")].join("");
      ev.color = newSlotcolour;   //mark color to new item
    }
    item = createItem(ev);
    basket[ev.id] = item;

    updateBasketTable(item);
    scheduler.endLightbox(true,null);
    $("#crm-booking-new-slot").dialog('close');
  });
  
  //click cancle "select-resource-cancel"
  $(document).on("click", 'input[name="select-resource-cancel"]', function(e){
    $( "#start_date" ).datepicker("destroy");
    $( "#end_date" ).datepicker("destroy");});

  //click "Remove from basket"
  $(document).on("click", ".remove-from-basket-btn", function(e){
    e.preventDefault();
    var eid = $(this).data('eid');
    delete basket[eid];
    subTotal = calculateTotalPrice();
    $('tr[data-eid=' + eid + ']').remove();
    $('#subTotal').html(subTotal.toFixed(2));
    $("#resources").val(JSON.stringify(basket));
    if(subTotal == 0 || isNaN(subTotal)){
      $('#basket-region').hide();
    }
    scheduler.deleteEvent(eid);
    CRM.alert(ts(''), ts('Resource removed'), 'success');
  });

  //Onclick "select-resource-cancel"
  $(document).on('click', 'input[name="select-resource-cancel"]', function(e){
    e.preventDefault();
    scheduler.endLightbox(false, null);
    $("#crm-booking-new-slot").dialog('close');
  });

  //adjusting "quantity"
  $(document).on('keypress keyup keydown', 'input[name="quantity"]',  function(e) {
    var price = $("#configSelect").find(':selected').data('price');
    var priceEstimate = price * $(this).val();
    if(!isNaN(priceEstimate)){
      $('#price-estimate').html(priceEstimate.toFixed(2));
    }
  });

  //Onchange "configSelect"
  $(document).on("change", 'select[name="configuration"]', function(e) {
    var val = $(this).val();
    console.log(val);
    if(val == ""){
      $('input[name="quantity"]').attr("disabled",true);
      $('#price-estimate').html(0.00);
    }else{
      $('input[name="quantity"]').attr("disabled",false);
    }
  });

  //Render basket table
  function updateBasketTable(item){
    var el =  $('tr[data-eid=' + item.id + ']');  //check item in basket table
    subTotal = calculateTotalPrice();
    if(!isNaN(subTotal)){
      var template = _.template(cj('#selected-resource-row-tpl').html());
      if(el.length){ //check object existing
        el.replaceWith(template({data: item}));
      }else{
        $('#basket-table > tbody:last').append(template({data: item})); //add new item to table
      }
      $("#resources").val(JSON.stringify(basket)); //ADD JSON object to basket
      $('#subTotal').html(subTotal.toFixed(2));
      $('#basket-region').show();
    }else{
      $('#basket-region').hide();
    }
  }

  //initiate item
	function createItem(ev) {
		var item = {
			id : ev.id,
			resource_id : ev.resource_id,
			start_date : moment(ev.start_date).format("YYYY-MM-DD HH:mm"),
			end_date : moment(ev.end_date).format("YYYY-MM-DD HH:mm"),
			label : $("#resource-label").val(),
			text : ev.text,
			configuration_id : ev.configuration_id,
			quantity : ev.quantity,
			quantity_display : ev.quantity_display,
			price : ev.price,
			note : ev.note,
			readonly : ev.readonly,
			is_updated : false,
		};
		return item;
	}

  //calculate total price in basket
  function calculateTotalPrice(){
    var priceList = $.map(basket, function(val, key) {
      return { price: val.price, quantity: val.quantity};
    });
    if(typeof priceList[0] === 'undefined'){
      return 0;
    }
    var total = 0;
    for(var i=0; i < priceList.length; ++i){
       total += parseFloat(priceList[i].price);
    }
    return total;
  }

  //check item id in basket
  function getItemInBasket(id){
    var idList = $.map(basket, function(val, key) {
      return { id: val.id};
    });
    if(typeof idList[0] !== 'undefined'){
      for(var i = 0; i<idList.length; ++i){
        if(id == idList[i].id){
          return basket[id];
        }
      }
    }
    return null;
  }

  //execute when page load
  function loadEvents(){
    if ($.trim($("#resources").val())) {
        var slots = [];
        var resources = JSON.parse($.trim($("#resources").val()));
        _.each(resources, function (item, key){
          basket[key] = item;
          item.readonly = true;
          slots.push(item);
          updateBasketTable(item);
        });
        scheduler.parse(JSON.stringify(slots),"json");
    }
  }
  $(document).ready(loadEvents);
});


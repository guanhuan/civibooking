<script id="add-resource-template" type="text/template">
<form id="add-resource-form">
   <input type="hidden" name="resource-label" id="resource-label" autofocus/>
  <div class="crm-section">
    <div class="label">
      <label>{ts}Start date time{/ts}</label>
    </div>
    <div class="content">
      <input type="text"  name="start_date"   id="start_date" size="10px" />
      <input type="text"  name="start_time"   id="start_time" size="4px" />
    </div>
    <div class="clear"></div>
  </div>

  <div class="crm-section">
    <div class="label">
      <label>{ts}End date time{/ts}</label>
    </div>
    <div class="content">
     <input type="text"  name="end_date"    id="end_date" size="10px" />
     <input type="text"  name="end_time"   id="end_time" size="4px" />
    </div>
    <div class="clear"></div>
  </div>

  <div class="crm-section">
    <div class="label">
      <label for="configuration">{ts}Configuration{/ts}</label>
    </div>
    <div class="content">
    <select name="configuration" id="configSelect" class="crm-booking-form-add-resource">
    </select>
    <span id="config-max-size"></span>
    </div>
    <div class="clear"></div>
   </div>
   <div class="crm-section">
    <div class="label">
      <label for="quantity">{ts}Quantity{/ts}</label>
    </div>
    <div class="content">
      <input type="text" name="quantity" disabled="disabled" class="crm-booking-form-add-resource"/>
    </div>
    <div class="clear"></div>

   </div>

   <div class="crm-section">
      <div class="label">
        <label for="note">{ts}Note{/ts}</label>
      </div>
      <div class="content">
        <textarea id="resource-note" class="crm-booking-form-add-resource"></textarea>
      </div>
      <div class="clear"></div>
    </div>

   <div class="crm-section">
      <div class="label">
        <label >{ts}Price estimate{/ts}</label>
      </div>
      <div class="content">
         {$currencySymbols}<span id="price-estimate">0.00</span>
      </div>
      <div class="clear"></div>
    </div>

    <div id="add-resource-btn" class="crm-submit-buttons"  >
    <span class="crm-button crm-button-type-next">
      <input class="validate form-submit default" name="select-resource-save" value="{ts}Save{/ts}" type="submit"  >
      <input class="validate form-submit default" name="select-resource-cancel" value="{ts}Cancel{/ts}" type="submit" >
    </span>
  </div>
  {literal}

  <script>
 cj(function($) {
    $( "#start_date" ).datepicker({
      changeMonth: true,
      changeYear: true
    });
    $( "#end_date" ).datepicker({
      changeMonth: true,
      changeYear: true
    });
    $('#start_time').timeEntry({show24Hours: true}).change(function() { 
      var log = $('#log'); 
      log.val(log.val() + ($('#defaultEntry').val() || 'blank') + '\n'); 
    });
    $('#end_time').timeEntry({show24Hours: true}).change(function() { 
      var log = $('#log'); 
      log.val(log.val() + ($('#defaultEntry').val() || 'blank') + '\n'); 
    });
});
</script>
{/literal}
</form>
</script>




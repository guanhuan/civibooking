<?php

require_once 'CRM/Core/Form.php';

/**
 * Form controller class
 *
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC43/QuickForm+Reference
 */
class CRM_Booking_Form_BookingDetail extends CRM_Core_Form {

  function preProcess(){
    $val = $this->controller->exportValues('AddSubResource');
   // dprint_r(json_decode($val['resources']));
  }

  function buildQuickForm() {
    parent::buildQuickForm();

    $buttons = array(
      array('type' => 'back',
        'name' => ts('<< Previous'),
      ),
      /*array(
        'type' => 'next',
        'name' => ts('Next >>'),
        'spacing' => '&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;',
        'isDefault' => TRUE,
      ),*/
      array(
        'type' => 'submit',
        'name' => ts('Save'),
      ),

    );

    $this->addButtons($buttons);

  }

  function postProcess() {
    $values = $this->exportValues();

    dprint_r($this);
    exit;

    parent::postProcess();
  }


}
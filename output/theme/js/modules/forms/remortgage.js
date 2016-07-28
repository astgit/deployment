define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for doing things when the user scrolls
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
    	jqueryui = require('jqueryui'),
    	accounting = require('accounting');
	(function() {
		var app = app || {};

		app.setUpRemortgagingCalculator = (function() {
		  
		  var error = false;
		  
		  function setUpSliders() {
		    $(".money-slider").slider({
		      range: "min",
		      value: 100000,
		      step: 50000,
		      min: 50000,
		      max: 1000000,
		      slide: function(event, ui) {
		        $(event.target).parents('.col').find('input').val(accounting.formatMoney(ui.value, '')).trigger('blur');
		      }
		    });
		    
		    $(".money-slider:eq(1)").slider({
		      value: 200000
		    });

		    $(".percent-slider").slider({
		      range: "min",
		      value: 3,
		      step: 0.1,
		      min: 1,
		      max: 8,
		      slide: function(event, ui) {
		        $(event.target).parents('.col').find('input').val(accounting.formatMoney(ui.value, '')).trigger('blur');
		      }
		    });

		    $(".percent-slider:eq(1)").slider({
		      value: 4
		    });
		  }
		  
		  function listenToInputs($parent) {
		    $parent.find('input').blur(function() {
		      var existingMortgageValue = getExistingMortgageValue(),
		          existingRateValue = getExistingRateValue(),
		          fullMortgageValue = getFullMortgageValue(),
		          remortgageRateValue = getRemortgageRateValue();
		      
		      updateSliderValue(this);
		      
		      checkFullMortgageValue();
		      
		      if(!error) {
		        calculateExistingCost(existingMortgageValue, existingRateValue);
		        calculateRemortgageCost(fullMortgageValue, remortgageRateValue);
		        
		        if(existingMortgageValue && existingRateValue && fullMortgageValue && remortgageRateValue) {
		          calculateDifferences(existingMortgageValue, existingRateValue, fullMortgageValue, remortgageRateValue)
		        }
		      }
		      
		    });
		  }
		  
		  function updateSliderValue(element) {
		    var value = accounting.formatNumber(element.value, '0', '');
		    $(element).parent().find('.ui-slider').slider("value", value);
		  }
		  
		  function getExistingMortgageValue() {
		    if($('#existing_mortgage').val() != "") {
		      var existingMortgageValue = accounting.formatMoney($('#existing_mortgage').val(), '');
		      if(existingMortgageValue == 0.00) {
		        if(!$('#existing_mortgage').hasClass('error')) {
		          $('#existing_mortgage').addClass('error').val("");
		          $('#existing_mortgage').next().after('<span class="error">Please enter a correct value.</span>')
		          error = true;
		        }
		      }
		      else {
		        $('#existing_mortgage').removeClass('error').val(existingMortgageValue);
		        $('#existing_mortgage').nextAll('span.error').remove();
		        error = false;
		        return existingMortgageValue;
		      }
		    }
		  }
		  
		  function getExistingRateValue() { 
		    if($('#existing_rate').val() != "") {
		      var existingRateValue = accounting.formatNumber($('#existing_rate').val(), '2');
		      if(existingRateValue == 0.00) {
		        if(!$('#existing_rate').hasClass('error')) {
		          $('#existing_rate').addClass('error').val("");
		          $('#existing_rate').after('<span class="error">Please enter a correct value.</span>')
		          error = true;
		        }
		      }
		      else {
		        $('#existing_rate').removeClass('error').val(existingRateValue);
		        $('#existing_rate').nextAll('span.error').remove();
		        error = false;
		        return existingRateValue;
		      }
		    }
		  }
		  
		  function getFullMortgageValue() { 
		    if($('#full_mortgage').val() != "") {
		      var fullMortgageValue = accounting.formatMoney($('#full_mortgage').val(), '');
		      if(fullMortgageValue == 0.00) {
		        if(!$('#full_mortgage').hasClass('error')) {
		          $('#full_mortgage').addClass('error').val("");
		          $('#full_mortgage').next().after('<span class="error">Please enter a correct value.</span>')
		          error = true;
		        }
		      }
		      else {
		        $('#full_mortgage').removeClass('error').val(fullMortgageValue);
		        $('#full_mortgage').nextAll('span.error').remove();
		        error = false;
		        return fullMortgageValue;
		      }
		    }
		  }
		  
		  function getRemortgageRateValue() { 
		    if($('#remortgage_rate').val() != "") {
		      var remortgageRateValue = accounting.formatNumber($('#remortgage_rate').val(), '2');
		      if(remortgageRateValue == 0.00) {
		        if(!$('#remortgage_rate').hasClass('error')) {
		          $('#remortgage_rate').addClass('error').val("");
		          $('#remortgage_rate').after('<span class="error">Please enter a correct value.</span>')
		          error = true;
		        }
		      }
		      else {
		        $('#remortgage_rate').removeClass('error').val(remortgageRateValue);
		        $('#remortgage_rate').nextAll('span.error').remove();
		        error = false;
		        return remortgageRateValue;
		      }
		    }
		  }
		  
		  function calculateExistingCost(existingMortgageValue, existingRateValue) {
		    if(existingMortgageValue && existingRateValue) {
		      var existingCost = accounting.formatMoney((accounting.formatNumber(existingMortgageValue, '2', '') / 100) * accounting.formatNumber(existingRateValue, '2', ''), '');
		      $('#existing_cost').html("£" + existingCost);
		    }
		  }
		  
		  function calculateRemortgageCost(fullMortgageValue, remortgageRateValue) {
		    if(fullMortgageValue && remortgageRateValue) {
		      var remorgageCost = accounting.formatMoney((accounting.formatNumber(fullMortgageValue, '2', '') / 100) * accounting.formatNumber(remortgageRateValue, '2', ''), '');
		      $('#remortgage_cost').html("£" + remorgageCost);
		    }
		  }
		  
		  function calculateDifferences(existingMortgageValue, existingRateValue, fullMortgageValue, remortgageRateValue) {
		    var additionalLoanAmount = accounting.formatMoney(accounting.formatNumber(fullMortgageValue, '2', '') - accounting.formatNumber(existingMortgageValue, '2', ''), '£'),
		        remorgageCost = $('#remortgage_cost').html(),
		        existingCost = $('#existing_cost').html(),
		        annualCostDifference = accounting.formatMoney(accounting.formatNumber(remorgageCost, '2', '') - accounting.formatNumber(existingCost, '2', ''), '£');
		    
		    $('#additional_loan').html(additionalLoanAmount);
		    $('#annual_cost').html(annualCostDifference);
		    
		    calculateAdditionalBorrowingRate(additionalLoanAmount, annualCostDifference);
		  }
		  
		  function calculateAdditionalBorrowingRate(additionalLoanAmount, annualCostDifference) {
		    if(accounting.formatNumber(additionalLoanAmount, '', '') > 0) {
		      var additionalBorrowingRate = accounting.formatNumber((accounting.formatNumber(annualCostDifference, '2', '') / accounting.formatNumber(additionalLoanAmount, '2', '')) * 100, '2', '');

		      $('#additional_borrowing').html(additionalBorrowingRate + "%");
		    }
		  }
		  
		  function checkFullMortgageValue() {
		    if($('#full_mortgage').val() != "")  {
		      if(parseFloat(accounting.formatNumber($('#full_mortgage').val(), '2', '')) <= parseFloat(accounting.formatNumber($('#existing_mortgage').val(), '2', '')))  {
		        if(!$('#full_mortgage').hasClass('error'))  {
		          $('#full_mortgage').addClass('error').next().after('<span class="error">Full remortgage amount must be higher than existing mortgage value.</span>')
		          error = true;
		        }
		        clearFields();
		      }
		      else {
		        $('#full_mortgage').removeClass('error');
		        $('span.error').remove();
		        error = false;
		      }
		    }
		  }
		  
		  function clearFields() {
		    $('#existing_cost').html('');
		    $('#remortgage_cost').html('');
		    $('#additional_loan').html('');
		    $('#annual_cost').html('');
		    $('#additional_borrowing').html('');
		  }
		  
		  return {
		    init: function() {
		      var $parent = $('.leftcol');
		      setUpSliders();
		      listenToInputs($parent);
		    }
		  }
		})();

	  /* Remortgaging Calculator */
	  if($('#remortgaging_calc')) {
	    app.setUpRemortgagingCalculator.init();
	  }
	})();

});
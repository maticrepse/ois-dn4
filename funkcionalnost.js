var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    
    return response.responseJSON.sessionId;
}

setInterval(function enableButton(){
	sessionId = getSessionId();

	var ime = $("#inputFirst").val();
	var priimek = $("#inputLast").val();
	var datumRojstva = $("#inputDatum").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#ustvari").addClass("disabled");
	}else{
		$("#ustvari").removeClass("disabled");
	}
}, 1);

function ustvariEHR() {
	
	sessionId = getSessionId();
	var ime = $("#inputFirst").val();
	var priimek = $("#inputLast").val();
	var datumRojstva = $("#inputDatum").val();

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#vasID").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#vasID").html('<div class="form-group has-success"><label class="control-label" for="inputSuccess">Vaš EHR ID</label><input type="text" class="form-control" id="inputSuccess"></div>');
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#inputSuccess").val(ehrId);
		                }
		            },
		            error: function(err) {
		            	$("#vasID").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


$(document).ready(function() {
    $('#selectPrimer').change(function() {
		$("#vasID").html("");
		var podatki = $(this).val().split(",");
		$("#inputFirst").val(podatki[0]);
		$("#inputLast").val(podatki[1]);
		$("#inputDatum").val(podatki[2]);
	});
});
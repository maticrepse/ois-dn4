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
	
	var ehrId = $("#inputID").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#vnesen").addClass("disabled");
	}else{
		$("#vnesen").removeClass("disabled");
	}
}, 1);

function vnesenEHRID() {
	sessionId = getSessionId();
	var ehrId = $("#inputID").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#profilIDneuspesen").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#profilID").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				$("#profilID").html('<section class="container-fluid" id="section4"><div class="container"><div class="row"></div></div></section>');
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
				$("#neviden").click();
				
			},
			error: function(err) {
				$("#profilIDneuspesen").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}

function ustvariEHR() {
	
	sessionId = getSessionId();
	var ime = $("#inputFirst").val();
	var priimek = $("#inputLast").val();
	var datumRojstva = $("#inputDatum").val();
	var spol;
	if($("#optionsRadios1").checked){
		spol="MALE";
	}else if($("#optionsRadios2").checked){
		spol="FEMALE";
	}else if($("#optionsRadios3").checked){
		spol="OTHER";
	}else{
		spol="UNKNOWN";
	}
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
		            gender: spol,
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
	$('#selectPrimerID').change(function() {
		$("#profilID").html("");
		$("#inputID").val($(this).val());
	});
});
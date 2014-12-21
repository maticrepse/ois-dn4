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

	var inputMeritve = $("#selectMeritev").val();

	if (!inputMeritve) {
		$("#preberiMeritve").addClass("disabled");
	}else{
		$("#preberiMeritve").removeClass("disabled");
	}
}, 1);

function vnesenEHRID() {
	sessionId = getSessionId();
	var ehrId = $("#inputID").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#profilIDneuspesen").html('<div class="alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>Prosim vnesite zahtevan podatek</div>');
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#profilID").load("profil.html");
				
				$("#profilID").html('<section class="container-fluid" id="section4"><div class="container"><div class="row"></div></div></section>');
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
				$("#neviden").click();
				idProfila = ehrId;
				imeProfila = party.firstNames;
				priimekProfila = party.lastNames;
				letoProfila = parseInt(party.dateOfBirth.substring(0,4));
				mesecProfila = parseInt(party.dateOfBirth.substring(5,7));
				danProfila = parseInt(party.dateOfBirth.substring(8,10));
				today = new Date();
				currentTime = today.getFullYear() + "-"+(today.getMonth()+1)+"-"+today.getDate()+"T"+today.getHours()+":"+today.getMinutes()+"Z";
				spolProfila = party.gender;
				if(spolProfila === "UNKNOWN"){
					spolProfila= "Neznano";
				}else if(spolProfila === "FEMALE"){
					spolProfila= "Ženska";
				}else if("OTHER" === spolProfila){
					spolProfila="Drugo";
				}else{
					spolProfila="Moški";
				}
				
				//$("#imeProfila").html('<h4 id="headerIme">&nbsp&nbsp&nbsp&nbsp' + imeProfila + '</h4>');
				//vstaviPodatek("imeProfila", imeProfila, "headerIme");
			},
			error: function(err) {
				$("#profilIDneuspesen").html('<div class="alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>Napaka "' + JSON.parse(err.responseText).userMessage + '!</div>');
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}

function vnesiPodatke() {
    $("#imeProfila").html('<h4 id="headerIme">&nbsp&nbsp&nbsp&nbsp' + imeProfila + '</h4>');
    $("#priimekProfila").html('<h4 id="headerIme">&nbsp&nbsp&nbsp&nbsp' + priimekProfila + '</h4>');
    
    $("#spolProfila").html('<h4 id="headerIme">&nbsp&nbsp&nbsp&nbsp' + spolProfila + '</h4>');
    if(mesecProfila < (today.getMonth()+1)){
    	letoProfila = today.getFullYear() - letoProfila;
    }else if (danProfila <= today.getDate() ){
    	letoProfila = today.getFullYear() - letoProfila;    	
    }else{
    	letoProfila = today.getFullYear() - letoProfila -1;    	
    }
    $("#starostProfila").html('<h4 id="headerIme">&nbsp&nbsp&nbsp&nbsp' + letoProfila + '</h4>');
}

function addChecked(cifra){
	if(cifra === 1){
		$("#optionsRadios1").addClass("checked");
		$("#optionsRadios2").removeClass("checked");
		$("#optionsRadios3").removeClass("checked");
		$("#optionsRadios4").removeClass("checked");
	}else if (cifra === 2){
		$("#optionsRadios2").addClass("checked");
		$("#optionsRadios1").removeClass("checked");
		$("#optionsRadios3").removeClass("checked");
		$("#optionsRadios4").removeClass("checked");
	}else if (cifra === 3){
		$("#optionsRadios3").addClass("checked");
		$("#optionsRadios2").removeClass("checked");
		$("#optionsRadios1").removeClass("checked");
		$("#optionsRadios4").removeClass("checked");
	}else{
		$("#optionsRadios4").addClass("checked");
		$("#optionsRadios2").removeClass("checked");
		$("#optionsRadios3").removeClass("checked");
		$("#optionsRadios1").removeClass("checked");
	}
}

function ustvariEHR() {
	
	sessionId = getSessionId();
	var ime = $("#inputFirst").val();
	var priimek = $("#inputLast").val();
	var datumRojstva = $("#inputDatum").val();
	var spol;
	if($("#optionsRadios4").hasClass("checked")){
		spol="UNKNOWN";
		console.log("unkw");
	}else if($("#optionsRadios2").hasClass("checked")){
		spol="FEMALE";
		console.log("fml");
	}else if($("#optionsRadios3").hasClass("checked")){
		spol="OTHER";
		console.log("othr");
	}else{
		spol="MALE";
		console.log("ml");
	}
	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#vasID").html('<div class="alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>Prosimo vnesite podatke.</div>');
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
		            	$("#vasID").html('<div class="alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>Napaka "' + JSON.parse(err.responseText).userMessage + '!</div>');
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}

function dodajMeritve() {
	sessionId = getSessionId();


	var datumInUra = currentTime;
	var telesnaVisina = $("#inputVisina").val();
	var telesnaTeza = $("#inputTeza").val();
	var vMetrih = parseInt(telesnaVisina)/100;
	var bodyMassIndex = parseInt(telesnaTeza)/(vMetrih*vMetrih);
	
	if(bodyMassIndex>25){
		$("#prviVideo").empty();
		$("#prviVideo").html('<div class="row"><div class="col-lg-10">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4 alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button><strong>Imate prekomerno telesno težo, predlagamo vam: </strong></div><div class="col-lg-4">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4"><iframe width="420" height="315" src="https://www.youtube.com/v/qL210_mo0fI"></iframe></div></div>');
		console.log("Video1");
	}else if(bodyMassIndex<18.5){
		$("#prviVideo").empty();
		$("#prviVideo").html('<div class="row"><div class="col-lg-10">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4 alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button><strong>Imate premajhno telesno težo, predlagamo vam: </strong></div><div class="col-lg-4">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4"><iframe width="420" height="315" src="https://www.youtube.com/v/DvFpT32VbFE"></iframe></div></div>');
		console.log("Video2");
	}else{
		$("#prviVideo").empty();
		$("#prviVideo").html('<div class="row"><div class="col-lg-10">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4 alert alert-dismissable alert-success"><button type="button" class="close" data-dismiss="alert">×</button><strong>Imate idealen indeks telesne mase, svetujemo vam:</strong></div><div class="col-lg-4">&nbsp</div></div><div class="row"><div class="col-lg-4">&nbsp</div><div class="col-lg-4"><iframe width="420" height="315" src="https://www.youtube.com/v/K-Ch9kbtLYQ"></iframe></div></div>');
		console.log("Video3");
	}
	$.ajaxSetup({
		headers: {"Ehr-Session": sessionId}
	});
	var podatki = {
		// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		"ctx/language": "en",
		"ctx/territory": "SI",
		"ctx/time": datumInUra,
		"vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		"vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		"vital_signs/body_mass_index/any_event/body_mass_index|magnitude": bodyMassIndex,
		"vital_signs/body_mass_index/any_event/body_mass_index|unit":"kg/m2"
		/*"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		"vital_signs/body_temperature/any_event/temperature|unit": "°C",
		"vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		"vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		"vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom*/
	};
	var parametriZahteve = {
		"ehrId": idProfila,
		templateId: 'Vital Signs',
		format: 'FLAT',
		committer: imeProfila + " " + priimekProfila
	};
	$.ajax({
		url: baseUrl + "/composition?" + $.param(parametriZahteve),
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify(podatki),
		success: function (res) {
			console.log(res.meta.href);
			$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		},
		error: function(err) {
			$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			console.log(JSON.parse(err.responseText).userMessage);
		}
	});

}

function izpisiTezo(){
	sessionId = getSessionId();
	var tip = $("#selectMeritev").val();
	$.ajax({
			url: baseUrl + "/demographics/ehr/" + idProfila + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				if(tip==="teza") {
					$.ajax({
						url: baseUrl + "/view/" + idProfila + "/" + "weight",
						type: 'GET',
						headers: {"Ehr-Session": sessionId},
						success: function (res) {
							if (res.length > 0) {
								var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
								for (var i in res) {
									results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].weight + " " + res[i].unit + "</td>";
								}
								results += "</table>";
								$("#preberiMeritveVitalnihZnakovSporocilo").empty();
								$("#rezultatMeritveVitalnihZnakov").empty();
								$("#rezultatMeritveVitalnihZnakov").append(results);
							} else {
								$("#rezultatMeritveVitalnihZnakov").empty();
								$("#preberiMeritveVitalnihZnakovSporocilo").empty();
								$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							}
						},
						error: function (err) {
							$("#rezultatMeritveVitalnihZnakov").empty();
							$("#preberiMeritveVitalnihZnakovSporocilo").empty();
							$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
						}
					});
				}else if(tip==="visina"){
					$.ajax({
						url: baseUrl + "/view/" + idProfila + "/" + "height",
						type: 'GET',
						headers: {"Ehr-Session": sessionId},
						success: function (res) {
							if (res.length > 0) {
								var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Telesna teža</th></tr>";
								for (var i in res) {
									results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].height + " " + res[i].unit + "</td>";
								}
								results += "</table>";
								$("#preberiMeritveVitalnihZnakovSporocilo").empty();
								$("#rezultatMeritveVitalnihZnakov").empty();
								$("#rezultatMeritveVitalnihZnakov").append(results);
							} else {
								$("#rezultatMeritveVitalnihZnakov").empty();
								$("#preberiMeritveVitalnihZnakovSporocilo").empty();
								$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
							}
						},
						error: function (err) {
							$("#rezultatMeritveVitalnihZnakov").empty();
							$("#preberiMeritveVitalnihZnakovSporocilo").empty();
							$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
						}
					});
				}else if(tip==="BMI"){
					var AQL = 
								"select "+
								    "a_a/data[at0001]/events[at0002]/time/value as time, "+
								    "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as Body_Mass_Index_magnitude, "+
								    "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/units as Body_Mass_Index_units "+
								"from EHR e[e/ehr_id/value='" + idProfila + "'] " +
								"contains COMPOSITION a "+
								"contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.body_mass_index.v1] "+
								"where Body_Mass_Index_magnitude>25 or Body_Mass_Index_magnitude<18.5 "+
								"order by time desc "+
								"limit 10"
					$.ajax({
					    url: baseUrl + "/query?" + $.param({"aql": AQL}),
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>Indeks telesne mase</th></tr>";
					    	if (res) {
					    		var rows = res.resultSet;
						        for (var i in rows) {
						        	if(rows[i].Body_Mass_Index_magnitude.toFixed(2)>25){
						        		var stanje = "<span class='obvestilo label label-danger fade-in'>Prekomerna telesna teža!</span>"
						        	}else{
						        		var stanje = "<span class='obvestilo label label-danger fade-in'>Podhranjenost!</span>"
						        	}
						            results += "<tr><td>" + rows[i].time + "</td><td class='text-right'>"+stanje+"    " + rows[i].Body_Mass_Index_magnitude.toFixed(2) + " " 	+ rows[i].Body_Mass_Index_units + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}

					    },
					    error: function(err) {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});
				}
	    	},
			error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
	});
}

function switchTab(niz){
	if(niz==="tab1"){
		$("#tab1Stars").addClass("active");
		$("#tab2Stars").removeClass("active");
		$("#tab3Stars").removeClass("active");
		$("#tab4Stars").removeClass("active");
		$("#tab5Stars").removeClass("active");
		$("#cont1").addClass("active in");
		$("#cont2").removeClass("active in");
		$("#cont3").removeClass("active in");
		$("#cont4").removeClass("active in");
		$("#cont5").removeClass("active in");
	}else if(niz==="tab2"){
		$("#tab2Stars").addClass("active");
		$("#tab1Stars").removeClass("active");
		$("#tab3Stars").removeClass("active");
		$("#tab4Stars").removeClass("active");
		$("#tab5Stars").removeClass("active");
		$("#cont2").addClass("active in");
		$("#cont1").removeClass("active in");
		$("#cont3").removeClass("active in");
		$("#cont4").removeClass("active in");
		$("#cont5").removeClass("active in");
	}else if(niz==="tab3"){
		$("#tab3Stars").addClass("active");
		$("#tab1Stars").removeClass("active");
		$("#tab2Stars").removeClass("active");
		$("#tab4Stars").removeClass("active");
		$("#tab5Stars").removeClass("active");
		$("#cont3").addClass("active in");
		$("#cont1").removeClass("active in");
		$("#cont2").removeClass("active in");
		$("#cont4").removeClass("active in");
		$("#cont5").removeClass("active in");
	}else if(niz==="tab4"){
		$("#tab4Stars").addClass("active");
		$("#tab1Stars").removeClass("active");
		$("#tab3Stars").removeClass("active");
		$("#tab2Stars").removeClass("active");
		$("#tab5Stars").removeClass("active");
		$("#cont4").addClass("active in");
		$("#cont1").removeClass("active in");
		$("#cont3").removeClass("active in");
		$("#cont2").removeClass("active in");
		$("#cont5").removeClass("active in");
	}else if(niz==="tab5"){
		$("#tab5Stars").addClass("active");
		$("#tab1Stars").removeClass("active");
		$("#tab3Stars").removeClass("active");
		$("#tab4Stars").removeClass("active");
		$("#tab2Stars").removeClass("active");
		$("#cont5").addClass("active in");
		$("#cont1").removeClass("active in");
		$("#cont3").removeClass("active in");
		$("#cont4").removeClass("active in");
		$("#cont2").removeClass("active in");
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
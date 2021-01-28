(function(){

	// Requirements
	if (!window.jQuery) { 
		console.error("DataDelivery requires jQuery. jQuery is not loaded!"); 
	}
	
	// Create object
	function dd(dataVarName) {
		this.dataVarName = dataVarName;
	}

	dd.prototype.deliver = function (jsonUrl, callback) {
		var v = this.dataVarName;
		jQuery.ajax({
			type: 		"get"
			,url:		jsonUrl
			,dataType: 	"json"
			,complete: function(x,t) {
			}
			,success: function(responseObj) {
				try {
					if (v.length > 0) {
						window[v] = responseObj;
					}
					//var responseObj = $.parseJSON(response);
					console.log("Ajax Success loading data");
				} catch (err) {
					alert("ERROR IN JSON DATA");
					console.error("ERROR IN JSON DATA");
					console.log(responseObj);
				}
				if (typeof callback === 'function') callback(responseObj);
			}
			,failure: function(msg) {
				console.error("Fail\n"+ msg);
			}
			,error: function(x, textStatus, errorThrown) {
				console.error("Error\n" + x.responseText + "\nText Status: " + textStatus + "\nError Thrown: " + errorThrown);
			}
		});
	}

	const component = {
		fileName: 		"DataDelivery",
		classes:		{"DataDelivery": dd},
		requirements:	[],
		description:	"DataDelivery Class, requires jquery ($)",
		credits:		"By Luke Nickerson, 2014-2015"
	};

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	} else if (window) {
		for (let className in component.classes) {
			window[className] = component.classes[className];
		}
	}
})();
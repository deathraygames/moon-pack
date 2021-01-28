const BUILDING_TYPES = {
	"H" : {
		"name": "House",
		"width": 20,
		"height": 30,
		"color": 0x775c4f,
		"residentCapacity": 1,
		"workerCapacity": 0,
		"maxBoxes": 1,
		"boxProductionRate": 0,
		"pollutionProductionRate": 0,
		"boxPrice": 1,
		"textureFilePath": "images/",
		"textureFileNameOn": "house_on.png",
		"textureFileNameOff": "house_off.png"
	},
	"A": {
		"name": "Apartment",
		"width": 42,
		"height": 60,
		"color": 0x775c4f,
		"residentCapacity": 3,
		"workerCapacity": 0,
		"maxBoxes": 1,
		"boxProductionRate": 0,
		"pollutionProductionRate": 0,
		"boxPrice": 4,
		"textureFilePath": "images/",
		"textureFileNameOn": "apartment_on.png",
		"textureFileNameOff": "apartment_off.png"
	},
	"C": {
		"name": "Coal Factory",
		"width": 60,
		"height": 50,
		"color": 0x4f5277,
		"residentCapacity": 0,
		"workerCapacity": 6,
		"maxBoxes": 3,
		"boxProductionRate": 10,
		"pollutionProductionRate": 10,
		"boxPrice": 6,
		"textureFilePath": "images/",
		"textureFileNameOn": "carbon_factory_on.png",
		"textureFileNameOff": "carbon_factory_off.png"
	},
	"S": {
		"name": "Solar Factory",
		"width": 70,
		"height": 50,
		"color": 0x4f5277,
		"residentCapacity": 0,
		"workerCapacity": 8,
		"maxBoxes": 2,
		"boxProductionRate": 6,
		"pollutionProductionRate": 0,
		"boxPrice": 12,
		"textureFilePath": "images/",
		"textureFileNameOn": "solar_factory_on.png",
		"textureFileNameOff": "solar_factory_off.png"
	}
};
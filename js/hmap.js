(function($){ 
	jQuery.fn.googleHeatMaps = function(options) {
		if (!window.GBrowserIsCompatible || !GBrowserIsCompatible())  {
		   return this;
		}
		// Utilizar defaults si no se establecen opciones
		var options = $.extend({}, $.googleHeatMaps.defaults, options);
		// Crear el mapa
		return this.each(function() {
			$.googleHeatMaps.gMap = new GMap2(this, options);
			$.googleHeatMaps.hmConfiguracion(options);
		});
	};
	
	$.googleHeatMaps = {
		latitud: '',
		longitud: '',
		factorZoom: 0,
		data: {},
		// Opciones iniciales
		defaults: {
			latitud: 19.40602,
	        longitud: -99.16990,
	        factorZoom: 13,
			scroll: true,
			layer: null
		},
		hmConfiguracion: function(opts) {
			// Geolocalizacion con direcciones postales 
			if (opts.geoLocalizacion)
			{
				geolocalizaDireccion = new GClientGeocoder();
				geolocalizaDireccion.getLatLng(opts.geoLocalizacion, function(center)
				{
					if (center)
					{
						$.googleHeatMaps.gMap.setCenter(center, opts.factorZoom);
						$.googleHeatMaps.latitud = center.x;
						$.googleHeatMaps.longitud = center.y;
					}
	      		});
			}
			else {
				// Coordenadas de Geolocalizacion
				var center 	= $.googleHeatMaps.obtenerCoords(opts.latitud, opts.longitud);
				$.googleHeatMaps.gMap.setCenter(center, opts.factorZoom);
			}
			// Controles de manejo
			$.googleHeatMaps.gMap.setUIToDefault();
			// Manipulando los datos
			
			var n 	= $.googleHeatMaps.filtrardatos(opts.data, '23/11/2011', '29/11/2011','tipo #a');

		},
		obtenerCoords: function(latitud, longitud) {
			return new GLatLng(latitud, longitud);
		},
		geoCode: function(options) {
			geolocalizaDireccion = new GClientGeocoder();
			geolocalizaDireccion.getLatLng(options.address, function(point) {
				if (point)
					$.googleMaps.gMap.setCenter(point, options.depth);
	      	});
		},
		filtrardatos: function(data,fechainicio, fechafinal,tipo) {
		    arraydatos = new Array();
		    numdatos =0;
		 	$.each(data, function(key, val) {
				$.each(val, function(k, v) {
				    //alert(v);
				    
				    if (k=='fecha'){
				      fecha=v;
				    }
				    if (k=='lat'){
				      latitud=v;
				    }
				    if (k=='lon'){
				      longitud=v;
				    }
					if (k=='tipo'){
						tipodato=v;				
  					}
				});
				
				if (((fecha>=fechainicio)&&(fecha<=fechafinal))&&(tipodato==tipo))
				{
					arraydatos[numdatos]= new Array(latitud,longitud);	
					numdatos = numdatos+1;
				}
			});
			return arraydatos;
		}
	}
})(jQuery); 
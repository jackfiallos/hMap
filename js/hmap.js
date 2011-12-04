(function(jQuery){

	jQuery.fn.googleHeatMaps = function(options) {
		if (!window.GBrowserIsCompatible || !GBrowserIsCompatible()) {
		   return this;
		}
		// Utilizar defaults si no se establecen opciones
		var options = jQuery.extend({}, jQuery.googleHeatMaps.defaults, options);		
		// Crear el mapa
		return this.each(function() {
			jQuery.googleHeatMaps.gMap = new GMap2(this, options);
			jQuery.googleHeatMaps.hmConfiguracion(options);
		});
	};
	
	jQuery.googleHeatMaps = {
		latitud: '',
		longitud: '',
		factorZoom: 0,
		mapsWidth: 0,
		mapsHeight: 0,
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
				geolocalizaDireccion.getLatLng(opts.geoLocalizacion, function(center) {
					if (center) {
						jQuery.googleHeatMaps.gMap.setCenter(center, 16/*opts.factorZoom*/);
						jQuery.googleHeatMaps.latitud = center.x;
						jQuery.googleHeatMaps.longitud = center.y;
					}
	      		});
			}
			else {
				// Coordenadas de Geolocalizacion

				var center 	= jQuery.googleHeatMaps.obtenerCoords(opts.latitud, opts.longitud);
				jQuery.googleHeatMaps.gMap.setCenter(center, 16/*opts.factorZoom*/);
				jQuery.googleHeatMaps.latitud = center.x;
				jQuery.googleHeatMaps.longitud = center.y;

			}
			
			jQuery.googleHeatMaps.gMap.addControl(new GMapTypeControl());
			jQuery.googleHeatMaps.gMap.addControl(new GLargeMapControl());


			GEvent.addListener(jQuery.googleHeatMaps.gMap, "zoomend", function() {
				jQuery.googleHeatMaps.redibujar(opts);
			});
			
			label = new ELabel(jQuery.googleHeatMaps.gMap.getCenter(), '<canvas id="carcanvas" width="' + opts.mapsWidth + '" height="' + opts.mapsHeight + '"><\/canvas>',null ,new GSize(-' + (opts.mapsWidth/2) + ', ' + (opts.mapsHeight/2) + '));
			jQuery.googleHeatMaps.gMap.addOverlay(label);
			canvas = document.getElementById("carcanvas").getContext('2d');
			jQuery.googleHeatMaps.redibujar(opts);
			// Controles de manejo
			jQuery.googleHeatMaps.gMap.setUIToDefault();
		},
		obtenerCoords: function(latitud, longitud) {
			return new GLatLng(latitud, longitud);
		},
		geoCode: function(options) {
			geolocalizaDireccion = new GClientGeocoder();
			geolocalizaDireccion.getLatLng(options.address, function(point) {
				if (point)
					jQuery.googleMaps.gMap.setCenter(point, options.depth);
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
		},
		redibujar: function (opts) {
			jQuery.googleHeatMaps.clean(canvas);
			var zoom = jQuery.googleHeatMaps.gMap.getZoom();
			zoom = Math.pow(2, zoom) / Math.pow(2, 16);
			canvas.fillStyle = "rgba(250, 0, 0, 0.8)";  

			/*var y = jQuery.googleHeatMaps.gMap.getCenter().y - 19.406145;
			var x = jQuery.googleHeatMaps.gMap.getCenter().x - -99.169807;
			var fac = 47000.0 / (1.0/zoom);			
			canvas.fillRect ((opts.mapsWidth/2) + (-x*fac), (opts.mapsHeight/2) + (y*fac) , 10, 10);*/

			a = new Array();
			a[0] = new Array();
			a[1] = new Array();
			
			a[0].push(19.40602);
			a[1].push(-99.16990);
			
			a[0].push(19.40202);
			a[1].push(-99.17090);
			
			a[0].push(19.40102);
			a[1].push(-99.17290);
				
			for (var i = 0; i < a[0].length ; i++) { 
								
				var y = $.googleHeatMaps.longitud - a[0][i];
				var x = $.googleHeatMaps.latitud - a[1][i];
				
				var fac = 47000.0 / (1.0/zoom);

				canvas.fillRect ((opts.mapsWidth/2) + (-x*fac), (opts.mapsHeight/2) + (y*fac) , 10, 10);
				
			}
			
			
			


		},
		clean: function (canvas) {
			canvas.setTransform(1, 0, 0, 1, 0, 0);
			canvas.clearRect(0, 0, 
				jQuery("#carcanvas").width(), jQuery("#carcanvas").height	
			);
		}		
	}
})(jQuery); 

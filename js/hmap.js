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
						$.googleHeatMaps.gMap.setCenter(center, 16/*opts.factorZoom*/);
						$.googleHeatMaps.latitud = center.x;
						$.googleHeatMaps.longitud = center.y;
					}
	      		});
			}
			else {
				// Coordenadas de Geolocalizacion
				var center 	= $.googleHeatMaps.obtenerCoords(opts.latitud, opts.longitud);
				$.googleHeatMaps.gMap.setCenter(center, 16/*opts.factorZoom*/);
			}
			
			
			
			$.googleHeatMaps.gMap.addControl(new GMapTypeControl());
			$.googleHeatMaps.gMap.addControl(new GLargeMapControl());

			GEvent.addListener($.googleHeatMaps.gMap, "zoomend", function() {
				$.googleHeatMaps.redibujar();
			});
			
			label = new ELabel($.googleHeatMaps.gMap.getCenter(), '<canvas id="carcanvas" width="550" height="450"><\/canvas>',null ,new GSize(-275, 225));
			$.googleHeatMaps.gMap.addOverlay(label);
			canvas = document.getElementById("carcanvas").getContext('2d');
			$.googleHeatMaps.redibujar();
			
			
			// Controles de manejo
			$.googleHeatMaps.gMap.setUIToDefault();
			// Manipulando los datos
			/*$.each(opts.data, function(key, val) {
				$.each(val, function(k, v) {
					alert(v);
				});
			});*/
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
		redibujar: function () 
		{
			
			$.googleHeatMaps.clean(canvas);
			var zoom = $.googleHeatMaps.gMap.getZoom();

			zoom = Math.pow(2, zoom) / Math.pow(2, 16);

			canvas.fillStyle = "rgba(250, 0, 0, 0.8)";  

			/* data: [
				{
					x: 19.406145, 
					y: -99.169807
				},
				{
					x: 19.406145, 
					y: -99.169807
				}, 
				{
					x: 19.406145,
					y: -99.169807
				} 
			]
			$.each(data, function(clave, valor) {
				alert(clave.x);
			}) */
			
			var y = $.googleHeatMaps.gMap.getCenter().y - 19.406145;
			var x = $.googleHeatMaps.gMap.getCenter().x - -99.169807;
			
			var fac = 47000.0 / (1.0/zoom);

	                // (19.406145,-99.169807)
			canvas.fillRect (275 + (-x*fac), 225 + (y*fac) , 10, 10);
			
		},
		clean: function (canvas) 
		{
			canvas.setTransform(1, 0, 0, 1, 0, 0);
			canvas.clearRect(0, 0, 
				document.getElementById("carcanvas").width, document.getElementById("carcanvas").height	
			);

		}		
	}
})(jQuery); 
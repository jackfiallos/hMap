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
						jQuery.googleHeatMaps.gMap.setC.enter(center, 16/*opts.factorZoom*/);
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
			
			
			/*
			GEvent.addListener(jQuery.googleHeatMaps.gMap, "move", function() {
				jQuery.googleHeatMaps.redibujar(opts);
			});
			*/
			
			
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
		filtrardatos: function(data,fechainicio, fechafinal,tipo) {
		    arraydatos = new Array();
		    numdatos =0;
		 	$.each(data, function(key, val) {
				$.each(val, function(k, v) {				    
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
				
				if (( ((fecha>=fechainicio)||(fechainicio=='')) && ((fecha<=fechafinal) ||(fechafinal=='')) ) &&
				    ((tipodato==tipo)||(tipo=='')))
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
			canvas.fillStyle = "rgba(0, 0, 200, 0.8)";  


			var a = jQuery.googleHeatMaps.filtrardatos(opts.data,'','30/11/2011','');
			
			/* a = new Array();
			a.push( new Array(19.40637, -99.16998));
			a.push( new Array(19.40602, -99.17090));
			a.push( new Array(19.40972, -99.16890)); */  
			
			
			/* for (var i = 0; i < a.length ; i++) { 
								
				canvas.fillStyle = "rgba(0, 200, 0, 0.8)";
				var latlng  = new GLatLng(a[i][0], a[i][1],true);
				var cor = jQuery.googleHeatMaps.gMap.fromLatLngToContainerPixel(latlng);
				var y = cor.y;
				var x = cor.x;
				canvas.fillRect (x, y , 10, 10);
			}*/
			
			jQuery.googleHeatMaps.pinta(a, canvas, opts);
			
			
		},
		pinta: function (a, canvas, opts) 
		{
			
			var zoom = jQuery.googleHeatMaps.gMap.getZoom();
			zoom = Math.pow(2, zoom) / Math.pow(2, 16);

			var escala = 2;
			
			var pantalla = [];			
			for (var x=0; x<opts.mapsWidth/escala; x++) {
				pantalla[x] = new Array();
				for (var y=0; y<opts.mapsHeight/escala; y++) {
					pantalla[x][y] = 0;
				}
			}
			
			
			for (var i = 0; i < a.length ; i++) {
				var latlng  = new GLatLng(a[i][0], a[i][1],true);
				var cor = jQuery.googleHeatMaps.gMap.fromLatLngToContainerPixel(latlng);
				var y = cor.y;
				var x = cor.x;
				// canvas.fillRect (x, y , 10, 10);
				pantalla[parseInt(x/escala)][parseInt(y/escala)] = 0.1;
				
			}
			
			pantalla = jQuery.googleHeatMaps.desvaneceN(40, pantalla, opts.mapsWidth/escala, opts.mapsHeight/escala);
			
			for (var x=0; x<opts.mapsWidth/escala; x++) {
				for (var y=0; y<opts.mapsHeight/escala; y++) {
					var value = pantalla[x][y];
					canvas.fillStyle = "rgba(250, 0, 0, " + value + ")"; 
					canvas.fillRect (x*escala, y*escala , escala, escala);
				}
			}
		},
		
		
		desvaneceN: function (n, pantalla, ancho, alto) {
			for (var i=0; i<n; i++) {
				pantalla = jQuery.googleHeatMaps.desvanece(pantalla, ancho, alto);	
			}
			pantalla = jQuery.googleHeatMaps.normaliza(pantalla, ancho, alto);	
			
			return pantalla;
		},
		
		desvanece: function (pantalla, ancho, alto) {
			pantalla2 = [];
			for (var x=0; x<ancho; x++){
				pantalla2[x] = new Array();
				for (var y=0; y<alto; y++){
					if (x == 0 || x == ancho-1) {
						pantalla2[x][y] = 0;
					} else if (y == 0 || y == alto-1)  {
						pantalla2[x][y] = 0;
					} else {
						
						pantalla2[x][y] = ( pantalla[x-0][y+1] + 
											pantalla[x-0][y-0] +
											pantalla[x-0][y-1] +
											pantalla[x-1][y+1] +
											pantalla[x-1][y-0] +
											pantalla[x-1][y-1] +
											pantalla[x+1][y+1] +
											pantalla[x+1][y-0] +
											pantalla[x+1][y-1] );
					}
				}
			}	
			return pantalla2;
		},
		normaliza: function(pantalla, ancho, alto) {
			var max = 0;
			var min = 1.0;
			for (var x=1; x<ancho-1; x++){
				for (var y=1; y<alto-1; y++){
					max = Math.max(max, pantalla[x][y]);
					min = Math.min(min, pantalla[x][y]);
				}
			}
			
			for (var x=1; x<ancho-1; x++){
				for (y=1; y<alto-1; y++){
					pantalla[x][y] = ((pantalla[x][y]-min) / (max-min)) * 1.0;
				}
			}
			return pantalla;
		},
		clean: function (canvas) 
		{
			canvas.setTransform(1, 0, 0, 1, 0, 0);
			canvas.clearRect(0, 0, 
				jQuery("#carcanvas").width(), jQuery("#carcanvas").height()	
			);
		}		
	}
})(jQuery); 

(function(jQuery){
	var ele;
	jQuery.fn.googleHeatMaps = function(options) {
		if (!window.GBrowserIsCompatible || !GBrowserIsCompatible()) {
		   return this;
		}
		
		ele = jQuery(this);
		
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
			this.data = opts.data;
			this.mapsWidth = opts.mapsWidth;
			this.mapsHeight = opts.mapsHeight;
			
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
				jQuery.googleHeatMaps.filtrardatos("","");
			});
			
			
			/*
			GEvent.addListener(jQuery.googleHeatMaps.gMap, "move", function() {
				jQuery.googleHeatMaps.filtrardatos("","");
			});
			*/
			
			
			label = new heatmapLayer(jQuery.googleHeatMaps.gMap.getCenter(), '<canvas id="carcanvas" width="' + opts.mapsWidth + '" height="' + opts.mapsHeight + '"><\/canvas>' ,new GSize(-' + (opts.mapsWidth/2) + ', ' + (opts.mapsHeight/2) + '));
			jQuery.googleHeatMaps.gMap.addOverlay(label);
			canvas = document.getElementById("carcanvas").getContext('2d');
			
			// Controles de manejo
			jQuery.googleHeatMaps.gMap.setUIToDefault();
			
			var timeline = jQuery('<div />');
			timeline.attr('id', 'timeline');/*.css({
				'bottom':'40px',
				'right':'10px'
			});*/
			var startDate = jQuery('<input />');
			startDate.attr({
				id:'startDate',
				type:'text'
			});
			var endDate = jQuery('<input />');
			endDate.attr({
				id:'endDate',
				type:'text'
			}).after('<br />');
			var btnAccept = jQuery('<button />');
			btnAccept.attr('id','btnaccept').text('Filtrar');
			var eslider = jQuery('<div />');
			eslider.attr('id','slider').after('<br />');
			var dateFiltered = jQuery('<div />');
			dateFiltered.attr('id','dateFiltered').text('Inicio');
			var lblfi = $('<div />');
			lblfi.css('width','80px').append('Fecha Inicial');
			var lblff = $('<div />');
			lblff.css('width','80px').append('Fecha Final');
			timeline.append(lblfi).append(startDate).append('<br />').append(lblff).append(endDate).append('<br />').append(btnAccept).append('<br /><br />').append(eslider).append('<br />').append(dateFiltered);
			ele.after(timeline);
			
			TimeLineFilters.onFilterAccept = function (startDate, endDate) {jQuery.googleHeatMaps.filtrardatos(startDate,startDate);};
		    TimeLineFilters.onSliderFilter = function (startDate, endDate) {jQuery.googleHeatMaps.filtrardatos(startDate,endDate);};
			
			// Generando el slider para mover el canvas
			jQuery.googleHeatMaps.TimeLine(startDate,endDate,"#slider",btnAccept,"#dateFiltered",new Date(), new Date());
			jQuery.googleHeatMaps.filtrardatos(new Date(), new Date());
		},
		obtenerCoords: function(latitud, longitud) {
			return new GLatLng(latitud, longitud);
		},
		filtrardatos: function(fechainicio, fechafinal) {
		    arraydatos = new Array();
		    numdatos =0;
		 	$.each(this.data, function(key, val) {
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
								
				if (( ((fecha>=fechainicio)||(fechainicio=='')) && ((fecha<=fechafinal) ||(fechafinal=='')) ) )
				{
					arraydatos[numdatos]= new Array(latitud,longitud);	
					numdatos = numdatos+1;
				}
			});
			jQuery.googleHeatMaps.redibujar(arraydatos);
		},
		redibujar: function (data) {
			
			jQuery.googleHeatMaps.clean(canvas);
			
			var zoom = jQuery.googleHeatMaps.gMap.getZoom();
			zoom = Math.pow(2, zoom) / Math.pow(2, 16);
			canvas.fillStyle = "rgba(0, 0, 200, 0.8)";  


			/*var a = jQuery.googleHeatMaps.filtrardatos('','30/11/2011','');*/
			
			jQuery.googleHeatMaps.pinta(data, canvas);
			
			
		},
		pinta: function (a, canvas) 
		{
			
			var zoom = jQuery.googleHeatMaps.gMap.getZoom();
			zoom = Math.pow(2, zoom) / Math.pow(2, 16);

			var escala = 2;
			
			var pantalla = [];			
			for (var x=0; x<this.mapsWidth/escala; x++) {
				pantalla[x] = new Array();
				for (var y=0; y<this.mapsHeight/escala; y++) {
					pantalla[x][y] = 0;
				}
			}
			
			for (var i = 0; i < a.length ; i++) {
				var latlng  = new GLatLng(a[i][0], a[i][1],true);
				var cor = jQuery.googleHeatMaps.gMap.fromLatLngToContainerPixel(latlng);
				var y = cor.y;
				var x = cor.x;
				// canvas.fillRect (x, y , 10, 10);
				if (x/escala > 0 && x/escala < this.mapsWidth) {
					if (y/escala > 0 && y/escala < this.mapsHeight) {
						pantalla[parseInt(x/escala)][parseInt(y/escala)] = 0.1;
					}
				}
				
			}
			
			pantalla = jQuery.googleHeatMaps.desvaneceN(40, pantalla, this.mapsWidth/escala, this.mapsHeight/escala);
			
			for (var x=0; x<this.mapsWidth/escala; x++) {
				for (var y=0; y<this.mapsHeight/escala; y++) {
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
		},
		TimeLine: function (startDateName, endDateName, sliderName, buttonName, dateFilteredName, startDate, endDate ) 
	    {           
	        TimeLineFilters.slider = sliderName;
	        TimeLineFilters.startDate = startDate;
	        TimeLineFilters.startDate = endDate;
	        TimeLineFilters.dateFilteredName = dateFilteredName;	        
	        startDateName.attr("value", TimeLineFilters.twoChar(startDate.getDate()) + "/" + TimeLineFilters.twoChar(startDate.getMonth()+1) + "/" + startDate.getFullYear());
	        endDateName.attr("value", TimeLineFilters.twoChar(endDate.getDate()) + "/" + TimeLineFilters.twoChar(endDate.getMonth()+1) + "/" + endDate.getFullYear());
	        
	        jQuery(function(){
	            buttonName.click(function(){TimeLineFilters.onFilter();});
	            startDateName.datepicker({
	            	dateFormat: 'dd/mm/yy',
	                onSelect: function(dateText) {TimeLineFilters.onStartDateChange(dateText);}
	            });
	            endDateName.datepicker({
	            	dateFormat: 'dd/mm/yy',
	                onSelect: function(dateText) {TimeLineFilters.onEndDateChange(dateText);}
	            });
	            jQuery(sliderName).slider({
	            	min: 1,
	                max: ((TimeLineFilters.startDate - TimeLineFilters.startDate)/1000/24/60/60+1 ),
	                change: function(event, ui) {TimeLineFilters.onSliderChange(ui.value);},
	                slide: function(event, ui) {TimeLineFilters.onSliderSlide(ui.value);}
	            });
	        });
	    }		
	}
})(jQuery); 


TimeLineFilters =
{
    startDate : new Date(),
    endDate : new Date(),
    slider : "",
    dateFilteredName : "",
    twoChar : function(value) {
    	if( value.toString().length == 1 ){
    		return "0" + value;
    	}
    	return value;
    },
    onStartDateChange : function(value){
        this.startDate = new Date(value.substr(6), value.substr(3,2)-1, value.substr(0,2), 0, 0, 0, 0);        
    },
    onEndDateChange: function(value){
        this.endDate = new Date(value.substr(6), value.substr(3,2)-1, value.substr(0,2), 0, 0, 0, 0);
    },
    onSliderChange : function(value){
        var newEndDate = new Date();
        newEndDate.setDate(this.startDate.getDate() + value - 1);
        this.onSliderFilter(this.startDate,newEndDate);
    },
    onFilter : function(){    	
        if(this.startDate > this.endDate){
            alert("La fecha inicial no debe de ser mayor a la fecha final");
            return;
        }
        jQuery(this.slider).slider({max:  ( (this.endDate - this.startDate)/1000/24/60/60+1 )});
        this.onFilterAccept(this.startDate, this.startDate);
    },
    onSliderFilter : function(startDate, endDate){
        //
    },
    onFilterAccept : function(startDate, endDate){
        //
    },
    onSliderSlide : function(value){
        var newEndDate = new Date();
        newEndDate.setDate(this.startDate.getDate() + value - 1);
        jQuery(this.dateFilteredName).text(this.twoChar(newEndDate.getDate()) + "/" + this.twoChar(newEndDate.getMonth()) + "/" + newEndDate.getFullYear());
    }
}

function heatmapLayer(point, html, pixelOffset) {
	this.point = point;
    this.html = html;
    this.pixelOffset = pixelOffset||new GSize(0,0);
} 
      
heatmapLayer.prototype = new GOverlay();

// Crear el div que representa al canvas layer
heatmapLayer.prototype.initialize = function(map) {
	var div = document.createElement("div");
    div.style.position = "absolute";
    div.innerHTML = '<div>' + this.html + '</div>' ;
    map.getPane(G_MAP_FLOAT_SHADOW_PANE).appendChild(div);
    this.map_ = map;
    this.div_ = div;
}

// Elimina el div principal del panel del mapa
heatmapLayer.prototype.remove = function() {
	this.div_.parentNode.removeChild(this.div_);
}
// Copia los datos a un nueva capa
heatmapLayer.prototype.copy = function() {
	return new heatmapLayer(this.point, this.html, this.pixelOffset);
}

heatmapLayer.prototype.redraw = function(force) {
	// Redibujar solamente si las coordenadas han cambiado
	if (!force) return;
	
	// Calcular las coord del div a partir de las 2 esquinas del limite del rectangulo del canvas
	var c1 = this.map_.fromLatLngToDivPixel(this.point);
	var c2 = parseInt(this.div_.clientHeight);
	
	// La posicion del div esta basada en las coordenadas de limites del canvas
	var p = this.map_.fromLatLngToDivPixel(this.point);
    var h = parseInt(this.div_.clientHeight);
    this.div_.style.left = (p.x + this.pixelOffset.width) + "px";
    this.div_.style.top = (p.y +this.pixelOffset.height - h) + "px";
}

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
			
			TimeLineFilters.onFilterAccept = function (startDate, endDate) {};
		    TimeLineFilters.onSliderFilter = function (startDate, endDate) {};
			
			// Generando el slider para mover el canvas
			jQuery.googleHeatMaps.TimeLine(startDate,endDate,"#slider",btnAccept,"#dateFiltered",new Date(), new Date());
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
			
			jQuery.googleHeatMaps.pinta(a, canvas);
			
			
		},
		pinta: function (a, canvas) 
		{
			var pantalla = [];
			for (var x=0; x<550; x++) {
				pantalla[x] = new Array();
				for (var y=0; y<450; y++) {
					pantalla[x][y] = 0;
				}
			}
			
			var zoom = jQuery.googleHeatMaps.gMap.getZoom();
			zoom = Math.pow(2, zoom) / Math.pow(2, 16);
			canvas.fillStyle = "rgba(250, 0, 0, 0.8)"; 
			var fac = 47000.0 / (1.0/zoom);
			
			for (var i = 0; i < a.length ; i++) {
				var latlng  = new GLatLng(a[i][0], a[i][1],true);
				var cor = jQuery.googleHeatMaps.gMap.fromLatLngToContainerPixel(latlng);
				var y = cor.y;
				var x = cor.x;
				// canvas.fillRect (x, y , 10, 10);
				
				console.log(x+" "+y);
				
				pantalla[parseInt(x)][parseInt(y)] = 1.0;
				
			}
			
			
			
			for (var x=0; x<550; x++) {
				for (var y=0; y<450; y++) {
					var value = pantalla[x][y];
					canvas.fillStyle = "rgba(250, 0, 0, " + value + ")"; 
					canvas.fillRect (x, y , 20, 20);
				}
			}
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
	        startDateName.attr("value", TimeLineFilters.twoChar(startDate.getDate()) + "/" + TimeLineFilters.twoChar(startDate.getMonth()) + "/" + startDate.getFullYear());
	        endDateName.attr("value", TimeLineFilters.twoChar(endDate.getDate()) + "/" + TimeLineFilters.twoChar(endDate.getMonth()) + "/" + endDate.getFullYear());
	        
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
        this.onFilterAccept(this.startDate, this.endDate);
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

function ELabel(point, html, classname, pixelOffset, percentOpacity, overlap) {
    // Mandatory parameters
    this.point = point;
    this.html = html;
    
    // Optional parameters
    this.classname = classname||"";
    this.pixelOffset = pixelOffset||new GSize(0,0);
    if (percentOpacity) {
      if(percentOpacity<0){percentOpacity=0;}
      if(percentOpacity>100){percentOpacity=100;}
    }        
    this.percentOpacity = percentOpacity;
    this.overlap=overlap||false;
    this.hidden = false;
  } 
  
  ELabel.prototype = new GOverlay();

  ELabel.prototype.initialize = function(map) {
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.innerHTML = '<div class="' + this.classname + '">' + this.html + '</div>' ;
    map.getPane(G_MAP_FLOAT_SHADOW_PANE).appendChild(div);
    this.map_ = map;
    this.div_ = div;
    if (this.percentOpacity) {        
      if(typeof(div.style.filter)=='string'){div.style.filter='alpha(opacity:'+this.percentOpacity+')';}
      if(typeof(div.style.KHTMLOpacity)=='string'){div.style.KHTMLOpacity=this.percentOpacity/100;}
      if(typeof(div.style.MozOpacity)=='string'){div.style.MozOpacity=this.percentOpacity/100;}
      if(typeof(div.style.opacity)=='string'){div.style.opacity=this.percentOpacity/100;}
    }
    if (this.overlap) {
      var z = GOverlay.getZIndex(this.point.lat());
      this.div_.style.zIndex = z;
    }
    if (this.hidden) {
      this.hide();
    }
  }

  ELabel.prototype.remove = function() {
    this.div_.parentNode.removeChild(this.div_);
  }

  ELabel.prototype.copy = function() {
    return new ELabel(this.point, this.html, this.classname, this.pixelOffset, this.percentOpacity, this.overlap);
  }

  ELabel.prototype.redraw = function(force) {
    var p = this.map_.fromLatLngToDivPixel(this.point);
    var h = parseInt(this.div_.clientHeight);
    this.div_.style.left = (p.x + this.pixelOffset.width) + "px";
    this.div_.style.top = (p.y +this.pixelOffset.height - h) + "px";
  }

  ELabel.prototype.show = function() {
    if (this.div_) {
      this.div_.style.display="";
      this.redraw();
    }
    this.hidden = false;
  }
  
  ELabel.prototype.hide = function() {
    if (this.div_) {
      this.div_.style.display="none";
    }
    this.hidden = true;
  }
  
  ELabel.prototype.isHidden = function() {
    return this.hidden;
  }
  
  ELabel.prototype.supportsHide = function() {
    return true;
  }

  ELabel.prototype.setContents = function(html) {
    this.html = html;
    this.div_.innerHTML = '<div class="' + this.classname + '">' + this.html + '</div>' ;
    this.redraw(true);
  }
  
  ELabel.prototype.setPoint = function(point) {
    this.point = point;
    if (this.overlap) {
      var z = GOverlay.getZIndex(this.point.lat());
      this.div_.style.zIndex = z;
    }
    this.redraw(true);
  }
  
  ELabel.prototype.setOpacity = function(percentOpacity) {
    if (percentOpacity) {
      if(percentOpacity<0){percentOpacity=0;}
      if(percentOpacity>100){percentOpacity=100;}
    }        
    this.percentOpacity = percentOpacity;
    if (this.percentOpacity) {        
      if(typeof(this.div_.style.filter)=='string'){this.div_.style.filter='alpha(opacity:'+this.percentOpacity+')';}
      if(typeof(this.div_.style.KHTMLOpacity)=='string'){this.div_.style.KHTMLOpacity=this.percentOpacity/100;}
      if(typeof(this.div_.style.MozOpacity)=='string'){this.div_.style.MozOpacity=this.percentOpacity/100;}
      if(typeof(this.div_.style.opacity)=='string'){this.div_.style.opacity=this.percentOpacity/100;}
    }
  }

  ELabel.prototype.getPoint = function() {
    return this.point;
  }
var zvMap = zvMap || {};

var MyViewModel = function() {
  var self = this;
  var map;
  var infowindow;


  self.initialize = function() {
    var pyrmont = new google.maps.LatLng(30.51853, 114.36214);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: pyrmont,
      zoom: 13
    });
    var request = {
      location: pyrmont,
      radius: 50000,
      types: ['restaurant','cafe'],
    
    };
    zvMap.request = request;
  
  }
  
  self.getNearbyPlaces = function() {
    var markers
    var callback = function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          self.createMarker(results[i]);
        }
      }
      console.log(zvMap.markers);
      markers = zvMap.markers;
      console.log(markers);
      console.log("callback:")
      console.log(self);
    }
    
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(zvMap.request, callback);
    console.log(self);
  }
  
  
  self.createMarker = function(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    zvMap.markers.push(place.name)
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }


//when click a marker, show information of the place. Data fetched from API.
}




$(window).load(function() {
  zvMap.markers = []
  zvMap.myViewModel = new MyViewModel();
  zvMap.myViewModel.initialize();
  zvMap.myViewModel.getNearbyPlaces();
  
  
  var view = function() {
      var allplaces = [];
      for (var i = 0; i < zvMap.markers.length; i++) {
        allplaces.push({name: zvMap.markers[i]})
      }
        
      var viewModel = {
          query: ko.observable('')
      };
  
      viewModel.allplaces = ko.dependentObservable(function() {
          var search = this.query().toLowerCase();
          return ko.utils.arrayFilter(allplaces, function(allplaces) {
              return allplaces.name.toLowerCase().indexOf(search) >= 0;
          });
      }, viewModel);
  
      ko.applyBindings(viewModel);
    };
    
    
    setTimeout(view,1000);
});


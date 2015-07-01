//generate the dynamic data using KO methods: observable, binding, data-bind.
function ViewModel(mapModel) {
  var self = this;

  //generate a location list.
  self.locSearchInput = ko.observable('');
  self.locationList = ko.computed(function() {
        var list = [];
        if (self.locSearchInput() === '') {
          mapModel.totallist.forEach(function(location) {
                list.push(location[0]);
            });
            mapModel.markers.forEach(function(marker) {
                marker.setMap(mapModel.map);
            });
            //console.log(list);
            return list;
        } else {
            mapModel.totallist.forEach(function(location) {
                if (location[0].toLowerCase().indexOf(self.locSearchInput().toLowerCase()) >= 0) {
                    list.push(location[0]);
                }
            });
            mapModel.markers.forEach(function(marker) {
                if (list.indexOf(marker.title) >= 0) {
                    marker.setMap(mapModel.map);
                } else {
                    marker.setMap(null);
                }
            });
            return list;
        }
    });


    self.searchContent = function(location){
      mapModel.markers.forEach(function(marker) {
            if (location == marker.title) {
               var wikipediaURL = 'http://zh.wikipedia.org/w/api.php?action=opensearch&search=' + location + '&format=json';
                $.ajax(wikipediaURL, {
                    dataType: 'jsonp'
                })
                    .done(function(data) {
                        if (data[2][0] !== undefined) {
                            var title = "<h2> " + data[0] + "</h2>"; 
                            mapModel.infowindow.setContent(title+data[2][0]);
                        } else {
                            mapModel.infowindow.setContent('No WikiPedia article found.');
                        }
                    })
                    .fail(function() {
                        mapModel.infowindow.setContent('Wikipedia Articles Could Not Be Loaded');
                    });
                mapModel.infowindow.open(mapModel.map,marker);
                marker.setMap(mapModel.map);
                mapModel.map.setCenter(marker.getPosition());
            } 
    });
  };
}


//create map, data here are fixed.
function MapModel() {
  var self = this;
  self.totallist = [];
  self.markers = [];
  
  //initialize the basic map with markers by google map nearBySearch.
  self.initialize = function() {
    var pyrmont = new google.maps.LatLng(30.51853, 114.36214);
    self.map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: pyrmont,
      zoom: 13
    });
    var request = {
      location: pyrmont,
      radius: 50000,
      types: ['university'],
    };
    var callback = function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          self.createMarker(results[i]);
        }
      }
    };
    self.infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(self.map);
    service.nearbySearch(request, callback);
  };

  //create markers.
  self.createMarker = function(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      title: place.name,
      position: place.geometry.location
    });
    self.markers.push(marker);
    self.totallist.push([place.name,placeLoc[0],placeLoc[1]]);
    marker.setMap(self.map);
    google.maps.event.addListener(marker, 'click', function() {
          self.searchContent(marker.title);
      });
  };
  
  //using a wikipedia API to show more information.
  self.searchContent = function(location){
      self.markers.forEach(function(marker) {
            if (location == marker.title) {
               var wikipediaURL = 'http://zh.wikipedia.org/w/api.php?action=opensearch&search=' + location + '&format=json';
                $.ajax(wikipediaURL, {
                    dataType: 'jsonp'
                })
                    .done(function(data) {
                        if (data[2][0] !== undefined) {
                            var title = "<h2>" + data[0] + "</h2>" ;
                            self.infowindow.setContent(title +data[2][0]);
                        } else {
                            self.infowindow.setContent('No WikiPedia article found.');
                        }
                    })
                    .fail(function() {
                        self.infowindow.setContent('Wikipedia Articles Could Not Be Loaded');
                    });
                self.infowindow.open(self.map,marker);
                marker.setMap(self.map);
                self.map.setCenter(marker.getPosition());
            } 
    });
  };
} 

//load when open window
$(window).load(function() {
  var mapModel = new MapModel();
  mapModel.initialize();

  var viewModel;
  var create = function() {
    viewModel = new ViewModel(mapModel);
    ko.applyBindings(viewModel);
  };
  //in case list showing before markers being pushed.
  setTimeout(create, 3000);
});
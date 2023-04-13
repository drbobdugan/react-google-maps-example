import React, { useRef, useState, useEffect } from 'react';
import { StandaloneSearchBox, GoogleMap, LoadScript, Marker} from '@react-google-maps/api';
import shortid from 'shortid';
import './autocomplete.css';

const containerStyle = {
    borderRadius: '10px',
    width: '600px',
    height: '600px'
};

// Set default center to Wayland High School
const center = {
        lat: 42.342205191165746, 
        lng: -71.37293147353779
}

const libraries = ["places"];

const Autocomplete = (props) => {
    const searchBox = useRef();
    const inputBox = useRef();

    // Handle google standalone search box autocomplete
    const handlePlaceChanged = () => { 
        // place is SET by google standalone search box api
        try {
            const [place] = searchBox.current.getPlaces();
        
            if(place) { 
                // SAVE string address that user set in the search box
                inputBox.current.placeholder = place.formatted_address;

                // UPDATE marker list with new lat and lng from google autocomplete place object
                const updateMarker = [{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}]; 
                setMarkers(updateMarker)
            }
        }
        catch (error)
        {
            console.log("Autocomplete: handlePlaceChanged: error: ", error);
        } 
    }

    const [map, setMap] = useState();
    const [markers, setMarkers] = useState([center]);

    useEffect(() => {
        if (map)
        {
            // Use google places api to get lat and lng from string address
            let request = { query: inputBox.current.placeholder, fields: ["name", "geometry"]};
            let service = new window.google.maps.places.PlacesService(map);
        
            service.findPlaceFromQuery(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const updateMarker = [{lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}]; 
                setMarkers(updateMarker)
            }
            });
        }
    }, [map])
  
    useEffect(() => {
        
        if (map) {
            // Fit map to markers collection (right now there is only one marker)
            var bounds = new window.google.maps.LatLngBounds();
            window.google.maps.event.addListenerOnce(map, 'bounds_changed', function() { this.setZoom(Math.min(15, this.getZoom())); });
            for(var i = 0; i < markers.length; i++) {
                bounds.extend( new window.google.maps.LatLng(markers[i].lat, markers[i].lng));
            }
            map.fitBounds(bounds)
       }
      }, [markers, map])
  
      const onLoad = React.useCallback(function callback(map) {
        const bound = new window.google.maps.LatLngBounds();
        window.google.maps.event.addListenerOnce(map, 'bounds_changed', function() { this.setZoom(Math.min(15, this.getZoom())); });
        map.fitBounds(bound);
        setMap(map)
      }, [])

    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY} libraries={libraries}>
            <StandaloneSearchBox
                    onLoad={ref => searchBox.current = ref}
                    onPlacesChanged={handlePlaceChanged}
            >
                <input
                    id="StandaloneSearchBox"
                    type="text"
                    className="form-control"
                    placeholder="USCG Station Boston, 1 Harborside Dr, Boston, MA 02128, USA"
                    ref = {inputBox}
                />
            </StandaloneSearchBox>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                >
                {
                    markers.map((item) => {
                        return (
                            <Marker animation="DROP" key={shortid.generate()} position={{lat: item.lat, lng: item.lng}}/>
                        )
                    })
                }
                </GoogleMap>
            </LoadScript>
    );
};

export default Autocomplete;
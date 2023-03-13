import React, { useRef, useState, useEffect } from 'react';
import { StandaloneSearchBox, GoogleMap, LoadScript, Marker} from '@react-google-maps/api';
import shortid from 'shortid';
import './autocomplete.css';

const containerStyle = {
    borderRadius: '10px',
    width: '600px',
    height: '600px'
};
  
const center = {
        lat: 42.342205191165746, 
        lng: -71.37293147353779
}

const Autocomplete = (props) => {
    const inputRef = useRef();

    const handlePlaceChanged = () => { 
        const [ place ] = inputRef.current.getPlaces();
        if(place) { 
            console.log(place.formatted_address)
            console.log(place.geometry.location.lat())
            console.log(place.geometry.location.lng())

            const updateMarker = [{lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}]; 
            setMarkers(updateMarker)
        } 
    }

    const [map, setMap] = useState();
    const [markers, setMarkers] = useState([center]);
  
      useEffect(() => {
        
        if (map) {
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
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY} libraries={["places"]}>
            <StandaloneSearchBox
                    onLoad={ref => inputRef.current = ref}
                    onPlacesChanged={handlePlaceChanged}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Location"
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
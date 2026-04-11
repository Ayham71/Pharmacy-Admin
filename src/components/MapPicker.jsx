import React, { useState, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const MapPicker = ({ latitude, longitude, onLocationChange, height = '400px' }) => {
  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(latitude) || 31.9539,
    lng: parseFloat(longitude) || 35.9106
  })

  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(latitude) || 31.9539,
    lng: parseFloat(longitude) || 35.9106
  })

  const mapContainerStyle = {
    width: '100%',
    height: height,
    borderRadius: '8px'
  }

  const handleMapClick = useCallback((event) => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    
    setMarkerPosition({
      lat: newLat,
      lng: newLng
    })

    if (onLocationChange) {
      onLocationChange(newLat, newLng)
    }
  }, [onLocationChange])

  const handleMarkerDragEnd = useCallback((event) => {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    
    setMarkerPosition({
      lat: newLat,
      lng: newLng
    })

    if (onLocationChange) {
      onLocationChange(newLat, newLng)
    }
  }, [onLocationChange])

  return (
    <div style={{ width: '100%' }}>
      <LoadScript googleMapsApiKey="AIzaSyAlvXFMVj5f63VgSfj2kqyt7_88sd0o43A">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        </GoogleMap>
      </LoadScript>
      
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: '#555'
      }}>
        <div>
          <strong>📍 Selected Location:</strong>
        </div>
        <div style={{ fontFamily: 'monospace', color: '#1976d2' }}>
          {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
        </div>
      </div>
      
      <p style={{ 
        fontSize: '12px', 
        color: '#777', 
        marginTop: '8px',
        textAlign: 'center'
      }}>
        💡 Click on the map or drag the marker to select a location
      </p>
    </div>
  )
}

export default MapPicker
import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const libraries = ['places']

const MapPicker = ({ latitude, longitude, onLocationChange, height = '400px' }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyAlvXFMVj5f63VgSfj2kqyt7_88sd0o43A",
    libraries: libraries
  })

  const [markerPosition, setMarkerPosition] = useState({
    lat: parseFloat(latitude) || 31.9539,
    lng: parseFloat(longitude) || 35.9106
  })

  const [mapCenter, setMapCenter] = useState({
    lat: parseFloat(latitude) || 31.9539,
    lng: parseFloat(longitude) || 35.9106
  })

  // Update marker when props change
  useEffect(() => {
    if (latitude && longitude) {
      const newLat = parseFloat(latitude)
      const newLng = parseFloat(longitude)
      if (!isNaN(newLat) && !isNaN(newLng)) {
        setMarkerPosition({ lat: newLat, lng: newLng })
        setMapCenter({ lat: newLat, lng: newLng })
      }
    }
  }, [latitude, longitude])

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

  if (!isLoaded) {
    return (
      <div style={{ 
        width: '100%', 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#999' }}>Loading map...</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        <Marker
          position={markerPosition}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
      
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
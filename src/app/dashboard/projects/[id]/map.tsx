'use client'

import { useQuery } from '@tanstack/react-query'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { useState } from 'react'

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

export default function ProjectMap({ projectId }: { projectId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedMarker, setSelectedMarker] = useState<any>(null)

  const { data } = useQuery({
      queryKey: ['project-map', projectId],
      queryFn: () => fetch(`/api/projects/${projectId}/map`).then(res => res.json())
  })

  const markers = data?.markers || []
  const mapCenter = markers.find((m: any) => m.type === 'project') 
      ? { lat: markers.find((m: any) => m.type === 'project').lat, lng: markers.find((m: any) => m.type === 'project').lng }
      : center

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return <div className="bg-muted p-8 text-center rounded-lg">Google Maps API Key missing.</div>
  }

  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {markers.map((marker: any) => (
                    <Marker
                        key={marker.id}
                        position={{ lat: marker.lat, lng: marker.lng }}
                        onClick={() => setSelectedMarker(marker)}
                        // Could optimize icon based on type here
                    />
                ))}

                {selectedMarker && (
                    <InfoWindow
                        position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-sm mb-1">{selectedMarker.name}</h3>
                            <p className="text-xs text-gray-600 mb-2 capitalize">{selectedMarker.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500 mb-3">{selectedMarker.address}</p>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMarker.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Open in Google Maps
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    </div>
  )
}

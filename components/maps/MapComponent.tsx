'use client'

import { useEffect, useRef } from 'react'

interface MapComponentProps {
  pickupLat: number
  pickupLng: number
  dropoffLat?: number
  dropoffLng?: number
  height?: string
}

export function MapComponent({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  height = '500px',
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Dynamically import leaflet only on client-side
    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default
      require('leaflet/dist/leaflet.css')

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView(
        [pickupLat, pickupLng],
        13
      )

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add pickup marker
      L.marker([pickupLat, pickupLng], {
        title: 'Pickup Location',
      })
        .bindPopup('Pickup Location')
        .addTo(mapRef.current)

      // Add dropoff marker if provided
      if (dropoffLat && dropoffLng) {
        L.marker([dropoffLat, dropoffLng], {
          title: 'Dropoff Location',
        })
          .bindPopup('Dropoff Location')
          .addTo(mapRef.current)

        // Fit both markers in view
        const group = new L.FeatureGroup([
          L.marker([pickupLat, pickupLng]),
          L.marker([dropoffLat, dropoffLng]),
        ])
        mapRef.current.fitBounds(group.getBounds().pad(0.1))
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng])

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-300"
    />
  )
}

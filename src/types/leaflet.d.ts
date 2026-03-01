import 'leaflet'

declare module 'leaflet' {
  interface MarkerOptions {
    // Typescript complains if these are not included,
    // seems like contextmenu is expected in MarkerOptions as well even if only used in L.Map
    contextmenu?: boolean
    contextmenuItems?: []
  }

  interface CircleMarker {
    polygonID: number
  }
}

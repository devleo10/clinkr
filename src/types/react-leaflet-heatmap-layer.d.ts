declare module 'react-leaflet-heatmap-layer' {
  import { Component } from 'react';
  
  interface HeatmapLayerProps {
    points: Array<any>;
    longitudeExtractor: (point: any) => number;
    latitudeExtractor: (point: any) => number;
    intensityExtractor?: (point: any) => number;
    radius?: number;
    max?: number;
    minOpacity?: number;
    blur?: number;
    gradient?: Record<string, string>;
  }
  
  export default class HeatmapLayer extends Component<HeatmapLayerProps> {}
}
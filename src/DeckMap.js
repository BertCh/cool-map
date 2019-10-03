import React, { useContext } from "react";
import DeckGL, { GeoJsonLayer, ScatterplotLayer } from "deck.gl";
import ReactMapGL from "react-map-gl";
import { StateDispatch } from "./App";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicmdjZ2VvZyIsImEiOiJjajBuNG1sMjUwMDFlMzNxcWY0M2RqMHI3In0.XfM0BMSqZqjRDcz-oJuadw"; // eslint-disable-line

const DeckMap = ({ state }) => {
  const { viewport, park, route, routeStart } = state;

  const dispatch = useContext(StateDispatch);
  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      onViewportChange={viewport =>
        dispatch({ type: "UPDATE_VIEWPORT", viewport: viewport })
      }
    >
      <DeckGL viewState={viewport} controller={true}>
        <GeoJsonLayer
          id={`park-${park.properties.UNIT_CODE}`}
          data={park}
          pickable="false"
          stroked="false"
          filled="true"
          getFillColor={[185, 185, 185, 150]}
        />
        {routeStart && (
          <ScatterplotLayer
            data={[
              { coordinates: [routeStart.longitude, routeStart.latitude] }
            ]}
            filled={true}
            radiusMinPixels={2}
            radiusMaxPixels={10}
            opacity={0.4}
            getRadius={100}
            getFillColor={[21, 189, 237, 200]}
            getPosition={d => d.coordinates}
          />
        )}
        {route && (
          <GeoJsonLayer
            id={`route`}
            data={route.routes[0].geometry}
            pickable="false"
            lineWidthMinPixels={1}
            stroked="true"
            filled="false"
            getLineColor={[21, 189, 237, 200]}
          />
        )}
      </DeckGL>
    </ReactMapGL>
  );
};

export default DeckMap;

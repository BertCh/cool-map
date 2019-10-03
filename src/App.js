import React, { useReducer, createContext, useEffect, Fragment } from "react";
import WebMercatorViewport from "viewport-mercator-project";
import { FlyToInterpolator } from "react-map-gl";
import { easeCubic } from "d3-ease";
import bbox from "@turf/bbox";
import along from "@turf/along";
import length from "@turf/length";
import DeckMap from "./DeckMap";
import LocationButton from "./LocationButton";
import { getRandomInt } from "./utils/utils";
import "./App.css";
import parks from "./data/random_simple_parks.json";

export const StateDispatch = createContext(null);

const height = 800;
const width = 1000;

function reducer(state, action) {
  if (action.type !== "UPDATE_VIEWPORT") console.log(action);
  switch (action.type) {
    case "RANDOMIZE_PARK": {
      const newPark = parks.features[getRandomInt(0, parks.features.length)];
      const initBBOX = bbox(newPark);
      const newViewport = new WebMercatorViewport({
        width: width,
        height: height
      }).fitBounds([[initBBOX[0], initBBOX[1]], [initBBOX[2], initBBOX[3]]], {
        padding: 20,
        offset: [0, 0]
      });
      const animatedViewport = {
        ...newViewport,
        transitionDuration: 5000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      };
      return {
        ...state,
        park: newPark,
        parkCentroid: {
          longitude: newViewport.longitude,
          latitude: newViewport.latitude
        },
        viewport: animatedViewport,
        interpolationProgress: 0.001
      };
    }
    case "UPDATE_VIEWPORT":
      return { ...state, viewport: { ...state.viewport, ...action.viewport } };
    case "GO_TO_ME": {
      const animatedViewport = {
        ...state.viewport,
        longitude: action.location[0],
        latitude: action.location[1],
        zoom: 17,
        transitionDuration: 5000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      };
      return {
        ...state,
        viewport: animatedViewport,
        routeStart: {
          latitude: animatedViewport.latitude,
          longitude: animatedViewport.longitude
        }
      };
    }
    case "DISPLAY_ROUTE": {
      const initBBOX = bbox(action.route.routes[0].geometry);
      const newViewport = new WebMercatorViewport({
        width: width,
        height: height
      }).fitBounds([[initBBOX[0], initBBOX[1]], [initBBOX[2], initBBOX[3]]], {
        padding: 100,
        offset: [0, 0]
      });
      const animatedViewport = {
        ...newViewport,
        transitionDuration: 5000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      };
      return {
        ...state,
        viewport: animatedViewport,
        route: action.route
      };
    }
    case "INTERPOLATE_TRIP": {
      let percentage = state.interpolationProgress + 0.001;
      if (percentage > 1) {
        percentage = 0.001;
      }
      const tripLength = length(state.route.routes[0].geometry);
      const progress = percentage * tripLength;
      const currentPosition = along(state.route.routes[0].geometry, progress);
      return {
        ...state,
        interpolationProgress: percentage,
        viewport: {
          ...state.viewport,
          longitude: currentPosition.geometry.coordinates[0],
          latitude: currentPosition.geometry.coordinates[1],
          transitionDuration: 0,
          zoom: 7
        }
      };
    }
    case "TOGGLE_INTERPOLATION":
      return { ...state, interpolate: !state.interpolate };
    case "TOGGLE_ROUTING":
      return { ...state, newRoute: !state.newRoute };
  }
}
const initialPark = 10;
const initBBOX = bbox(parks.features[initialPark]);
const initViewport = new WebMercatorViewport({
  width: width,
  height: height
}).fitBounds([[initBBOX[0], initBBOX[1]], [initBBOX[2], initBBOX[3]]], {
  padding: 20,
  offset: [0, 0]
});
const initialState = {
  park: parks.features[initialPark],
  parkCentroid: {
    longitude: initViewport.longitude,
    latitude: initViewport.latitude
  },
  viewport: initViewport,
  routeStart: {
    latitude: null,
    longitude: null
  },
  newRoute: false,
  route: null,
  interpolate: false,
  interpolationProgress: 0.001
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateDispatch.Provider value={dispatch}>
      <div
        className="App"
        style={{
          height: `${height}px`,
          width: `${width}px`,
          position: "relative"
        }}
      >
        <LocationButton state={state} />
        <DeckMap state={state} />
      </div>
    </StateDispatch.Provider>
  );
}

export default App;

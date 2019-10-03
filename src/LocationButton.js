import React, { useContext, Fragment, useEffect, useRef } from "react";
import { StateDispatch } from "./App";
import { useGeolocation } from "react-use";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicmdjZ2VvZyIsImEiOiJjajBuNG1sMjUwMDFlMzNxcWY0M2RqMHI3In0.XfM0BMSqZqjRDcz-oJuadw"; // eslint-disable-line

const LocationButton = ({ state }) => {
  const {
    routeStart,
    park,
    parkCentroid,
    newRoute,
    interpolate,
    route
  } = state;
  const dispatch = useContext(StateDispatch);
  const location = useGeolocation();

  useEffect(() => {
    const fetchRouteAsync = async () => {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${routeStart.longitude},${routeStart.latitude};${parkCentroid.longitude},${parkCentroid.latitude}?access_token=${MAPBOX_TOKEN}&overview=full&geometries=geojson&steps=true&banner_instructions=true`
      );
      const data = await response.json();
      dispatch({ type: "DISPLAY_ROUTE", route: data });
    };
    if (newRoute) {
      dispatch({ type: "TOGGLE_ROUTING" });
      fetchRouteAsync();
    }
  }, [
    routeStart.latitude,
    routeStart.longitude,
    parkCentroid.longitude,
    parkCentroid.latitude,
    newRoute
  ]);
  const requestRef = useRef();

  const animate = () => {
    dispatch({ type: "INTERPOLATE_TRIP" });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (interpolate) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [interpolate]);

  return (
    <Fragment>
      <button
        style={{
          position: "absolute",
          top: "5px",
          right: "0px",
          zIndex: "10"
        }}
        onClick={() => dispatch({ type: "RANDOMIZE_PARK" })}
      >
        random park
      </button>
      <button
        style={{
          position: "absolute",
          top: "30px",
          right: "0px",
          zIndex: "10"
        }}
        onClick={() => {
          if (!location.loading) {
            dispatch({
              type: "GO_TO_ME",
              location: [location.longitude, location.latitude]
            });
          }
        }}
      >
        Find My Location
      </button>
      {routeStart.latitude && routeStart.longitude && (
        <button
          style={{
            position: "absolute",
            top: "60px",
            right: "0px",
            zIndex: "10"
          }}
          onClick={() => {
            dispatch({
              type: "TOGGLE_ROUTING"
            });
          }}
        >
          {`Find route to ${park.properties.UNIT_CODE}`}
        </button>
      )}
      {route && (
        <button
          style={{
            position: "absolute",
            top: "90px",
            right: "0px",
            zIndex: "10"
          }}
          onClick={() => {
            dispatch({
              type: "TOGGLE_INTERPOLATION"
            });
          }}
        >
          {!interpolate
            ? `Animate along route to ${park.properties.UNIT_CODE}`
            : `Stop animation to ${park.properties.UNIT_CODE}`}
        </button>
      )}
    </Fragment>
  );
};

export default LocationButton;

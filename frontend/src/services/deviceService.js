// src/services/deviceService.js
import { get, post, patch, del, unwrap } from "./api";

export const getDevices   = ()           => get("/devices/").then(unwrap);
export const getDevice    = (id)         => get(`/devices/${id}/`);
export const createDevice = (data)       => post("/devices/", data);
export const updateDevice = (id, fields) => patch(`/devices/${id}/`, fields);
export const deleteDevice = (id)         => del(`/devices/${id}/`);
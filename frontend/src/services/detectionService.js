// src/services/detectionService.js
import { get, post, del, unwrap } from "./api";

export const getDetections   = ()     => get("/detections/").then(unwrap);
export const createDetection = (data) => post("/detections/", data);
export const deleteDetection = (id)   => del(`/detections/${id}/`);

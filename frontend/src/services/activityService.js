// src/services/activityService.js
import { get, post, del, unwrap } from "./api";

export const getActivities  = ()     => get("/activities/").then(unwrap);
export const createActivity = (data) => post("/activities/", data);
export const deleteActivity = (id)   => del(`/activities/${id}/`);
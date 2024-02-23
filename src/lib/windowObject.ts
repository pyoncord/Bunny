import { createVendettaObject } from "./vendettaObject";

export default function initWindowObject(unloads: any[]) {
    window.vendetta = createVendettaObject(unloads);
}
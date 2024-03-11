import { createVendettaObject } from "@core/vendettaObject";

export default function initWindowObject(unloads: any[]) {
    window.vendetta = createVendettaObject(unloads);
    window.bunny = require(".");
}

import { lazyDestructure } from "@lib/utils/lazy";
import { findByProps } from "@metro";

export const { openAlert, dismissAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));

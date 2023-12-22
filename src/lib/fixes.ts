import { FluxDispatcher, moment } from "@metro/common";
import logger from "@lib/logger";

function onDispatch({ locale }: { locale: string }) {
    // Timestamps
    try {
        // TODO: Test if this works with all locales
        moment.locale(locale.toLowerCase());
    } catch(e) {
        logger.error("Failed to fix timestamps...", e);
    }

    // We're done here!
    FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", onDispatch);
}

export default () => FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", onDispatch);
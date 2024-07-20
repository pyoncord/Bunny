/**
 * Why do we need this exactly? It's simple, to fight the side effects caused by when you
 * initialize modules not in the right time or when you're not supposed to.
 * Back then, we had major bugs like the mixing of light and dark themes and AMOLED option getting ignored.
 * Nowadays, there are only three which I can spot: Hindi timestamps, crashing on some native components and slower startup time.
 * - @pylixonly
 */

import { logger } from "@lib/utils/logger";
import { FluxDispatcher } from "@metro/common";
import moment from "moment";

function onDispatch({ locale }: { locale: string; }) {
    // Timestamps
    try {
        moment.locale(locale.toLowerCase());
    } catch (e) {
        logger.error("Failed to fix timestamps...", e);
    }

    // We're done here!
    FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", onDispatch);
}

export default () => {
    FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", onDispatch);
};

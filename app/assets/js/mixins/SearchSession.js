import merge from "lodash.merge";
import deepEqual from 'deep-equal';

export default {
    data() {
        return {
            defaultSearchSession: {
                hash: null,
                urls: {
                },
                count: 0,
                params: {
                }
            },
        }
    },
    methods: {
        initSearchSession(data) {
            let sessionData = merge({}, this.defaultSearchSession, data)
            sessionData.hash = Date.now();
            window.sessionStorage.setItem('search_session', JSON.stringify(sessionData));
        },
        updateSearchSession(data) {
            let sessionData = this.getSearchSession();
            // check if search parameters have changed. If not, session hash stays unchanged
            if ( !deepEqual(sessionData?.params ?? {}, data?.params ?? {}) ) {
                sessionData.hash = Date.now();
            }
            sessionData.params = {} // clear params
            sessionData = merge({}, sessionData, data)
            window.sessionStorage.setItem('search_session', JSON.stringify(sessionData));
        },
        getSearchSession(sessionHash) {
            try {
                let sessionData = JSON.parse(window.sessionStorage.getItem('search_session'));
                if (sessionHash) {
                    return (sessionData.hash === sessionHash ? sessionData : null)
                } else {
                    return sessionData;
                }
            } catch(e) {
                return null;
            }
        },
        getSearchSessionHash() {
            return this.getSearchSession()?.hash ?? null
        },
    },
}

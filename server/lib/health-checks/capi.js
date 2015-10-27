import { Check, status } from 'n-health';

import api from 'next-ft-api-client';

class CapiCheck extends Check {

    constructor(options) {
        super(options);
        this.capiMethod = options.capiMethod;
        this.capiOptions = options.capiOptions || {}
    }

    get checkOutput() {
        switch (this.status) {
            case status.PENDING:
                return 'This check has not yet run';
            case status.PASSED:
                return 'CAPI query returned data successfully';
            default:
                return 'CAPI query did not return data successfully';
        }
    }

    tick() {
        return api[this.capiMethod](this.capiOptions)
            .then(data => {
                this.status = data ? status.PASSED : status.FAILED;
                this.lastUpdated = new Date();
            });
    }
}

export default CapiCheck;

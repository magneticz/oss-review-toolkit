/*
 * Copyright (C) 2020 HERE Europe B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */

import { randomStringGenerator } from '../utils';

class WebAppRuleViolation {
    #_id;

    #howToFix;

    #license;

    #licenseIndex;

    #licenseSource;

    #message;

    #package;

    #packageIndex;

    #severity;

    #resolutions = [];

    #rule;

    #webAppOrtResult;

    constructor(obj, webAppOrtResult) {
        if (obj) {
            if (Number.isInteger(obj._id)) {
                this.#_id = obj._id;
            }

            if (obj.how_to_fix || obj.howToFix) {
                this.#howToFix = obj.how_to_fix
                    || obj.howToFix;
            }

            if (obj.license) {
                this.#licenseIndex = obj.license;
            }

            if (obj.license_source || obj.licenseSource) {
                this.#licenseSource = obj.license_source
                    || obj.licenseSource;
            }

            if (obj.message) {
                this.#message = obj.message;
            }

            if (obj.pkg && obj.pkg >= 0) {
                this.#packageIndex = obj.pkg;
            }

            if (obj.severity) {
                this.#severity = obj.severity;
            }

            if (obj.resolutions) {
                this.#resolutions = obj.resolutions;
            }

            if (obj.rule) {
                this.#rule = obj.rule;
            }

            if (webAppOrtResult) {
                this.#webAppOrtResult = webAppOrtResult;

                const webAppPackage = webAppOrtResult.getPackageByIndex(this.#packageIndex);
                if (webAppPackage) {
                    this.#package = webAppPackage;
                }

                const webAppLicense = webAppOrtResult.getLicenseByIndex(this.#licenseIndex);
                if (webAppLicense) {
                    this.#license = webAppLicense;
                }
            }

            this.key = randomStringGenerator(20);
        }
    }

    get _id() {
        return this.#_id;
    }

    get howToFix() {
        return this.#howToFix;
    }

    get license() {
        return this.#license;
    }

    get licenseName() {
        return this.#license.id;
    }

    get message() {
        return this.#message;
    }

    get package() {
        return this.#package;
    }

    get packageName() {
        return this.#package ? this.#package.id : '';
    }

    get severity() {
        return this.#severity;
    }

    get resolutions() {
        return this.#resolutions;
    }

    get rule() {
        return this.#rule;
    }
}

export default WebAppRuleViolation;

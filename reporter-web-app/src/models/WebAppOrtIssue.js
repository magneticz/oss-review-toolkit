/*
 * Copyright (C) 2019-2020 HERE Europe B.V.
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

class WebAppOrtIssue {
    #_id;

    #message;

    #package;

    #packageIndex;

    #path;

    #scanResult;

    #scanResultIndex;

    #severity;

    #source;

    #timestamp;

    #type;

    #resolutions = [];

    #webAppOrtResult;

    constructor(obj, webAppOrtResult) {
        if (obj) {
            if (Number.isInteger(obj._id)) {
                this.#_id = obj._id;
            }

            if (obj.message) {
                this.#message = obj.message;
            }

            if (obj.path) {
                this.#path = obj.path;
            }

            if (Number.isInteger(obj.pkg)) {
                this.#packageIndex = obj.pkg;
            }

            if (Number.isInteger(obj.scan_result) || Number.isInteger(obj.scanResult)) {
                this.#scanResultIndex = obj.scan_result || obj.scanResult;
            }

            if (obj.severity) {
                this.#severity = obj.severity;
            }

            if (obj.source) {
                this.#source = obj.source;
            }

            if (obj.timestamp) {
                this.#timestamp = obj.timestamp;
            }

            if (obj.type) {
                this.#type = obj.type;
            }

            if (obj.resolutions) {
                this.#resolutions = obj.resolutions;
            }

            if (webAppOrtResult) {
                this.#webAppOrtResult = webAppOrtResult;

                const webAppPackage = webAppOrtResult.getPackageByIndex(this.#packageIndex);
                console.log('webAppPackage', this.#packageIndex, webAppOrtResult, webAppPackage);
                if (webAppPackage) {
                    this.#package = webAppPackage;
                }

                const webAppScanResult = webAppOrtResult.getScanResultByIndex(this.#packageIndex);
                if (webAppScanResult) {
                    this.#scanResult = webAppScanResult;
                }
            }

            this.key = randomStringGenerator(20);
        }
    }

    get _id() {
        return this.#_id;
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

    get path() {
        return this.#path;
    }

    get scanResult() {
        return this.#scanResult;
    }

    get severity() {
        return this.#severity;
    }

    get source() {
        return this.#source;
    }

    get timestamp() {
        return this.#timestamp;
    }

    get type() {
        return this.#type;
    }

    get resolutions() {
        return this.#resolutions;
    }
}

export default WebAppOrtIssue;

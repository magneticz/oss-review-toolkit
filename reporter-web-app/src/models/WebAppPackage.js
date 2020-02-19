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

import RemoteArtifact from './RemoteArtifact';
import VcsInfo from './VcsInfo';
import WebAppFinding from './WebAppFinding';
import WebAppPackagePath from './WebAppPackagePath';
import WebAppScanResult from './WebAppScanResult';
import { randomStringGenerator } from '../utils';

class WebAppPackage {
    #_id;

    #binaryArtifact;

    #concludedLicense;

    #curations = [];

    #declaredLicenses = new Set();

    #declaredLicensesIndexes = new Set();

    #declaredLicensesProcessed = {
        spdxExpression: ''
    };

    #definitionFilePath;

    #description;

    #detectedLicenses = new Set();

    #detectedLicensesIndexes = new Set();

    #findings = [];

    #homepageUrl;

    #id;

    #isExcluded = false;

    #isProject = false;

    #issues = [];

    #levels = new Set([]);

    #pathExcludes = new Set();

    #paths = [];

    #purl;

    #scanResults = [];

    #scopeExcludes = new Set();

    #scopes = new Set();

    #sourceArtifact;

    #vcs = new VcsInfo();

    #vcsProcessed = new VcsInfo();

    #violations;

    constructor(obj, webAppOrtResult) {
        if (obj) {
            if (Number.isInteger(obj._id)) {
                this.#_id = obj._id;
            }

            if (obj.binary_artifact || obj.binaryArtifact) {
                const binaryArtifact = obj.binary_artifact || obj.binaryArtifact;
                this.#binaryArtifact = new RemoteArtifact(binaryArtifact);
            }

            if (obj.concluded_license || obj.concludedLicense) {
                this.#concludedLicense = obj.concluded_license
                    || obj.concludedLicense;
            }

            if (obj.curations) {
                this.#curations = obj.curations;
            }

            if (obj.declared_licenses || obj.declaredLicenses) {
                const declaredLicensesIndexes = obj.declared_licenses
                    || obj.declaredLicenses;
                this.#declaredLicensesIndexes = new Set(declaredLicensesIndexes);
            }

            if (obj.declaredLicensesProcessed && obj.declaredLicensesProcessed.spdxExpression) {
                const { spdxExpression } = obj.declaredLicensesProcessed;

                this.#declaredLicensesProcessed = {
                    spdxExpression
                };
            }

            if (obj.declaredLicensesProcessed && obj.declaredLicensesProcessed.spdxExpression) {
                const { spdxExpression } = obj.declaredLicensesProcessed;

                this.#declaredLicensesProcessed = {
                    spdxExpression
                };
            }

            if (obj.definition_file_path || obj.definitionFilePath) {
                this.#definitionFilePath = obj.definition_file_path
                    || obj.definitionFilePath;
            }

            if (obj.description) {
                this.#description = obj.description;
            }

            if (obj.detected_licenses || obj.detectedLicenses) {
                const detectedLicensesIndexes = obj.detected_licenses
                    || obj.detectedLicenses;
                this.#detectedLicensesIndexes = new Set(detectedLicensesIndexes);
            }

            if (obj.homepage_url || obj.homepageUrl) {
                this.#homepageUrl = obj.homepage_url || obj.homepageUrl;
            }

            if (obj.id) {
                this.#id = obj.id;
            }

            if (obj.is_excluded || obj.isExcluded) {
                this.#isExcluded = obj.is_excluded || obj.isExcluded;
            }

            if (obj.findings && webAppOrtResult) {
                for (let i = 0, len = obj.findings.length; i < len; i++) {
                    this.#findings.push(new WebAppFinding(obj.findings[i], webAppOrtResult));
                }
            }

            if (obj.is_project || obj.isProject) {
                this.#isProject = obj.is_project || obj.isProject;
            }

            if (obj.levels) {
                this.#levels = new Set(obj.levels);
            }

            if (obj.path_excludes || obj.pathExcludes) {
                const pathExcludes = obj.path_excludes || obj.pathExcludes;
                this.#pathExcludes = new Set(pathExcludes);
            }

            if (obj.paths) {
                for (let i = 0, len = obj.paths.length; i < len; i++) {
                    this.#paths.push(new WebAppPackagePath(obj.paths[i]));
                }
            }

            if (obj.purl) {
                this.#purl = obj.purl;
            }

            if (obj.scan_results || obj.scanResults) {
                const scanResults = obj.scan_results || obj.scanResults;
                for (let i = 0, len = scanResults.length; i < len; i++) {
                    this.#scanResults.push(new WebAppScanResult(scanResults[i]));
                }
            }

            if (obj.scope_excludes || obj.scopeExcludes) {
                const scopeExcludes = obj.scope_excludes || obj.scopeExcludes;
                this.#scopeExcludes = new Set(scopeExcludes);
            }

            if (obj.scopes) {
                this.#scopes = new Set(obj.scopes);
            }

            if (obj.source_artifact || obj.sourceArtifact) {
                const sourceArtifact = obj.source_artifact || obj.sourceArtifact;
                this.#sourceArtifact = new RemoteArtifact(sourceArtifact);
            }

            if (obj.vcs) {
                this.#vcs = new VcsInfo(obj.vcs);
            }

            if (obj.vcs_processed || obj.vcsProcessed) {
                const vcsProcessed = obj.vcs_processed || obj.vcsProcessed;
                this.#vcsProcessed = new VcsInfo(vcsProcessed);
            }

            if (webAppOrtResult) {
                if (this.#declaredLicensesIndexes.size !== 0) {
                    this.#declaredLicensesIndexes.forEach((index) => {
                        const webAppLicense = webAppOrtResult.getLicenseByIndex(index);
                        if (webAppLicense) {
                            const { id } = webAppLicense;
                            this.#declaredLicenses.add(id);
                        } else {
                            console.log(
                                `Unresolvable declared license ${index} in package ${this.#id}.`
                            );
                        }
                    });
                }

                if (this.#detectedLicensesIndexes.size !== 0) {
                    this.#detectedLicensesIndexes.forEach((index) => {
                        const webAppLicense = webAppOrtResult.getLicenseByIndex(index);
                        if (webAppLicense) {
                            const { id } = webAppLicense;
                            this.#detectedLicenses.add(id);
                        } else {
                            console.log(
                                `Unresolvable detected license ${index} in package ${this.#id}.`
                            );
                        }
                    });
                }

                this.#issues = webAppOrtResult.getIssuesForPackageIndex(this.#_id) || null;
                this.#violations = webAppOrtResult.getViolationsForPackageIndex(this.#_id) || null;

                this.key = randomStringGenerator(20);
            }
        }
    }

    get binaryArtifact() {
        return this.#binaryArtifact;
    }

    get concludedLicense() {
        return this.#concludedLicense;
    }

    get curations() {
        return this.#curations;
    }

    get declaredLicenses() {
        return this.#declaredLicenses;
    }

    get declaredLicensesIndexes() {
        return this.#detectedLicensesIndexes;
    }

    get declaredLicensesProcessed() {
        return this.#declaredLicensesProcessed;
    }

    get definitionFilePath() {
        return this.#definitionFilePath;
    }

    get description() {
        return this.#description;
    }

    get detectedLicenses() {
        return this.#detectedLicenses;
    }

    get detectedLicensesIndexes() {
        return this.#detectedLicensesIndexes;
    }

    get findings() {
        return this.#findings;
    }

    get id() {
        return this.#id;
    }

    get isExcluded() {
        return this.#isExcluded;
    }

    get isProject() {
        return this.#isProject;
    }

    get levels() {
        return this.#levels;
    }

    get packageIndex() {
        return this.#_id;
    }

    get pathExcludes() {
        return this.#pathExcludes;
    }

    get paths() {
        return this.#paths;
    }

    get purl() {
        return this.#purl;
    }

    get scanResults() {
        return this.#scanResults;
    }

    get scopeExcludes() {
        return this.#scopeExcludes;
    }

    get scopes() {
        return this.#scopes;
    }

    get sourceArtifact() {
        return this.#sourceArtifact;
    }

    get vcs() {
        return this.#vcs;
    }

    get vcsProcessed() {
        return this.#vcsProcessed;
    }

    getIssues() {
        return this.#issues;
    }

    getViolations() {
        return this.#violations;
    }

    hasFindings() {
        return this.#findings.length > 0;
    }

    hasIssues() {
        return this.#issues.length > 0;
    }

    hasLicenses() {
        if (this.declaredLicenses.size !== 0
            || this.detectedLicenses.size !== 0) {
            return true;
        }

        return false;
    }

    hasPaths() {
        if (this.paths.length !== 0) {
            return false;
        }

        return true;
    }

    hasViolations() {
        return this.#violations.length > 0;
    }
}

export default WebAppPackage;

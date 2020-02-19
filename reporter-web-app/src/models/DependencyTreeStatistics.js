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

class DependencyTreeStatistics {
    #excludedPackages = 0;

    #excludedProjects = 0;

    #excludedScopes = [];

    #includedPackages = 0;

    #includedProjects = 0;

    #includedScopes = [];

    #includedTreeDepth = 0;

    #totalTreeDepth = 0;

    constructor(obj) {
        if (obj instanceof Object) {
            if (obj.excluded_packages >= 0 || obj.excludedPackages >= 0) {
                this.#excludedPackages = obj.excluded_packages || obj.excludedPackages;
            }

            if (obj.excluded_projects >= 0 || obj.excludedProjects >= 0) {
                this.#excludedProjects = obj.excluded_projects || obj.excludedProjects;
            }

            if (obj.excluded_scopes || obj.excludedScopes) {
                this.#excludedScopes = obj.excluded_scopes || obj.excludedScopes;
            }

            if (obj.included_packages >= 0 || obj.includedPackages >= 0) {
                this.#includedPackages = obj.included_packages || obj.includedPackages;
            }

            if (obj.included_projects >= 0 || obj.includedProjects >= 0) {
                this.#includedProjects = obj.included_projects || obj.includedProjects;
            }

            if (obj.included_scopes || obj.includedScopes) {
                this.#includedScopes = obj.included_scopes || obj.includedScopes;
            }

            if (obj.included_tree_depth >= 0 || obj.includedTreeDepth >= 0) {
                this.#includedTreeDepth = obj.included_tree_depth || obj.includedTreeDepth;
            }

            if (obj.total_tree_depth >= 0 || obj.totalTreeDepth >= 0) {
                this.#totalTreeDepth = obj.total_tree_depth || obj.totalTreeDepth;
            }
        }
    }

    get excludedPackages() {
        return this.#excludedPackages;
    }

    get excludedProjects() {
        return this.#excludedProjects;
    }

    get excludedScopes() {
        return this.#excludedScopes;
    }

    get includedPackages() {
        return this.#includedPackages;
    }

    get includedProjects() {
        return this.#includedProjects;
    }

    get includedScopes() {
        return this.#includedScopes;
    }

    get includedTreeDepth() {
        return this.#includedTreeDepth;
    }

    get totalTreeDepth() {
        return this.#totalTreeDepth;
    }
}

export default DependencyTreeStatistics;

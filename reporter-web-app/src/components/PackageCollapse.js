/*
 * Copyright (C) 2019 HERE Europe B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
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

import React from 'react';
import PropTypes from 'prop-types';

import {
    Collapse
} from 'antd';
import IssuesTable from './IssuesTable';
import PackageDetails from './PackageDetails';
import PackageLicenses from './PackageLicenses';
import PackagePaths from './PackagePaths';
import PackageScanResults from './PackageScanResults';
import ViolationsTable from './ViolationsTable';

const { Panel } = Collapse;

// Generates the HTML for packages issues
const PackageCollapse = (props) => {
    const {
        pkg,
        filterScanFindings,
        includeLicenses,
        includeIssues,
        includeViolations,
        includePaths,
        includeScanFindings,
        showDetails,
        showLicenses,
        showIssues,
        showViolations,
        showPaths,
        showScanFindings,
        webAppOrtResult
    } = props;

    const defaultActiveKey = [];

    if (showDetails) {
        defaultActiveKey.push('1');
    }

    if (showLicenses) {
        defaultActiveKey.push('2');
    }

    if (showIssues) {
        defaultActiveKey.push('3');
    }

    if (showViolations) {
        defaultActiveKey.push('4');
    }

    if (showPaths) {
        defaultActiveKey.push('5');
    }

    if (showScanFindings) {
        defaultActiveKey.push('6');
    }

    return (
        <Collapse
            bordered={false}
            defaultActiveKey={defaultActiveKey}
        >
            <Panel header="Package Details" key="1">
                <PackageDetails pkg={pkg} webAppOrtResult={webAppOrtResult} />
            </Panel>
            {
                includeLicenses
                && pkg.hasLicenses()
                && (
                    <Panel header="Package Licenses" key="2">
                        <PackageLicenses pkg={pkg} webAppOrtResult={webAppOrtResult} />
                    </Panel>
                )
            }
            {
                includeIssues
                && pkg.hasIssues()
                && (
                    <Panel header="Package Issues" key="3">
                        <IssuesTable
                            issues={pkg.getIssues()}
                            showPackageColumn={false}
                        />
                    </Panel>
                )
            }
            {
                includeViolations
                && pkg.hasViolations()
                && (
                    <Panel header="Package Violations" key="4">
                        <ViolationsTable
                            showPackageColumn={false}
                            violations={pkg.getViolations()}
                        />
                    </Panel>
                )
            }
            {
                includePaths
                && pkg.hasPaths()
                && (
                    <Panel header="Package Paths" key="5">
                        <PackagePaths pkg={pkg} webAppOrtResult={webAppOrtResult} />
                    </Panel>
                )
            }
            {
                includeScanFindings
                && pkg.hasFindings()
                && (
                    <Panel header="Package Scan Results" key="6">
                        <PackageScanResults
                            filter={filterScanFindings}
                            pkg={pkg}
                            webAppOrtResult={webAppOrtResult}
                        />
                    </Panel>
                )
            }
        </Collapse>
    );
};

PackageCollapse.propTypes = {
    filterScanFindings: PropTypes.object,
    pkg: PropTypes.object.isRequired,
    includeLicenses: PropTypes.bool,
    includeIssues: PropTypes.bool,
    includeViolations: PropTypes.bool,
    includePaths: PropTypes.bool,
    includeScanFindings: PropTypes.bool,
    showDetails: PropTypes.bool,
    showLicenses: PropTypes.bool,
    showIssues: PropTypes.bool,
    showViolations: PropTypes.bool,
    showPaths: PropTypes.bool,
    showScanFindings: PropTypes.bool,
    webAppOrtResult: PropTypes.object.isRequired
};

PackageCollapse.defaultProps = {
    filterScanFindings: {
        type: [],
        value: []
    },
    includeLicenses: true,
    includeIssues: true,
    includeViolations: true,
    includePaths: true,
    includeScanFindings: true,
    showDetails: true,
    showLicenses: true,
    showIssues: true,
    showViolations: true,
    showPaths: false,
    showScanFindings: false
};

export default PackageCollapse;

/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
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
// import LicenseTag from './LicenseTag';

// Generates the HTML for licenses declared or detected in a package
const PackageLicenses = (props) => {
    const { pkg } = props;
    const {
        concludedLicense,
        detectedLicenses,
        declaredLicenses,
        declaredLicensesProcessed
    } = pkg;

    console.log('pkg', pkg);

    if (declaredLicenses.length === 0 && detectedLicenses.length === 0) {
        return null;
    }

    const renderTr = (thVal, tdVal) => (
        <tr>
            <th>
                {thVal}
            </th>
            <td>
                {tdVal}
            </td>
        </tr>
    );

    const renderTrLicenses = (label, licenses) => (
        <tr>
            <th>
                {label}
            </th>
            <td className="ort-package-licenses">
                {
                    Array.from(licenses).join(', ')
                }
            </td>
        </tr>
    );

    return (
        <table className="ort-package-props">
            <tbody>
                {
                    concludedLicense
                    && (
                        renderTr(
                            'Concluded SPDX',
                            concludedLicense
                        )
                    )
                }
                {
                    declaredLicenses.size !== 0
                    && renderTrLicenses(
                        'Declared',
                        declaredLicenses
                    )
                }
                {
                    declaredLicensesProcessed
                    && declaredLicensesProcessed.spdxExpression.length !== 0
                    && (
                        renderTr(
                            'Declared (SPDX)',
                            declaredLicensesProcessed.spdxExpression
                        )
                    )
                }
                {
                    detectedLicenses.size !== 0
                    && renderTrLicenses(
                        'Detected',
                        detectedLicenses
                    )
                }
            </tbody>
        </table>
    );
};

PackageLicenses.propTypes = {
    pkg: PropTypes.object.isRequired
};

export default PackageLicenses;

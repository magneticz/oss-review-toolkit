/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
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

import memoizeOne from 'memoize-one';

const hasOrtResultChanged = (newArgs, oldArgs) => newArgs.length !== oldArgs.length
    || newArgs[0].data.reportLastUpdate !== oldArgs[0].data.reportLastUpdate;

// ---- App selectors ----

export const getAppView = state => state.app;
export const getAppViewoading = state => state.app.loading;
export const getAppViewShowKey = state => state.app.showKey;

// ---- Data selectors ----

export const getOrtResult = state => state.data.ortResult;

// ---- SummaryView selectors ----

export const getSummaryDeclaredLicenses = memoizeOne(
    (state) => {
        const webAppOrtResult = getOrtResult(state);
        const { declaredLicenseStats } = webAppOrtResult;

        console.log('getSummaryDeclaredLicenses', webAppOrtResult, declaredLicenseStats);

        return Object.entries(declaredLicenseStats)
            .reduce((accumulator, [name, value]) => {
                const license = webAppOrtResult.getLicenseByName(name);

                accumulator.push({
                    name,
                    value,
                    color: license.color
                });

                return accumulator;
            }, []);
    },
    hasOrtResultChanged
);
export const getSummaryDeclaredLicensesChart = (state) => {
    const declaredLicenses = getSummaryDeclaredLicenses(state);

    if (state.summary.licenses.declaredChart.length === 0 && declaredLicenses.length !== 0) {
        return declaredLicenses;
    }

    return state.summary.licenses.declaredChart;
};
export const getSummaryDeclaredLicensesFilter = state => state.summary.licenses.declaredFilter;
export const getSummaryDeclaredLicensesTotal = memoizeOne(
    (state) => {
        console.log('getSummaryDeclaredLicensesFilter');
        const webAppOrtResult = getOrtResult(state);
        const { declaredLicenseStats } = webAppOrtResult;

        return Object.keys(declaredLicenseStats).length;
    },
    hasOrtResultChanged
);

export const getSummaryDetectedLicenses = memoizeOne(
    (state) => {
        const webAppOrtResult = getOrtResult(state);
        const { detectedLicenseStats } = webAppOrtResult;

        console.log('getSummaryDetectedLicenses', webAppOrtResult);

        return Object.entries(detectedLicenseStats)
            .reduce((accumulator, [name, value]) => {
                const license = webAppOrtResult.getLicenseByName(name);

                accumulator.push({
                    name,
                    value,
                    color: license.color
                });

                return accumulator;
            }, []);
    },
    hasOrtResultChanged
);
export const getSummaryDetectedLicensesChart = (state) => {
    const detectedLicenses = getSummaryDetectedLicenses(state);

    if (state.summary.licenses.detectedChart.length === 0 && detectedLicenses.length !== 0) {
        return detectedLicenses;
    }

    return state.summary.licenses.detectedChart;
};
export const getSummaryDetectedLicensesFilter = state => state.summary.licenses.detectedFilter;
export const getSummaryDetectedLicensesTotal = memoizeOne(
    (state) => {
        console.log('getSummaryDetectedLicensesTotal');
        const webAppOrtResult = getOrtResult(state);
        const { declaredLicenseStats } = webAppOrtResult;

        return Object.keys(declaredLicenseStats).length;
    },
    hasOrtResultChanged
);

export const getSummaryView = state => state.summary;
export const getSummaryViewShouldComponentUpdate = state => state.summary.shouldComponentUpdate;

// ---- TableView selectors ----

export const getTableView = state => state.table;
export const getTableViewShouldComponentUpdate = state => state.table.shouldComponentUpdate;

// ---- TreeView selectors ----

export const getTreeView = state => state.tree;
export const getTreeViewShouldComponentUpdate = state => state.tree.shouldComponentUpdate;

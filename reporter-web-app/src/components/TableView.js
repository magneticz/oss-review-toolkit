/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
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

import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Icon,
    Table,
    Tooltip
} from 'antd';
import PropTypes from 'prop-types';
import {
    getOrtResult,
    getTableView,
    getTableViewShouldComponentUpdate
} from '../reducers/selectors';
import store from '../store';
import PackageCollapse from './PackageCollapse';

class TableView extends React.Component {
    shouldComponentUpdate() {
        const { shouldComponentUpdate } = this.props;
        return shouldComponentUpdate;
    }

    render() {
        const {
            tableView: {
                filter: {
                    filteredInfo,
                    sortedInfo
                }
            },
            webAppOrtResult
        } = this.props;

        // Specifies table columns as per
        // https://ant.design/components/table/
        const columns = [
            {
                align: 'right',
                filters: (() => [
                    { text: 'Issues', value: 'issues' },
                    { text: 'Violations', value: 'violations' }
                ])(),
                filterMultiple: true,
                key: 'issues',
                onFilter: (value, pkg) => {
                    if (value === 'issues') {
                        return pkg.hasIssues();
                    }

                    if (value === 'violations') {
                        return pkg.hasViolations();
                    }

                    return false;
                },
                render: (pkg) => {
                    if (pkg.hasIssues() || pkg.hasViolations()) {
                        return (
                            <Icon
                                type="exclamation-circle"
                                className="ort-error"
                            />
                        );
                    }

                    return (
                        <Icon
                            type="check-circle"
                            className="ort-success"
                        />
                    );
                },
                width: '0.8em'
            },
            {
                align: 'right',
                dataIndex: 'packages',
                filters: (() => {
                    const { packages } = webAppOrtResult;
                    return packages.map((pkg, index) => ({ text: pkg.definitionFilePath, value: index }));
                })(),
                filteredValue: filteredInfo.packages || null,
                onFilter: (value, pkg) => pkg.packageIndex.includes(parseInt(value, 10)),
                render: (text, pkg) => {
                    if (pkg.isProject) {
                        return (
                            <span className="ort-project-icon">
                                <Tooltip
                                    placement="right"
                                    title={`Defined in ${pkg.definitionFilePath}`}
                                >
                                    <Icon type="file-text" />
                                </Tooltip>
                            </span>
                        );
                    }

                    return (
                        <span className="ort-package-icon">
                            <Icon type="file-text" />
                        </span>
                    );
                },
                width: '0.8em'
            },
            {
                align: 'left',
                dataIndex: 'id',
                onFilter: (value, pkg) => pkg.id.includes(value),
                sorter: (a, b) => {
                    const idA = a.id.toUpperCase();
                    const idB = b.id.toUpperCase();
                    if (idA < idB) {
                        return -1;
                    }
                    if (idA > idB) {
                        return 1;
                    }

                    return 0;
                },
                sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
                title: 'Package',
                render: text => (
                    <span
                        className="ort-package-id ort-word-break-wrap"
                    >
                        {text}
                    </span>
                )
            },
            {
                align: 'left',
                dataIndex: 'scopes',
                filters: (() => webAppOrtResult.scopes.map(scope => ({ text: scope, value: scope })))(),
                filteredValue: filteredInfo.scopes || null,
                onFilter: (scope, pkg) => pkg.scopes.has(scope),
                title: 'Scopes',
                render: scopes => (
                    <span>
                        {Array.from(scopes).join(',')}
                    </span>
                )
            },
            {
                align: 'center',
                dataIndex: 'levels',
                filters: (() => webAppOrtResult.levels.map(level => ({ text: level, value: level })))(),
                filteredValue: filteredInfo.levels || null,
                filterMultiple: true,
                onFilter: (level, pkg) => pkg.levels.has(parseInt(level, 10)),
                title: 'Levels',
                render: levels => (
                    <span
                        className="ort-word-break-wrap"
                    >
                        {Array.from(levels).join(', ')}
                    </span>
                ),
                width: 80
            },
            {
                align: 'left',
                dataIndex: 'declaredLicenses',
                filters: (
                    () => webAppOrtResult.declaredLicenses.map(license => ({ text: license, value: license }))
                )(),
                filteredValue: filteredInfo.declaredLicenses || null,
                filterMultiple: true,
                key: 'declaredLicenses',
                onFilter: (value, pkg) => pkg.declaredLicenses.has(value),
                title: 'Declared Licenses',
                render: declaredLicenses => (
                    <span
                        className="ort-word-break-wrap"
                    >
                        {Array.from(declaredLicenses).join(', ')}
                    </span>
                ),
                width: 160
            },
            {
                align: 'left',
                dataIndex: 'detectedLicenses',
                filters: (
                    () => webAppOrtResult.detectedLicenses.map(license => ({ text: license, value: license }))
                )(),
                filteredValue: filteredInfo.detectedLicenses || null,
                filterMultiple: true,
                onFilter: (license, pkg) => pkg.detectedLicenses.has(license),
                title: 'Detected Licenses',
                render: detectedLicenses => (
                    <span
                        className="ort-word-break-wrap"
                    >
                        {Array.from(detectedLicenses).join(', ')}
                    </span>
                ),
                width: 160
            }
        ];

        return (
            <div>
                <div className="ort-table-operations">
                    <Button
                        onClick={() => {
                            store.dispatch({ type: 'TABLE::CLEAR_FILTERS_TABLE' });
                        }}
                        size="small"
                    >
                        Clear filters
                    </Button>
                </div>
                <Table
                    columns={columns}
                    expandedRowRender={
                        pkg => (
                            <PackageCollapse
                                pkg={pkg}
                                webAppOrtResult={webAppOrtResult}
                            />
                        )
                    }
                    dataSource={webAppOrtResult.packages}
                    expandRowByClick
                    indentSize={0}
                    locale={{
                        emptyText: 'No packages'
                    }}
                    onChange={(pagination, filters, sorter, extra) => {
                        store.dispatch({
                            type: 'TABLE::CHANGE_PACKAGES_TABLE',
                            payload: {
                                filter: {
                                    filteredInfo: filters,
                                    sortedInfo: sorter
                                },
                                filterData: extra.currentDataSource
                            }
                        });
                    }}
                    pagination={
                        {
                            defaultPageSize: 100,
                            hideOnSinglePage: true,
                            pageSizeOptions: ['50', '100', '250', '500'],
                            position: 'both',
                            showSizeChanger: true
                        }
                    }
                    size="small"
                    rowClassName="ort-package"
                    rowKey="key"
                />
            </div>
        );
    }
}

TableView.propTypes = {
    shouldComponentUpdate: PropTypes.bool.isRequired,
    tableView: PropTypes.object.isRequired,
    webAppOrtResult: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    shouldComponentUpdate: getTableViewShouldComponentUpdate(state),
    tableView: getTableView(state),
    webAppOrtResult: getOrtResult(state)
});

export default connect(
    mapStateToProps,
    () => ({})
)(TableView);

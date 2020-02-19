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
import { Icon, Table } from 'antd';

// Generates the HTML to display issues as a Table
const IssuesTable = (props) => {
    const {
        issues,
        expandedRowRender,
        showPackageColumn
    } = props;

    // If return null to prevent React render issue
    if (!issues) {
        return null;
    }

    const columns = [];
    const totalIssues = issues.length;

    columns.push({
        align: 'right',
        dataIndex: 'severity',
        filters: (() => [
            { text: 'Errors', value: 'ERROR' },
            { text: 'Warnings', value: 'WARNING' },
            { text: 'Hints', value: 'HINT' },
            { text: 'Resolved', value: 'RESOLVED' }
        ])(),
        onFilter: (value, record) => record.severity.includes(value),
        render: (text, row) => (
            <span>
                {
                    row.severity === 'ERROR'
                    && (
                        <Icon
                            type="exclamation-circle"
                            className="ort-error"
                        />
                    )
                }
                {
                    row.severity === 'WARNING'
                    && (
                        <Icon
                            type="warning"
                            className="ort-warning"
                        />
                    )
                }
                {
                    row.severity === 'HINT'
                    && (
                        <Icon
                            type="info-circle"
                            className="ort-hint"
                        />
                    )
                }
            </span>
        ),
        width: '1em'
    });

    if (showPackageColumn) {
        columns.push({
            title: 'Package',
            dataIndex: 'packageName',
            key: 'packageName',
            render: packageName => (
                <span
                    className="ort-package-id ort-word-break-wrap"
                >
                    {packageName}
                </span>
            )
        });
    }

    columns.push({
        title: 'Message',
        dataIndex: 'message',
        key: 'message'
    });

    return (
        <Table
            columns={columns}
            dataSource={issues}
            expandedRowRender={expandedRowRender}
            locale={{
                emptyText: 'No issues'
            }}
            pagination={
                {
                    defaultPageSize: 25,
                    hideOnSinglePage: true,
                    pageSizeOptions: ['50', '100', '250', '500'],
                    position: 'bottom',
                    showQuickJumper: true,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} issues`
                }
            }
            rowKey="key"
            showHeader={totalIssues > 1}
            size="small"
        />
    );
};

IssuesTable.propTypes = {
    issues: PropTypes.array.isRequired,
    expandedRowRender: PropTypes.func,
    showPackageColumn: PropTypes.bool
};

IssuesTable.defaultProps = {
    expandedRowRender: null,
    showPackageColumn: false
};

export default IssuesTable;

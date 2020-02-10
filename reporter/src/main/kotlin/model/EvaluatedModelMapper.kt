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

package com.here.ort.reporter.model

import com.here.ort.model.CuratedPackage
import com.here.ort.model.Identifier
import com.here.ort.model.OrtIssue
import com.here.ort.model.OrtResult
import com.here.ort.model.Package
import com.here.ort.model.PackageReference
import com.here.ort.model.Project
import com.here.ort.model.RemoteArtifact
import com.here.ort.model.RuleViolation
import com.here.ort.model.ScanResult
import com.here.ort.model.ScanSummary
import com.here.ort.model.config.IssueResolution
import com.here.ort.model.config.PathExclude
import com.here.ort.model.config.RuleViolationResolution
import com.here.ort.model.config.ScopeExclude
import com.here.ort.model.utils.FindingsMatcher
import com.here.ort.model.yamlMapper
import com.here.ort.reporter.ReporterInput
import com.here.ort.reporter.utils.StatisticsCalculator
import com.here.ort.utils.ProcessedDeclaredLicense

/**
 * Maps the [reporter input][input] to an [EvaluatedModel].
 */
class EvaluatedModelMapper(private val input: ReporterInput) {
    private val packages = mutableListOf<EvaluatedPackage>()
    private val paths = mutableListOf<EvaluatedPackagePath>()
    private val dependencyTrees = mutableListOf<DependencyTreeNode>()
    private val scanResults = mutableListOf<EvaluatedScanResult>()
    private val copyrights = mutableListOf<CopyrightStatement>()
    private val licenses = mutableListOf<LicenseId>()
    private val scopes = mutableListOf<ScopeName>()
    private val declaredLicenseStats = mutableMapOf<String, MutableSet<Identifier>>()
    private val detectedLicenseStats = mutableMapOf<String, MutableSet<Identifier>>()
    private val issues = mutableListOf<EvaluatedOrtIssue>()
    private val issueResolutions = mutableListOf<IssueResolution>()
    private val pathExcludes = mutableListOf<PathExclude>()
    private val scopeExcludes = mutableListOf<ScopeExclude>()
    private val ruleViolations = mutableListOf<EvaluatedRuleViolation>()
    private val ruleViolationResolutions = mutableListOf<RuleViolationResolution>()

    private val findingsMatcher = FindingsMatcher()

    fun build(): EvaluatedModel {
        input.ortResult.analyzer?.result?.projects?.forEach { project ->
            addProject(project)
        }

        input.ortResult.analyzer?.result?.packages?.forEach { curatedPkg ->
            addPackage(curatedPkg)
        }

        input.ortResult.evaluator?.violations?.forEach { ruleViolation ->
            addRuleViolation(ruleViolation)
        }

        input.ortResult.analyzer?.result?.projects?.forEach { project ->
            val pkg = packages.find { it.id == project.id }!!
            addDependencyTree(project, pkg)
        }

        return EvaluatedModel(
            pathExcludes = pathExcludes,
            scopeExcludes = scopeExcludes,
            issueResolutions = issueResolutions,
            issues = issues,
            copyrights = copyrights,
            licenses = licenses,
            scopes = scopes,
            scanResults = scanResults,
            packages = packages,
            paths = paths,
            dependencyTrees = dependencyTrees,
            ruleViolationResolutions = ruleViolationResolutions,
            ruleViolations = ruleViolations,
            declaredLicenseStats = declaredLicenseStats.mapValuesTo(sortedMapOf()) { it.value.size },
            detectedLicenseStats = detectedLicenseStats.mapValuesTo(sortedMapOf()) { it.value.size },
            statistics = StatisticsCalculator().getStatistics(input.ortResult, input.resolutionProvider),
            repositoryConfiguration = yamlMapper.writeValueAsString(input.ortResult.repository.config),
            customData = input.ortResult.data
        )
    }

    private fun addProject(project: Project) {
        val scanResults = mutableListOf<EvaluatedScanResult>()
        val detectedLicenses = mutableSetOf<LicenseId>()
        val findings = mutableListOf<EvaluatedFinding>()
        val issues = mutableListOf<EvaluatedOrtIssue>()

        val applicablePathExcludes = input.ortResult.getExcludes().findPathExcludes(project, input.ortResult)
        val evaluatedPathExcludes = pathExcludes.addIfRequired(applicablePathExcludes)

        val evaluatedPackage = EvaluatedPackage(
            id = project.id,
            isProject = true,
            definitionFilePath = project.definitionFilePath,
            purl = project.id.toPurl(), // TODO: Add PURL to Project class.
            declaredLicenses = project.declaredLicenses.map { licenses.addIfRequired(LicenseId(it)) },
            declaredLicensesProcessed = project.declaredLicensesProcessed.evaluate(),
            detectedLicenses = detectedLicenses,
            concludedLicense = null,
            description = "",
            homepageUrl = project.homepageUrl,
            binaryArtifact = RemoteArtifact.EMPTY, // Should be nullable?
            sourceArtifact = RemoteArtifact.EMPTY, // Should be nullable?
            vcs = project.vcs,
            vcsProcessed = project.vcsProcessed,
            curations = emptyList(),
            paths = mutableListOf(),
            levels = sortedSetOf(0),
            scopes = mutableSetOf(),
            scanResults = scanResults,
            findings = findings,
            isExcluded = applicablePathExcludes.isNotEmpty(),
            pathExcludes = evaluatedPathExcludes,
            scopeExcludes = emptyList(),
            issues = issues
        )

        val actualPackage = packages.addIfRequired(evaluatedPackage)

        project.declaredLicensesProcessed.allLicenses.forEach { license ->
            val actualLicense = licenses.addIfRequired(LicenseId(license))
            declaredLicenseStats.add(actualLicense.id, actualPackage.id)
        }

        issues += addAnalyzerIssues(project.id, actualPackage)

        input.ortResult.getScanResultsForId(project.id).mapTo(scanResults) { result ->
            convertScanResult(result, findings, actualPackage)
        }

        findings.filter { it.type == EvaluatedFindingType.LICENSE }.mapNotNullTo(detectedLicenses) { it.license }
    }

    private fun addPackage(curatedPkg: CuratedPackage) {
        val pkg = curatedPkg.pkg

        val scanResults = mutableListOf<EvaluatedScanResult>()
        val detectedLicenses = mutableSetOf<LicenseId>()
        val findings = mutableListOf<EvaluatedFinding>()
        val issues = mutableListOf<EvaluatedOrtIssue>()

        val isExcluded = input.ortResult.isPackageExcluded(curatedPkg.pkg.id)
        val (applicablePathExcludes, applicableScopeExcludes) = if (isExcluded) {
            Pair(input.ortResult.findPathExcludes(pkg), input.ortResult.findScopeExcludes(pkg))
        } else {
            Pair(emptySet(), emptySet())
        }

        val evaluatedPathExcludes = pathExcludes.addIfRequired(applicablePathExcludes)
        val evaluatedScopeExcludes = scopeExcludes.addIfRequired(applicableScopeExcludes)

        val evaluatedPackage = EvaluatedPackage(
            id = pkg.id,
            isProject = false,
            definitionFilePath = "",
            purl = pkg.purl,
            declaredLicenses = pkg.declaredLicenses.map { licenses.addIfRequired(LicenseId(it)) },
            declaredLicensesProcessed = pkg.declaredLicensesProcessed.evaluate(),
            detectedLicenses = detectedLicenses,
            concludedLicense = pkg.concludedLicense,
            description = pkg.description,
            homepageUrl = pkg.homepageUrl,
            binaryArtifact = pkg.binaryArtifact,
            sourceArtifact = pkg.sourceArtifact,
            vcs = pkg.vcs,
            vcsProcessed = pkg.vcsProcessed,
            curations = curatedPkg.curations,
            paths = mutableListOf(),
            levels = sortedSetOf(),
            scopes = mutableSetOf(),
            scanResults = scanResults,
            findings = findings,
            isExcluded = isExcluded,
            pathExcludes = evaluatedPathExcludes,
            scopeExcludes = evaluatedScopeExcludes,
            issues = issues
        )

        val actualPackage = packages.addIfRequired(evaluatedPackage)

        pkg.declaredLicensesProcessed.allLicenses.forEach { license ->
            val actualLicense = licenses.addIfRequired(LicenseId(license))
            declaredLicenseStats.add(actualLicense.id, actualPackage.id)
        }

        issues += addAnalyzerIssues(pkg.id, actualPackage)

        input.ortResult.getScanResultsForId(pkg.id).mapTo(scanResults) { result ->
            convertScanResult(result, findings, actualPackage)
        }

        findings.filter { it.type == EvaluatedFindingType.LICENSE }.mapNotNullTo(detectedLicenses) { it.license }
    }

    private fun addAnalyzerIssues(id: Identifier, pkg: EvaluatedPackage): List<EvaluatedOrtIssue> {
        input.ortResult.analyzer?.result?.issues?.get(id)?.let { analyzerIssues ->
            return addIssues(analyzerIssues, EvaluatedOrtIssueType.ANALYZER, pkg, null, null)
        }
        return emptyList()
    }

    private fun addRuleViolation(ruleViolation: RuleViolation) {
        val resolutions = addResolutions(ruleViolation)
        val pkg = packages.find { it.id == ruleViolation.pkg }!!
        val license = ruleViolation.license?.let { licenses.addIfRequired(LicenseId(it)) }

        val evaluatedViolation = EvaluatedRuleViolation(
            rule = ruleViolation.rule,
            pkg = pkg,
            license = license,
            licenseSource = ruleViolation.licenseSource,
            severity = ruleViolation.severity,
            message = ruleViolation.message,
            howToFix = ruleViolation.howToFix,
            resolutions = resolutions
        )

        ruleViolations += evaluatedViolation
    }

    private fun convertScanResult(
        result: ScanResult,
        findings: MutableList<EvaluatedFinding>,
        pkg: EvaluatedPackage
    ): EvaluatedScanResult {
        val issues = mutableListOf<EvaluatedOrtIssue>()

        val evaluatedScanResult = EvaluatedScanResult(
            provenance = result.provenance,
            scanner = result.scanner,
            startTime = result.summary.startTime,
            endTime = result.summary.endTime,
            fileCount = result.summary.fileCount,
            packageVerificationCode = result.summary.packageVerificationCode,
            issues = issues
        )

        val actualScanResult = scanResults.addIfRequired(evaluatedScanResult)

        issues += addIssues(
            result.summary.issues,
            EvaluatedOrtIssueType.SCANNER,
            pkg,
            actualScanResult,
            null
        )

        addLicensesAndCopyrights(result.summary, actualScanResult, pkg, findings)

        return actualScanResult
    }

    private fun addDependencyTree(project: Project, pkg: EvaluatedPackage) {
        fun PackageReference.toEvaluatedTreeNode(scope: ScopeName, path: List<EvaluatedPackage>): DependencyTreeNode {
            val dependency = packages.find { it.id == id }!!
            val issues = mutableListOf<EvaluatedOrtIssue>()
            val packagePath = EvaluatedPackagePath(
                pkg = dependency,
                project = pkg,
                scope = scope,
                path = path
            )

            dependency.paths += paths.addIfRequired(packagePath)
            dependency.levels += path.size
            dependency.scopes += scopes.addIfRequired(scope)

            issues += addIssues(this.issues, EvaluatedOrtIssueType.ANALYZER, dependency, null, packagePath)

            return DependencyTreeNode(
                title = id.toCoordinates(),
                pkg = dependency,
                children = dependencies.map { it.toEvaluatedTreeNode(scope, path + dependency) },
                pathExcludes = emptyList(),
                scopeExcludes = emptyList(),
                issues = issues
            )
        }

        val scopeTrees = project.scopes.map { scope ->
            val subTrees = scope.dependencies.map {
                it.toEvaluatedTreeNode(scopes.addIfRequired(ScopeName(scope.name)), mutableListOf())
            }

            val applicableScopeExcludes = input.ortResult.getExcludes().findScopeExcludes(scope)
            val evaluatedScopeExcludes = scopeExcludes.addIfRequired(applicableScopeExcludes)

            DependencyTreeNode(
                title = scope.name,
                pkg = null,
                children = subTrees,
                pathExcludes = emptyList(),
                scopeExcludes = evaluatedScopeExcludes,
                issues = emptyList()
            )
        }

        val tree = DependencyTreeNode(
            title = project.id.toCoordinates(),
            pkg = pkg,
            children = scopeTrees,
            pathExcludes = pkg.pathExcludes,
            scopeExcludes = emptyList(),
            issues = emptyList()
        )

        dependencyTrees += tree
    }

    private fun addIssues(
        issues: List<OrtIssue>,
        type: EvaluatedOrtIssueType,
        pkg: EvaluatedPackage,
        scanResult: EvaluatedScanResult?,
        path: EvaluatedPackagePath?
    ): List<EvaluatedOrtIssue> {
        val evaluatedIssues = issues.map { issue ->
            val resolutions = addResolutions(issue)

            EvaluatedOrtIssue(
                timestamp = issue.timestamp,
                type = type,
                source = issue.source,
                message = issue.message,
                severity = issue.severity,
                resolutions = resolutions,
                pkg = pkg,
                scanResult = scanResult,
                path = path
            )
        }

        return this.issues.addIfRequired(evaluatedIssues)
    }

    private fun addResolutions(issue: OrtIssue): List<IssueResolution> {
        val matchingResolutions = input.resolutionProvider.getIssueResolutionsFor(issue)

        return issueResolutions.addIfRequired(matchingResolutions)
    }

    private fun addResolutions(ruleViolation: RuleViolation): List<RuleViolationResolution> {
        val matchingResolutions = input.resolutionProvider.getRuleViolationResolutionsFor(ruleViolation)

        return ruleViolationResolutions.addIfRequired(matchingResolutions)
    }

    private fun addLicensesAndCopyrights(
        summary: ScanSummary,
        scanResult: EvaluatedScanResult,
        pkg: EvaluatedPackage,
        findings: MutableList<EvaluatedFinding>
    ) {
        val matchedFindings = findingsMatcher.match(
            summary.licenseFindings,
            summary.copyrightFindings
        )

        matchedFindings.forEach { licenseFindings ->
            licenseFindings.copyrights.forEach { copyrightFinding ->
                val actualCopyright = copyrights.addIfRequired(CopyrightStatement(copyrightFinding.statement))

                copyrightFinding.locations.forEach { location ->
                    findings += EvaluatedFinding(
                        type = EvaluatedFindingType.COPYRIGHT,
                        license = null,
                        copyright = actualCopyright,
                        path = location.path,
                        startLine = location.startLine,
                        endLine = location.endLine,
                        scanResult = scanResult
                    )
                }
            }

            val actualLicense = licenses.addIfRequired(LicenseId(licenseFindings.license))
            detectedLicenseStats.add(actualLicense.id, pkg.id)

            licenseFindings.locations.forEach { location ->
                findings += EvaluatedFinding(
                    type = EvaluatedFindingType.LICENSE,
                    license = actualLicense,
                    copyright = null,
                    path = location.path,
                    startLine = location.startLine,
                    endLine = location.endLine,
                    scanResult = scanResult
                )
            }
        }
    }

    private fun ProcessedDeclaredLicense.evaluate(): EvaluatedProcessedDeclaredLicense =
        EvaluatedProcessedDeclaredLicense(
            spdxExpression = spdxExpression,
            mappedLicenses = spdxExpression?.licenses()?.map { licenses.addIfRequired(LicenseId(it)) }.orEmpty(),
            unmappedLicenses = unmapped.map { licenses.addIfRequired(LicenseId(it)) }
        )

    /**
     * Adds the [value] to this list if the list does not already contain an equal item. Returns the item that is
     * contained in the list. This is important to make sure that there is only one instance of equal items used in the
     * model, because when Jackson generates IDs each instance gets a new ID, no matter if they are equal or not.
     */
    private fun <T> MutableList<T>.addIfRequired(value: T): T {
        val existingValue = find { it == value }

        return if (existingValue != null) {
            existingValue
        } else {
            add(value)
            value
        }
    }

    /**
     * Similar to [addIfRequired], but for multiple input values.
     */
    private fun <T> MutableList<T>.addIfRequired(values: Collection<T>): List<T> {
        val result = mutableListOf<T>()

        values.forEach { value ->
            val existingValue = find { it == value }
            if (existingValue != null) {
                result += existingValue
            } else {
                add(value)
                result += value
            }
        }

        return result.distinct()
    }

    private fun MutableMap<String, MutableSet<Identifier>>.add(key: String, value: Identifier) {
        this.getOrPut(key) { mutableSetOf() } += value
    }

    private fun OrtResult.findPathExcludes(pkg: Package): Set<PathExclude> {
        val excludes = mutableSetOf<PathExclude>()

        getProjects().forEach { project ->
            if (pkg.id in project) {
                excludes += getExcludes().findPathExcludes(project, this)
            }
        }

        return excludes
    }

    private fun OrtResult.findScopeExcludes(pkg: Package): Set<ScopeExclude> {
        val excludes = mutableSetOf<ScopeExclude>()

        getProjects().forEach { project ->
            project.scopes.forEach { scope ->
                if (scope.contains(pkg.id)) {
                    excludes += getExcludes().findScopeExcludes(scope)
                }
            }
        }

        return excludes
    }
}

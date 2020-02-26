/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
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

package com.here.ort.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

import com.here.ort.spdx.SpdxExpression
import com.here.ort.spdx.SpdxOperator
import com.here.ort.utils.DeclaredLicenseProcessor
import com.here.ort.utils.ProcessedDeclaredLicense

import java.util.SortedSet

/**
 * A class describing a software project. A [Project] is very similar to a [Package] but contains some additional
 * meta-data like e.g. the [homepageUrl]. Most importantly, it defines the dependency scopes that refer to the actual
 * packages.
 */
@JsonIgnoreProperties(value = ["aliases", "purl"])
data class Project(
    /**
     * The unique identifier of this project. The [id]'s type is the name of the package manager that manages this
     * project (e.g. "Gradle" for a Gradle project).
     */
    val id: Identifier,

    /**
     * The path to the definition file of this project, relative to the root of the repository described in [vcs]
     * and [vcsProcessed].
     */
    val definitionFilePath: String,

    /**
     * The list of licenses the authors have declared for this package. This does not necessarily correspond to the
     * licenses as detected by a scanner. Both need to be taken into account for any conclusions.
     */
    val declaredLicenses: SortedSet<String>,

    /**
     * The declared licenses as [SpdxExpression]. If [declaredLicenses] contains multiple licenses they are
     * concatenated with [SpdxOperator.AND].
     */
    val declaredLicensesProcessed: ProcessedDeclaredLicense = DeclaredLicenseProcessor.process(declaredLicenses),

    /**
     * Original VCS-related information as defined in the [Project]'s meta-data.
     */
    val vcs: VcsInfo,

    /**
     * Processed VCS-related information about the [Project] that has e.g. common mistakes corrected.
     */
    val vcsProcessed: VcsInfo = vcs.normalize(),

    /**
     * The URL to the project's homepage.
     */
    val homepageUrl: String,

    /**
     * The dependency scopes defined by this project.
     */
    val scopes: SortedSet<Scope>
) : Comparable<Project> {
    companion object {
        /**
         * A constant for a [Project] where all properties are empty.
         */
        @JvmField
        val EMPTY = Project(
            id = Identifier.EMPTY,
            definitionFilePath = "",
            declaredLicenses = sortedSetOf(),
            declaredLicensesProcessed = ProcessedDeclaredLicense.EMPTY,
            vcs = VcsInfo.EMPTY,
            vcsProcessed = VcsInfo.EMPTY,
            homepageUrl = "",
            scopes = sortedSetOf()
        )
    }

    /**
     * Return the set of package [Identifier]s of all transitive dependencies of this [Project], up to and including a
     * depth of [maxDepth] where counting starts at 0 (for the [Project] itself) and 1 are direct dependencies etc. A
     * value below 0 means to not limit the depth. If the given [filterPredicate] is false for a specific
     * [PackageReference] the corresponding [Identifier] is excluded from the result.
     */
    fun collectDependencies(
        maxDepth: Int = -1,
        filterPredicate: (PackageReference) -> Boolean = { true }
    ): Set<Identifier> =
        scopes.fold(mutableSetOf()) { refs, scope ->
            refs.also { it += scope.collectDependencies(maxDepth, filterPredicate) }
        }

    /**
     * Return a map of all de-duplicated [OrtIssue]s associated by [Identifier].
     */
    fun collectIssues(): Map<Identifier, Set<OrtIssue>> {
        val collectedIssues = mutableMapOf<Identifier, MutableSet<OrtIssue>>()

        fun addIssues(pkgRef: PackageReference) {
            if (pkgRef.issues.isNotEmpty()) {
                collectedIssues.getOrPut(pkgRef.id) { mutableSetOf() } += pkgRef.issues
            }

            pkgRef.dependencies.forEach { addIssues(it) }
        }

        for (scope in scopes) {
            for (dependency in scope.dependencies) {
                addIssues(dependency)
            }
        }

        declaredLicensesProcessed.unmapped.forEach { unmappedLicense ->
            collectedIssues.getOrPut(id) { mutableSetOf() } += OrtIssue(
                severity = Severity.ERROR,
                source = id.toCoordinates(),
                message = "The declared license '$unmappedLicense' could not be mapped to a valid license or " +
                        "parsed as an SPDX expression."
            )
        }

        return collectedIssues
    }

    /**
     * Return the set of [Identifier]s that refer to sub-projects of this [Project].
     */
    fun collectSubProjects(): SortedSet<Identifier> =
        scopes.fold(sortedSetOf()) { refs, scope ->
            refs.also {
                it += scope.collectDependencies { ref -> ref.linkage in PackageLinkage.PROJECT_LINKAGE }
            }
        }

    /**
     * A comparison function to sort projects by their identifier.
     */
    override fun compareTo(other: Project) = id.compareTo(other.id)

    /**
     * Return whether the package identified by [id] is contained as a (transitive) dependency in this project.
     */
    operator fun contains(id: Identifier) = scopes.any { id in it }

    /**
     * Return all references to [id] as a dependency in this project.
     */
    fun findReferences(id: Identifier) = scopes.flatMap { it.findReferences(id) }

    /**
     * Return a [Package] representation of this [Project].
     */
    fun toPackage() = Package(
        id = id,
        declaredLicenses = declaredLicenses,
        description = "",
        homepageUrl = homepageUrl,
        binaryArtifact = RemoteArtifact.EMPTY,
        sourceArtifact = RemoteArtifact.EMPTY,
        vcs = vcs,
        vcsProcessed = vcsProcessed
    )
}

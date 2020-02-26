/*
 * Copyright (C) 2017-2010 HERE Europe B.V.
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

package com.here.ort.reporter.reporters

import com.here.ort.reporter.Reporter
import com.here.ort.reporter.ReporterInput
import com.here.ort.reporter.model.EvaluatedModel

import java.io.OutputStream

/**
 * An abstract [Reporter] that generates an [EvaluatedModel]. The model is serialized using the provided [serialize]
 * function.
 */
class EvaluatedModelReporter : Reporter {
    override val reporterName: String = "EvaluatedModel"
    override val defaultFilename: String = "evaluated-model.json"

    override fun generateReport(outputStream: OutputStream, input: ReporterInput) {
        val evaluatedModel = EvaluatedModel.create(input)

        outputStream.bufferedWriter().use {
            it.write(evaluatedModel.toJson())
        }
    }
}

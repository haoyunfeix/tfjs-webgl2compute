/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as broadcast_util from '@tensorflow/tfjs-core/dist/ops/broadcast_util';

import {computeDispatch} from '../webgl2compute_util';
import {WebGL2ComputeProgram} from './webgl2compute_program';

const CHECK_NAN_SNIPPET = `
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`;

export const MUL = 'return a * b;';
export const ADD = 'return a + b;';
export const SUB = 'return a - b;';
export const DIV = `
  if (b == 0.0) {
    return NAN;
  }
  if (a == b) {
    return 1.0;
  };
  return a / b;
`;
export const MIN = CHECK_NAN_SNIPPET + `
  return min(a, b);
`;
export class BinaryOpProgram implements WebGL2ComputeProgram {
  outputShape: number[];
  userCode: string;
  dispatchLayout: {x: number[]};
  workGroupSize: [number, number, number];
  dispatch: [number, number, number];
  variableNames = ['A', 'B'];

  constructor(op: string, aShape: number[], bShape: number[]) {
    this.outputShape =
        broadcast_util.assertAndGetBroadcastShape(aShape, bShape);
    this.workGroupSize = [64, 1, 1];
    this.dispatchLayout = {x: this.outputShape.map((d, i) => i)};
    this.dispatch = computeDispatch(
        this.dispatchLayout, this.outputShape, this.workGroupSize);

    this.userCode = `
      float binaryOperation(float a, float b) {
        ${op}
      }

      void main() {
        int index = int(gl_GlobalInvocationID.x);
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(index, binaryOperation(a, b));
      }
    `;
  }
}

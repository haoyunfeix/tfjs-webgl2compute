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

import * as concat_util from '@tensorflow/tfjs-core/dist/ops/concat_util';
import {computeDispatch} from '../webgl2compute_util';
import {WebGL2ComputeProgram} from './webgl2compute_program';

export class ConcatProgram implements WebGL2ComputeProgram {
  outputShape: number[];
  userCode: string;
  dispatchLayout: {x: number[], y: number[]};
  workGroupSize: [number, number, number] = [64, 1, 1];
  dispatch: [number, number, number];
  variableNames: string[];

  constructor(shapes: Array<[number, number]>) {
    this.outputShape =
        concat_util.computeOutShape(shapes, 1 /* axis */) as [number, number];
    this.variableNames = shapes.map((_, i) => `T${i}`);
    //this.variableNames = shapes.map((_, i) => `${String.fromCharCode(84 + i)}`);

    this.dispatchLayout = {x: [0], y: [1]};
    this.dispatch = computeDispatch(this.dispatchLayout, this.outputShape, this.workGroupSize);

    const offsets: number[] = new Array(shapes.length - 1);
    offsets[0] = shapes[0][1];
    for (let i = 1; i < offsets.length; i++) {
      offsets[i] = offsets[i - 1] + shapes[i][1];
    }
      
    const snippets = [
      `if (yC < ${offsets[0]}) setOutput(getFlatIndex(coords, t0Shape), T0[getFlatIndex(ivec2(yR, yC), t0Shape)]);`
    ];

    for (let i = 1; i < offsets.length; i++) {
      const shift = offsets[i - 1];
      snippets.push(
          `else if (yC < ${offsets[i]}) ` +
          `setOutput(getFlatIndex(coords, t${i}Shape), T${i}[getFlatIndex(ivec2(yR, yC-${shift}), t${i}Shape)]);`);
    }
    const lastIndex = offsets.length;
    const lastShift = offsets[offsets.length - 1];
    snippets.push(`else setOutput(getFlatIndex(coords, t${lastIndex}Shape), T${lastIndex}[getFlatIndex(ivec2(yR, yC-${lastShift}), t${lastIndex}Shape)]);`);

    this.userCode = `
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;
        ${snippets.join('\n        ')}
      }
    `;
  }
}
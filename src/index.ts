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

import * as tf from '@tensorflow/tfjs';

import {WebGL2ComputeBackend} from './backend_webgl2compute';

export * from '@tensorflow/tfjs';

export const ready = (async () => {
tf.ENV.registerBackend('webgl2compute', () => {
  return new WebGL2ComputeBackend();
}, 3 /*priority*/);

// If registration succeeded, set the backend.
if (tf.ENV.findBackend('webgl2compute') != null) {
  tf.setBackend('webgl2compute');
}
})();
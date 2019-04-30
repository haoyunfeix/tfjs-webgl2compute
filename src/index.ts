import * as tf from '@tensorflow/tfjs';

import {WebGPUBackend} from './backend_webgpu';

export * from '@tensorflow/tfjs';

export const ready = (async () => {
tf.ENV.registerBackend('webgpu', () => {
  return new WebGPUBackend();
}, 3 /*priority*/);

// If registration succeeded, set the backend.
if (tf.ENV.findBackend('webgpu') != null) {
  tf.setBackend('webgpu');
}
})();
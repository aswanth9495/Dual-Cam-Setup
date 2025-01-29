import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import {
  createApi, fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

import CaseUtil from '../utils/caseUtil';

import { isNullOrUndefined } from '../utils/type';

// To be used later on
// eslint-disable-next-line no-unused-vars
const getIbtspContext = (ibtsp) => ({
  'api_context[id]': ibtsp,
  'api_context[type]': 'interviewbit_test_session_problem',
});

const getIbtContext = (testId) => ({
  'api_context[id]': testId,
  'api_context[type]': 'interviewbit_test',
});

export function customParamsSerializer(params) {
  const cleanedParams = pickBy(params, (v) => !isNullOrUndefined(v));
  const finalParams = map(cleanedParams, (value, key) => {
    if (Array.isArray(value)) {
      return value.map(v => `${key}[]=${v}`).join('&');
    } else {
      return `${key}=${value}`;
    }
  }).join('&');
  return finalParams;
}

const baseDualCamProctoringQuery = fetchBaseQuery({
  baseUrl: window.location.origin,
  paramsSerializer: customParamsSerializer,
  /* Add it when we add JWT token */
  // prepareHeaders: (headers) => {
  //   const { jwt } = AuthStore.get();
  //   if (jwt) {
  //     headers.set('X-User-Token', jwt);
  //   }
  //   return headers;
  // },
});

const dualCamProctoringService = createApi({
  reducerPath: 'dualCamProctoring',
  tagTypes: [],
  async baseQuery(...args) {
    const response = await baseDualCamProctoringQuery(...args);
    if (response.meta.response.ok && response.data?.data) {
      return { data: CaseUtil.toCase('camelCase', response.data) };
    } else {
      return CaseUtil.toCase('camelCase', response);
    }
  },
  endpoints: (build) => ({
    checkOrientation: build.mutation({
      query: ({
        formData,
        token,
        testId,
      }) => ({
        url: `api/v3/proctoring/dual_camera/check_compatibility`,
        method: 'POST',
        params: {
          token,
          ...getIbtContext(testId),
        },
        body: formData,
      }),
    }),
    sendProctorEvent: build.mutation({
      query: ({
        deviceFingerprint,
        token,
        eventName,
        testId,
        extraData,
      }) => ({
        url: `api/v3/proctoring/dual_camera/events`,
        method: 'POST',
        params: {
          ...getIbtContext(testId),
          token,
          device_fingerprint: deviceFingerprint,
        },
        body: {
          events: [{
            type: 'secondary_camera',
            name: eventName,
            data: extraData,
          }],
        },
      }),
    }),
  }),
});

export const {
  useSendProctorEventMutation,
  useCheckOrientationMutation,
  util: dualCamProctoringEvent,
} = dualCamProctoringService;

export default dualCamProctoringService;

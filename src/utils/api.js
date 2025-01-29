/* eslint-disable no-param-reassign */
import fetch from 'isomorphic-fetch';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import { isNullOrUndefined } from './type';

export function searchParams(params, transformArray = false) {
  const cleanedParams = pickBy(params, (v) => !isNullOrUndefined(v));
  return map(cleanedParams, (value, key) => {
    if (transformArray && Array.isArray(value)) {
      return value.map(v => `${key}[]=${v}`).join('&');
    } else {
      return `${key}=${value}`;
    }
  }).join('&');
}

/**
 * Parses JSON responses for easier consumption.
 *
 * The returned promise behaves as follows:
 * * For "OK" responses (2xx status codes)
 *   * If the body has JSON, it resolves to the JSON itself
 *   * If the body has no JSON (i.e. is empty), it resolves to null
 * * For all other responses, it rejects with an `Error` object that contains
 *   the following properties:
 *   * `isFromServer`: Set to true, indicating it is a server error
 *   * `response`: The complete response, for reference if required
 *   * `responseJson`: The response body pre-converted to JSON for convenience
 *
 * @param {Object} response
 * @returns {Promise<{}>}
 */
export async function parseJsonResponse(response) {
  let json = null;
  try {
    json = await response.json();
  } catch (e) {
    // TODO Do something if response has no, or invalid JSON
  }

  if (response.headers.has('X-Flash-Messages')) {
    const flashHeader = response.headers.get('X-Flash-Messages') || '{}';
    const { error, notice } = JSON.parse(flashHeader) || {};
    if (error || notice) {
      json ||= {};
      json.flashError = error || notice;
    }

    if (error) {
      window.GTMtracker?.pushEvent({
        event: 'gtm_custom_click',
        data: {
          click_text: error,
          click_type: 'Flash error',
        },
      });
    }
  }

  if (response.ok) {
    return json;
  } else {
    const error = new Error(response.statusText);
    error.isFromServer = true;
    error.response = response;
    error.responseJson = json;

    throw error;
  }
}

/**
 * Performs an API request.
 *
 * @param {string} method - 'GET', 'POST' etc.
 * @param {string} path
 * @param {Object} [body]
 * @param {Object} [options] - `fetch` options other than `method` and `body`
 * @returns {Promise<{}>} As returned by {@link parseJsonResponse}
 */
export async function apiRequest(method, path, body = null, options = {}) {
  let defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Accept-Flash': true,
  };

  // TODO Remove DOM dependency from this file
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    defaultHeaders['X-CSRF-Token'] = csrfMeta.content;
  }

  const defaultOptions = { method };

  if (options.dataType === 'FormData') {
    delete defaultHeaders['Content-Type'];
    defaultOptions.body = body;
  } else if (body && method !== 'GET') {
    defaultOptions.body = JSON.stringify(body);
  }

  const { headers, params, ...remainingOptions } = options;
  const finalOptions = Object.assign(
    defaultOptions,
    { headers: Object.assign(defaultHeaders, headers) },
    { credentials: 'same-origin' },
    remainingOptions,
  );

  if (params) {
    path += `?${searchParams(params)}`;
  } else if (method === 'GET' && body) {
    path += `?${searchParams(body, true)}`;
  }

  const response = await fetch(path, finalOptions);
  return parseJsonResponse(response);
}

export async function generateJWT() {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  let token;
  await fetch('/generate-jwt', {
    method: 'POST',
    headers: {
      'Content-Type': 'text',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrfMeta.content,
    },
    body: JSON.stringify({}),
  }).then(response => {
    if (!response.ok) throw new Error(response.status);
    return response.text();
  })
    .then(val => { token = val; })
    .catch((error) => {
      if (error.message === '401') {
        window.location = `${window.location.protocol}//${window.location.host}`
        + '/users/sign_in';
      }
    });

  return token;
}

export const ABORTED_ERROR_CODE = 20;

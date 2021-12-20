import {
  SET_DATE_RANGE,
  SET_FROM,
  SET_UNTIL,
  SET_MAX_NODES,
  REFRESH,
  REQUEST_TAGS,
  RECEIVE_TAGS,
  REQUEST_TAG_VALUES,
  RECEIVE_TAG_VALUES,
  REQUEST_NAMES,
  RECEIVE_NAMES,
  SET_QUERY,
  SET_LEFT_DATE_RANGE,
  SET_RIGHT_DATE_RANGE,
  SET_LEFT_FROM,
  SET_LEFT_UNTIL,
  SET_RIGHT_FROM,
  SET_RIGHT_UNTIL,
  RECEIVE_COMPARISON_APP_DATA,
  REQUEST_COMPARISON_APP_DATA,
  CANCEL_COMPARISON_APP_DATA,
  REQUEST_PYRESCOPE_APP_DATA,
  RECEIVE_PYRESCOPE_APP_DATA,
  CANCEL_PYRESCOPE_APP_DATA,
  REQUEST_COMPARISON_DIFF_APP_DATA,
  RECEIVE_COMPARISON_DIFF_APP_DATA,
  CANCEL_COMPARISON_DIFF_APP_DATA,
  REQUEST_COMPARISON_TIMELINE,
  RECEIVE_COMPARISON_TIMELINE,
  SET_FILE,
  SET_LEFT_FILE,
  SET_RIGHT_FILE,
} from './actionTypes';
import { isAbortError } from '../util/abort';
import { addNotification } from './reducers/notifications';

export const setDateRange = (from, until) => ({
  type: SET_DATE_RANGE,
  payload: { from, until },
});

export const setLeftDateRange = (from, until) => ({
  type: SET_LEFT_DATE_RANGE,
  payload: { from, until },
});

export const setRightDateRange = (from, until) => ({
  type: SET_RIGHT_DATE_RANGE,
  payload: { from, until },
});

export const setFrom = (from) => ({ type: SET_FROM, payload: { from } });

export const setLeftFrom = (from) => ({
  type: SET_LEFT_FROM,
  payload: { from },
});
export const setRightFrom = (from) => ({
  type: SET_RIGHT_FROM,
  payload: { from },
});

export const setUntil = (until) => ({ type: SET_UNTIL, payload: { until } });
export const setLeftUntil = (until) => ({
  type: SET_LEFT_UNTIL,
  payload: { until },
});
export const setRightUntil = (until) => ({
  type: SET_RIGHT_UNTIL,
  payload: { until },
});

export const setMaxNodes = (maxNodes) => ({
  type: SET_MAX_NODES,
  payload: { maxNodes },
});

export const refresh = (url) => ({ type: REFRESH, payload: { url } });

export const requestTimeline = (url) => ({
  type: REQUEST_COMPARISON_TIMELINE,
  payload: { url },
});

export const receiveTimeline = (data) => ({
  type: RECEIVE_COMPARISON_TIMELINE,
  payload: data,
});

export const requestPyrescopeAppData = (url) => ({
  type: REQUEST_PYRESCOPE_APP_DATA,
  payload: { url },
});

export const receivePyrescopeAppData = (data) => ({
  type: RECEIVE_PYRESCOPE_APP_DATA,
  payload: { data },
});
export const cancelPyrescopeAppData = () => ({
  type: CANCEL_PYRESCOPE_APP_DATA,
});

export const requestComparisonAppData = (url, viewSide) => ({
  type: REQUEST_COMPARISON_APP_DATA,
  payload: { url, viewSide },
});

export const receiveComparisonAppData = (data, viewSide) => ({
  type: RECEIVE_COMPARISON_APP_DATA,
  payload: { data, viewSide },
});
export const cancelComparisonappData = () => ({
  type: CANCEL_COMPARISON_APP_DATA,
});

export const requestComparisonDiffAppData = (url) => ({
  type: REQUEST_COMPARISON_DIFF_APP_DATA,
  payload: { url },
});

export const receiveComparisonDiffAppData = (data) => ({
  type: RECEIVE_COMPARISON_DIFF_APP_DATA,
  payload: { data },
});

export const cancelComparisonDiffAppData = () => ({
  type: CANCEL_COMPARISON_DIFF_APP_DATA,
});

export const requestTags = () => ({ type: REQUEST_TAGS });

export const receiveTags = (tags) => ({
  type: RECEIVE_TAGS,
  payload: { tags },
});

export const requestTagValues = (tag) => ({
  type: REQUEST_TAG_VALUES,
  payload: { tag },
});

export const receiveTagValues = (values, tag) => ({
  type: RECEIVE_TAG_VALUES,
  payload: { values, tag },
});

export const requestNames = () => ({ type: REQUEST_NAMES, payload: {} });

export const receiveNames = (names) => ({
  type: RECEIVE_NAMES,
  payload: { names },
});

export const setQuery = (query) => ({
  type: SET_QUERY,
  payload: { query },
});

export const setFile = (file, flamebearer) => ({
  type: SET_FILE,
  payload: { file, flamebearer },
});

export const setLeftFile = (file, flamebearer) => ({
  type: SET_LEFT_FILE,
  payload: { file, flamebearer },
});

export const setRightFile = (file, flamebearer) => ({
  type: SET_RIGHT_FILE,
  payload: { file, flamebearer },
});

// ResponseNotOkError refers to when request is not ok
// ie when status code is not in the 2xx range
class ResponseNotOkError extends Error {
  constructor(response) {
    super(`Bad Response: ${response.status}`);
    this.name = 'ResponseNotOkError';
    this.response = response;
  }
}

// dispatchNotificationByError dispatches a notification
// depending on the error passed
function dispatchNotificationByError(dispatch, e) {
  if (e instanceof ResponseNotOkError) {
    dispatch(
      addNotification({
        title: 'Request Failed',
        message: `Failed to request profile data: status ${e.response.status}`,
        type: 'danger',
      })
    );
  } else if (!isAbortError(e)) {
    // AbortErrors are fine

    // Generic case, so we use as message whatever error we got
    // It's not the best UX, but our users should be experienced enough
    // to be able to decipher what's going on based on the message
    dispatch(
      addNotification({
        title: 'Error',
        message: e.message,
        type: 'danger',
      })
    );
  }
}

/**
 * ATTENTION! There may be race conditions:
 * Since a new controller is created every time a 'fetch' action is called
 * A badly timed 'abort' action may cancel the brand new 'fetch' action!
 */
let currentTimelineController;
const currentComparisonTimelineController = {
  left: null,
  right: null,
};
let fetchTagController;
let fetchTagValuesController;

export function fetchTimeline(url) {
  return (dispatch) => {
    if (currentTimelineController) {
      currentTimelineController.abort();
    }
    currentTimelineController = new AbortController();
    dispatch(requestTimeline(url));

    return fetch(`${url}&format=json`, {
      signal: currentTimelineController.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(receiveTimeline(data));
      })
      .catch((e) => {
        // AbortErrors are fine
        if (!isAbortError(e)) {
          throw e;
        }
      })
      .finally();
  };
}

export function abortTimelineRequest() {
  return () => {
    if (currentTimelineController) {
      currentTimelineController.abort();
    }
  };
}

export function fetchComparisonAppData(url, viewSide) {
  return (dispatch) => {
    const getTimelineController = () => {
      switch (viewSide) {
        case 'left':
          return currentComparisonTimelineController.left;
        case 'right':
          return currentComparisonTimelineController.right;
        default:
          throw new Error(`Invalid viewSide: '${viewSide}'`);
      }
    };
    let timelineController = getTimelineController();
    if (timelineController) {
      timelineController.abort();
    }

    switch (viewSide) {
      case 'left':
        currentComparisonTimelineController.left = new AbortController();
        break;
      case 'right':
        currentComparisonTimelineController.right = new AbortController();
        break;
      default:
        throw new Error(`Invalid viewSide: '${viewSide}'`);
    }
    dispatch(requestComparisonAppData(url, viewSide));
    timelineController = getTimelineController();
    return fetch(`${url}&format=json`, {
      signal: timelineController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new ResponseNotOkError(response);
        }

        return response.json();
      })
      .then((data) => {
        dispatch(receiveComparisonAppData(data, viewSide));
      })
      .catch((e) => dispatchNotificationByError(dispatch, e))
      .then(() => dispatch(cancelComparisonappData()))
      .finally();
  };
}

export function fetchPyrescopeAppData(url) {
  return (dispatch) => {
    if (currentTimelineController) {
      currentTimelineController.abort();
    }
    currentTimelineController = new AbortController();
    dispatch(requestPyrescopeAppData(url));
    return fetch(`${url}&format=json`, {
      signal: currentTimelineController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new ResponseNotOkError(response);
        }

        return response.json();
      })
      .then((data) => {
        dispatch(receivePyrescopeAppData(data));
      })
      .catch((e) => dispatchNotificationByError(dispatch, e))
      .then(() => dispatch(cancelPyrescopeAppData()))
      .finally();
  };
}

export function fetchComparisonDiffAppData(url) {
  return (dispatch) => {
    if (currentTimelineController) {
      currentTimelineController.abort();
    }
    currentTimelineController = new AbortController();
    dispatch(requestComparisonDiffAppData(url));
    return fetch(`${url}&format=json`, {
      signal: currentTimelineController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new ResponseNotOkError(response);
        }

        return response.json();
      })
      .then((data) => {
        dispatch(receiveComparisonDiffAppData(data));
      })
      .catch((e) => dispatchNotificationByError(dispatch, e))
      .then(() => dispatch(cancelComparisonDiffAppData()))
      .finally();
  };
}

export function fetchTags(query) {
  return (dispatch) => {
    if (fetchTagController) {
      fetchTagController.abort();
    }
    fetchTagController = new AbortController();

    dispatch(requestTags());
    return fetch(`./labels?query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        dispatch(receiveTags(data));
      })
      .catch((e) => {
        // AbortErrors are fine
        if (!isAbortError(e)) {
          throw e;
        }
      })
      .finally();
  };
}

export function abortFetchTags() {
  return () => {
    if (fetchTagController) {
      fetchTagController.abort();
    }
  };
}

export function fetchTagValues(query, tag) {
  return (dispatch) => {
    if (fetchTagValuesController) {
      fetchTagValuesController.abort();
    }
    fetchTagValuesController = new AbortController();

    dispatch(requestTagValues(tag));
    return fetch(
      `/label-values?label=${encodeURIComponent(
        tag
      )}&query=${encodeURIComponent(query)}`
    )
      .then((response) => response.json())
      .then((data) => {
        dispatch(receiveTagValues(data, tag));
      })
      .catch((e) => {
        // AbortErrors are fine
        if (!fetchTagValuesController.signal.aborted) {
          throw e;
        }
      })
      .finally();
  };
}
export function abortFetchTagValues() {
  return () => {
    if (fetchTagValuesController) {
      fetchTagValuesController.abort();
    }
  };
}

let currentNamesController;
export function fetchNames() {
  return (dispatch) => {
    if (currentNamesController) {
      currentNamesController.abort();
    }
    currentNamesController = new AbortController();

    dispatch(requestNames());
    return fetch('/label-values?label=__name__', {
      signal: currentNamesController.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(receiveNames(data));
      })
      .catch((e) => {
        // AbortErrors are fine
        if (!isAbortError(e)) {
          throw e;
        }
      })
      .finally();
  };
}
export function abortFetchNames() {
  return () => {
    if (abortFetchNames) {
      abortFetchNames.abort();
    }
  };
}

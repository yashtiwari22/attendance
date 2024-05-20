// send res

export const sendResponse = (status, message, res) => {
  res.status(status).json({
    is_error: 0,
    message: message,
    status_code: status,
  });
};
// send error response

export const sendErrorResponse = (status, message, res) => {
  res.status(status).json({
    is_error: 1,
    message: message,
    status_code: status,
  });
};
// send response with data

export const sendResponseData = (status, message, data, res) => {
  res.status(status).json({
    is_error: 0,
    message: message,
    status_code: status,
    data: data,
  });
};
// send error response with data

export const sendErrorResponseData = (status, message, data, res) => {
  res.status(status).json({
    is_error: 1,
    message: message,
    status_code: status,
    data: data,
  });
};

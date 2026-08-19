class ApiResponse {
  constructor({ success = true, statusCode = 200, message = '', data = null }) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;

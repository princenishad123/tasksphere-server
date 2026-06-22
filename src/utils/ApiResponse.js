class ApiResponse{
    constructor(statusCode,data,message = "success",success = true) {
        this.data = data,
        this.message = message,
        this.statusCode = statusCode,
        this.success = success
    }
}

export default ApiResponse;
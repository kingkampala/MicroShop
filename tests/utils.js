function mockRequest(data = {}) {
    return {
      ...data,
      headers: data.headers || {},
      body: data.body || {},
      params: data.params || {},
      query: data.query || {},
      user: data.user || {},
    };
}
  
function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
    return res;
}
  
function mockNext() {
    return jest.fn();
}
  
module.exports = { mockRequest, mockResponse, mockNext };  
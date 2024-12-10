
jest.mock('axios');
jest.mock('form-data');
jest.mock('fs');

// describe('FactorioModPortalApiService', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('CheckIfModIsPublished', () => {
//         it('should return true if mod exists', async () => {
//             const mockResponse = { data: { name: 'test-mod' } };
//             (axios.get as jest.Mock).mockReturnValue(mockResponse);
//             const result = await FactorioModPortalApiService.CheckIfModIsPublished('test-mod');
//             expect(result).toBe(true);
//         });

//         it('should return false if mod does not exist', async () => {
//             const response = { status: 404 } as AxiosResponse<ModInfo>;
//             const mockResponse: AxiosError = new AxiosError();
//             mockResponse.response = response;

//             axios.get = jest.fn().mockRejectedValue(mockResponse);
//             const result = await FactorioModPortalApiService.CheckIfModIsPublished('test-mod');
//             expect(result).toBe(false);
//         });
//     });

//     describe('getLatestModVersion', () => {
//         it('should return latest version', async () => {
//             const mockResponse = {
//                 data: {
//                     releases: [
//                         { version: '1.0.0', released_at: '2023-01-01' },
//                         { version: '1.0.1', released_at: '2023-01-02' }
//                     ]
//                 }
//             };

//             (axios.get as jest.Mock).mockReturnValue(mockResponse);

//             const result = await FactorioModPortalApiService.getLatestModVersion('test-mod');
//             expect(result).toBe('1.0.1');
//         });

//         it('should throw ModNotFoundError if mod does not exist', async () => {
//             const response = { status: 404 } as AxiosResponse<ModInfo>;
//             const mockResponse: AxiosError = new AxiosError();
//             mockResponse.response = response;
//             axios.get = jest.fn().mockRejectedValue(mockResponse);

//             await expect(FactorioModPortalApiService.getLatestModVersion('test-mod'))
//                 .rejects.toThrow(fmpe.FactorioModPortalApiModNotFoundError);
//         });
//     });

//     describe('ModUploadInit', () => {
//         it('should return upload url', async () => {
//             const mockResponse = { data: { upload_url: 'https://test.com/upload' } };
//             (axios.post as jest.Mock).mockResolvedValue(mockResponse);

//             const result = await FactorioModPortalApiService.ModUploadInit('token', 'test-mod');
//             expect(result).toBe('https://test.com/upload');
//         });
//     });

//     describe('ModUploadFinish', () => {
//         it('should successfully upload mod', async () => {
//             const mockResponse = { data: { success: true } };
//             (axios.post as jest.Mock).mockResolvedValue(mockResponse);

//             await expect(FactorioModPortalApiService.ModUploadFinish(
//                 'token',
//                 'https://test.com/upload',
//                 'test-mod.zip'
//             )).resolves.not.toThrow();
//         });
//     });

//     describe('Error handling', () => {
//         it('should preserve stack trace in custom errors', () => {
//             const originalStack = 'Error: test\n    at Test.stack';
//             const error = new fmpe.FactorioModPortalApiError('Test error', originalStack);
//             expect(error.stack).toBe(originalStack);
//         });

//         it('should handle invalid API token error', async () => {
//             const response = { status: 401, data: { error: 'InvalidApiKey' } } as AxiosResponse;
//             const mockError: AxiosError = new AxiosError();
//             mockError.response = response;
//             mockError.stack = 'Error: unauthorized\n    at Test.stack';
//             axios.post = jest.fn().mockRejectedValue(mockError);
//             await expect(FactorioModPortalApiService.ModUploadInit('invalid-token', 'test-mod'))
//                 .rejects.toThrow(fmpe.FactorioModPortalApiInvalidApiTokenError);
//         });

//         it('should handle forbidden error', async () => {
//             const response = { status: 403, data: { error: 'Forbidden' } } as AxiosResponse;
//             const mockError: AxiosError = new AxiosError();
//             mockError.response = response;
            
//             axios.post = jest.fn().mockRejectedValue(mockError);

//             await expect(FactorioModPortalApiService.ModUploadInit('token', 'test-mod'))
//                 .rejects.toThrow(fmpe.FactorioModPortalApiForbiddenError);
//         });

//         it('should handle internal server error', async () => {
//             const response = { status: 500 } as AxiosResponse;
//             const mockError: AxiosError = new AxiosError();
//             mockError.response = response;
            
//             axios.post = jest.fn().mockRejectedValue(mockError);

//             await expect(FactorioModPortalApiService.ModUploadInit('token', 'test-mod'))
//                 .rejects.toThrow(fmpe.FactorioModPortalApiInternalError);
//         });
//     });
// });
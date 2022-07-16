class RetryService {
    async retry<T>(fn: () => Promise<T>, errorResponse: any, retries = 0): Promise<Awaited<T>> {
        try {
            return await fn();
        } catch (e) {
            if (retries < 3) {
                console.log(`Error: ${e.message} @ ${retries}/3`);
                return this.retry(fn, retries + 1);
            } else {
                console.log(`Final Error: ${e.message} @ 3/3`);
                return errorResponse;
            }
        }
    }
}
export default new RetryService();